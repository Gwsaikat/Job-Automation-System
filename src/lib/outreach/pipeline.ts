// ============================================
// v2.0 — Autonomous Outreach Pipeline
// Contact Discovery → Company Intel → Psych Analysis → Emails → Drafts
// Full research-driven outreach, not templates
// ============================================

import prisma from '../db';
import { discoverContacts, DiscoveredContact } from './contact-discovery';
import { gatherCompanyIntel, CompanyIntel } from './company-intel';
import { generateHook, HookResult } from './hook';
import { generateColdEmail, generateReferralMessage } from './emails';
import { createDraft, isGmailConnected } from './gmail';
import { callAIStandard } from '../ai';
import { CANDIDATE } from '../candidate-profile';

export interface OutreachResult {
  // Contact Discovery
  hrName: string | null;
  hrEmail: string | null;
  hrTitle: string | null;
  contactSource: string | null;
  contactConfidence: string | null;
  allContacts: DiscoveredContact[];
  // Company Intelligence
  companyIntel: CompanyIntel | null;
  companyDomain: string | null;
  companyStage: string | null;
  // Psychological Analysis
  psychProfile: HookResult | null;
  // Outreach Messages
  coldMailDraftId: string | null;
  referralDraftId: string | null;
  linkedinPeopleSearch: string | null;
  linkedinCompanyPage: string | null;
  googleLinkedinSearch: string | null;
  linkedinContactUrl: string | null;
  linkedinNote: string | null;
  founderMessage: string | null;
  hrMessage: string | null;
  referralMessage: string | null;
  employeeReferral: string | null;
  followUpScheduled: string | null;
  // Discovery Log
  discoveryLog: string[];
}

export async function runOutreachPipeline(jobId: number): Promise<OutreachResult> {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error(`Job ${jobId} not found`);

  const company = job.company || 'Unknown';
  const jobTitle = job.jobTitle || 'Software Engineer';
  const jobUrl = job.jobUrl || '';
  const cvPath = job.cvPdfPath || '';

  console.log(`[Outreach v2.0] ═══════════════════════════════════════`);
  console.log(`[Outreach v2.0] Processing: ${jobTitle} at ${company}`);
  console.log(`[Outreach v2.0] ═══════════════════════════════════════`);

  const result: OutreachResult = {
    hrName: null, hrEmail: null, hrTitle: null,
    contactSource: null, contactConfidence: null, allContacts: [],
    companyIntel: null, companyDomain: null, companyStage: null,
    psychProfile: null,
    coldMailDraftId: null, referralDraftId: null,
    linkedinPeopleSearch: null, linkedinCompanyPage: null,
    googleLinkedinSearch: null, linkedinContactUrl: null,
    linkedinNote: null, founderMessage: null, hrMessage: null,
    referralMessage: null, employeeReferral: null, followUpScheduled: null,
    discoveryLog: [],
  };

  // ═══════════════════════════════════════
  // STEP 1: Multi-Strategy Contact Discovery
  // ═══════════════════════════════════════
  console.log(`[Outreach v2.0] Step 1: Contact Discovery...`);
  const discoveryResult = await discoverContacts(company, jobTitle, jobUrl);
  result.allContacts = discoveryResult.contacts;
  result.companyDomain = discoveryResult.companyDomain;
  result.discoveryLog = discoveryResult.discoveryLog;

  // Pick primary contact (prefer HR, then founder, then engineering)
  const priorityOrder: DiscoveredContact['role'][] = ['hr', 'founder', 'engineering', 'employee', 'unknown'];
  let primaryContact: DiscoveredContact | null = null;

  for (const role of priorityOrder) {
    primaryContact = discoveryResult.contacts.find(c => c.role === role) || null;
    if (primaryContact) break;
  }

  if (primaryContact) {
    result.hrName = primaryContact.name;
    result.hrEmail = primaryContact.email;
    result.hrTitle = primaryContact.title;
    result.contactSource = primaryContact.source;
    result.contactConfidence = primaryContact.confidence;
    result.linkedinContactUrl = primaryContact.linkedinUrl;
    console.log(`[Outreach v2.0] Primary contact: ${primaryContact.name} (${primaryContact.title}) via ${primaryContact.source}`);
  }

  // Store fallback links
  result.linkedinPeopleSearch = discoveryResult.fallbackLinks.linkedinPeopleSearch;
  result.linkedinCompanyPage = discoveryResult.fallbackLinks.linkedinCompanyPage;
  result.googleLinkedinSearch = discoveryResult.fallbackLinks.googleLinkedinSearch;

  // ═══════════════════════════════════════
  // STEP 2: Company Intelligence Gathering
  // ═══════════════════════════════════════
  console.log(`[Outreach v2.0] Step 2: Company Intelligence...`);
  try {
    const domain = discoveryResult.companyDomain || company.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    result.companyIntel = await gatherCompanyIntel(company, domain);
    result.companyStage = result.companyIntel.stage;
    console.log(`[Outreach v2.0] Intel gathered: stage=${result.companyIntel.stage}, culture=[${result.companyIntel.culture.join(', ')}]`);
  } catch (error) {
    console.error('[Outreach v2.0] Company intel failed:', error);
  }

  // ═══════════════════════════════════════
  // STEP 3: Psychological Hook Generation
  // ═══════════════════════════════════════
  console.log(`[Outreach v2.0] Step 3: Psychological Analysis...`);
  const hookResult = await generateHook(
    primaryContact?.title || '',
    company,
    jobTitle,
    result.companyIntel,
    primaryContact,
  );
  result.psychProfile = hookResult;

  console.log(`[Outreach v2.0] Psych profile: angle=${hookResult.angle}, principle=${hookResult.influencePrinciple}`);
  console.log(`[Outreach v2.0] Rationale: ${hookResult.psychologicalRationale}`);

  // Store all message types
  result.linkedinNote = hookResult.linkedinNote || null;
  result.founderMessage = hookResult.founderMessage || null;
  result.hrMessage = hookResult.hrMessage || null;
  result.employeeReferral = hookResult.employeeReferralMessage || null;

  // ═══════════════════════════════════════
  // STEP 4: Determine Most Relevant Skill
  // ═══════════════════════════════════════
  let mostRelevantSkill = 'full-stack development with React and Node.js';
  try {
    // If company intel has tech stack, match against it
    if (result.companyIntel && result.companyIntel.techStack.length > 0) {
      const candidateSkills = ['react', 'node.js', 'typescript', 'next.js', 'mongodb', 'redis', 'socket.io', 'langchain', 'express'];
      const overlap = result.companyIntel.techStack.filter(t =>
        candidateSkills.some(s => t.toLowerCase().includes(s) || s.includes(t.toLowerCase()))
      );
      if (overlap.length > 0) {
        mostRelevantSkill = overlap.join(', ');
      }
    } else {
      const skillPrompt = `Given this job title "${jobTitle}" at "${company}", what is the single most relevant skill from this list that I should highlight?
Skills: React.js, Node.js, TypeScript, Next.js, MERN, Socket.io, LangChain, REST APIs, MongoDB, Redis
Return ONLY the skill name, nothing else.`;
      mostRelevantSkill = await callAIStandard(skillPrompt, { maxTokens: 20, temperature: 0.1 });
    }
  } catch {
    // Use default
  }

  // ═══════════════════════════════════════
  // STEP 5: Generate Emails and Gmail Drafts
  // ═══════════════════════════════════════
  const gmailConnected = await isGmailConnected();

  if (result.hrEmail && gmailConnected) {
    try {
      console.log(`[Outreach v2.0] Step 5: Generating personalized emails...`);

      // Cold email with company intel
      const coldEmail = await generateColdEmail(
        result.hrName || 'Hiring Manager',
        result.hrTitle || '',
        company,
        jobTitle,
        hookResult.hook,
        cvPath,
        result.companyIntel,
      );

      const subjectMatch = coldEmail.match(/^Subject:\s*(.+)/m);
      const subject = subjectMatch ? subjectMatch[1].trim() : `Application: ${jobTitle} at ${company}`;
      const body = coldEmail.replace(/^Subject:\s*.+\n*/m, '').trim();

      const coldDraftId = await createDraft(result.hrEmail, subject, body, cvPath);
      result.coldMailDraftId = coldDraftId;
      console.log(`[Outreach v2.0] Cold email draft created: ${coldDraftId}`);

      // Referral message
      const referralMsg = await generateReferralMessage(
        result.hrName || 'there',
        company,
        jobTitle,
        hookResult.hook,
        mostRelevantSkill,
        cvPath,
      );
      result.referralMessage = referralMsg;

      const referralDraftId = await createDraft(
        result.hrEmail,
        `Referral Request: ${jobTitle} at ${company}`,
        referralMsg,
        cvPath,
      );
      result.referralDraftId = referralDraftId;
      console.log(`[Outreach v2.0] Referral draft created: ${referralDraftId}`);
    } catch (error) {
      console.error('[Outreach v2.0] Draft creation failed:', error);
    }
  } else if (!gmailConnected) {
    console.warn('[Outreach v2.0] Gmail not connected, skipping draft creation');
    // Still generate the email text for display
    try {
      const coldEmail = await generateColdEmail(
        result.hrName || 'Hiring Manager',
        result.hrTitle || '',
        company,
        jobTitle,
        hookResult.hook,
        cvPath,
        result.companyIntel,
      );
      result.referralMessage = coldEmail;
    } catch {
      // Non-critical
    }
  }

  // ═══════════════════════════════════════
  // STEP 6: Schedule Follow-Up
  // ═══════════════════════════════════════
  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + 5);
  result.followUpScheduled = followUpDate.toISOString().split('T')[0];

  // ═══════════════════════════════════════
  // STEP 7: Update Job Record
  // ═══════════════════════════════════════
  console.log(`[Outreach v2.0] Step 7: Saving to database...`);
  await prisma.job.update({
    where: { id: jobId },
    data: {
      hrName: result.hrName,
      hrEmail: result.hrEmail,
      hrTitle: result.hrTitle,
      contactSource: result.contactSource,
      contactConfidence: result.contactConfidence,
      companyIntel: result.companyIntel ? JSON.stringify(result.companyIntel) : null,
      companyDomain: result.companyDomain,
      companyStage: result.companyStage,
      psychProfile: result.psychProfile ? JSON.stringify(result.psychProfile) : null,
      coldMailDraftId: result.coldMailDraftId,
      referralDraftId: result.referralDraftId,
      linkedinPeopleSearch: result.linkedinPeopleSearch,
      linkedinCompanyPage: result.linkedinCompanyPage,
      googleLinkedinSearch: result.googleLinkedinSearch,
      linkedinContactUrl: result.linkedinContactUrl,
      linkedinNote: result.linkedinNote,
      founderMessage: result.founderMessage,
      hrMessage: result.hrMessage,
      referralMessage: result.referralMessage,
      employeeReferral: result.employeeReferral,
      followUpScheduled: result.followUpScheduled,
    },
  });

  console.log(`[Outreach v2.0] ═══════════════════════════════════════`);
  console.log(`[Outreach v2.0] COMPLETE for ${jobTitle} at ${company}`);
  console.log(`[Outreach v2.0]   Contacts found: ${result.allContacts.length}`);
  console.log(`[Outreach v2.0]   Primary: ${result.hrName} (${result.contactSource})`);
  console.log(`[Outreach v2.0]   Intel: stage=${result.companyStage}`);
  console.log(`[Outreach v2.0]   Psych: ${hookResult.influencePrinciple}`);
  console.log(`[Outreach v2.0] ═══════════════════════════════════════`);

  return result;
}
