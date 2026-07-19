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

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; JobBot/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`[Unstop] returned ${response.status}, skipping`);
      return [];
    }

    const data: UnstopResponse = await response.json();
    const opportunities = data?.data?.data || [];
    
    // Filter out past deadlines
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
        // Unstop API now provides full SEO URLs (starting with http/https). Use it directly if present.
        applyLink: item.seo_url && item.seo_url.startsWith('http')
          ? item.seo_url
          : `https://unstop.com/o/${item.seo_url || item.id}`,
        deadline: item.end_date || '',
      }));
  } catch (error) {
    console.warn(`[Unstop] network error, skipping:`, error);
    return [];
  }
}
