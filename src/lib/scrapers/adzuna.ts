// ============================================
// Adzuna Scraper — Section 4.1
// Fetches from India and Remote/UK endpoints
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
  url.searchParams.set('max_days_old', '2');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Adzuna ${sourceName} returned ${response.status}: ${await response.text()}`);
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
}

export async function scrapeAdzunaIndia(): Promise<RawJob[]> {
  return fetchAdzuna(
    'in',
    'full stack developer react nodejs javascript',
    'Adzuna India'
  );
}

export async function scrapeAdzunaRemoteUK(): Promise<RawJob[]> {
  return fetchAdzuna(
    'gb',
    'react nextjs nodejs remote fresher entry level junior',
    'Adzuna Remote/UK'
  );
}
