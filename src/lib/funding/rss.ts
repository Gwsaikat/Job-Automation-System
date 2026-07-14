// ============================================
// Funding News Pipeline — Section 7.1
// RSS feeds → keyword filter → AI extraction → DB
// ============================================

import prisma from '../db';
import { callAIStandard, parseAIJson } from '../ai';
import { lookupHRContacts } from '../outreach/apollo';
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

interface FundingInfo {
  company: string;
  amount: string;
  sector: string;
  problemStatement: string;
  needsDevelopers: boolean;
  domain: string;
  isIndian: boolean;
  stage: string;
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
  "stage": "Seed/Series A/Series B/etc"
}`;

      const response = await callAIStandard(prompt, { maxTokens: 300, temperature: 0.1 });
      const info = parseAIJson<FundingInfo>(response);

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
      };

      // Apollo lookup only if needsDevelopers (save API calls)
      if (info.needsDevelopers) {
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
