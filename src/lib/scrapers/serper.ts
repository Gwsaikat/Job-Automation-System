// ============================================
// Serper.dev Scraper — Section 4.2
// Searches across ATS platforms (Greenhouse, Lever, Ashby, etc.)
// v2.1: Tiered scheduling to conserve finite Serper credits
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
  credits?: number;
}

// ---- Tiered Query System ----
// Tier 1: Run daily (~12 queries) — highest-signal platforms
// Tier 2: Run every 3rd day (~12 queries) — secondary platforms
// Tier 3: Run weekly (~11 queries) — broad/redundant searches

const TIER_1_QUERIES = [
  // LinkedIn (merged into fewer queries with broader OR clauses)
  'site:linkedin.com/jobs ("full stack" OR "MERN" OR "backend" OR "software engineer" OR "AI full stack" OR "graduate trainee") (fresher OR "0-1 year" OR "entry level") (India OR remote) 2026',
  // Naukri (merged)
  'site:naukri.com ("full stack" OR "MERN" OR "backend developer" OR "software engineer" OR "graduate engineer trainee" OR "associate software engineer") (fresher OR "0-1 year" OR "0 years") (Kolkata OR Bangalore OR remote)',
  // Indeed
  'site:in.indeed.com OR site:indeed.com "software engineer" OR "full stack" OR "MERN" fresher OR "entry level" India remote',
  // Wellfound/AngelList
  'site:wellfound.com OR site:angel.co "full stack" OR "MERN" OR "software engineer" OR "backend" fresher OR "0-1" India remote',
  // ATS Platforms — Greenhouse + Lever
  'site:boards.greenhouse.io react OR nodejs OR "full stack" fresher OR junior OR "entry level" India OR remote 2026',
  'site:jobs.lever.co "software engineer" OR "full stack developer" entry level OR fresher OR junior',
  // ATS — Ashby + Workable
  '(site:jobs.ashbyhq.com OR site:jobs.workable.com) "full stack" OR "frontend" OR "backend" junior India remote',
  // ATS — SmartRecruiters + Workday + Jobvite
  'site:smartrecruiters.com software engineer fresher OR "new grad" India 2026',
  'site:myworkdayjobs.com "software developer" OR "software engineer" entry level India',
  'site:jobs.jobvite.com software engineer fresher OR junior India remote',
  // Combined ATS
  '(site:boards.greenhouse.io OR site:jobs.lever.co) react nextjs nodejs MERN fresher 2026',
];

const TIER_2_QUERIES = [
  // Cutshort
  'site:cutshort.io "full stack" OR "MERN" OR "backend" OR "AI" fresher OR junior India Kolkata',
  // Instahyre
  'site:instahyre.com "software engineer" OR "MERN" OR "backend" entry level India',
  // AmbitionBox
  'site:ambitionbox.com "software engineer" OR "full stack" OR "MERN" fresher India',
  // Foundit
  'site:foundit.in "software engineer" OR "MERN" fresher Kolkata OR Bangalore OR remote',
  // Glassdoor
  'site:glassdoor.co.in OR site:glassdoor.com "software engineer" fresher OR "entry level" remote India',
  // Global Remote Boards
  'site:remoteok.com react OR nodejs OR "full stack" developer 2026',
  'site:weworkremotely.com "full stack" OR react OR nodejs developer',
  'site:otta.com software engineer entry level OR junior remote',
  'site:himalayas.app react OR nodejs developer remote',
  'site:arc.dev react OR nodejs developer remote junior',
  'site:work.ycombinator.com software engineer OR developer remote',
];

const TIER_3_QUERIES = [
  // Role-specific broad searches
  '"MERN stack developer" fresher OR "0-1 year" India OR remote hiring apply',
  '"AI full stack developer" OR "AI engineer" fresher OR entry level remote 2026',
  '"backend developer" MERN nodejs fresher OR "0-1 yrs" Kolkata OR remote',
  '"software engineer" "max match" OR "skills" fresher India 2026 hiring',
  '"graduate engineer trainee" OR "graduate trainee" software India 2026',
  // Indian Tech Unicorns & Global Leaders
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

// ---- Credit Tracking ----

let latestSerperCredits: number | null = null;

export function getLatestSerperCredits(): number | null {
  return latestSerperCredits;
}

async function storeSerperCredits(credits: number): Promise<void> {
  latestSerperCredits = credits;
  try {
    const prisma = (await import('../db')).default;
    await prisma.appState.upsert({
      where: { key: 'serper_credits_remaining' },
      update: { value: String(credits) },
      create: { key: 'serper_credits_remaining', value: String(credits) },
    });
  } catch {
    // Non-critical — don't fail the scrape over a credit log issue
  }
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

    // ---- Track credits from response headers ----
    const creditsHeader = response.headers.get('x-api-credits-remaining')
      || response.headers.get('x-credits-remaining')
      || response.headers.get('x-ratelimit-remaining');
    if (creditsHeader) {
      const credits = parseInt(creditsHeader, 10);
      if (!isNaN(credits)) {
        await storeSerperCredits(credits);
      }
    }

    const data: SerperResponse = await response.json();

    // Also check if credits are in the JSON response body
    if (data.credits !== undefined && data.credits !== null) {
      await storeSerperCredits(data.credits);
    }

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

// ---- Tier Selection Logic ----

function getQueriesForToday(): { queries: string[]; tierLabel: string } {
  const dayOfMonth = new Date().getDate();
  const dayOfWeek = new Date().getDay(); // 0 = Sunday

  // Tier 1 always runs
  const queries = [...TIER_1_QUERIES];
  const tiers = ['T1'];

  // Tier 2 runs every 3rd day (days 1,4,7,10,13,16,19,22,25,28)
  if (dayOfMonth % 3 === 1) {
    queries.push(...TIER_2_QUERIES);
    tiers.push('T2');
  }

  // Tier 3 runs weekly (Sundays only)
  if (dayOfWeek === 0) {
    queries.push(...TIER_3_QUERIES);
    tiers.push('T3');
  }

  return { queries, tierLabel: tiers.join('+') };
}

export async function scrapeSerper(): Promise<RawJob[]> {
  const { queries, tierLabel } = getQueriesForToday();

  console.log(`[Serper] Running ${queries.length} queries (tiers: ${tierLabel})`);

  const results = await Promise.allSettled(
    queries.map((query) => fetchSerper(query))
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

  // Log credit status
  if (latestSerperCredits !== null) {
    const creditWarning = latestSerperCredits < 200 ? ' ⚠️ LOW CREDITS!' : '';
    console.log(`[Serper] Credits remaining: ${latestSerperCredits}${creditWarning}`);
  }

  console.log(`[Serper] ${allJobs.length} unique jobs from ${queries.length} queries (tiers: ${tierLabel})`);
  return allJobs;
}

