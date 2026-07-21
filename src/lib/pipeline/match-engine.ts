// ============================================
// Career OS — Multi-Dimensional Match Scoring Engine
// 12 dimensions, weighted scoring, 85% threshold
// Deterministic where possible, AI only where necessary
// ============================================

import { CANDIDATE, CANDIDATE_SKILL_KEYWORDS, getSkillsSummary, getProjectsSummary } from '../candidate-profile';
import { RawJob, LOCATION_PRIORITY } from '../scrapers/types';
import { FilterResult } from './filter';

// ---- Score Dimensions ----

export interface MatchScores {
  atsKeywordMatch: number;         // 15% — keyword overlap
  skillMatch: number;              // 15% — direct skill alignment
  projectRelevance: number;        // 10% — AI: do projects match?
  experienceMatch: number;         // 10% — years/level alignment
  locationMatch: number;           // 10% — priority tier
  salaryMatch: number;             // 10% — meets threshold
  remoteScore: number;             // 5%  — remote preference
  hiringProbability: number;       // 10% — AI: active hiring signals
  recruiterResponseProb: number;   // 5%  — based on role urgency
  referralProbability: number;     // 5%  — contacts found
  founderNetworkValue: number;     // 5%  — startup signals
  overallScore: number;            // weighted composite
}

export type MatchTier = 'qualified' | 'below_threshold' | 'rejected';

const WEIGHTS = {
  atsKeywordMatch: 0.15,
  skillMatch: 0.15,
  projectRelevance: 0.10,
  experienceMatch: 0.10,
  locationMatch: 0.10,
  salaryMatch: 0.10,
  remoteScore: 0.05,
  hiringProbability: 0.10,
  recruiterResponseProb: 0.05,
  referralProbability: 0.05,
  founderNetworkValue: 0.05,
};

const QUALIFIED_THRESHOLD = 85;
const BELOW_THRESHOLD_MIN = 70;

// ============================================
// Deterministic Scoring (no AI tokens)
// ============================================

function scoreATSKeywords(job: RawJob): number {
  const jdLower = `${job.title} ${job.description}`.toLowerCase();
  const jdWords = new Set(jdLower.split(/[\s,;.|/()[\]{}]+/).filter(w => w.length > 2));

  let matches = 0;
  let total = 0;

  for (const keyword of CANDIDATE_SKILL_KEYWORDS) {
    if (keyword.length < 3) continue;
    total++;
    if (jdLower.includes(keyword)) {
      matches++;
    }
  }

  if (total === 0) return 50; // neutral
  const matchRate = matches / Math.min(total, 30); // normalize against reasonable ceiling
  return Math.min(100, Math.round(matchRate * 100 * 2.5)); // scale up — 40%+ keyword match = 100
}

function scoreSkillMatch(job: RawJob): number {
  const jdLower = `${job.title} ${job.description}`.toLowerCase();

  // Core stack keywords that matter most
  const coreKeywords = [
    'react', 'node', 'nodejs', 'node.js', 'express', 'mongodb', 'mern',
    'typescript', 'javascript', 'next.js', 'nextjs', 'full stack', 'fullstack',
    'full-stack', 'api', 'rest', 'websocket', 'socket.io',
  ];

  const secondaryKeywords = [
    'redis', 'docker', 'git', 'ci/cd', 'jwt', 'html', 'css',
    'langchain', 'openai', 'ai', 'machine learning', 'python', 'java', 'sql',
  ];

  let coreMatches = 0;
  for (const kw of coreKeywords) {
    if (jdLower.includes(kw)) coreMatches++;
  }

  let secondaryMatches = 0;
  for (const kw of secondaryKeywords) {
    if (jdLower.includes(kw)) secondaryMatches++;
  }

  // Score: core matches matter 3x more
  const rawScore = (coreMatches * 3 + secondaryMatches) / (coreKeywords.length * 3 + secondaryKeywords.length);
  return Math.min(100, Math.round(rawScore * 100 * 3)); // scale — hitting 33% of weighted keywords = 100
}

function scoreExperienceMatch(job: RawJob): number {
  const textLower = `${job.title} ${job.description?.substring(0, 800) || ''}`.toLowerCase();

  // Perfect 0-1 year match indicators
  const perfectKeywords = ['fresher', 'freshers', 'new grad', 'entry level', 'entry-level', '0-1', '0-1 year', '0-1 yrs', 'campus', 'graduate trainee', 'trainee', 'apprentice'];
  for (const kw of perfectKeywords) {
    if (textLower.includes(kw)) return 100;
  }

  // Good entry-level match
  const goodKeywords = ['junior', 'associate', 'intern', '0-2', '1 year', '1 yr'];
  for (const kw of goodKeywords) {
    if (textLower.includes(kw)) return 90;
  }

  // No experience requirement mentioned — neutral entry-level
  if (!/\b\d+\s*(?:\+?\s*)?(?:years?|yrs?)\b/i.test(textLower)) return 80;

  // 2+ years experience mentioned — low score for entry-level candidate
  return 40;
}

function scoreLocation(filterResult: FilterResult): number {
  if (!filterResult.passed || filterResult.locationPriority === null) return 0;

  const priorityScores: Record<number, number> = {
    1: 100,  // Remote Worldwide
    2: 90,   // Remote India
    3: 80,   // Kolkata
    4: 70,   // Other India
  };

  return priorityScores[filterResult.locationPriority] || 50;
}

function scoreSalary(job: RawJob, filterResult: FilterResult): number {
  const highSalary = Math.max(job.salaryMin, job.salaryMax);
  const noSalary = job.salaryMin === 0 && job.salaryMax === 0;

  if (noSalary) return 60; // Unknown — neutral

  // Competitive salary scoring
  if (highSalary >= 1500000) return 100;  // ≥15 LPA — excellent
  if (highSalary >= 1000000) return 95;   // ≥10 LPA — very good
  if (highSalary >= 800000) return 85;    // ≥8 LPA — good
  if (highSalary >= 650000) return 75;    // ≥6.5 LPA — decent
  if (highSalary >= 500000) return 65;    // ≥5 LPA — acceptable
  if (highSalary >= 350000) return 55;    // ≥3.5 LPA — minimum viable

  return 40; // Below minimum
}

function scoreRemote(job: RawJob, filterResult: FilterResult): number {
  const category = filterResult.category || '';
  if (category.includes('Remote (Worldwide)')) return 100;
  if (category.includes('Remote (India)')) return 90;
  if (category.includes('Kolkata')) return 60; // local — okay
  return 50; // onsite elsewhere
}

function scoreRecruiterResponse(job: RawJob): number {
  // Heuristics based on posting freshness and company signals
  const desc = (job.description || '').toLowerCase();

  let score = 60; // baseline

  // Urgency signals
  if (desc.includes('urgent') || desc.includes('immediately') || desc.includes('asap')) score += 15;
  if (desc.includes('hiring now') || desc.includes('start immediately')) score += 10;
  if (desc.includes('multiple openings') || desc.includes('multiple positions')) score += 10;

  // Startup signals (usually more responsive)
  if (desc.includes('startup') || desc.includes('early stage') || desc.includes('seed')) score += 5;
  if (desc.includes('series a') || desc.includes('series b')) score += 5;

  return Math.min(100, score);
}

function scoreReferralProbability(hasContacts: boolean): number {
  return hasContacts ? 80 : 40;
}

function scoreFounderNetworkValue(job: RawJob): number {
  const desc = (job.description || '').toLowerCase();

  let score = 40; // baseline

  // Startup / growth signals
  if (desc.includes('startup') || desc.includes('founded')) score += 20;
  if (desc.includes('series a') || desc.includes('series b') || desc.includes('seed funded')) score += 15;
  if (desc.includes('growing') || desc.includes('scaling') || desc.includes('expanding')) score += 10;
  if (desc.includes('founding') || desc.includes('first engineer') || desc.includes('small team')) score += 15;

  return Math.min(100, score);
}

// ============================================
// AI-Powered Scoring (batched into single call)
// ============================================

async function scoreWithAI(job: RawJob): Promise<{ projectRelevance: number; hiringProbability: number; ghostJobRisk: 'low' | 'medium' | 'high'; legitimacyScore: number }> {
  try {
    const { callAIStandard, parseAIJson } = await import('../ai');
    const { getProjectsSummary } = await import('../candidate-profile');

    const prompt = `Score this job opportunity for a MERN-stack developer and perform a scam/ghost-job legitimacy check. Return JSON only.

JOB: ${job.title} at ${job.company}
DESCRIPTION: ${(job.description || '').substring(0, 1000)}

CANDIDATE PROJECTS:
${getProjectsSummary()}

Evaluate:
1. projectRelevance (0-100): How well candidate's projects demonstrate needed skills
2. hiringProbability (0-100): Likelihood this is active hiring vs stale/ghost listing
3. ghostJobRisk ("low" | "medium" | "high"): Is this likely a resume harvester, scam, or evergreen ghost job?
4. legitimacyScore (0-100): Overall authenticity score

Return: {"projectRelevance": number, "hiringProbability": number, "ghostJobRisk": "low"|"medium"|"high", "legitimacyScore": number}`;

    const response = await callAIStandard(prompt, { maxTokens: 150, temperature: 0.2 });
    const result = parseAIJson<{ projectRelevance: number; hiringProbability: number; ghostJobRisk: 'low' | 'medium' | 'high'; legitimacyScore: number }>(response);

    return {
      projectRelevance: Math.max(0, Math.min(100, result.projectRelevance || 60)),
      hiringProbability: Math.max(0, Math.min(100, result.hiringProbability || 60)),
      ghostJobRisk: result.ghostJobRisk || 'low',
      legitimacyScore: Math.max(0, Math.min(100, result.legitimacyScore || 85)),
    };
  } catch (error) {
    console.warn('[MatchEngine] AI scoring failed, using defaults:', error);
    return { projectRelevance: 65, hiringProbability: 65, ghostJobRisk: 'low', legitimacyScore: 80 };
  }
}

// ============================================
// Main Scoring Function
// ============================================

export async function computeMatchScores(
  job: RawJob,
  filterResult: FilterResult,
  hasApolloContacts: boolean = false,
): Promise<MatchScores> {
  // Deterministic scores (free)
  const atsKeywordMatch = scoreATSKeywords(job);
  const skillMatch = scoreSkillMatch(job);
  const experienceMatch = scoreExperienceMatch(job);
  const locationMatch = scoreLocation(filterResult);
  const salaryMatch = scoreSalary(job, filterResult);
  const remoteScore = scoreRemote(job, filterResult);
  const recruiterResponseProb = scoreRecruiterResponse(job);
  const referralProbability = scoreReferralProbability(hasApolloContacts);
  const founderNetworkValue = scoreFounderNetworkValue(job);

  // AI scores (1 API call)
  const aiScores = await scoreWithAI(job);

  const scores = {
    atsKeywordMatch,
    skillMatch,
    projectRelevance: aiScores.projectRelevance,
    experienceMatch,
    locationMatch,
    salaryMatch,
    remoteScore,
    hiringProbability: aiScores.hiringProbability,
    recruiterResponseProb,
    referralProbability,
    founderNetworkValue,
  };

  // Compute weighted overall score
  let overallScore = 0;
  for (const [key, weight] of Object.entries(WEIGHTS)) {
    overallScore += (scores[key as keyof typeof scores] || 0) * weight;
  }

  return {
    ...scores,
    overallScore: Math.round(overallScore),
  };
}

// ============================================
// Tier Classification
// ============================================

export function classifyTier(overallScore: number): MatchTier {
  if (overallScore >= QUALIFIED_THRESHOLD) return 'qualified';
  if (overallScore >= BELOW_THRESHOLD_MIN) return 'below_threshold';
  return 'rejected';
}

export { QUALIFIED_THRESHOLD, BELOW_THRESHOLD_MIN };
