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

// Career OS — Expanded queries across ALL 6 source tiers
const SERPER_QUERIES = [
  // ---- Tier 1-2: ATS Platforms (Greenhouse, Lever, Ashby, Workday, SmartRecruiters, Jobvite) ----
  'site:boards.greenhouse.io react OR nodejs OR "full stack" fresher OR junior OR "entry level" India OR remote 2026',
  'site:jobs.lever.co "software engineer" OR "full stack developer" entry level OR fresher OR junior',
  'site:jobs.ashbyhq.com developer OR engineer junior OR fresher India OR remote',
  'site:smartrecruiters.com software engineer fresher OR "new grad" India 2026',
  'site:myworkdayjobs.com "software developer" OR "software engineer" entry level India',
  'site:jobs.jobvite.com software engineer fresher OR junior India remote',

  // ---- Tier 2 continued: Broader ATS searches ----
  '(site:boards.greenhouse.io OR site:jobs.lever.co) react nextjs nodejs MERN fresher 2026',
  '(site:jobs.ashbyhq.com OR site:jobs.workable.com) "full stack" OR "frontend" OR "backend" junior India remote',

  // ---- Tier 3: Job Boards (Wellfound, CutShort, Instahyre, YC, Naukri) ----
  'site:wellfound.com software engineer OR developer fresher OR junior India remote',
  'site:cutshort.io react nodejs OR MERN fresher India Kolkata OR Bangalore',
  'site:instahyre.com software developer entry level India',
  'site:work.ycombinator.com software engineer OR developer remote',
  'site:naukri.com react nodejs fresher OR "0-2 years" Kolkata OR Bangalore OR remote',

  // ---- Tier 3 continued: General job board coverage ----
  'software engineer fresher India 2026 apply greenhouse lever',
  'react developer junior remote 2026 apply greenhouse lever ashby',
  'full stack developer entry level India 2026 careers apply',
  'nodejs developer fresher remote 2026 jobs hiring',
  'MERN stack developer fresher India 2026 hiring apply now',
  'SDE 1 software engineer India 2026 new grad hiring',
  'javascript typescript react remote developer jobs 2026',

  // ---- Tier 4: Remote Boards ----
  'site:weworkremotely.com "full stack" OR react OR nodejs developer',
  'site:otta.com software engineer entry level OR junior remote',
  'site:himalayas.app react OR nodejs developer remote',
  'site:remoteok.com react OR nodejs developer 2026',
  'site:arc.dev react OR nodejs developer remote junior',

  // ---- Tier 5: Startup & Funding Portals ----
  'site:angel.co software engineer India remote startup hiring',
  '"funded startup" India software engineer react nodejs fresher series A B 2026 remote',
  'frontend developer junior India 2026 workday smartrecruiters apply',
  'software developer intern 2026 India Google Amazon Microsoft',
  'backend developer entry level remote 2026 startup hiring',

  // ---- Tier 6: Community & GitHub Hiring ----
  'site:github.com hiring "software engineer" OR "developer" India remote 2026',
  'site:reddit.com/r/remotejs OR site:reddit.com/r/forhire react developer hiring',

  // ---- FAANG & Big Tech ----
  'Google Amazon Netflix software engineer SDE fresher new grad 2026 India',
  'Meta Microsoft Apple Adobe Salesforce software engineer fresher India 2026',

  // ---- Indian Unicorns & Growth Companies ----
  'Zepto Razorpay CRED Groww Setu software engineer fresher India',
  'Flipkart Swiggy Zomato PhonePe Paytm software engineer SDE fresher India 2026',
  'Zerodha Postman BrowserStack Chargebee Freshworks software engineer fresher India 2026',
  'Juspay Sarvam Scaler Unacademy software developer fresher India 2026',
];

function extractCompanyFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

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
