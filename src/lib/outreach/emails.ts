// ============================================
// v2.0 — Intelligent Email Generation
// Company-aware, psychologically-targeted emails
// Cold email, referral message, and follow-up
// ============================================

import { callAIEmail, callAIStandard } from '../ai';
import { CompanyIntel } from './company-intel';

// ---- Section 6.3: Cold Email (<120 words, uses hook + company intel) ----

export async function generateColdEmail(
  recipientName: string,
  recipientTitle: string,
  company: string,
  jobTitle: string,
  hook: string,
  cvLink: string,
  companyIntel?: CompanyIntel | null,
): Promise<string> {
  // Build company research context
  let companyContext = '';
  if (companyIntel) {
    const parts: string[] = [];
    if (companyIntel.description) parts.push(`What they do: ${companyIntel.description.substring(0, 200)}`);
    if (companyIntel.stage !== 'unknown') parts.push(`Stage: ${companyIntel.stage}`);
    if (companyIntel.recentNews.length > 0) parts.push(`Recent news: ${companyIntel.recentNews[0]}`);
    if (companyIntel.techStack.length > 0) parts.push(`Their tech: ${companyIntel.techStack.slice(0, 5).join(', ')}`);
    if (companyIntel.culture.length > 0) parts.push(`Culture: ${companyIntel.culture.join(', ')}`);
    if (companyIntel.communicationStyle !== 'unknown') parts.push(`Tone: match their ${companyIntel.communicationStyle} style`);
    companyContext = parts.join('\n');
  }

  const prompt = `Write a cold email for a job application.

TO: ${recipientName} (${recipientTitle}) at ${company}
ROLE: ${jobTitle}
PSYCHOLOGICAL HOOK: ${hook}

COMPANY RESEARCH:
${companyContext || 'No specific intel — use generic but professional approach'}

CANDIDATE: Saikat Maji, CS graduate (2026), full-stack developer (MERN, TypeScript, Next.js)
CV LINK: ${cvLink}

RULES:
1. MAXIMUM 120 words — be punchy and direct
2. STRICT ZERO-HALLUCINATION: Never fabricate fake metrics, unverified facts, or false claims about candidate or company.
3. Sound human, NOT like a generic template
4. Include the hook naturally (don't just paste it)
5. ${companyIntel?.description ? `Reference what the company actually DOES (you know: "${companyIntel.description.substring(0, 100)}")` : 'Include a generic but polite expression of interest in their product/domain'}
6. ${companyIntel?.recentNews?.[0] ? `Optionally reference their recent news: "${companyIntel.recentNews[0]}"` : 'Show genuine interest in their tech stack'}
7. ${companyIntel?.communicationStyle === 'casual' ? 'Use a conversational, startup-friendly tone' : companyIntel?.communicationStyle === 'technical' ? 'Lead with technical substance, be precise' : 'Professional but warm tone'}
8. Clear call to action
9. Sign off as "Saikat Maji" with LinkedIn: linkedin.com/in/saikat-maji- and GitHub: github.com/GwSaikat

Write the email subject line and body. Format as:
Subject: ...

Body text here`;

  return callAIEmail(prompt, {
    maxTokens: 400,
    temperature: 0.7,
  });
}

// ---- Section 6.4: Referral Message (personalized template) ----

export async function generateReferralMessage(
  recipientName: string,
  company: string,
  jobTitle: string,
  hook: string,
  mostRelevantSkill: string,
  cvLink: string,
): Promise<string> {
  const prompt = `Generate ONE natural sentence using this psychological hook that fits between the first paragraph and the "Would you be open..." line of a referral message:

HOOK: ${hook}

The sentence should feel conversational and natural, not forced. Return ONLY the one sentence, nothing else.`;

  let hookSentence: string;
  try {
    hookSentence = await callAIEmail(prompt, {
      maxTokens: 80,
      temperature: 0.5,
    });
  } catch {
    hookSentence = hook;
  }

  return `Hi ${recipientName}, I noticed ${company} is hiring for ${jobTitle}, and my background in ${mostRelevantSkill} lines up closely with the description.

${hookSentence.trim()}

Would you be open to passing my resume along, or a quick intro to the hiring manager?

Totally understand if it's not the right fit. Either way, appreciate you considering it.

Thanks,
Saikat Maji
CV: ${cvLink}
LinkedIn: linkedin.com/in/saikat-maji- | GitHub: github.com/GwSaikat`;
}

// ---- Section 6.5: Follow-Up Email (<60 words, with new value-add) ----

export async function generateFollowUp(
  recipientName: string,
  company: string,
  jobTitle: string,
  daysSinceSent: number,
  companyIntel?: CompanyIntel | null,
): Promise<string> {
  let valueAdd = '';
  if (companyIntel?.techStack && companyIntel.techStack.length > 0) {
    valueAdd = `VALUE-ADD: Reference that you've been working with ${companyIntel.techStack.slice(0, 2).join(' and ')} recently.`;
  }

  const prompt = `Write a short follow-up email for a job application.

TO: ${recipientName} at ${company}
ROLE: ${jobTitle}
DAYS SINCE ORIGINAL EMAIL: ${daysSinceSent}
${valueAdd}

RULES:
1. MAXIMUM 60 words
2. Punchy opening line — explicitly AVOID "I hope this finds you well" or any variant
3. Sound human and confident, not desperate
4. Brief reminder of value — mention a SPECIFIC project (FlowForge or Banking System)
5. Clear, low-pressure call to action
6. Sign off as "Saikat"

Write the email subject line and body. Format as:
Subject: ...

Body text here`;

  return callAIEmail(prompt, {
    maxTokens: 150,
    temperature: 0.5,
  });
}
