// ============================================
// Location + Salary Filter — Section 4.6
// Exact logic from the BUILD_PROMPT
// ============================================

import { RawJob, LocationCategory } from '../scrapers/types';

const REMOTE_KEYWORDS = ['remote', 'wfh', 'work from home'];
const REMOTE_DESC_KEYWORDS = ['fully remote', '100% remote', 'work from anywhere'];
const KOLKATA_KEYWORDS = ['kolkata', 'calcutta', 'west bengal'];
const OTHER_INDIA_KEYWORDS = [
  'india', 'bengaluru', 'bangalore', 'mumbai', 'delhi',
  'hyderabad', 'pune', 'chennai', 'noida', 'gurgaon',
  'gurugram', 'ahmedabad',
];

const KOLKATA_MIN_SALARY = 500000;       // ₹5 LPA
const OTHER_INDIA_MIN_SALARY = 600000;   // ₹6 LPA — deliberately different, do not merge

function containsAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

export interface FilterResult {
  passed: boolean;
  category: LocationCategory;
  rejectReason: string | null;
  salaryDisplay: string;
}

export function filterJobByLocation(job: RawJob): FilterResult {
  const locationLower = (job.location || '').toLowerCase();
  const titleLower = (job.title || '').toLowerCase();
  const descLower = (job.description || '').toLowerCase();

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
    const salaryInLakhs = Math.round(highSalary / 100000);
    salaryDisplay = `₹${salaryInLakhs}L`;
  }

  // Apply the exact filter logic from Section 4.6
  if (isRemote) {
    return {
      passed: true,
      category: 'Remote (Worldwide)',
      rejectReason: null,
      salaryDisplay,
    };
  }

  if (isKolkata) {
    if (noSalary || highSalary >= KOLKATA_MIN_SALARY) {
      return {
        passed: true,
        category: noSalary ? 'Kolkata (Salary TBD)' : 'Kolkata (₹XL)',
        rejectReason: null,
        salaryDisplay,
      };
    }
    return {
      passed: false,
      category: null,
      rejectReason: `Kolkata salary too low: ${salaryDisplay} (min ₹5L)`,
      salaryDisplay,
    };
  }

  if (isOtherIndia) {
    if (!noSalary && highSalary >= OTHER_INDIA_MIN_SALARY) {
      return {
        passed: true,
        category: 'Other India (₹XL)',
        rejectReason: null,
        salaryDisplay,
      };
    }
    if (noSalary) {
      return {
        passed: false,
        category: null,
        rejectReason: `Other India city with no salary mentioned`,
        salaryDisplay,
      };
    }
    return {
      passed: false,
      category: null,
      rejectReason: `Other India salary too low: ${salaryDisplay} (min ₹6L)`,
      salaryDisplay,
    };
  }

  // Not India and not remote
  return {
    passed: false,
    category: null,
    rejectReason: 'Location outside India and not remote',
    salaryDisplay,
  };
}

export async function filterJobByTechFit(job: RawJob): Promise<{ passed: boolean; rejectReason: string | null }> {
  // First, do a quick keyword check to avoid calling AI for obvious non-tech jobs
  const textLower = `${job.title} ${job.description}`.toLowerCase();
  
  // Negative keywords (fast reject)
  const nonTechKeywords = [
    'flight coordinator', 'medical assistant', 'nurse', 'doctor', 'driver', 'warehouse', 
    'delivery', 'cashier', 'chef', 'cook', 'waiter', 'receptionist', 'plumber', 'electrician'
  ];
  
  for (const kw of nonTechKeywords) {
    if (textLower.includes(kw)) {
      return { passed: false, rejectReason: `Non-tech role detected (${kw})` };
    }
  }

  // Import callAIStandard and parseAIJson dynamically to avoid circular deps if any
  const { callAIStandard, parseAIJson } = await import('../ai');

  const prompt = `
You are an expert technical recruiter filtering jobs for a Software Engineer whose core stack is:
MERN Stack, React.js, Node.js, Express.js, MongoDB, TypeScript, Full-Stack Development.
The candidate is open to general Software Engineering, Frontend, or Backend roles, even if they use Python/Java, as long as it's a coding/developer role.
The candidate is NOT interested in non-tech roles (e.g., Sales, HR, Medical, Aviation, Customer Support, Marketing) or purely IT support roles (e.g., Helpdesk).

Job Title: ${job.title}
Company: ${job.company}
Description:
${job.description.substring(0, 1500)} // truncate to save tokens

Determine if this job is a fit for the candidate. Return ONLY a JSON object with:
- "passed": boolean (true if it's a software engineering/developer role, false otherwise)
- "rejectReason": string (if passed is false, brief reason why. If passed is true, leave empty)
`;

  try {
    const aiResponse = await callAIStandard(prompt, { maxTokens: 100, temperature: 0.1 });
    const result = parseAIJson<{ passed: boolean; rejectReason: string }>(aiResponse);
    return {
      passed: Boolean(result.passed),
      rejectReason: result.passed ? null : (result.rejectReason || 'AI determined job is not a tech fit'),
    };
  } catch (error) {
    console.warn(`[Filter] Tech fit AI check failed for ${job.title}, passing by default:`, error);
    return { passed: true, rejectReason: null }; // Fail open so we don't drop jobs if AI errors
  }
}
