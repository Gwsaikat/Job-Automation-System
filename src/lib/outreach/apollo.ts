// ============================================
// Apollo.io HR Contact Lookup — Section 6.1
// API key goes in X-Api-Key HEADER, not body
// Falls back to LinkedIn/Google search links on zero results
// ============================================

import { getConfig } from '../config';
import { findHRWithBrowser } from '../scrapers/browser-search';

export interface ApolloContact {
  name: string;
  email: string;
  title: string;
  linkedinUrl?: string;
}

export interface ApolloResult {
  contacts: ApolloContact[];
  fallbackLinks: {
    linkedinPeopleSearch: string;
    linkedinCompanyPage: string;
    googleLinkedinSearch: string;
  } | null;
}

export async function lookupHRContacts(company: string): Promise<ApolloResult> {
  const config = getConfig();

  const fallbackLinks = {
    linkedinPeopleSearch: `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' recruiter hiring India')}`,
    linkedinCompanyPage: `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`,
    googleLinkedinSearch: `https://www.google.com/search?q=site:linkedin.com+"${encodeURIComponent(company)}"+recruiter+OR+hiring+India`,
  };

  let contacts: ApolloContact[] = [];

  if (config.apolloApiKey) {
    try {
      // CRITICAL: Apollo requires API key in X-Api-Key HEADER, not body
      const response = await fetch('https://api.apollo.io/api/v1/mixed_people/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': config.apolloApiKey,
        },
        body: JSON.stringify({
          q_organization_name: company,
          person_titles: [
            'recruiter',
            'talent acquisition',
            'hr manager',
            'head of people',
            'hiring manager',
            'people operations',
          ],
          per_page: 3,
          page: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const people = data.people || [];
        contacts = people.map((person: Record<string, string>) => ({
          name: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
          email: person.email || '',
          title: person.title || '',
        })).filter((c: ApolloContact) => c.email);
      } else {
        console.warn(`[Apollo] API returned status ${response.status}. Falling back to browser search...`);
      }
    } catch (error) {
      console.error('[Apollo] API lookup failed, falling back to browser search:', error);
    }
  }

  // If no contact found via API, use browser search fallback
  if (contacts.length === 0) {
    console.log(`[Outreach] Triggering browser-based Google/LinkedIn search fallback for: "${company}"`);
    const browserContact = await findHRWithBrowser(company);
    if (browserContact) {
      // Generate a reasonable email format guess since we found a name
      const domainSlug = company.toLowerCase().replace(/[^a-z0-9]/g, '');
      const emailGuess = `hr@${domainSlug || 'company'}.com`;
      contacts.push({
        name: browserContact.name,
        email: emailGuess,
        title: browserContact.title,
        linkedinUrl: browserContact.url
      });
      console.log(`[Browser Search] Successfully found HR: ${browserContact.name} (${browserContact.title})`);
    } else {
      console.log(`[Browser Search] No recruiter profile found on Google/LinkedIn for ${company}.`);
    }
  }

  return {
    contacts,
    fallbackLinks: contacts.length === 0 ? fallbackLinks : null,
  };
}
