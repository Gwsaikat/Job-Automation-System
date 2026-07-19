// ============================================
// Outreach Pipeline — Sections 6.1–6.6
// Apollo lookup → hook → cold email → referral → Gmail draft
// ============================================

import prisma from '../db';
import { lookupHRContacts } from './apollo';
import { generateHook } from './hook';
import { generateColdEmail, generateReferralMessage } from './emails';
import { createDraft, isGmailConnected } from './gmail';
import { callAIStandard } from '../ai';

export interface OutreachResult {
  hrName: string | null;
  hrEmail: string | null;
  hrTitle: string | null;
  coldMailDraftId: string | null;
  referralDraftId: string | null;
  linkedinPeopleSearch: string | null;
  linkedinCompanyPage: string | null;
  googleLinkedinSearch: string | null;
  linkedinContactUrl: string | null;
}

export async function runOutreachPipeline(jobId: number): Promise<OutreachResult> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error(`Job ${jobId} not found`);

  const company = job.company || 'Unknown';
  const jobTitle = job.jobTitle || 'Software Engineer';
  const cvPath = job.cvPdfPath || '';

  console.log(`[Outreach] Processing job ${jobId}: ${jobTitle} at ${company}`);

  const result: OutreachResult = {
    hrName: null,
    hrEmail: null,
    hrTitle: null,
    coldMailDraftId: null,
    referralDraftId: null,
    linkedinPeopleSearch: null,
    linkedinCompanyPage: null,
    googleLinkedinSearch: null,
    linkedinContactUrl: null,
  };

  // Step 1: Apollo lookup (Section 6.1)
  const apolloResult = await lookupHRContacts(company);

  if (apolloResult.contacts.length > 0) {
    const contact = apolloResult.contacts[0];
    result.hrName = contact.name;
    result.hrEmail = contact.email;
    result.hrTitle = contact.title;
    result.linkedinContactUrl = contact.linkedinUrl || null;
  }

  // Store fallback links
  if (apolloResult.fallbackLinks) {
    result.linkedinPeopleSearch = apolloResult.fallbackLinks.linkedinPeopleSearch;
    result.linkedinCompanyPage = apolloResult.fallbackLinks.linkedinCompanyPage;
    result.googleLinkedinSearch = apolloResult.fallbackLinks.googleLinkedinSearch;
  } else {
    // Generate them anyway as convenience search links
    result.linkedinPeopleSearch = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(company + ' recruiter hiring India')}`;
    result.linkedinCompanyPage = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company)}`;
    result.googleLinkedinSearch = `https://www.google.com/search?q=site:linkedin.com+"${encodeURIComponent(company)}"+recruiter+OR+hiring+India`;
  }

  // Step 2: Psychological hook (Section 6.2)
  const hookResult = await generateHook(
    result.hrTitle || '',
    company,
    jobTitle
  );
  console.log(`[Outreach] Hook angle: ${hookResult.angle} — "${hookResult.hook}"`);

  // Step 3: Determine most relevant skill for referral
  let mostRelevantSkill = 'full-stack development with React and Node.js';
  try {
    const skillPrompt = `Given this job title "${jobTitle}" at "${company}", what is the single most relevant skill from this list that I should highlight?
Skills: React.js, Node.js, TypeScript, Next.js, MERN, Socket.io, LangChain, REST APIs, MongoDB, Redis
Return ONLY the skill name, nothing else.`;
    mostRelevantSkill = await callAIStandard(skillPrompt, { maxTokens: 20, temperature: 0.1 });
  } catch {
    // Use default
  }

  // Step 4: Generate emails and create Gmail drafts (only if connected)
  const gmailConnected = await isGmailConnected();

  if (result.hrEmail && gmailConnected) {
    try {
      // Cold email (Section 6.3)
      const coldEmail = await generateColdEmail(
        result.hrName || 'Hiring Manager',
        result.hrTitle || '',
        company,
        jobTitle,
        hookResult.hook,
        cvPath
      );

      // Parse subject and body
      const subjectMatch = coldEmail.match(/^Subject:\s*(.+)/m);
      const subject = subjectMatch ? subjectMatch[1].trim() : `Application: ${jobTitle} at ${company}`;
      const body = coldEmail.replace(/^Subject:\s*.+\n*/m, '').trim();

      const coldDraftId = await createDraft(
        result.hrEmail,
        subject,
        body,
        cvPath
      );
      result.coldMailDraftId = coldDraftId;
      console.log(`[Outreach] Cold email draft created: ${coldDraftId}`);

      // Referral message (Section 6.4)
      const referralMsg = await generateReferralMessage(
        result.hrName || 'there',
        company,
        jobTitle,
        hookResult.hook,
        mostRelevantSkill,
        cvPath
      );

      const referralDraftId = await createDraft(
        result.hrEmail,
        `Referral Request: ${jobTitle} at ${company}`,
        referralMsg,
        cvPath
      );
      result.referralDraftId = referralDraftId;
      console.log(`[Outreach] Referral draft created: ${referralDraftId}`);
    } catch (error) {
      console.error('[Outreach] Draft creation failed:', error);
    }
  } else if (!gmailConnected) {
    console.warn('[Outreach] Gmail not connected, skipping draft creation');
  }

  // Step 5: Update job record
  await prisma.job.update({
    where: { id: jobId },
    data: {
      hrName: result.hrName,
      hrEmail: result.hrEmail,
      hrTitle: result.hrTitle,
      coldMailDraftId: result.coldMailDraftId,
      referralDraftId: result.referralDraftId,
      linkedinPeopleSearch: result.linkedinPeopleSearch,
      linkedinCompanyPage: result.linkedinCompanyPage,
      googleLinkedinSearch: result.googleLinkedinSearch,
      linkedinContactUrl: result.linkedinContactUrl,
    },
  });

  return result;
}
