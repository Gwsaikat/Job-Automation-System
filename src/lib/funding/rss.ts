// ============================================
// Funding News Pipeline — Section 7.1
// RSS feeds → keyword filter → AI extraction → DB
// ============================================

import prisma from '../db';
import { callAIStandard, parseAIJson } from '../ai';
import { lookupHRContacts } from '../outreach/apollo';
import { CANDIDATE_SKILL_KEYWORDS } from '../candidate-profile';
import Parser from 'rss-parser';

const RSS_FEEDS = [
  { name: 'YourStory', url: 'https://yourstory.com/feed' },
  { name: 'Inc42', url: 'https://inc42.com/feed/' },
  { name: 'TechCrunch Funding', url: 'https://techcrunch.com/tag/funding/feed/' },
  { name: 'ET Startups', url: 'https://economictimes.indiatimes.com/tech/startups/rssfeeds/78570561.cms' },
];

const FUNDING_KEYWORDS = [
  'funding', 'raised', 'million', 'crore', 'seed',
  'series a', 'series b', 'startup', 'saas', 'fintech',
  'api', 'developer', 'investment',
];

// ---- Hidden Hiring Signal Keywords ----

const HIRING_SIGNAL_KEYWORDS = [
  'we are growing', 'scaling', 'hiring soon', 'engineering expansion',
  'building our team', 'expanding the team', 'growing fast',
  'looking for talent', 'hiring spree', 'rapid growth',
  'doubling our engineering', 'ramping up', 'aggressive hiring',
  'looking for engineers', 'engineering-first',
];

interface FundingInfo {
  company: string;
  amount: string;
  sector: string;
  problemStatement: string;
  needsDevelopers: boolean;
  domain: string;
  isIndian: boolean;
  stage: string;
  techStack: string[];
  hiringSignals: string[];
}

function matchesFundingKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  let matchCount = 0;
  for (const kw of FUNDING_KEYWORDS) {
    if (lower.includes(kw)) matchCount++;
  }
  return matchCount >= 2;
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
}

export async function runFundingPipeline(): Promise<{
  itemsFound: number;
  leadsInserted: number;
  errors: string[];
}> {
  const parser = new Parser();
  const stats = { itemsFound: 0, leadsInserted: 0, errors: [] as string[] };
  const today = new Date().toISOString().split('T')[0];

  console.log('[Funding] Starting funding news pipeline...');

  // Step 1: Fetch all RSS feeds (Promise.allSettled)
  const feedResults = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return { name: feed.name, items: parsed.items || [] };
    })
  );

  // Collect and filter items
  const allItems: Array<{ title: string; link: string; content: string; source: string }> = [];
  const seenTitles = new Set<string>();

  for (const result of feedResults) {
    if (result.status === 'fulfilled') {
      for (const item of result.value.items) {
        const title = item.title || '';
        const content = `${title} ${item.contentSnippet || item.content || ''}`;

        if (!matchesFundingKeywords(content)) continue;

        // Dedup by normalized title
        const normalized = normalizeTitle(title);
        if (seenTitles.has(normalized)) continue;
        seenTitles.add(normalized);

        allItems.push({
          title,
          link: item.link || '',
          content: content.substring(0, 1000),
          source: result.value.name,
        });
      }
    } else {
      stats.errors.push(`RSS feed failed: ${result.reason}`);
    }
  }

  stats.itemsFound = allItems.length;
  console.log(`[Funding] ${allItems.length} funding items after filtering`);

  // Step 2: AI extraction + insert
  for (const item of allItems) {
    // Check for existing entry
    const sourceId = `funding_${normalizeTitle(item.title)}`;
    const existing = await prisma.fundingLead.findUnique({ where: { sourceId } });
    if (existing) continue;

    try {
      const prompt = `Extract funding information from this news item.

TITLE: ${item.title}
CONTENT: ${item.content}
SOURCE: ${item.source}

Return JSON:
{
  "company": "company name",
  "amount": "funding amount (e.g. '$5M', '₹10 Crore')",
  "sector": "industry sector",
  "problemStatement": "one sentence about what the company does",
  "needsDevelopers": true/false,
  "domain": "web/mobile/ai/fintech/etc",
  "isIndian": true/false,
  "stage": "Seed/Series A/Series B/etc",
  "techStack": ["list of technologies mentioned or likely used"],
  "hiringSignals": ["any phrases indicating imminent hiring"]
}`;

      const response = await callAIStandard(prompt, { maxTokens: 800, temperature: 0.1 });
      const info = parseAIJson<FundingInfo>(response);

      // ---- Hidden Hiring Intelligence ----

      // Detect hiring signals from text
      const contentLower = item.content.toLowerCase();
      const detectedSignals: string[] = [
        ...(info.hiringSignals || []),
      ];
      for (const signal of HIRING_SIGNAL_KEYWORDS) {
        if (contentLower.includes(signal) && !detectedSignals.includes(signal)) {
          detectedSignals.push(signal);
        }
      }

      // Compute tech stack match
      const techStackMatch = computeTechStackMatch(info.techStack || []);

      // Compute hiring probability
      const hiringProbability = computeHiringProbability(info, detectedSignals, techStackMatch);

      // Build data for insert
      const data: Record<string, unknown> = {
        sourceId,
        dateFound: today,
        company: info.company,
        fundingAmount: info.amount,
        stage: info.stage,
        sector: info.sector,
        problemSolved: info.problemStatement,
        isIndian: info.isIndian ? 1 : 0,
        domain: info.domain,
        newsLink: item.link,
        hiringProbability,
        hiringSignals: JSON.stringify(detectedSignals),
        techStackMatch,
      };

      // Apollo lookup only if needsDevelopers AND high hiring probability
      if (info.needsDevelopers && hiringProbability >= 50) {
        const apollo = await lookupHRContacts(info.company);
        if (apollo.contacts.length > 0) {
          data.emailsFound = JSON.stringify(apollo.contacts.map((c) => c.email));
        }
        if (apollo.fallbackLinks) {
          data.linkedinPeopleSearch = apollo.fallbackLinks.linkedinPeopleSearch;
          data.linkedinCompanyPage = apollo.fallbackLinks.linkedinCompanyPage;
          data.googleLinkedinSearch = apollo.fallbackLinks.googleLinkedinSearch;
        }
      }

      await prisma.fundingLead.create({ data: data as Parameters<typeof prisma.fundingLead.create>[0]['data'] });
      stats.leadsInserted++;
    } catch (error) {
      console.error(`[Funding] Failed to process: ${item.title}`, error);
      stats.errors.push(`Failed: ${item.title}`);
    }
  }

  // Update timestamp
  await prisma.appState.upsert({
    where: { key: 'last_funding_run' },
    update: { value: new Date().toISOString() },
    create: { key: 'last_funding_run', value: new Date().toISOString() },
  });

  console.log(`[Funding] Done. Inserted ${stats.leadsInserted} leads.`);
  return stats;
}

// ---- Hidden Hiring Intelligence Helpers ----

function computeTechStackMatch(techStack: string[]): number {
  if (!techStack || techStack.length === 0) return 30; // unknown

  let matches = 0;
  for (const tech of techStack) {
    if (CANDIDATE_SKILL_KEYWORDS.has(tech.toLowerCase())) {
      matches++;
    }
  }

  if (techStack.length === 0) return 30;
  return Math.min(100, Math.round((matches / techStack.length) * 100));
}

function computeHiringProbability(
  info: FundingInfo,
  signals: string[],
  techMatch: number
): number {
  let score = 20; // baseline

  // Funding stage scoring
  const stage = (info.stage || '').toLowerCase();
  if (stage.includes('seed')) score += 15;
  if (stage.includes('series a')) score += 25;
  if (stage.includes('series b')) score += 20;
  if (stage.includes('series c') || stage.includes('series d')) score += 10;

  // Needs developers
  if (info.needsDevelopers) score += 20;

  // Hiring signals detected
  score += Math.min(20, signals.length * 5);

  // Indian company bonus (more accessible)
  if (info.isIndian) score += 5;

  // Tech stack match bonus
  if (techMatch >= 50) score += 10;

  return Math.min(100, score);
}
