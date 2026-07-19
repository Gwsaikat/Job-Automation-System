// ============================================
// Adzuna Scraper — Section 4.1
// Fetches from India, UK, US, Canada, Australia endpoints
// Multiple queries per region for maximum coverage
// ============================================

import { getConfig } from '../config';
import { RawJob } from './types';

interface AdzunaResult {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description: string;
  salary_min?: number;
  salary_max?: number;
  redirect_url: string;
  created: string;
}

interface AdzunaResponse {
  results: AdzunaResult[];
}

async function fetchAdzuna(region: string, query: string, sourceName: string): Promise<RawJob[]> {
  const config = getConfig();

  if (!config.adzunaAppId || !config.adzunaAppKey) {
    console.warn(`[Adzuna] API keys not configured, skipping ${sourceName}`);
    return [];
  }

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${region}/search/1`);
  url.searchParams.set('app_id', config.adzunaAppId);
  url.searchParams.set('app_key', config.adzunaAppKey);
  url.searchParams.set('what', query);
  url.searchParams.set('results_per_page', '50');
  url.searchParams.set('sort_by', 'date');
  url.searchParams.set('max_days_old', '7');  // 7 days instead of 2 for better coverage

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      console.warn(`[Adzuna] ${sourceName} returned ${response.status}, skipping`);
      return [];
    }

    const data: AdzunaResponse = await response.json();

    return (data.results || []).map((item): RawJob => ({
      sourceId: `adzuna_${item.id}`,
      title: item.title || '',
      company: item.company?.display_name || 'Unknown',
      location: item.location?.display_name || '',
      description: item.description || '',
      salaryMin: item.salary_min || 0,
      salaryMax: item.salary_max || 0,
      url: item.redirect_url || '',
      datePosted: item.created || new Date().toISOString(),
      source: sourceName,
    }));
  } catch (error) {
    console.warn(`[Adzuna] ${sourceName} network error, skipping:`, error);
    return [];
  }
}

// India queries — broad coverage from FAANG to startups
const INDIA_QUERIES = [
  'software developer',
  'software engineer',
  'full stack developer',
  'react developer',
  'frontend developer',
  'backend developer',
  'nodejs developer',
  'javascript developer',
  'web developer',
  'junior software engineer',
];

// Remote/International queries
const REMOTE_QUERIES = [
  'remote software developer',
  'remote full stack developer',
  'remote react developer',
  'remote javascript developer',
  'remote web developer entry level',
];

export async function scrapeAdzunaIndia(): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    INDIA_QUERIES.map((query) => fetchAdzuna('in', query, `Adzuna India`))
  );

  const allJobs: RawJob[] = [];
  const seenIds = new Set<string>();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const job of result.value) {
        if (!seenIds.has(job.sourceId)) {
          seenIds.add(job.sourceId);
          allJobs.push(job);
        }
      }
    }
  }

  console.log(`[Adzuna] India: ${allJobs.length} unique jobs from ${INDIA_QUERIES.length} queries`);
  return allJobs;
}

export async function scrapeAdzunaRemoteUK(): Promise<RawJob[]> {
  // Search multiple regions: UK, US, Canada, Australia
  const regions = [
    { code: 'gb', name: 'UK' },
    { code: 'us', name: 'US' },
    { code: 'ca', name: 'Canada' },
    { code: 'au', name: 'Australia' },
  ];

  const results = await Promise.allSettled(
    regions.flatMap(({ code, name }) =>
      REMOTE_QUERIES.map((query) => fetchAdzuna(code, query, `Adzuna ${name}`))
    )
  );

  const allJobs: RawJob[] = [];
  const seenIds = new Set<string>();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const job of result.value) {
        if (!seenIds.has(job.sourceId)) {
          seenIds.add(job.sourceId);
          allJobs.push(job);
        }
      }
    }
  }

  console.log(`[Adzuna] Remote/International: ${allJobs.length} unique jobs from ${regions.length} regions`);
  return allJobs;
}
