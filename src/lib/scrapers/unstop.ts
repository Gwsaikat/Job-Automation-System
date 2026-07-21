// ============================================
// Career OS — Multi-Platform Hiring Challenge Engine
// Sources: Hack2skill, Devpost, HackerRank, HackerEarth, Devfolio, CodeChef, LeetCode, GFG
// Zero AI cost — no relevance check, no CV tailoring
// ============================================

import { RawChallenge } from './types';
import { getConfig } from '../config';

interface SerperResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
}

const CHALLENGE_QUERIES = [
  // Hack2skill
  { query: 'site:hack2skill.com hackathon OR "hiring challenge" OR "coding contest" 2026', platform: 'Hack2skill' },
  { query: 'site:hack2skill.com software engineer developer hiring India', platform: 'Hack2skill' },

  // Devpost
  { query: 'site:devpost.com hackathon software developer hiring 2026', platform: 'Devpost' },
  { query: 'site:devpost.com "hiring challenge" OR "coding contest" India remote', platform: 'Devpost' },

  // HackerRank
  { query: 'site:hackerrank.com hiring challenge OR "coding challenge" software engineer 2026', platform: 'HackerRank' },
  { query: 'site:hackerrank.com/contests software developer hiring contest', platform: 'HackerRank' },

  // HackerEarth
  { query: 'site:hackerearth.com hiring challenge software engineer 2026', platform: 'HackerEarth' },
  { query: 'site:hackerearth.com/challenges SDE challenge OR "hiring challenge"', platform: 'HackerEarth' },

  // Devfolio
  { query: 'site:devfolio.co hackathon hiring software developer India 2026', platform: 'Devfolio' },

  // CodeChef
  { query: 'site:codechef.com hiring challenge software engineer India', platform: 'CodeChef' },

  // LeetCode & GeeksforGeeks
  { query: 'site:leetcode.com/contest OR site:leetcode.com/discuss hiring challenge 2026', platform: 'LeetCode' },
  { query: 'site:geeksforgeeks.org/jobs OR site:practice.geeksforgeeks.org hiring contest SDE', platform: 'GeeksforGeeks' },

  // GitHub & Broad Multi-Platform Search
  { query: 'site:github.com hackathon OR "hiring challenge" software engineer 2026', platform: 'GitHub' },
  { query: '"hiring challenge" OR "SDE hiring" software engineer register India 2026', platform: 'Various' },
];

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

function extractCompanyFromChallenge(title: string, platform: string): string {
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

  return platform;
}

export async function scrapeAllChallenges(): Promise<RawChallenge[]> {
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
          body: JSON.stringify({ q: query, num: 20 }),
        });

        if (!response.ok) return [];

        const data = await response.json();
        const organic: SerperResult[] = data?.organic || [];

        return organic
          .filter(item => {
            const title = item.title.toLowerCase();
            const snippet = (item.snippet || '').toLowerCase();
            return (
              title.includes('challenge') || title.includes('hackathon') ||
              title.includes('contest') || title.includes('hiring') ||
              snippet.includes('challenge') || snippet.includes('hiring')
            );
          })
          .map((item): RawChallenge => {
            let hash = 0;
            for (let i = 0; i < item.link.length; i++) {
              hash = ((hash << 5) - hash) + item.link.charCodeAt(i);
              hash |= 0;
            }

            return {
              sourceId: `challenge_${platform.toLowerCase()}_${Math.abs(hash)}`,
              challengeName: item.title || '',
              company: extractCompanyFromChallenge(item.title, platform),
              source: platform,
              applyLink: item.link || '',
              deadline: item.date || '',
              platform,
              challengeType: isHiringChallenge(`${item.title} ${item.snippet}`) ? 'hiring' : 'competition',
            };
          });
      } catch (error) {
        console.warn(`[Challenges] Query failed for ${platform}:`, error);
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

  // Sort: hiring challenges first
  results.sort((a, b) => {
    if (a.challengeType === 'hiring' && b.challengeType !== 'hiring') return -1;
    if (a.challengeType !== 'hiring' && b.challengeType === 'hiring') return 1;
    return 0;
  });

  console.log(`[Challenges] ${results.length} total challenges from Hack2skill, Devpost, HackerRank, HackerEarth, Devfolio, CodeChef, LeetCode, GFG`);
  return results;
}

// Backward compatibility export
export async function scrapeUnstop(): Promise<RawChallenge[]> {
  return scrapeAllChallenges();
}
