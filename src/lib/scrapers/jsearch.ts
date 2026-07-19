// ============================================
// JSearch (RapidAPI) Scraper — Section 4.1
// Optimized queries focusing on software engineering
// ============================================

import { getConfig } from '../config';
import { RawJob } from './types';

interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description: string;
  job_min_salary?: number;
  job_max_salary?: number;
  job_apply_link: string;
  job_posted_at_datetime_utc?: string;
  job_is_remote?: boolean;
}

interface JSearchResponse {
  data: JSearchJob[];
}

// Simpler, more targeted queries that actually yield results
const JSEARCH_QUERIES = [
  { query: 'software engineer fresher India', name: 'SWE Fresher India' },
  { query: 'full stack developer fresher India', name: 'Full Stack Fresher India' },
  { query: 'react developer junior remote', name: 'React Junior Remote' },
  { query: 'nodejs developer remote entry level', name: 'NodeJS Junior Remote' },
  { query: 'backend developer fresher remote', name: 'Backend Junior Remote' },
];

async function fetchJSearch(query: string, sourceName: string): Promise<RawJob[]> {
  const config = getConfig();

  if (!config.rapidApiKey) {
    console.warn(`[JSearch] RapidAPI key not configured, skipping ${sourceName}`);
    return [];
  }

  const url = new URL('https://jsearch.p.rapidapi.com/search');
  url.searchParams.set('query', query);
  url.searchParams.set('page', '1');
  url.searchParams.set('num_pages', '1');
  url.searchParams.set('date_posted', 'today'); // Focus on very recent jobs

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'X-RapidAPI-Key': config.rapidApiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      console.warn(`[JSearch] ${sourceName} returned ${response.status}, skipping`);
      return [];
    }

    const data: JSearchResponse = await response.json();

    return (data.data || []).map((item): RawJob => {
      const locationParts = [item.job_city, item.job_state, item.job_country].filter(Boolean);
      let location = locationParts.join(', ');
      if (item.job_is_remote) {
        location = location ? `Remote - ${location}` : 'Remote';
      }

      return {
        sourceId: `jsearch_${item.job_id}`,
        title: item.job_title || '',
        company: item.employer_name || 'Unknown',
        location,
        description: item.job_description || '',
        salaryMin: item.job_min_salary || 0,
        salaryMax: item.job_max_salary || 0,
        url: item.job_apply_link || '',
        datePosted: item.job_posted_at_datetime_utc || new Date().toISOString(),
        source: `JSearch`,
      };
    });
  } catch (error) {
    console.warn(`[JSearch] ${sourceName} network error, skipping:`, error);
    return [];
  }
}

export async function scrapeJSearch(): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    JSEARCH_QUERIES.map(({ query, name }) => fetchJSearch(query, name))
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

  console.log(`[JSearch] ${allJobs.length} unique jobs from ${JSEARCH_QUERIES.length} queries`);
  return allJobs;
}
