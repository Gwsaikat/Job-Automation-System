// ============================================
// v2.0 — Hidden Jobs Discovery Engine
// Finds jobs that aren't on traditional job boards:
// - Company career pages (from funding leads)
// - Hacker News "Who's Hiring" threads
// - GitHub hiring posts
// - Twitter/X hiring posts
// ============================================

import { getConfig } from '../config';
import { RawJob } from './types';

// ---- Serper Helper ----

interface SerperOrganic {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

async function serperSearch(query: string): Promise<SerperOrganic[]> {
  const config = getConfig();
  if (!config.serperApiKey) return [];

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': config.serperApiKey,
      },
      body: JSON.stringify({ q: query, num: 15 }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.organic || [];
  } catch {
    return [];
  }
}

// ---- Source ID Generator ----

function generateSourceId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `hidden_${Math.abs(hash)}`;
}

// ---- Strategy 1: Funded Startup Career Pages ----

async function scrapeFromFundedStartups(companies: string[]): Promise<RawJob[]> {
  const jobs: RawJob[] = [];

  for (const company of companies.slice(0, 10)) { // Limit to 10 companies per run
    const query = `"${company}" careers software engineer OR developer India OR remote 2026`;
    const results = await serperSearch(query);

    for (const result of results) {
      const lower = `${result.title} ${result.snippet}`.toLowerCase();
      const isJobPosting =
        lower.includes('engineer') ||
        lower.includes('developer') ||
        lower.includes('software') ||
        lower.includes('careers') ||
        lower.includes('apply');

      if (isJobPosting && result.link.includes('http')) {
        jobs.push({
          sourceId: generateSourceId(result.link),
          title: result.title.replace(/\s*[-|–]\s*.*$/, '').trim() || `Software Engineer at ${company}`,
          company: company,
          location: 'Check Listing',
          description: result.snippet || '',
          salaryMin: 0,
          salaryMax: 0,
          url: result.link,
          datePosted: result.date || new Date().toISOString(),
          source: 'Hidden: Funded Startup',
        });
      }
    }
  }

  console.log(`[Hidden Jobs] Found ${jobs.length} jobs from funded startups`);
  return jobs;
}

// ---- Strategy 2: Hacker News "Who's Hiring" ----

async function scrapeHackerNewsHiring(): Promise<RawJob[]> {
  const jobs: RawJob[] = [];
  const now = new Date();
  const monthName = now.toLocaleString('en', { month: 'long' });
  const year = now.getFullYear();

  const query = `site:news.ycombinator.com "Who is hiring" ${monthName} ${year} software engineer remote India`;
  const results = await serperSearch(query);

  // Also search for specific tech stack mentions in HN hiring
  const techQuery = `site:news.ycombinator.com "Who is hiring" react OR nodejs OR typescript remote 2026`;
  const techResults = await serperSearch(techQuery);

  const allResults = [...results, ...techResults];
  const seenLinks = new Set<string>();

  for (const result of allResults) {
    if (seenLinks.has(result.link)) continue;
    seenLinks.add(result.link);

    const lower = `${result.title} ${result.snippet}`.toLowerCase();
    if (lower.includes('hiring') || lower.includes('engineer') || lower.includes('developer')) {
      jobs.push({
        sourceId: generateSourceId(result.link),
        title: result.title.substring(0, 200),
        company: 'HN Community',
        location: 'Check Thread',
        description: result.snippet || '',
        salaryMin: 0,
        salaryMax: 0,
        url: result.link,
        datePosted: result.date || new Date().toISOString(),
        source: 'Hidden: Hacker News',
      });
    }
  }

  console.log(`[Hidden Jobs] Found ${jobs.length} HN hiring threads`);
  return jobs;
}

// ---- Strategy 3: GitHub Hiring ----

async function scrapeGitHubHiring(): Promise<RawJob[]> {
  const jobs: RawJob[] = [];

  const queries = [
    'site:github.com "we are hiring" software engineer react OR node 2026',
    'site:github.com HIRING.md software developer India remote',
    'site:github.com "hiring" "full stack" OR "frontend" OR "backend" developer 2026',
  ];

  for (const query of queries) {
    const results = await serperSearch(query);
    for (const result of results) {
      if (!result.link.includes('github.com')) continue;

      jobs.push({
        sourceId: generateSourceId(result.link),
        title: result.title.replace(/\s*·\s*GitHub.*$/, '').trim(),
        company: extractGitHubOrg(result.link),
        location: 'Remote (GitHub)',
        description: result.snippet || '',
        salaryMin: 0,
        salaryMax: 0,
        url: result.link,
        datePosted: result.date || new Date().toISOString(),
        source: 'Hidden: GitHub',
      });
    }
  }

  console.log(`[Hidden Jobs] Found ${jobs.length} GitHub hiring posts`);
  return jobs;
}

function extractGitHubOrg(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    if (parts.length >= 1) {
      return parts[0].replace(/-/g, ' ').replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
  } catch {}
  return 'Unknown (GitHub)';
}

// ---- Strategy 4: Twitter/X Hiring Posts ----

async function scrapeTwitterHiring(): Promise<RawJob[]> {
  const jobs: RawJob[] = [];

  const queries = [
    '"hiring" "software engineer" OR "developer" India OR remote site:x.com 2026',
    '"we\'re hiring" react OR node OR typescript developer site:x.com',
  ];

  for (const query of queries) {
    const results = await serperSearch(query);
    for (const result of results) {
      if (!result.link.includes('x.com') && !result.link.includes('twitter.com')) continue;

      jobs.push({
        sourceId: generateSourceId(result.link),
        title: result.title.substring(0, 200),
        company: extractTwitterUser(result.link),
        location: 'Check Post',
        description: result.snippet || '',
        salaryMin: 0,
        salaryMax: 0,
        url: result.link,
        datePosted: result.date || new Date().toISOString(),
        source: 'Hidden: Twitter/X',
      });
    }
  }

  console.log(`[Hidden Jobs] Found ${jobs.length} Twitter/X hiring posts`);
  return jobs;
}

function extractTwitterUser(url: string): string {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    if (parts.length >= 1) {
      return `@${parts[0]}`;
    }
  } catch {}
  return 'Unknown (Twitter)';
}

// ---- Main Hidden Jobs Function ----

export async function scrapeHiddenJobs(fundedCompanies?: string[]): Promise<RawJob[]> {
  console.log('[Hidden Jobs] ═══════════════════════════════════════');
  console.log('[Hidden Jobs] Starting hidden job discovery...');

  const [
    fundedResult,
    hnResult,
    githubResult,
    twitterResult,
  ] = await Promise.allSettled([
    fundedCompanies && fundedCompanies.length > 0
      ? scrapeFromFundedStartups(fundedCompanies)
      : Promise.resolve([]),
    scrapeHackerNewsHiring(),
    scrapeGitHubHiring(),
    scrapeTwitterHiring(),
  ]);

  const allJobs: RawJob[] = [];
  const seenIds = new Set<string>();

  const results = [
    { name: 'Funded Startups', result: fundedResult },
    { name: 'Hacker News', result: hnResult },
    { name: 'GitHub', result: githubResult },
    { name: 'Twitter/X', result: twitterResult },
  ];

  for (const { name, result } of results) {
    if (result.status === 'fulfilled') {
      for (const job of result.value) {
        if (!seenIds.has(job.sourceId)) {
          seenIds.add(job.sourceId);
          allJobs.push(job);
        }
      }
    } else {
      console.error(`[Hidden Jobs] ${name} failed:`, result.reason);
    }
  }

  console.log(`[Hidden Jobs] Total hidden jobs found: ${allJobs.length}`);
  console.log('[Hidden Jobs] ═══════════════════════════════════════');
  return allJobs;
}
