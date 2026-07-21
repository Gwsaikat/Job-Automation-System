// ============================================
// Serper.dev Scraper — Section 4.2
// Searches across ATS platforms (Greenhouse, Lever, Ashby, etc.)
// Uses simpler queries compatible with free tier
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

/// Career OS — Global Multi-Platform Scraper across ALL major job portals
const SERPER_QUERIES = [
  // ---- 1. Major Job Portals (LinkedIn, Naukri, Indeed, Wellfound, Cutshort, Instahyre, Glassdoor, Foundit) ----
  'site:linkedin.com/jobs "full stack" OR "MERN" OR "backend" OR "software engineer" fresher OR "0-1 year" OR "entry level" India OR remote',
  'site:linkedin.com/jobs "AI full stack" OR "MERN stack" OR "graduate trainee" India OR remote 2026',
  'site:naukri.com "full stack" OR "MERN" OR "backend developer" OR "software engineer" fresher OR "0-1 year" Kolkata OR Bangalore OR remote',
  'site:naukri.com "graduate engineer trainee" OR "associate software engineer" "0 years" Kolkata OR remote',
  'site:in.indeed.com OR site:indeed.com "software engineer" OR "full stack" OR "MERN" fresher OR "entry level" India remote',
  'site:wellfound.com OR site:angel.co "full stack" OR "MERN" OR "software engineer" OR "backend" fresher OR "0-1" India remote',
  'site:cutshort.io "full stack" OR "MERN" OR "backend" OR "AI" fresher OR junior India Kolkata',
  'site:instahyre.com "software engineer" OR "MERN" OR "backend" entry level India',
  'site:ambitionbox.com "software engineer" OR "full stack" OR "MERN" fresher India',
  'site:foundit.in "software engineer" OR "MERN" fresher Kolkata OR Bangalore OR remote',
  'site:glassdoor.co.in OR site:glassdoor.com "software engineer" fresher OR "entry level" remote India',

  // ---- 2. ATS Platforms (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Jobvite) ----
  'site:boards.greenhouse.io react OR nodejs OR "full stack" fresher OR junior OR "entry level" India OR remote 2026',
  'site:jobs.lever.co "software engineer" OR "full stack developer" entry level OR fresher OR junior',
  'site:jobs.ashbyhq.com developer OR engineer junior OR fresher India OR remote',
  'site:smartrecruiters.com software engineer fresher OR "new grad" India 2026',
  'site:myworkdayjobs.com "software developer" OR "software engineer" entry level India',
  'site:jobs.jobvite.com software engineer fresher OR junior India remote',
  '(site:boards.greenhouse.io OR site:jobs.lever.co) react nextjs nodejs MERN fresher 2026',
  '(site:jobs.ashbyhq.com OR site:jobs.workable.com) "full stack" OR "frontend" OR "backend" junior India remote',

  // ---- 3. Global Remote Boards ----
  'site:remoteok.com react OR nodejs OR "full stack" developer 2026',
  'site:weworkremotely.com "full stack" OR react OR nodejs developer',
  'site:otta.com software engineer entry level OR junior remote',
  'site:himalayas.app react OR nodejs developer remote',
  'site:arc.dev react OR nodejs developer remote junior',
  'site:work.ycombinator.com software engineer OR developer remote',

  // ---- 4. Role Specific Coverage (MERN, AI Fullstack, Backend, SDE 1, Graduate Trainee) ----
  '"MERN stack developer" fresher OR "0-1 year" India OR remote hiring apply',
  '"AI full stack developer" OR "AI engineer" fresher OR entry level remote 2026',
  '"backend developer" MERN nodejs fresher OR "0-1 yrs" Kolkata OR remote',
  '"software engineer" "max match" OR "skills" fresher India 2026 hiring',
  '"graduate engineer trainee" OR "graduate trainee" software India 2026',

  // ---- 5. Indian Tech Unicorns & Global Leaders ----
  'Google Amazon Netflix software engineer SDE fresher new grad 2026 India',
  'Meta Microsoft Apple Adobe Salesforce software engineer fresher India 2026',
  'Zepto Razorpay CRED Groww Setu software engineer fresher India',
  'Flipkart Swiggy Zomato PhonePe Paytm software engineer SDE fresher India 2026',
  'Zerodha Postman BrowserStack Chargebee Freshworks software engineer fresher India 2026',
  'Juspay Sarvam Scaler Unacademy software developer fresher India 2026',
];

function extractCompanyFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('linkedin.com')) return 'LinkedIn Job';
    if (host.includes('naukri.com')) return 'Naukri Listing';
    if (host.includes('indeed.com')) return 'Indeed Job';
    if (host.includes('wellfound.com') || host.includes('angel.co')) return 'Wellfound Startup';
    if (host.includes('cutshort.io')) return 'Cutshort Listing';
    if (host.includes('instahyre.com')) return 'Instahyre Listing';
    if (host.includes('ambitionbox.com')) return 'AmbitionBox';
    if (host.includes('foundit.in') || host.includes('monsterindia.com')) return 'Foundit Listing';
    if (host.includes('glassdoor.com') || host.includes('glassdoor.co.in')) return 'Glassdoor Job';

    // boards.greenhouse.io/company-name/...
    if (host.includes('greenhouse.io')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      return formatCompanyName(parts[0] || 'Unknown');
    }
    // jobs.lever.co/company-name/...
    if (host.includes('lever.co')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      return formatCompanyName(parts[0] || 'Unknown');
    }
    // company.jobs.ashbyhq.com
    if (host.includes('ashbyhq.com')) {
      const subdomain = host.split('.')[0];
      return subdomain !== 'jobs' ? formatCompanyName(subdomain) : 'Unknown';
    }
    // company.workable.com
    if (host.includes('workable.com')) {
      const subdomain = host.split('.')[0];
      return subdomain !== 'apply' && subdomain !== 'www' ? formatCompanyName(subdomain) : 'Unknown';
    }
    // smartrecruiters.com/CompanyName
    if (host.includes('smartrecruiters.com')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      return formatCompanyName(parts[0] || 'Unknown');
    }
    // company.myworkdayjobs.com
    if (host.includes('myworkdayjobs.com') || host.includes('workday.com')) {
      const subdomain = host.split('.')[0];
      return formatCompanyName(subdomain);
    }

    // Try to extract from the title or snippet instead
    return 'Unknown';
  } catch {
    return 'Unknown';
  }
}

function formatCompanyName(raw: string): string {
  return raw
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

  try {
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
      const errorText = await response.text();
      console.warn(`[Serper] Query "${query.substring(0, 50)}..." returned ${response.status}: ${errorText}`);
      return [];
    }

    const data: SerperResponse = await response.json();

    // Filter to only keep results that look like job postings
    return (data.organic || [])
      .filter(item => {
        const url = item.link.toLowerCase();
        const title = item.title.toLowerCase();
        // Keep if it's from a known ATS or has job-related terms
        return (
          url.includes('greenhouse.io') ||
          url.includes('lever.co') ||
          url.includes('ashbyhq.com') ||
          url.includes('workable.com') ||
          url.includes('smartrecruiters.com') ||
          url.includes('myworkdayjobs.com') ||
          url.includes('workday.com') ||
          url.includes('careers') ||
          url.includes('jobs') ||
          url.includes('apply') ||
          title.includes('engineer') ||
          title.includes('developer') ||
          title.includes('software')
        );
      })
      .map((item): RawJob => ({
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
  } catch (error) {
    console.warn(`[Serper] Query network error, skipping:`, error);
    return [];
  }
}

export async function scrapeSerper(): Promise<RawJob[]> {
  const results = await Promise.allSettled(
    SERPER_QUERIES.map((query) => fetchSerper(query))
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
    } else {
      console.error('[Serper] Query failed:', result.reason);
    }
  }

  console.log(`[Serper] ${allJobs.length} unique jobs from ${SERPER_QUERIES.length} queries`);
  return allJobs;
}
