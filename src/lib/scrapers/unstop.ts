// ============================================
// Unstop Scraper — Section 4.1 / 4.4
// Routes into sde_challenges table, NOT jobs
// Zero AI cost — no relevance check, no CV tailoring
// ============================================

import { RawChallenge } from './types';

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

export async function scrapeUnstop(): Promise<RawChallenge[]> {
  const url =
    'https://unstop.com/api/public/opportunity/search-result?opportunity=competitions&per_page=20&oppstatus=open&title=SDE hiring challenge software engineer';

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Unstop returned ${response.status}: ${await response.text()}`);
  }

  const data: UnstopResponse = await response.json();
  const opportunities = data?.data?.data || [];

  return opportunities.map((item): RawChallenge => ({
    sourceId: `unstop_${item.id}`,
    challengeName: item.title || '',
    company: item.organization?.name || 'Unknown',
    source: 'Unstop',
    applyLink: item.seo_url
      ? `https://unstop.com/${item.seo_url}`
      : `https://unstop.com/competitions/${item.id}`,
    deadline: item.end_date || '',
  }));
}
