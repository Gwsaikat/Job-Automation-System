// ============================================
// Headless Browser (Playwright) Search Utility
// Scrapes Google Search organic results to get
// highly accurate jobs and recruiter LinkedIn profiles.
// ============================================

import { chromium } from 'playwright';
import { RawJob } from './types';

export interface ScrapedSearchResult {
  title: string;
  link: string;
  snippet: string;
}

/**
 * Perform an organic Google search using Playwright
 */
export async function searchGoogleWithPuppeteer(query: string): Promise<ScrapedSearchResult[]> {
  console.log(`[Browser Search] Searching Google for: "${query}"`);
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

    // Wait for main results container to render
    await page.waitForSelector('#search', { timeout: 8000 }).catch(() => {});

    const results = await page.evaluate(() => {
      const items: ScrapedSearchResult[] = [];
      const searchBlocks = document.querySelectorAll('div.g');

      searchBlocks.forEach((block) => {
        const titleEl = block.querySelector('h3');
        const linkEl = block.querySelector('a');
        
        // Snippet selectors can vary, try a few common ones
        const snippetEl = block.querySelector('div[style*="webkit-line-clamp"], .VwiC3b, .yD755d, .MUFPAc');
        const snippetText = snippetEl ? snippetEl.textContent : (block.textContent || '').substring(0, 250);

        if (titleEl && linkEl) {
          const title = (titleEl.textContent || '').trim();
          const link = linkEl.getAttribute('href') || '';
          const snippet = (snippetText || '').trim();

          if (link.startsWith('http') && !link.includes('google.com')) {
            items.push({ title, link, snippet });
          }
        }
      });

      return items;
    });

    console.log(`[Browser Search] Found ${results.length} organic search results.`);
    return results;
  } catch (error) {
    console.error('[Browser Search] Playwright search failed:', error);
    return [];
  } finally {
    await browser.close();
  }
}

/**
 * Fallback recruiter locator using Google + LinkedIn search queries
 */
export async function findHRWithBrowser(company: string): Promise<{ name: string; title: string; url: string } | null> {
  const query = `site:linkedin.com/in/ "${company}" recruiter OR "talent acquisition" OR "hiring manager" OR "HR"`;
  
  try {
    const results = await searchGoogleWithPuppeteer(query);
    if (results.length === 0) return null;

    const firstResult = results[0];
    
    // Parse name and title from the search title
    // Example: "Jane Doe - Talent Acquisition Partner - CompanyName | LinkedIn"
    // Example: "John Smith | LinkedIn"
    const rawTitle = firstResult.title;
    let name = 'Hiring Team';
    let title = 'Hiring Manager';

    const cleanTitle = rawTitle.replace(/\s*\|\s*LinkedIn/gi, '').trim();
    const parts = cleanTitle.split(/[-|]/);

    if (parts.length >= 1 && parts[0]) {
      name = parts[0].trim();
    }
    if (parts.length >= 2 && parts[1]) {
      title = parts[1].trim();
    }

    return {
      name,
      title,
      url: firstResult.link
    };
  } catch (error) {
    console.error(`[Browser Search] Failed finding HR for ${company}:`, error);
    return null;
  }
}
