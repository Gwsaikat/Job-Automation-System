// ============================================
// v2.0 — Company Intelligence Engine
// Gathers strategic intelligence on companies using Serper
// Company profile, culture, news, tech stack, hiring signals
// ============================================

import { getConfig } from '../config';

// ---- Types ----

export interface CompanyIntel {
  domain: string;
  description: string;
  stage: 'early-startup' | 'growth' | 'enterprise' | 'unknown';
  culture: string[];
  recentNews: string[];
  techStack: string[];
  hiringSignals: string[];
  glassdoorRating: string;
  companySize: string;
  fundingStage: string;
  industryVertical: string;
  companyValues: string[];
  communicationStyle: 'formal' | 'casual' | 'technical' | 'unknown';
}

// ---- Serper Helper ----

interface SerperOrganic {
  title: string;
  link: string;
  snippet: string;
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
      body: JSON.stringify({ q: query, num: 10 }),
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.organic || [];
  } catch {
    return [];
  }
}

// ---- Intelligence Gathering ----

async function gatherCompanyDescription(company: string): Promise<string> {
  const results = await serperSearch(`"${company}" company about what does`);
  if (results.length === 0) return '';

  // Take the most informative snippet
  const snippets = results
    .slice(0, 3)
    .map(r => r.snippet)
    .filter(s => s.length > 50);

  return snippets[0] || '';
}

async function gatherRecentNews(company: string): Promise<string[]> {
  const results = await serperSearch(`"${company}" news 2025 OR 2026 funding OR hiring OR launch OR product`);
  return results
    .slice(0, 3)
    .map(r => r.title)
    .filter(Boolean);
}

async function gatherTechStack(company: string): Promise<string[]> {
  const results = await serperSearch(`"${company}" engineering blog OR tech stack OR "built with" OR "we use"`);
  const allText = results.map(r => `${r.title} ${r.snippet}`).join(' ').toLowerCase();

  const techKeywords = [
    'react', 'angular', 'vue', 'svelte', 'next.js', 'node.js', 'express',
    'python', 'django', 'flask', 'fastapi', 'java', 'spring', 'kotlin',
    'go', 'golang', 'rust', 'typescript', 'javascript', 'ruby', 'rails',
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform',
    'graphql', 'rest api', 'microservices', 'kafka', 'rabbitmq',
  ];

  return techKeywords.filter(tech => allText.includes(tech));
}

async function gatherHiringSignals(company: string): Promise<string[]> {
  const results = await serperSearch(`"${company}" hiring OR "we're growing" OR "join our team" OR careers 2026`);
  const signals: string[] = [];

  const signalKeywords = [
    'hiring', 'growing', 'scaling', 'expanding', 'join our team',
    'open positions', 'career', 'we\'re building', 'looking for',
  ];

  for (const result of results.slice(0, 5)) {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    for (const kw of signalKeywords) {
      if (text.includes(kw) && !signals.includes(kw)) {
        signals.push(kw);
      }
    }
  }

  return signals;
}

function detectStage(
  description: string,
  news: string[],
  hiringSignals: string[]
): CompanyIntel['stage'] {
  const allText = `${description} ${news.join(' ')} ${hiringSignals.join(' ')}`.toLowerCase();

  const earlySignals = ['seed', 'pre-seed', 'angel', 'bootstrapped', 'early-stage', 'pre-series', 'mvp'];
  const growthSignals = ['series a', 'series b', 'series c', 'scaling', 'rapid growth', 'unicorn', 'growing fast'];
  const enterpriseSignals = ['fortune 500', 'established', 'publicly traded', 'ipo', 'nasdaq', 'nyse', 'enterprise'];

  const earlyCount = earlySignals.filter(s => allText.includes(s)).length;
  const growthCount = growthSignals.filter(s => allText.includes(s)).length;
  const enterpriseCount = enterpriseSignals.filter(s => allText.includes(s)).length;

  if (enterpriseCount > growthCount && enterpriseCount > earlyCount) return 'enterprise';
  if (growthCount > earlyCount) return 'growth';
  if (earlyCount > 0) return 'early-startup';
  return 'unknown';
}

function detectCulture(description: string, news: string[]): string[] {
  const allText = `${description} ${news.join(' ')}`.toLowerCase();
  const culture: string[] = [];

  const cultureIndicators: Record<string, string[]> = {
    'engineering-first': ['engineering blog', 'tech-first', 'engineering culture', 'developer experience'],
    'remote-friendly': ['remote', 'distributed', 'work from anywhere', 'async'],
    'fast-paced': ['fast-paced', 'move fast', 'startup', 'agile', 'rapid'],
    'mission-driven': ['mission', 'impact', 'social good', 'sustainability', 'purpose'],
    'data-driven': ['data-driven', 'analytics', 'metrics', 'evidence-based'],
    'customer-focused': ['customer-first', 'user-centric', 'customer obsession'],
    'innovative': ['innovation', 'cutting-edge', 'ai-first', 'deep tech'],
    'collaborative': ['collaborative', 'team-oriented', 'cross-functional'],
  };

  for (const [trait, keywords] of Object.entries(cultureIndicators)) {
    if (keywords.some(kw => allText.includes(kw))) {
      culture.push(trait);
    }
  }

  return culture.length > 0 ? culture : ['professional'];
}

function detectCommunicationStyle(culture: string[], stage: string): CompanyIntel['communicationStyle'] {
  if (culture.includes('engineering-first') || culture.includes('data-driven')) return 'technical';
  if (stage === 'early-startup' || culture.includes('fast-paced')) return 'casual';
  if (stage === 'enterprise') return 'formal';
  return 'unknown';
}

function extractValues(description: string): string[] {
  const values: string[] = [];
  const valuePatterns: Record<string, string[]> = {
    'Transparency': ['transparent', 'transparency', 'open'],
    'Ownership': ['ownership', 'autonomy', 'empowerment'],
    'Speed': ['speed', 'velocity', 'ship fast', 'move fast'],
    'Quality': ['quality', 'excellence', 'craftsmanship'],
    'Diversity': ['diversity', 'inclusion', 'dei', 'belonging'],
    'Growth': ['growth', 'learning', 'development'],
  };

  const lower = description.toLowerCase();
  for (const [value, keywords] of Object.entries(valuePatterns)) {
    if (keywords.some(kw => lower.includes(kw))) {
      values.push(value);
    }
  }

  return values;
}

// ---- Main Intelligence Function ----

export async function gatherCompanyIntel(
  company: string,
  domain: string
): Promise<CompanyIntel> {
  console.log(`[Company Intel] Gathering intelligence on "${company}" (${domain})`);

  // Run all research in parallel for speed
  const [description, news, techStack, hiringSignals] = await Promise.all([
    gatherCompanyDescription(company),
    gatherRecentNews(company),
    gatherTechStack(company),
    gatherHiringSignals(company),
  ]);

  const stage = detectStage(description, news, hiringSignals);
  const culture = detectCulture(description, news);
  const communicationStyle = detectCommunicationStyle(culture, stage);
  const companyValues = extractValues(description);

  // Try to extract Glassdoor rating
  let glassdoorRating = 'N/A';
  const glassdoorResults = await serperSearch(`site:glassdoor.com "${company}" rating`);
  if (glassdoorResults.length > 0) {
    const ratingMatch = glassdoorResults[0].snippet.match(/(\d\.\d)\s*(?:out of|\/)\s*5/);
    if (ratingMatch) {
      glassdoorRating = ratingMatch[1] + '/5';
    }
  }

  // Try to detect company size
  let companySize = 'Unknown';
  const sizeResults = await serperSearch(`"${company}" employees OR "team size" OR headcount`);
  if (sizeResults.length > 0) {
    const sizeText = sizeResults[0].snippet.toLowerCase();
    const sizeMatch = sizeText.match(/(\d+[\d,]*)\s*(?:employees|people|team members|engineers)/);
    if (sizeMatch) {
      companySize = sizeMatch[1].replace(/,/g, '') + ' employees';
    }
  }

  // Detect funding stage
  let fundingStage = 'Unknown';
  const fundingKeywords = ['seed', 'pre-seed', 'series a', 'series b', 'series c', 'series d', 'ipo', 'bootstrapped'];
  const allText = `${description} ${news.join(' ')}`.toLowerCase();
  for (const stage of fundingKeywords) {
    if (allText.includes(stage)) {
      fundingStage = stage.charAt(0).toUpperCase() + stage.slice(1);
      break;
    }
  }

  // Detect industry
  let industryVertical = 'Technology';
  const industries: Record<string, string[]> = {
    'FinTech': ['fintech', 'finance', 'banking', 'payments', 'lending'],
    'EdTech': ['edtech', 'education', 'learning', 'school'],
    'HealthTech': ['healthtech', 'health', 'medical', 'pharma', 'biotech'],
    'E-Commerce': ['ecommerce', 'e-commerce', 'marketplace', 'retail', 'shopping'],
    'SaaS': ['saas', 'software as a service', 'b2b', 'platform'],
    'AI/ML': ['artificial intelligence', 'machine learning', 'ai-first', 'deep learning'],
    'DevTools': ['developer tools', 'devtools', 'api platform', 'infrastructure'],
    'Logistics': ['logistics', 'supply chain', 'delivery', 'shipping'],
    'Social': ['social', 'community', 'networking', 'communication'],
  };

  for (const [industry, keywords] of Object.entries(industries)) {
    if (keywords.some(kw => allText.includes(kw))) {
      industryVertical = industry;
      break;
    }
  }

  const intel: CompanyIntel = {
    domain,
    description: description.substring(0, 500),
    stage,
    culture,
    recentNews: news,
    techStack,
    hiringSignals,
    glassdoorRating,
    companySize,
    fundingStage,
    industryVertical,
    companyValues,
    communicationStyle,
  };

  console.log(`[Company Intel] Complete for "${company}": stage=${stage}, culture=[${culture.join(', ')}], techStack=[${techStack.slice(0, 5).join(', ')}]`);
  return intel;
}
