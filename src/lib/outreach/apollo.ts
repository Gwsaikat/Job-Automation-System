// ============================================
// Apollo.io HR Contact Lookup — Section 6.1
// API key goes in X-Api-Key HEADER, not body
// Falls back to LinkedIn/Google search links on zero results
// ============================================

import { getConfig } from '../config';

export interface ApolloContact {
  name: string;
  email: string;
  title: string;
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

  if (!config.apolloApiKey) {
    console.warn('[Apollo] API key not configured, returning fallback links only');
    return { contacts: [], fallbackLinks };
  }

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

    if (!response.ok) {
      console.error(`[Apollo] API returned ${response.status}: ${await response.text()}`);
      return { contacts: [], fallbackLinks };
    }

    const data = await response.json();
    const people = data.people || [];

    if (people.length === 0) {
      console.log(`[Apollo] No contacts found for ${company}, using fallback links`);
      return { contacts: [], fallbackLinks };
    }

    const contacts: ApolloContact[] = people.map((person: Record<string, string>) => ({
      name: person.name || `${person.first_name || ''} ${person.last_name || ''}`.trim(),
      email: person.email || '',
      title: person.title || '',
    })).filter((c: ApolloContact) => c.email);

    return {
      contacts,
      fallbackLinks: contacts.length === 0 ? fallbackLinks : null,
    };
  } catch (error) {
    console.error('[Apollo] Lookup failed:', error);
    return { contacts: [], fallbackLinks };
  }
}
