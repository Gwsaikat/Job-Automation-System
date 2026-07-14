// ============================================
// Full CV Pipeline — orchestrates tailoring, rendering,
// scoring, and cover letter for a single job
// ============================================

import prisma from '../db';
import { MASTER_CV_HTML as DEFAULT_MASTER_CV_HTML, MASTER_CV_LATEX as DEFAULT_MASTER_CV_LATEX } from './template';
import { shouldTailorCV, tailorCV } from './tailor';
import { renderCVtoPDF, renderLatexToPDF } from './render';
import { scoreCVWithRetry } from './score';
import { generateCoverLetter, saveCoverLetter } from './cover-letter';

export interface CVPipelineResult {
  cvPdfPath: string;
  cvUpdated: boolean;
  atsScore: number;
  atsFeedback: string;
  coverLetterPath: string | null;
}

export async function runCVPipeline(jobId: number): Promise<CVPipelineResult> {
  // Fetch the job record
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error(`Job ${jobId} not found`);

  const jd = job.jobDescription || '';
  const jobTitle = job.jobTitle || '';
  const company = job.company || '';

  console.log(`[CV Pipeline] Processing job ${jobId}: ${jobTitle} at ${company}`);

  // Fetch cv_type setting
  const cvTypeSetting = await prisma.settings.findUnique({
    where: { key: 'cv_type' },
  });
  const cvType = (cvTypeSetting?.value as 'html' | 'latex') || 'html';

  // Fetch Master CV from Settings based on type
  const settingKey = cvType === 'latex' ? 'master_cv_latex' : 'master_cv_html';
  const masterCvSetting = await prisma.settings.findUnique({
    where: { key: settingKey },
  });
  const MASTER_CV = masterCvSetting?.value || (cvType === 'latex' ? DEFAULT_MASTER_CV_LATEX : DEFAULT_MASTER_CV_HTML);

  // Step 1: Decide if tailoring is needed (Section 5.3)
  let cvContent = MASTER_CV;
  let wasTailored = false;

  try {
    const decision = await shouldTailorCV(jd);
    console.log(`[CV Pipeline] Tailor decision: ${decision.shouldTailor} — ${decision.reason}`);

    if (decision.shouldTailor && decision.missingKeywords.length > 0) {
      // Step 2: Tailor the CV (Section 5.4)
      const tailored = await tailorCV(jd, decision.missingKeywords, cvType);
      cvContent = tailored.content;
      wasTailored = tailored.wasTailored;
    }
  } catch (error) {
    console.error('[CV Pipeline] Tailoring error, using master CV:', error);
  }

  // Step 3: Render to PDF with 1-page enforcement (Section 5.5)
  let renderResult;
  if (cvType === 'latex') {
    renderResult = await renderLatexToPDF(cvContent, jobId, MASTER_CV);
  } else {
    renderResult = await renderCVtoPDF(cvContent, jobId, MASTER_CV);
  }
  
  console.log(
    `[CV Pipeline] PDF rendered: ${renderResult.pageCount} page(s), auto-shrunk: ${renderResult.wasAutoShrunk}`
  );

  // Step 4: ATS scoring with retry (Section 5.6)
  const { bestScore, finalCvHtml } = await scoreCVWithRetry(
    cvContent,
    jd,
    async (missingKeywords, previousScore) => {
      console.log(
        `[CV Pipeline] Re-tailoring for score improvement (prev: ${previousScore})...`
      );
      const retailored = await tailorCV(jd, missingKeywords, cvType);
      // Re-render if we got new content
      if (retailored.wasTailored) {
        if (cvType === 'latex') {
          await renderLatexToPDF(retailored.content, jobId, MASTER_CV);
        } else {
          await renderCVtoPDF(retailored.content, jobId, MASTER_CV);
        }
      }
      return retailored.content;
    }
  );

  console.log(`[CV Pipeline] Final ATS score: ${bestScore.score}/100`);

  // Step 5: Cover letter (Section 5.7 — only if JD requires one)
  let coverLetterPath: string | null = null;
  try {
    const coverLetter = await generateCoverLetter(jobTitle, company, jd);
    if (coverLetter) {
      coverLetterPath = await saveCoverLetter(coverLetter, jobId);
      console.log(`[CV Pipeline] Cover letter generated: ${coverLetterPath}`);
    }
  } catch (error) {
    console.error('[CV Pipeline] Cover letter generation failed:', error);
  }

  // Step 6: Update the job record
  await prisma.job.update({
    where: { id: jobId },
    data: {
      cvPdfPath: renderResult.pdfPath,
      cvUpdated: wasTailored ? 1 : 0,
      atsScore: bestScore.score,
      atsFeedback: bestScore.feedback,
      coverLetterPath,
    },
  });

  return {
    cvPdfPath: renderResult.pdfPath,
    cvUpdated: wasTailored,
    atsScore: bestScore.score,
    atsFeedback: bestScore.feedback,
    coverLetterPath,
  };
}
