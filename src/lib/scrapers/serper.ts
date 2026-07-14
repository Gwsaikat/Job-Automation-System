// ============================================
// Serper.dev Scraper — Section 4.2
// Searches across ATS platforms (Greenhouse, Lever, Ashby, etc.)
// This is the most important scraper — covers far more ground
// than any hardcoded company list
// ============================================

import { getConfig } from '../config';
import { RawJob } from './types';

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

interface SerperResponse {
  organic: SerperResult[];
}

const SERPER_QUERIES = [
  '(site:boards.greenhouse.io OR site:jobs.lever.co OR site:jobs.ashbyhq.com OR site:jobs.workable.com OR site:smartrecruiters.com OR site:myworkdayjobs.com) (react OR nodejs OR nextjs OR "full stack" OR javascript) (fresher OR "entry level" OR "0-1 year" OR "new grad") 2026',
  '(site:boards.greenhouse.io OR site:jobs.lever.co OR site:jobs.ashbyhq.com) "remote" (react OR node.js OR full stack developer) (junior OR fresher OR graduate) apply',
];

function extractCompanyFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    // boards.greenhouse.io/company-name/...
    if (host.includes('greenhouse.io')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      return parts[0] || 'Unknown';
    }
    // jobs.lever.co/company-name/...
    if (host.includes('lever.co')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      return parts[0] || 'Unknown';
    }
    // company.jobs.ashbyhq.com
    if (host.includes('ashbyhq.com')) {
      const subdomain = host.split('.')[0];
      return subdomain !== 'jobs' ? subdomain : 'Unknown';
    }

    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function generateSourceId(url: string): string {
  // Create a simple hash from the URL for dedup
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `serper_${Math.abs(hash)}`;
}

async function fetchSerper(query: string): Promise<RawJob[]> {
  const config = getConfig();

  if (!config.serperApiKey) {
    console.warn('[Serper] API key not configured, skipping');
    return [];
  }

  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': config.serperApiKey,
    },
    body: JSON.stringify({
      q: query,
      num: 30,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper returned ${response.status}: ${await response.text()}`);
  }

  const data: SerperResponse = await response.json();

  return (data.organic || []).map((item): RawJob => ({
    sourceId: generateSourceId(item.link),
    title: item.title || '',
    company: extractCompanyFromUrl(item.link),
    location: '', // Serper doesn't provide structured location
    description: item.snippet || '',
    salaryMin: 0,
    salaryMax: 0,
    url: item.link || '',
    datePosted: item.date || new Date().toISOString(),
    source: 'Serper (ATS Search)',
  }));
}

export async function scrapeSerper(): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    SERPER_QUERIES.map((query) => fetchSerper(query))
  );

  const allJobs: RawJob[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    } else {
      console.error('[Serper] Query failed:', result.reason);
    }
  }

  return allJobs;
}
