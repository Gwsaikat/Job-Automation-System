// ============================================
// JSearch (RapidAPI) Scraper — Section 4.1
// 10 separate query variants, all via Promise.allSettled
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

const JSEARCH_QUERIES = [
  { query: 'full stack developer react nodejs fresher 2026 India remote Kolkata', name: 'India Fresher' },
  { query: 'Google Amazon Netflix software engineer SDE fresher new grad 2026 India', name: 'FAANG batch 1' },
  { query: 'Meta Microsoft Apple Adobe Salesforce software engineer fresher India 2026', name: 'FAANG batch 2' },
  { query: 'Zepto Razorpay CRED Groww Setu Krutrim Dezerv Jar software engineer fresher India', name: 'Indian Unicorns 1' },
  { query: 'Flipkart Swiggy Zomato Ola Meesho PhonePe Paytm software engineer SDE fresher India 2026', name: 'Indian Unicorns 2' },
  { query: 'funded startup India software engineer react nodejs fresher series A B 2026 remote', name: 'Funded Startups' },
  { query: 'Zerodha Groww CloudKaptan Qualcomm Postman BrowserStack Chargebee Freshworks software engineer fresher India 2026', name: 'Hidden Gems 1' },
  { query: 'Juspay Sarvam AI MuSigma Scaler Bounce Yulu Unacademy Vedantu software developer fresher India 2026', name: 'Hidden Gems 2' },
  { query: 'TCS Infosys Wipro HCL Tech Mahindra Cognizant fresher software engineer 2026 India react nodejs', name: 'Indian IT Giants' },
  { query: 'remote full stack developer react nodejs entry level junior 0-1 year worldwide 2026', name: 'Global Remote' },
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

  const response = await fetch(url.toString(), {
    headers: {
      'X-RapidAPI-Key': config.rapidApiKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
  });

  if (!response.ok) {
    throw new Error(`JSearch ${sourceName} returned ${response.status}: ${await response.text()}`);
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
      source: `JSearch (${sourceName})`,
    };
  });
}

export async function scrapeJSearch(): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    JSEARCH_QUERIES.map(({ query, name }) => fetchJSearch(query, name))
  );

  const allJobs: RawJob[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value);
    } else {
      console.error(`[JSearch] Query failed:`, result.reason);
    }
  }

  return allJobs;
}
