// ============================================
// Career OS — Enhanced Filter Engine
// Multi-gate filter: Visa → Role → Experience → Location/Salary → Tech Fit
// Quality > Quantity: reject early, save AI tokens
// ============================================

import { RawJob, LocationCategory } from '../scrapers/types';
import { CANDIDATE } from '../candidate-profile';

// ---- Location Keywords ----

const REMOTE_KEYWORDS = ['remote', 'wfh', 'work from home'];
const REMOTE_DESC_KEYWORDS = ['fully remote', '100% remote', 'work from anywhere', 'remote worldwide', 'remote-first', 'work from anywhere in the world'];
const REMOTE_INDIA_KEYWORDS = ['remote india', 'remote - india', 'wfh india', 'work from home india', 'india remote'];
const KOLKATA_KEYWORDS = ['kolkata', 'calcutta', 'west bengal'];
const OTHER_INDIA_KEYWORDS = [
  'india', 'bengaluru', 'bangalore', 'mumbai', 'delhi',
  'hyderabad', 'pune', 'chennai', 'noida', 'gurgaon',
  'gurugram', 'ahmedabad',
];

// ---- Salary Thresholds (from user spec) ----

const REMOTE_MIN_SALARY = 350000;          // ₹3.5 LPA for remote
const KOLKATA_MIN_SALARY = 500000;         // ₹5 LPA for Kolkata
const OTHER_INDIA_MIN_SALARY = 650000;     // ₹6.5 LPA for other India cities

// ---- Non-tech role keywords for fast rejection ----

const NON_TECH_KEYWORDS = [
  'flight coordinator', 'medical assistant', 'nurse', 'doctor', 'driver',
  'warehouse', 'delivery', 'cashier', 'chef', 'cook', 'waiter', 'receptionist',
  'plumber', 'electrician', 'sales executive', 'marketing manager',
  'content writer', 'graphic designer', 'hr executive', 'accountant',
  'customer support', 'customer service', 'helpdesk', 'data entry',
  'telecaller', 'bpo', 'call center',
];

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

function containsWord(text: string, word: string): boolean {
  const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
  return regex.test(text);
}

// ---- Result Types ----

export interface FilterResult {
  passed: boolean;
  category: LocationCategory;
  rejectReason: string | null;
  salaryDisplay: string;
  locationPriority: number | null;
}

export interface GateResult {
  passed: boolean;
  rejectReason: string | null;
  gate: string;
}

// ============================================
// GATE 1: Visa/Citizenship Filter (zero cost)
// ============================================

export function filterByVisa(job: RawJob): GateResult {
  const textLower = `${job.title} ${job.description} ${job.location}`.toLowerCase();

  for (const keyword of CANDIDATE.visaRejectKeywords) {
    if (textLower.includes(keyword)) {
      return {
        passed: false,
        rejectReason: `Visa/auth requirement detected: "${keyword}"`,
        gate: 'visa',
      };
    }
  }

  return { passed: true, rejectReason: null, gate: 'visa' };
}

// ============================================
// GATE 2: Role Title Filter (zero cost)
// ============================================

export function filterByRole(job: RawJob): GateResult {
  const titleLower = (job.title || '').toLowerCase();

  // Check for non-tech roles first
  for (const kw of NON_TECH_KEYWORDS) {
    if (titleLower.includes(kw)) {
      return {
        passed: false,
        rejectReason: `Non-tech role: "${kw}"`,
        gate: 'role',
      };
    }
  }

  // Check for rejected seniority levels
  for (const reject of CANDIDATE.rejectRoleTitles) {
    if (containsWord(titleLower, reject)) {
      // Exception: "team lead" for very small teams, "senior" in company name, etc.
      // But we err on the side of rejection per spec
      return {
        passed: false,
        rejectReason: `Seniority too high: title contains "${reject}"`,
        gate: 'role',
      };
    }
  }

  // Check if the role title matches at least one accepted keyword
  const hasAcceptedRole = CANDIDATE.acceptRoleTitles.some(accept =>
    titleLower.includes(accept)
  );

  if (!hasAcceptedRole) {
    // Check if description contains software/developer keywords as fallback
    const descLower = (job.description || '').toLowerCase().substring(0, 500);
    const hasTechInDesc = ['software', 'developer', 'engineer', 'coding', 'programming', 'full stack', 'frontend', 'backend', 'react', 'node', 'typescript', 'javascript'].some(kw => descLower.includes(kw));
    if (!hasTechInDesc) {
      return {
        passed: false,
        rejectReason: `Title "${job.title}" does not match any accepted role keywords`,
        gate: 'role',
      };
    }
  }

  return { passed: true, rejectReason: null, gate: 'role' };
}

// ============================================
// GATE 3: Experience Level Filter (zero cost)
// ============================================

export function filterByExperience(job: RawJob): GateResult {
  const textLower = `${job.title} ${job.description?.substring(0, 1000) || ''}`.toLowerCase();

  // Check for explicit rejection experience levels
  for (const reject of CANDIDATE.rejectExperienceLevels) {
    // Look for patterns like "3+ years", "5-7 years experience"
    const yearPattern = new RegExp(`\\b${reject.replace('+', '\\+')}\\s*(?:years?|yrs?)`, 'i');
    if (yearPattern.test(textLower)) {
      return {
        passed: false,
        rejectReason: `Experience too high: requires "${reject}" years`,
        gate: 'experience',
      };
    }
    // Also check for "senior" level
    if (reject === 'senior' && containsWord(textLower.substring(0, 200), 'senior')) {
      // Only reject if "senior" is in the title portion, not deep in description
      if (containsWord((job.title || '').toLowerCase(), 'senior')) {
        return {
          passed: false,
          rejectReason: 'Senior-level position',
          gate: 'experience',
        };
      }
    }
  }

  return { passed: true, rejectReason: null, gate: 'experience' };
}

// ============================================
// GATE 4: Location + Salary Filter
// ============================================

export function filterByLocationSalary(job: RawJob): FilterResult {
  const locationLower = (job.location || '').toLowerCase();
  const titleLower = (job.title || '').toLowerCase();
  const descLower = (job.description || '').toLowerCase();

  // Determine location type
  const isRemoteIndia = containsAny(`${locationLower} ${descLower}`, REMOTE_INDIA_KEYWORDS);
  const isRemote =
    containsAny(job.location, REMOTE_KEYWORDS) ||
    containsAny(job.title, ['remote']) ||
    containsAny(job.description, REMOTE_DESC_KEYWORDS);
  const isKolkata = containsAny(job.location, KOLKATA_KEYWORDS);
  const isOtherIndia = !isKolkata && containsAny(job.location, OTHER_INDIA_KEYWORDS);

  const highSalary = Math.max(job.salaryMin, job.salaryMax);
  const noSalary = job.salaryMin === 0 && job.salaryMax === 0;

  // Format salary display
  let salaryDisplay = 'Not Mentioned';
  if (!noSalary) {
    if (highSalary >= 100000) {
      const salaryInLakhs = Math.round(highSalary / 100000);
      salaryDisplay = `₹${salaryInLakhs}L`;
    } else {
      // Could be in USD/other currency
      salaryDisplay = `$${Math.round(highSalary).toLocaleString()}`;
    }
  }

  // ---- Remote (Priority 1-2) ----
  if (isRemote) {
    if (!noSalary && highSalary < REMOTE_MIN_SALARY && highSalary > 1000) {
      // Only reject if explicit salary is below threshold
      // (highSalary > 1000 guards against currency conversion issues)
      return {
        passed: false,
        category: null,
        rejectReason: `Remote salary too low: ${salaryDisplay} (min ₹3.5L)`,
        salaryDisplay,
        locationPriority: null,
      };
    }
    const category: LocationCategory = isRemoteIndia ? 'Remote (India)' : 'Remote (Worldwide)';
    return {
      passed: true,
      category,
      rejectReason: null,
      salaryDisplay,
      locationPriority: isRemoteIndia ? 2 : 1,
    };
  }

  // ---- Kolkata (Priority 3) ----
  if (isKolkata) {
    if (noSalary || highSalary >= KOLKATA_MIN_SALARY) {
      return {
        passed: true,
        category: noSalary ? 'Kolkata (Salary TBD)' : 'Kolkata (₹XL)',
        rejectReason: null,
        salaryDisplay,
        locationPriority: 3,
      };
    }
    return {
      passed: false,
      category: null,
      rejectReason: `Kolkata salary too low: ${salaryDisplay} (min ₹5L)`,
      salaryDisplay,
      locationPriority: null,
    };
  }

  // ---- Other India (Priority 4) ----
  if (isOtherIndia) {
    if (!noSalary && highSalary >= OTHER_INDIA_MIN_SALARY) {
      return {
        passed: true,
        category: 'Other India (₹XL)',
        rejectReason: null,
        salaryDisplay,
        locationPriority: 4,
      };
    }
    if (noSalary) {
      // Pass with TBD — user spec doesn't hard-reject "no salary" for India cities
      return {
        passed: true,
        category: 'Other India (Salary TBD)',
        rejectReason: null,
        salaryDisplay,
        locationPriority: 4,
      };
    }
    return {
      passed: false,
      category: null,
      rejectReason: `Other India salary too low: ${salaryDisplay} (min ₹6.5L)`,
      salaryDisplay,
      locationPriority: null,
    };
  }

  // ---- Not India and not Remote → Reject ----
  return {
    passed: false,
    category: null,
    rejectReason: 'Location outside India and not remote',
    salaryDisplay,
    locationPriority: null,
  };
}

// ============================================
// GATE 5: AI Tech Fit Check (costs tokens)
// Only called AFTER all free gates pass
// ============================================

export async function filterByTechFit(job: RawJob): Promise<GateResult> {
  const { callAIStandard, parseAIJson } = await import('../ai');
  const { getSkillsSummary } = await import('../candidate-profile');

  const prompt = `You are an expert technical recruiter. Determine if this job is a genuine software engineering/developer role suitable for a MERN-stack developer.

CANDIDATE SKILLS:
${getSkillsSummary()}

JOB:
Title: ${job.title}
Company: ${job.company}
Description:
${(job.description || '').substring(0, 1500)}

Rules:
- ACCEPT: Software engineering, web development, full-stack, frontend, backend roles even if they use Python/Java/Go
- ACCEPT: DevOps, platform, cloud roles IF they involve coding
- REJECT: Pure IT support, helpdesk, network admin, non-coding roles
- REJECT: Sales, marketing, HR, content, design roles
- REJECT: Data entry, BPO, telecalling roles

Return JSON only: {"passed": boolean, "rejectReason": "brief reason if rejected"}`;

  try {
    const aiResponse = await callAIStandard(prompt, { maxTokens: 100, temperature: 0.1 });
    const result = parseAIJson<{ passed: boolean; rejectReason: string }>(aiResponse);
    return {
      passed: Boolean(result.passed),
      rejectReason: result.passed ? null : (result.rejectReason || 'AI: not a tech fit'),
      gate: 'techFit',
    };
  } catch (error) {
    console.warn(`[Filter] Tech fit AI check failed for ${job.title}, passing by default:`, error);
    return { passed: true, rejectReason: null, gate: 'techFit' };
  }
}

// ============================================
// COMBINED: Run all gates in order
// ============================================

export interface FullFilterResult {
  passed: boolean;
  filterResult: FilterResult | null;
  rejectReason: string | null;
  rejectGate: string | null;
}

export async function runAllFilterGates(job: RawJob): Promise<FullFilterResult> {
  // Gate 1: Visa (free)
  const visa = filterByVisa(job);
  if (!visa.passed) {
    return { passed: false, filterResult: null, rejectReason: visa.rejectReason, rejectGate: 'visa' };
  }

  // Gate 2: Role (free)
  const role = filterByRole(job);
  if (!role.passed) {
    return { passed: false, filterResult: null, rejectReason: role.rejectReason, rejectGate: 'role' };
  }

  // Gate 3: Experience (free)
  const exp = filterByExperience(job);
  if (!exp.passed) {
    return { passed: false, filterResult: null, rejectReason: exp.rejectReason, rejectGate: 'experience' };
  }

  // Gate 4: Location + Salary (free)
  const locSalary = filterByLocationSalary(job);
  if (!locSalary.passed) {
    return { passed: false, filterResult: locSalary, rejectReason: locSalary.rejectReason, rejectGate: 'location' };
  }

  // Gate 5: AI Tech Fit (costs tokens — only if all free gates pass)
  const tech = await filterByTechFit(job);
  if (!tech.passed) {
    return { passed: false, filterResult: locSalary, rejectReason: tech.rejectReason, rejectGate: 'techFit' };
  }

  return { passed: true, filterResult: locSalary, rejectReason: null, rejectGate: null };
}

// ============================================
// Backward compatibility exports
// ============================================

export function filterJobByLocation(job: RawJob): FilterResult {
  return filterByLocationSalary(job);
}

export async function filterJobByTechFit(job: RawJob): Promise<{ passed: boolean; rejectReason: string | null }> {
  const result = await filterByTechFit(job);
  return { passed: result.passed, rejectReason: result.rejectReason };
}
