// ============================================
// Common types for all scrapers — Section 4.3
// ============================================

export interface RawJob {
  sourceId: string;       // e.g. `adzuna_${originalId}` — used for dedup
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number;      // 0 if unknown
  salaryMax: number;
  url: string;
  datePosted: string;
  source: string;
  experienceRequired?: string; // e.g. "0-2 years", "Fresher", "3+ years"
}

export interface RawChallenge {
  sourceId: string;
  challengeName: string;
  company: string;
  source: string;
  applyLink: string;
  deadline: string;
  platform?: string;       // Unstop, HackerEarth, Devfolio, etc.
  challengeType?: string;  // "hiring" | "competition"
}

// Location categories with implicit priority ordering
export type LocationCategory =
  | 'Remote (Worldwide)'      // Priority 1
  | 'Remote (India)'           // Priority 2
  | 'Kolkata'                  // Priority 3
  | 'Kolkata (₹XL)'
  | 'Kolkata (Salary TBD)'
  | 'Other India (₹XL)'       // Priority 4
  | 'Other India (Salary TBD)'
  | null; // null means rejected

// Location priority for scoring (lower = better)
export const LOCATION_PRIORITY: Record<string, number> = {
  'Remote (Worldwide)': 1,
  'Remote (India)': 2,
  'Kolkata': 3,
  'Kolkata (₹XL)': 3,
  'Kolkata (Salary TBD)': 3,
  'Other India (₹XL)': 4,
  'Other India (Salary TBD)': 4,
};
