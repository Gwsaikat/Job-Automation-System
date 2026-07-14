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
}

export interface RawChallenge {
  sourceId: string;
  challengeName: string;
  company: string;
  source: string;
  applyLink: string;
  deadline: string;
}

export type LocationCategory =
  | 'Remote (Worldwide)'
  | 'Kolkata (₹XL)'
  | 'Kolkata (Salary TBD)'
  | 'Other India (₹XL)'
  | null; // null means rejected
