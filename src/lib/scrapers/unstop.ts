// ============================================
// Career OS — Hiring Challenge Engine
// Multi-platform: Unstop + Serper-based discovery
// for HackerEarth, Devfolio, CodeChef, HackerRank
// Zero AI cost — no relevance check, no CV tailoring
// ============================================

import { RawChallenge } from './types';
import { getConfig } from '../config';

// ---- Unstop (primary, has API) ----

interface UnstopOpportunity {
  id: number;
  title: string;
  organization?: { name?: string };
  seo_url?: string;
  end_date?: string;
  type?: string;
}

interface UnstopResponse {
  data?: {
    data?: UnstopOpportunity[];
  };
}

async function scrapeUnstopChallenges(): Promise<RawChallenge[]> {
  const url =
    'https://unstop.com/api/public/opportunity/search-result?opportunity=competitions&per_page=20&oppstatus=open&title=SDE hiring challenge software engineer';

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`[Challenges] Unstop returned ${response.status}, skipping`);
      return [];
    }

    const data: UnstopResponse = await response.json();
    const opportunities = data?.data?.data || [];
    const now = new Date();

    return opportunities
      .filter(item => {
        if (!item.end_date) return true;
        return new Date(item.end_date) >= now;
      })
      .map((item): RawChallenge => ({
        sourceId: `unstop_${item.id}`,
        challengeName: item.title || '',
        company: item.organization?.name || 'Unknown',
        source: 'Unstop',
        applyLink: item.seo_url && item.seo_url.startsWith('http')
          ? item.seo_url
          : `https://unstop.com/o/${item.seo_url || item.id}`,
        deadline: item.end_date || '',
        platform: 'Unstop',
        challengeType: isHiringChallenge(item.title || '') ? 'hiring' : 'competition',
      }));
  } catch (error) {
    console.warn(`[Challenges] Unstop network error:`, error);
    return [];
  }
}

// ---- Serper-based challenge discovery (HackerEarth, Devfolio, CodeChef, etc.) ----

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

const CHALLENGE_QUERIES = [
  { query: 'site:hackerearth.com hiring challenge software engineer 2026', platform: 'HackerEarth' },
  { query: 'site:hackerearth.com SDE challenge OR "hiring challenge" 2025 OR 2026', platform: 'HackerEarth' },
  { query: 'site:devfolio.co hackathon hiring software developer India', platform: 'Devfolio' },
  { query: 'site:codechef.com hiring challenge software engineer', platform: 'CodeChef' },
  { query: 'site:hackerrank.com hiring challenge OR "coding challenge" software 2026', platform: 'HackerRank' },
  { query: 'site:codingninjas.com hiring challenge software engineer India 2026', platform: 'CodingNinjas' },
  { query: '"hiring challenge" OR "SDE hiring" software engineer India 2025 OR 2026 register apply', platform: 'Various' },
];

async function scrapeSerperChallenges(): Promise<RawChallenge[]> {
  const config = getConfig();
  if (!config.serperApiKey) {
    console.warn('[Challenges] Serper API key not configured, skipping challenge search');
    return [];
  }

  const results: RawChallenge[] = [];
  const seenIds = new Set<string>();

  const queryResults = await Promise.allSettled(
    CHALLENGE_QUERIES.map(async ({ query, platform }) => {
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
        const organic: SerperResult[] = data?.organic || [];

        return organic
          .filter(item => {
            const title = item.title.toLowerCase();
            const snippet = (item.snippet || '').toLowerCase();
            // Only keep results that look like actual challenges/competitions
            return (
              title.includes('challenge') || title.includes('hackathon') ||
              title.includes('contest') || title.includes('hiring') ||
              snippet.includes('challenge') || snippet.includes('hiring')
            );
          })
          .map((item): RawChallenge => {
            // Generate hash-based sourceId
            let hash = 0;
            for (let i = 0; i < item.link.length; i++) {
              hash = ((hash << 5) - hash) + item.link.charCodeAt(i);
              hash |= 0;
            }

            return {
              sourceId: `challenge_${platform.toLowerCase()}_${Math.abs(hash)}`,
              challengeName: item.title || '',
              company: extractCompanyFromChallenge(item.title, item.link),
              source: platform,
              applyLink: item.link || '',
              deadline: '',
              platform,
              challengeType: isHiringChallenge(`${item.title} ${item.snippet}`) ? 'hiring' : 'competition',
            };
          });
      } catch (error) {
        console.warn(`[Challenges] Serper query failed for ${platform}:`, error);
        return [];
      }
    })
  );

  for (const result of queryResults) {
    if (result.status === 'fulfilled') {
      for (const challenge of result.value) {
        if (!seenIds.has(challenge.sourceId)) {
          seenIds.add(challenge.sourceId);
          results.push(challenge);
        }
      }
    }
  }

  return results;
}

// ---- Helpers ----

function isHiringChallenge(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes('hiring') ||
    lower.includes('recruitment') ||
    lower.includes('sde challenge') ||
    lower.includes('hiring challenge') ||
    lower.includes('job challenge') ||
    lower.includes('placement') ||
    lower.includes('drive')
  );
}

function extractCompanyFromChallenge(title: string, url: string): string {
  // Try to extract company from common patterns like "Company Name SDE Hiring Challenge"
  const patterns = [
    /^(.+?)\s+(?:SDE|Software|Hiring|Coding)\s+/i,
    /^(.+?)\s+(?:Challenge|Hackathon|Contest)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1] && match[1].length < 40) {
      return match[1].trim();
    }
  }

  return 'Unknown';
}

// ============================================
// Main export — combines all sources
// ============================================

export async function scrapeAllChallenges(): Promise<RawChallenge[]> {
  const [unstopResults, serperResults] = await Promise.allSettled([
    scrapeUnstopChallenges(),
    scrapeSerperChallenges(),
  ]);

  const all: RawChallenge[] = [];
  const seenIds = new Set<string>();

  for (const result of [unstopResults, serperResults]) {
    if (result.status === 'fulfilled') {
      for (const challenge of result.value) {
        if (!seenIds.has(challenge.sourceId)) {
          seenIds.add(challenge.sourceId);
          all.push(challenge);
        }
      }
    } else {
      console.error('[Challenges] Source failed:', result.reason);
    }
  }

  // Sort: hiring challenges first, then by platform
  all.sort((a, b) => {
    if (a.challengeType === 'hiring' && b.challengeType !== 'hiring') return -1;
    if (a.challengeType !== 'hiring' && b.challengeType === 'hiring') return 1;
    return 0;
  });

  console.log(`[Challenges] ${all.length} total challenges (${all.filter(c => c.challengeType === 'hiring').length} hiring)`);
  return all;
}

// Backward compatibility
export async function scrapeUnstop(): Promise<RawChallenge[]> {
  return scrapeAllChallenges();
}
