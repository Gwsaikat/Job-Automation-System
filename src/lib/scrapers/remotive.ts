// ============================================
// Remotive Scraper — Section 4.1
// No API key needed
// ============================================

import { RawJob } from './types';

interface RemotiveJob {
  id: number;
  title: string;
  company_name: string;
  candidate_required_location?: string;
  description: string;
  salary?: string;
  url: string;
  publication_date: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

export async function scrapeRemotive(): Promise<RawJob[]> {
  const url = 'https://remotive.com/api/remote-jobs?category=software-dev&search=react nodejs javascript&limit=50';

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Remotive returned ${response.status}: ${await response.text()}`);
  }

  const data: RemotiveResponse = await response.json();

  return (data.jobs || []).map((item): RawJob => ({
    sourceId: `remotive_${item.id}`,
    title: item.title || '',
    company: item.company_name || 'Unknown',
    location: item.candidate_required_location || 'Remote',
    description: item.description || '',
    salaryMin: 0,
    salaryMax: 0,
    url: item.url || '',
    datePosted: item.publication_date || new Date().toISOString(),
    source: 'Remotive',
  }));
}
