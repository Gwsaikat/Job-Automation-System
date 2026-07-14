// ============================================
// ATS Scoring + Retry Loop — Section 5.6
// Scores CV against JD (0-100), retries up to 3 times,
// always keeps the highest-scoring version
// ============================================

import { callAIQuality, parseAIJson } from '../ai';

export interface ATSScore {
  score: number;
  feedback: string;
  breakdown: {
    keywordMatch: number;       // 40%
    skillAlignment: number;     // 30%
    roleRelevance: number;      // 20%
    atsFormatting: number;      // 10%
  };
  missingKeywords: string[];
}

const PASS_THRESHOLD = 95;

export async function scoreCV(
  cvText: string,
  jobDescription: string
): Promise<ATSScore> {
  const prompt = `You are an ATS (Applicant Tracking System) scoring expert. Score this resume against the job description.

RESUME:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Score on a 0-100 scale using this exact weighting:
- Keyword Match (40%): How many required keywords from the JD appear in the resume?
- Skill Alignment (30%): Do the candidate's skills match the role requirements?
- Role Relevance (20%): How relevant is the candidate's experience to this specific role?
- ATS Formatting Readability (10%): Is the resume ATS-friendly (clean formatting, standard sections)?

Return JSON only:
{
  "score": <total 0-100>,
  "feedback": "<2-3 sentence summary of strengths and gaps>",
  "breakdown": {
    "keywordMatch": <0-100>,
    "skillAlignment": <0-100>,
    "roleRelevance": <0-100>,
    "atsFormatting": <0-100>
  },
  "missingKeywords": ["keyword1", "keyword2"]
}`;

  const response = await callAIQuality(prompt, {
    maxTokens: 512,
    temperature: 0.1,
  });

  return parseAIJson<ATSScore>(response);
}

/**
 * Score with retry loop (Section 5.6).
 * Tries up to 3 times, each time feeding back missing keywords.
 * Returns the highest-scoring result — never blocks the pipeline.
 */
export async function scoreCVWithRetry(
  cvHtml: string,
  jobDescription: string,
  regenerateCV?: (missingKeywords: string[], previousScore: number) => Promise<string>
): Promise<{ bestScore: ATSScore; finalCvHtml: string }> {
  // Strip HTML tags for scoring
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  let bestScore: ATSScore | null = null;
  let bestCvHtml = cvHtml;
  let currentCvHtml = cvHtml;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const cvText = stripHtml(currentCvHtml);
      const score = await scoreCV(cvText, jobDescription);

      console.log(
        `[ATS] Attempt ${attempt + 1}: Score ${score.score}/100 (${score.score >= PASS_THRESHOLD ? 'PASS' : 'FAIL'})`
      );

      // Keep the highest-scoring version
      if (!bestScore || score.score > bestScore.score) {
        bestScore = score;
        bestCvHtml = currentCvHtml;
      }

      // If passed threshold, we're done
      if (score.score >= PASS_THRESHOLD) {
        return { bestScore: score, finalCvHtml: currentCvHtml };
      }

      // If we can regenerate, try with feedback
      if (regenerateCV && attempt < 2) {
        console.log(
          `[ATS] Missing keywords: ${score.missingKeywords.join(', ')}. Regenerating...`
        );
        currentCvHtml = await regenerateCV(score.missingKeywords, score.score);
      }
    } catch (error) {
      console.error(`[ATS] Scoring attempt ${attempt + 1} failed:`, error);
    }
  }

  // Return whichever version scored highest — never block the pipeline
  return {
    bestScore: bestScore || {
      score: 0,
      feedback: 'Scoring failed after all attempts',
      breakdown: { keywordMatch: 0, skillAlignment: 0, roleRelevance: 0, atsFormatting: 0 },
      missingKeywords: [],
    },
    finalCvHtml: bestCvHtml,
  };
}
