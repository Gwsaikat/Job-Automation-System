// ============================================
// CV Tailoring — Sections 5.3 and 5.4
// Decides whether tailoring is needed, then rewrites
// only AI-editable regions. Never invents new skills.
// ============================================

import { callAIQuality, callAIStandard, parseAIJson } from '../ai';
import prisma from '../db';
import { MASTER_CV_HTML as DEFAULT_MASTER_CV_HTML, MASTER_CV_LATEX as DEFAULT_MASTER_CV_LATEX, MASTER_SKILLS, MASTER_RESUME_TEXT } from './template';

// ---- Section 5.3: Should this CV be tailored? ----

interface TailorDecision {
  shouldTailor: boolean;
  reason: string;
  missingKeywords: string[];
}

export async function shouldTailorCV(jobDescription: string): Promise<TailorDecision> {
  const prompt = `You are an ATS optimization expert. Given a master resume and a job description, decide if the resume needs tailoring.

MASTER RESUME:
${MASTER_RESUME_TEXT}

JOB DESCRIPTION:
${jobDescription}

Answer this question: Is there a mandatory keyword or skill genuinely missing from the current resume that the candidate DOES have evidence of elsewhere in the resume (just not prominently placed)?

Return JSON only:
{
  "shouldTailor": true/false,
  "reason": "brief explanation",
  "missingKeywords": ["keyword1", "keyword2"] // only if shouldTailor is true
}

IMPORTANT: Most of the time (~60-70%), the master resume is already well-matched. Only recommend tailoring if there's a REAL gap that can be addressed by reordering/re-emphasizing existing skills. Never recommend adding skills the candidate doesn't have.`;

  const response = await callAIStandard(prompt, {
    maxTokens: 256,
    temperature: 0.1,
  });

  return parseAIJson<TailorDecision>(response);
}

// ---- Section 5.4: Tailor the editable regions ----

function extractEditableRegion(html: string, startMarker: string, endMarker: string): string {
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) return '';
  return html.substring(startIdx + startMarker.length, endIdx).trim();
}

function replaceEditableRegion(
  html: string,
  startMarker: string,
  endMarker: string,
  newContent: string
): string {
  const startIdx = html.indexOf(startMarker);
  const endIdx = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) return html;
  return (
    html.substring(0, startIdx + startMarker.length) +
    '\n' + newContent + '\n' +
    html.substring(endIdx)
  );
}

function validateNoNewSkills(tailoredHtml: string): { valid: boolean; newSkills: string[] } {
  // Extract all text content from the tailored HTML
  const textContent = tailoredHtml
    .replace(/<[^>]*>/g, ' ')
    .toLowerCase();

  // Common tech terms that might appear in tailored content
  const commonTechTerms = [
    'python', 'java', 'golang', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'angular', 'vue', 'svelte', 'django', 'flask', 'spring', 'spring boot',
    'kubernetes', 'k8s', 'terraform', 'aws', 'azure', 'gcp',
    'postgresql', 'mysql', 'cassandra', 'dynamodb',
    'graphql', 'grpc', 'kafka', 'rabbitmq',
    'machine learning', 'deep learning', 'pytorch', 'tensorflow',
  ];

  const masterSkillsLower = MASTER_SKILLS.map((s) => s.toLowerCase());
  const newSkills: string[] = [];

  for (const term of commonTechTerms) {
    if (textContent.includes(term) && !masterSkillsLower.includes(term)) {
      // Check it wasn't already in the master CV
      if (!MASTER_RESUME_TEXT.toLowerCase().includes(term)) {
        newSkills.push(term);
      }
    }
  }

  return { valid: newSkills.length === 0, newSkills };
}

export async function tailorCV(
  jobDescription: string,
  missingKeywords: string[],
  cvType: 'html' | 'latex' = 'html'
): Promise<{ content: string; wasTailored: boolean }> {
  // Fetch Master CV from Settings, fallback to template if not set
  const settingKey = cvType === 'latex' ? 'master_cv_latex' : 'master_cv_html';
  const masterCvSetting = await prisma.settings.findUnique({
    where: { key: settingKey },
  });
  const MASTER_CV = masterCvSetting?.value || (cvType === 'latex' ? DEFAULT_MASTER_CV_LATEX : DEFAULT_MASTER_CV_HTML);

  const startMarker = (section: string) => cvType === 'latex' ? `% AI_EDITABLE_${section}_START %` : `<!-- AI_EDITABLE_${section}_START -->`;
  const endMarker = (section: string) => cvType === 'latex' ? `% AI_EDITABLE_${section}_END %` : `<!-- AI_EDITABLE_${section}_END -->`;

  const currentSummary = extractEditableRegion(MASTER_CV, startMarker('SUMMARY'), endMarker('SUMMARY'));
  const currentSkills = extractEditableRegion(MASTER_CV, startMarker('SKILLS'), endMarker('SKILLS'));
  const currentProjects = extractEditableRegion(MASTER_CV, startMarker('PROJECTS'), endMarker('PROJECTS'));

  const prompt = `You are an expert ATS resume optimizer. Tailor ONLY the provided resume sections to better match the job description.

JOB DESCRIPTION:
${jobDescription}

MISSING KEYWORDS TO ADDRESS:
${missingKeywords.join(', ')}

CURRENT SUMMARY SECTION (${cvType.toUpperCase()}):
${currentSummary}

CURRENT SKILLS SECTION (${cvType.toUpperCase()}):
${currentSkills}

CURRENT PROJECTS SECTION (${cvType.toUpperCase()}):
${currentProjects}

RULES (STRICTLY ENFORCED):
1. You may ONLY rewrite the Summary, Skills ordering, and Project bullet emphasis
2. NEVER add a skill, technology, or experience not already present in the original content
3. You may re-order skills to prioritize those matching the JD
4. You may rephrase project bullets to emphasize relevant aspects
5. You may adjust the summary to better align with the role
6. Keep the EXACT same ${cvType.toUpperCase()} structure and syntax
7. Keep content concise — the final resume MUST fit on one A4 page

Return a JSON object with the three tailored sections:
{
  "summary": "<the tailored summary section ${cvType.toUpperCase()}>",
  "skills": "<the tailored skills section ${cvType.toUpperCase()}>",
  "projects": "<the tailored projects section ${cvType.toUpperCase()}>"
}

Return ONLY the JSON, no other text.`;

  try {
    const response = await callAIQuality(prompt, {
      maxTokens: 3000,
      temperature: 0.2,
    });

    const tailored = parseAIJson<{
      summary: string;
      skills: string;
      projects: string;
    }>(response);

    // Build the tailored content
    let finalContent = MASTER_CV;
    finalContent = replaceEditableRegion(
      finalContent,
      startMarker('SUMMARY'),
      endMarker('SUMMARY'),
      tailored.summary
    );
    finalContent = replaceEditableRegion(
      finalContent,
      startMarker('SKILLS'),
      endMarker('SKILLS'),
      tailored.skills
    );
    finalContent = replaceEditableRegion(
      finalContent,
      startMarker('PROJECTS'),
      endMarker('PROJECTS'),
      tailored.projects
    );

    // Post-generation diff-check: reject if new skills appear (Section 5.4)
    const validation = validateNoNewSkills(finalContent);
    if (!validation.valid) {
      console.warn(
        `[CV] Tailoring rejected — new skills detected: ${validation.newSkills.join(', ')}. Falling back to master CV.`
      );
      return { content: MASTER_CV, wasTailored: false };
    }

    return { content: finalContent, wasTailored: true };
  } catch (error) {
    console.error('[CV] Tailoring failed, using master CV:', error);
    return { content: MASTER_CV, wasTailored: false };
  }
}
