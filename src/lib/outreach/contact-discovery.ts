// ============================================
// v2.0 — Multi-Strategy Contact Discovery Engine
// Cascading: Apollo → Serper Dorking → Email Pattern → Browser
// Finds HR, recruiters, founders, and employees for outreach
// ============================================

import { getConfig } from '../config';
import { lookupHRContacts } from './apollo';

// ---- Types ----

export interface DiscoveredContact {
  name: string;
  email: string | null;
  title: string;
  linkedinUrl: string | null;
  source: 'apollo' | 'serper-dorking' | 'email-pattern' | 'browser' | 'manual';
  confidence: 'high' | 'medium' | 'low';
  role: 'hr' | 'founder' | 'engineering' | 'employee' | 'unknown';
}

export interface ContactDiscoveryResult {
  contacts: DiscoveredContact[];
  companyDomain: string | null;
  emailPattern: string | null;
  fallbackLinks: {
    linkedinPeopleSearch: string;
    linkedinCompanyPage: string;
    googleLinkedinSearch: string;
    founderSearch: string;
  };
  discoveryLog: string[];
}

// ---- Domain Extraction ----

function extractDomainFromJobUrl(jobUrl: string): string | null {
  try {
    const url = new URL(jobUrl);
    const host = url.hostname.toLowerCase();

    // ATS platforms — extract company name from URL structure
    if (host.includes('greenhouse.io')) {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[0] ? `${parts[0].replace(/-/g, '')}.com` : null;
    }
    if (host.includes('lever.co')) {
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[0] ? `${parts[0].replace(/-/g, '')}.com` : null;
    }
    if (host.includes('ashbyhq.com')) {
      const subdomain = host.split('.')[0];
      return subdomain !== 'jobs' ? `${subdomain}.com` : null;
    }
    if (host.includes('workable.com')) {
      const subdomain = host.split('.')[0];
      return subdomain !== 'apply' && subdomain !== 'www' ? `${subdomain}.com` : null;
    }
    if (host.includes('smartrecruiters.com') || host.includes('myworkdayjobs.com')) {
      return null; // Can't reliably extract domain from these
    }

    // Direct company career pages
    if (host.includes('careers') || url.pathname.includes('careers') || url.pathname.includes('jobs')) {
      return host.replace('www.', '').replace('careers.', '');
    }

    return host.replace('www.', '');
  } catch {
    return null;
  }
}

function guessDomainFromCompany(company: string): string {
  return company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
}

// ---- Serper Google Dorking ----

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

// ---- Strategy 2: Serper LinkedIn Dorking ----

async function findContactsViaSerper(
  company: string,
  _jobTitle: string,
  log: string[]
): Promise<DiscoveredContact[]> {
  const contacts: DiscoveredContact[] = [];

  // Query 1: Find HR/Recruiters
  const hrQuery = `site:linkedin.com/in/ "${company}" recruiter OR "talent acquisition" OR "hiring manager" OR "HR" India`;
  log.push(`[Serper Dorking] Searching: ${hrQuery.substring(0, 80)}...`);
  const hrResults = await serperSearch(hrQuery);

  for (const result of hrResults.slice(0, 3)) {
    const parsed = parseLinkedInResult(result);
    if (parsed) {
      contacts.push({
        ...parsed,
        source: 'serper-dorking',
        confidence: 'medium',
        role: classifyRole(parsed.title),
      });
    }
  }

  // Query 2: Find Founders/CTOs
  const founderQuery = `site:linkedin.com/in/ "${company}" CTO OR "co-founder" OR CEO OR "chief technology" OR founder`;
  log.push(`[Serper Dorking] Searching founders: ${founderQuery.substring(0, 80)}...`);
  const founderResults = await serperSearch(founderQuery);

  for (const result of founderResults.slice(0, 2)) {
    const parsed = parseLinkedInResult(result);
    if (parsed) {
      contacts.push({
        ...parsed,
        source: 'serper-dorking',
        confidence: 'medium',
        role: 'founder',
      });
    }
  }

  // Query 3: Find Engineering Managers
  const engQuery = `site:linkedin.com/in/ "${company}" "engineering manager" OR "tech lead" OR "head of engineering"`;
  log.push(`[Serper Dorking] Searching eng managers...`);
  const engResults = await serperSearch(engQuery);

  for (const result of engResults.slice(0, 2)) {
    const parsed = parseLinkedInResult(result);
    if (parsed) {
      contacts.push({
        ...parsed,
        source: 'serper-dorking',
        confidence: 'medium',
        role: 'engineering',
      });
    }
  }

  log.push(`[Serper Dorking] Found ${contacts.length} contacts via LinkedIn dorking`);
  return contacts;
}

function parseLinkedInResult(result: SerperOrganic): { name: string; title: string; linkedinUrl: string; email: null } | null {
  if (!result.link.includes('linkedin.com/in/')) return null;

  const rawTitle = result.title;
  const cleanTitle = rawTitle.replace(/\s*[|–-]\s*LinkedIn/gi, '').trim();
  const parts = cleanTitle.split(/\s*[-–|]\s*/);

  let name = 'Unknown';
  let title = 'Professional';

  if (parts.length >= 1 && parts[0]) {
    name = parts[0].trim();
  }
  if (parts.length >= 2 && parts[1]) {
    title = parts[1].trim();
  }

  // Skip if the name looks like a company or is too short
  if (name.length < 3 || name === 'Unknown') return null;

  return {
    name,
    title,
    linkedinUrl: result.link,
    email: null,
  };
}

function classifyRole(title: string): DiscoveredContact['role'] {
  const lower = title.toLowerCase();
  if (/founder|ceo|cto|co-founder|chief|owner/i.test(lower)) return 'founder';
  if (/recruiter|talent|hiring|hr |human resource|people ops/i.test(lower)) return 'hr';
  if (/engineer|developer|architect|tech lead|sde/i.test(lower)) return 'engineering';
  return 'unknown';
}

// ---- Strategy 3: Email Pattern Discovery ----

async function discoverEmailPattern(
  company: string,
  domain: string,
  log: string[]
): Promise<string | null> {
  const query = `"${company}" "@${domain}" contact OR email OR reach`;
  log.push(`[Email Pattern] Searching for email format: @${domain}`);
  const results = await serperSearch(query);

  for (const result of results) {
    const text = `${result.title} ${result.snippet}`.toLowerCase();
    const emailMatch = text.match(/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/);
    if (emailMatch && emailMatch[1].includes(domain)) {
      const email = emailMatch[1];
      const localPart = email.split('@')[0];
      if (localPart.includes('.')) {
        log.push(`[Email Pattern] Detected format: first.last@${domain}`);
        return 'first.last';
      }
      if (localPart.length > 10) {
        log.push(`[Email Pattern] Detected format: firstlast@${domain}`);
        return 'firstlast';
      }
      log.push(`[Email Pattern] Detected format: first@${domain}`);
      return 'first';
    }
  }

  log.push(`[Email Pattern] No pattern found, will use common guesses`);
  return null;
}

function generateEmailGuesses(name: string, domain: string, pattern: string | null): string[] {
  const parts = name.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  if (parts.length === 0) return [`hr@${domain}`, `hiring@${domain}`];

  const first = parts[0];
  const last = parts[parts.length - 1];
  const firstInitial = first[0];

  if (pattern === 'first.last') {
    return [`${first}.${last}@${domain}`, `${first}@${domain}`];
  }
  if (pattern === 'firstlast') {
    return [`${first}${last}@${domain}`, `${first}@${domain}`];
  }
  if (pattern === 'first') {
    return [`${first}@${domain}`, `${first}.${last}@${domain}`];
  }

  // No pattern — try all common formats
  return [
    `${first}.${last}@${domain}`,
    `${first}@${domain}`,
    `${first}${last}@${domain}`,
    `${firstInitial}${last}@${domain}`,
    `hr@${domain}`,
    `hiring@${domain}`,
    `careers@${domain}`,
  ];
}

// ---- Main Discovery Function ----

export async function discoverContacts(
  company: string,
  jobTitle: string,
  jobUrl: string
): Promise<ContactDiscoveryResult> {
  const log: string[] = [];
  const allContacts: DiscoveredContact[] = [];

  log.push(`[Contact Discovery] Starting multi-strategy discovery for "${company}" (${jobTitle})`);

  // Extract domain
  const domainFromUrl = extractDomainFromJobUrl(jobUrl);
  const domain = domainFromUrl || guessDomainFromCompany(company);
  log.push(`[Contact Discovery] Company domain: ${domain} (${domainFromUrl ? 'from URL' : 'guessed'})`);

  // ---- Strategy 1: Apollo API (if configured) ----
  const config = getConfig();
  if (config.apolloApiKey) {
    log.push('[Strategy 1] Trying Apollo API...');
    try {
      const apolloResult = await lookupHRContacts(company);
      for (const contact of apolloResult.contacts) {
        allContacts.push({
          name: contact.name,
          email: contact.email,
          title: contact.title,
          linkedinUrl: contact.linkedinUrl || null,
          source: 'apollo',
          confidence: contact.email ? 'high' : 'medium',
          role: classifyRole(contact.title),
        });
      }
      log.push(`[Strategy 1] Apollo found ${apolloResult.contacts.length} contacts`);
    } catch (error) {
      log.push(`[Strategy 1] Apollo failed: ${error}`);
    }
  } else {
    log.push('[Strategy 1] Apollo API not configured, skipping');
  }

  // ---- Strategy 2: Serper LinkedIn Dorking ----
  if (config.serperApiKey) {
    log.push('[Strategy 2] Running Serper LinkedIn dorking...');
    try {
      const serperContacts = await findContactsViaSerper(company, jobTitle, log);
      // Deduplicate by name
      for (const contact of serperContacts) {
        const isDuplicate = allContacts.some(
          c => c.name.toLowerCase() === contact.name.toLowerCase()
        );
        if (!isDuplicate) {
          allContacts.push(contact);
        }
      }
    } catch (error) {
      log.push(`[Strategy 2] Serper dorking failed: ${error}`);
    }
  } else {
    log.push('[Strategy 2] Serper API not configured, skipping');
  }

  // ---- Strategy 3: Email Pattern Discovery ----
  let emailPattern: string | null = null;
  if (config.serperApiKey && domain) {
    log.push('[Strategy 3] Discovering email patterns...');
    try {
      emailPattern = await discoverEmailPattern(company, domain, log);

      // Enrich contacts without emails using the discovered pattern
      for (const contact of allContacts) {
        if (!contact.email && contact.name !== 'Unknown') {
          const guesses = generateEmailGuesses(contact.name, domain, emailPattern);
          contact.email = guesses[0] || null;
          if (contact.email) {
            contact.confidence = emailPattern ? 'medium' : 'low';
            log.push(`[Strategy 3] Generated email for ${contact.name}: ${contact.email}`);
          }
        }
      }
    } catch (error) {
      log.push(`[Strategy 3] Email pattern discovery failed: ${error}`);
    }
  }

  // ---- If still no contacts, add generic HR guesses ----
  if (allContacts.length === 0) {
    log.push('[Fallback] No contacts found — adding generic HR emails');
    allContacts.push({
      name: 'Hiring Team',
      email: `hr@${domain}`,
      title: 'HR Department',
      linkedinUrl: null,
      source: 'email-pattern',
      confidence: 'low',
      role: 'hr',
    });
  }

  // ---- Generate fallback search links ----
  const fallbackLinks = {
    linkedinPeopleSearch: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' recruiter hiring India')}`,
    linkedinCompanyPage: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`,
    googleLinkedinSearch: `https://www.google.com/search?q=site:linkedin.com+"${encodeURIComponent(company)}"+recruiter+OR+hiring+India`,
    founderSearch: `https://www.google.com/search?q="${encodeURIComponent(company)}"+founder+OR+CTO+OR+CEO+linkedin`,
  };

  log.push(`[Contact Discovery] Complete! Found ${allContacts.length} total contacts`);

  return {
    contacts: allContacts,
    companyDomain: domain,
    emailPattern,
    fallbackLinks,
    discoveryLog: log,
  };
}
