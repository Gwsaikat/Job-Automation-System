// ============================================
// Email Generation — Sections 6.3, 6.4, 6.5
// Cold email, referral message, and follow-up email
// ============================================

import { callAIEmail, callAIStandard } from '../ai';

// ---- Section 6.3: Cold Email (<120 words, uses hook) ----

export async function generateColdEmail(
  recipientName: string,
  recipientTitle: string,
  company: string,
  jobTitle: string,
  hook: string,
  cvLink: string
): Promise<string> {
  const prompt = `Write a cold email for a job application.

TO: ${recipientName} (${recipientTitle}) at ${company}
ROLE: ${jobTitle}
PSYCHOLOGICAL HOOK: ${hook}

CANDIDATE: Saikat Maji, CS graduate, full-stack developer
CV LINK: ${cvLink}

RULES:
1. MAXIMUM 120 words — be punchy and direct
2. Sound human, NOT like a template
3. Include the hook naturally (don't just paste it)
4. Include a one-sentence company research brief (what the company does/why it matters)
5. Clear call to action
6. Sign off as "Saikat Maji" with LinkedIn: linkedin.com/in/saikat-maji- and GitHub: github.com/GwSaikat

Write the email subject line and body. Format as:
Subject: ...

Body text here`;

  return callAIEmail(prompt, {
    maxTokens: 400,
    temperature: 0.7,
  });
}

// ---- Section 6.4: Referral Message (exact template) ----

export async function generateReferralMessage(
  recipientName: string,
  company: string,
  jobTitle: string,
  hook: string,
  mostRelevantSkill: string,
  cvLink: string
): Promise<string> {
  // Use the EXACT template from Section 6.4, adding one natural hook sentence
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

  // Fill the EXACT template from Section 6.4
  return `Hi ${recipientName}, I noticed ${company} is hiring for ${jobTitle}, and my background in ${mostRelevantSkill} lines up closely with the description.

${hookSentence.trim()}

Would you be open to passing my resume along, or a quick intro to the hiring manager?

Totally understand if it's not the right fit. Either way, appreciate you considering it.

Thanks,
Saikat Maji
CV: ${cvLink}
LinkedIn: linkedin.com/in/saikat-maji- | GitHub: github.com/GwSaikat`;
}

// ---- Section 6.5: Follow-Up Email (<60 words) ----

export async function generateFollowUp(
  recipientName: string,
  company: string,
  jobTitle: string,
  daysSinceSent: number
): Promise<string> {
  const prompt = `Write a short follow-up email for a job application.

TO: ${recipientName} at ${company}
ROLE: ${jobTitle}
DAYS SINCE ORIGINAL EMAIL: ${daysSinceSent}

RULES:
1. MAXIMUM 60 words
2. Punchy opening line — explicitly AVOID "I hope this finds you well" or any variant
3. Sound human and confident, not desperate
4. Brief reminder of value
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
