// ============================================
// v2.0 — Deep Psychological Hook Engine
// Cialdini's 6 Principles + Company Intel + Contact Profiling
// Generates hyper-personalized outreach for 4 audience types
// ============================================

import { callAIPsychological, parseAIJson } from '../ai';
import { CANDIDATE, getProjectsSummary, getExperienceSummary } from '../candidate-profile';
import { CompanyIntel } from './company-intel';
import { DiscoveredContact } from './contact-discovery';

export type RecipientAngle = 'founder' | 'hr' | 'engineering' | 'employee' | 'unknown';

export interface HookResult {
  angle: RecipientAngle;
  hook: string;
  angleDescription: string;
  influencePrinciple: string;
  psychologicalRationale: string;
  bestSendTime: string;
  toneGuide: string;
  linkedinNote: string;
  founderMessage: string;
  hrMessage: string;
  employeeReferralMessage: string;
  followUpHook: string;
}

// ---- Determine Angle from Contact ----

function determineAngle(contact: DiscoveredContact | null, companyIntel: CompanyIntel | null): RecipientAngle {
  if (contact) {
    return contact.role === 'unknown' ? 'engineering' : contact.role;
  }
  // If no contact, infer from company stage
  if (companyIntel) {
    if (companyIntel.stage === 'early-startup') return 'founder';
    if (companyIntel.stage === 'enterprise') return 'hr';
  }
  return 'engineering';
}

// ---- Build Intel Context for AI ----

function buildIntelContext(companyIntel: CompanyIntel | null): string {
  if (!companyIntel) return 'No company intelligence available.';

  const parts: string[] = [];
  if (companyIntel.description) parts.push(`ABOUT: ${companyIntel.description}`);
  if (companyIntel.stage !== 'unknown') parts.push(`STAGE: ${companyIntel.stage}`);
  if (companyIntel.culture.length > 0) parts.push(`CULTURE: ${companyIntel.culture.join(', ')}`);
  if (companyIntel.recentNews.length > 0) parts.push(`RECENT NEWS: ${companyIntel.recentNews.slice(0, 2).join('; ')}`);
  if (companyIntel.techStack.length > 0) parts.push(`TECH STACK: ${companyIntel.techStack.join(', ')}`);
  if (companyIntel.hiringSignals.length > 0) parts.push(`HIRING SIGNALS: ${companyIntel.hiringSignals.join(', ')}`);
  if (companyIntel.fundingStage !== 'Unknown') parts.push(`FUNDING: ${companyIntel.fundingStage}`);
  if (companyIntel.companySize !== 'Unknown') parts.push(`SIZE: ${companyIntel.companySize}`);
  if (companyIntel.industryVertical) parts.push(`INDUSTRY: ${companyIntel.industryVertical}`);
  if (companyIntel.companyValues.length > 0) parts.push(`VALUES: ${companyIntel.companyValues.join(', ')}`);
  if (companyIntel.communicationStyle !== 'unknown') parts.push(`COMM STYLE: ${companyIntel.communicationStyle}`);

  return parts.join('\n');
}

function buildContactContext(contact: DiscoveredContact | null): string {
  if (!contact) return 'No specific contact identified.';

  const parts = [`NAME: ${contact.name}`, `TITLE: ${contact.title}`];
  if (contact.linkedinUrl) parts.push(`LINKEDIN: ${contact.linkedinUrl}`);
  parts.push(`SOURCE: Found via ${contact.source} (${contact.confidence} confidence)`);
  parts.push(`ROLE TYPE: ${contact.role}`);

  return parts.join('\n');
}

// ---- Main Hook Generator ----

export async function generateHook(
  recipientTitle: string,
  company: string,
  jobTitle: string,
  companyIntel?: CompanyIntel | null,
  primaryContact?: DiscoveredContact | null,
): Promise<HookResult> {
  const angle = determineAngle(primaryContact || null, companyIntel || null);
  const intelContext = buildIntelContext(companyIntel || null);
  const contactContext = buildContactContext(primaryContact || null);

  const prompt = `You are an elite career outreach strategist who combines Robert Cialdini's 6 influence principles with deep psychological profiling to maximize recruiter response rates.

CANDIDATE: ${CANDIDATE.name} — Fresh CS graduate (${CANDIDATE.graduation}), Full-Stack Developer
CANDIDATE PROJECTS:
${getProjectsSummary()}

CANDIDATE EXPERIENCE:
${getExperienceSummary()}

TARGET COMPANY: ${company}
TARGET ROLE: ${jobTitle}

COMPANY INTELLIGENCE:
${intelContext}

CONTACT PERSON:
${contactContext}

AUDIENCE ANGLE: ${angle}

CIALDINI'S 6 INFLUENCE PRINCIPLES (choose the BEST one for this specific situation):
1. RECIPROCITY — Offer value first (e.g., "I noticed your product does X, here's a thought on improving Y...")
2. COMMITMENT/CONSISTENCY — Reference their stated values ("Your careers page mentions engineering excellence...")
3. SOCIAL PROOF — Reference deliverables ("Delivered production systems for 2 freelance clients...")
4. AUTHORITY — Establish credibility ("Built FlowForge, a real-time CPM engine using...")
5. LIKING — Mirror their values/language style based on company culture
6. SCARCITY — Create urgency without being pushy ("Currently interviewing but ${company} is my top choice...")

ANGLE-SPECIFIC RULES:
- FOUNDER/CTO → Show builder mentality, speed, ownership, technical depth. Reference specific technical decisions in your projects. Use AUTHORITY or RECIPROCITY.
- HR/TALENT → Show reliability, culture fit, structured achievements, team contribution. Use SOCIAL PROOF or LIKING.
- ENGINEERING MANAGER → Show code quality, system design thinking, problem-solving methodology. Use AUTHORITY or COMMITMENT.
- EMPLOYEE (REFERRAL) → Peer connection, shared tech interests, casual tone, non-threatening. Use LIKING or RECIPROCITY.

TONE GUIDE (based on company culture):
- Startup/Casual → Conversational, no corporate jargon, show energy
- Enterprise/Formal → Professional, structured, metric-driven
- Technical → Lead with architecture decisions, specific numbers, system design
- Unknown → Default to professional but warm

HARD RULES:
- NEVER use generic phrases like "I'm passionate about technology" or "I'm a quick learner"
- NEVER mention skills the candidate doesn't have
- Every message MUST reference a SPECIFIC real project (FlowForge, TrackChat, Banking System)
- LinkedIn note MUST be under 280 characters
- Hook MUST be exactly one compelling sentence
- If company intel mentions specific tech they use that overlaps with candidate skills, LEAD with that overlap
- If recent news is available, reference it naturally
- Employee referral message should feel like a peer asking a peer, NOT formal

Return JSON only:
{
  "angle": "founder" | "hr" | "engineering" | "employee",
  "angleDescription": "why this angle was chosen based on intel",
  "influencePrinciple": "which Cialdini principle and WHY it's best for this situation",
  "psychologicalRationale": "2-3 sentences explaining the psychological strategy: what emotional triggers are being used, what response pattern is being activated",
  "bestSendTime": "specific day and time recommendation (e.g., 'Tuesday 8:30 AM' or 'Thursday 10:00 AM')",
  "toneGuide": "one-line tone description (e.g., 'Conversational, builder-focused, direct')",
  "hook": "One specific, compelling sentence referencing a REAL project",
  "linkedinNote": "Short LinkedIn connection note under 280 chars — must feel personal, not templated",
  "founderMessage": "4-5 sentence message for founder/CTO — show builder mentality, reference specific project architecture",
  "hrMessage": "4-5 sentence message for HR — show culture fit, structured achievements, reliability",
  "employeeReferralMessage": "3-4 sentence casual message for an employee — peer-to-peer, shared tech interest, easy ask",
  "followUpHook": "One compelling sentence for a follow-up email if no response after 5 days"
}`;

  try {
    const response = await callAIPsychological(prompt, { maxTokens: 1200, temperature: 0.8 });
    const result = parseAIJson<HookResult>(response);

    // Enforce LinkedIn note length
    if (result.linkedinNote && result.linkedinNote.length > 280) {
      result.linkedinNote = result.linkedinNote.substring(0, 277) + '...';
    }

    // Ensure all fields have defaults
    result.angle = result.angle || angle;
    result.employeeReferralMessage = result.employeeReferralMessage || result.hrMessage || '';
    result.followUpHook = result.followUpHook || result.hook || '';
    result.psychologicalRationale = result.psychologicalRationale || '';
    result.bestSendTime = result.bestSendTime || 'Tuesday 8:30 AM';
    result.toneGuide = result.toneGuide || 'Professional and warm';

    return result;
  } catch (error) {
    console.error('[Hook v2.0] Generation failed, using defaults:', error);
    return {
      angle,
      angleDescription: `Default ${angle} angle — company intel ${companyIntel ? 'available' : 'unavailable'}`,
      influencePrinciple: 'Authority — establishing technical credibility',
      psychologicalRationale: 'Leading with technical authority to establish credibility as a builder who can deliver production systems.',
      bestSendTime: 'Tuesday 8:30 AM',
      toneGuide: 'Professional, direct, technically grounded',
      hook: `I built FlowForge, a real-time CPM engine using LangChain and WebSocket that models project dependencies as live graphs — the kind of systems-level thinking I'd bring to ${company}.`,
      linkedinNote: `Hi, I built real-time systems with React/Node/WebSocket (FlowForge). Interested in the ${jobTitle} role at ${company}. Would love to connect!`,
      founderMessage: `Hi, I've been building real-time systems — FlowForge uses LangChain + WebSocket to orchestrate project dependencies as live graphs. I also freelanced full-stack management systems end-to-end for two clients. Would love to bring that builder energy to ${company}.`,
      hrMessage: `Hi, I'm a full-stack developer with freelance client delivery experience and projects featuring real-time systems (Socket.io, Redis). I'd bring reliability and structured execution to the ${jobTitle} role at ${company}.`,
      employeeReferralMessage: `Hey! I'm a full-stack dev who's been building some cool stuff with React/Node — including a real-time CPM engine (FlowForge). Saw ${company} is hiring for ${jobTitle} and it looks like a great fit. Would you be open to referring me?`,
      followUpHook: `Since reaching out, I've shipped a new feature in FlowForge — would love to share how my systems approach aligns with ${company}'s engineering goals.`,
    };
  }
}
