// ============================================
// RemoteOK Scraper — Section 4.1
// No API key needed, but MUST send User-Agent header
// First array element is metadata — skip it
// ============================================

import { RawJob } from './types';

interface RemoteOKJob {
  id?: string;
  slug?: string;
  position?: string;
  company?: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  url?: string;
  date?: string;
  tags?: string[];
}

export async function scrapeRemoteOK(): Promise<RawJob[]> {
  const response = await fetch('https://remoteok.com/api?tag=javascript', {
    headers: {
      // Must send a User-Agent or the request is rejected
      'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`RemoteOK returned ${response.status}: ${await response.text()}`);
  }

  const data: RemoteOKJob[] = await response.json();

  // First element is metadata — skip it
  const jobs = data.slice(1);

  return jobs
    .filter((item) => item.position && item.company)
    .map((item): RawJob => ({
      sourceId: `remoteok_${item.id || item.slug || ''}`,
      title: item.position || '',
      company: item.company || 'Unknown',
      location: item.location || 'Remote',
      description: item.description || (item.tags || []).join(', '),
      salaryMin: item.salary_min || 0,
      salaryMax: item.salary_max || 0,
      url: item.url || `https://remoteok.com/remote-jobs/${item.slug || ''}`,
      datePosted: item.date || new Date().toISOString(),
      source: 'RemoteOK',
    }));
}
