// ============================================
// CV Tailoring — Sections 5.3 and 5.4
// Decides whether tailoring is needed, then rewrites
// only AI-editable regions using Google's XYZ formula.
// Includes hidden ATS keyword optimization tricks.
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

// ---- Section 5.4: Tailor editable regions ----

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
  cvType: 'html' | 'latex' = 'latex'
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

  const prompt = `You are a world-class ATS resume optimizer. Tailor ONLY the provided resume sections to match the job description using Google's XYZ Formula and ATS keyword optimization.

GOOGLE'S XYZ FORMULA:
Structure bullet points as: "Accomplished [X] as measured by [Y], by doing [Z]".
Example: "Engineered a real-time critical path calculation engine handling 50+ concurrent task nodes with <50ms latency (as measured by performance benchmarks) by implementing Kahn's topological sort and a Redis pub-sub caching layer."

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
1. Apply Google's XYZ Formula to project bullet points.
2. Highlight relevant skills matching the JD.
3. NEVER add a fake skill or technology not present in candidate's original resume.
4. Keep the EXACT same ${cvType.toUpperCase()} structure and formatting tags.
5. Must fit on one A4 page.

Return JSON:
{
  "summary": "<tailored summary>",
  "skills": "<tailored skills>",
  "projects": "<tailored projects>",
  "atsKeywords": ["matched_keyword_1", "matched_keyword_2", "matched_keyword_3"]
}

Return ONLY the JSON.`;

  try {
    const response = await callAIQuality(prompt, {
      maxTokens: 3000,
      temperature: 0.2,
    });

    const tailored = parseAIJson<{
      summary: string;
      skills: string;
      projects: string;
      atsKeywords?: string[];
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

    // ATS Keyword Bypassing Trick: Inject structured white-text / metadata keywords
    const keywordsToInject = (tailored.atsKeywords || missingKeywords).slice(0, 15).join(', ');
    if (keywordsToInject) {
      const atsBlock = cvType === 'latex'
        ? `\\vbox to 0pt{\\color{white}\\tiny \\textbf{ATS Optimization Metadata:} ${keywordsToInject}\\vss}`
        : `<span style="display:none; font-size:0.1px; color:#ffffff; max-height:0px; overflow:hidden;">ATS Keywords: ${keywordsToInject}</span>`;

      finalContent = replaceEditableRegion(
        finalContent,
        startMarker('ATS_KEYWORDS'),
        endMarker('ATS_KEYWORDS'),
        atsBlock
      );
    }

    // Post-generation diff-check: reject if new skills appear
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
