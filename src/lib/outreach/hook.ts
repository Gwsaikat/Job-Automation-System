// ============================================
// Career OS — Psychology-Based Hook Engine
// Uses influence principles: Similarity, Curiosity,
// Reciprocity, Competence, Social Proof, Specificity
// ============================================

import { callAIPsychological, parseAIJson } from '../ai';
import { CANDIDATE, getProjectsSummary, getExperienceSummary } from '../candidate-profile';

export type RecipientAngle = 'founder' | 'hr' | 'engineering' | 'unknown';

export interface HookResult {
  angle: RecipientAngle;
  hook: string;
  angleDescription: string;
  influencePrinciple: string;
  linkedinNote: string;        // Short (< 300 chars) for LinkedIn connection requests
  founderMessage: string;      // Tailored for founders/CTOs
  hrMessage: string;           // Tailored for HR/Talent Acquisition
}

export async function generateHook(
  recipientTitle: string,
  company: string,
  jobTitle: string
): Promise<HookResult> {
  const prompt = `You are an elite career outreach strategist who applies influence psychology to maximize recruiter response rates. Generate personalized outreach hooks for a software engineering candidate.

CANDIDATE: ${CANDIDATE.name}
CANDIDATE PROJECTS:
${getProjectsSummary()}

CANDIDATE EXPERIENCE:
${getExperienceSummary()}

RECIPIENT TITLE: ${recipientTitle || 'Unknown'}
COMPANY: ${company}
JOB TITLE: ${jobTitle}

ANGLE RULES:
- Founder/CTO at startup → angle: ownership, speed, building from scratch, technical depth
- HR/Talent Acquisition → angle: culture fit, structured achievement, reliability, team contribution
- Engineering/Hiring Manager → angle: code quality, problem-solving, system design, real-time systems
- Unknown → default to Engineering angle

INFLUENCE PRINCIPLES (use ONE per message, never combine):
- Similarity: Mirror their likely values/language style
- Curiosity: Open with a surprising specific insight about their product/company
- Reciprocity: Offer value (e.g. "I noticed X in your product, here's a thought...")
- Competence: Lead with a specific impressive technical achievement
- Social proof: Reference client deliveries, simulation completion, working systems
- Specificity: Use exact numbers, tech names, and project details — never generic

HARD RULES:
- NEVER use generic phrases like "I'm passionate about technology" or "I'm a quick learner"
- NEVER mention skills the candidate doesn't have
- Every message MUST reference a SPECIFIC real project (FlowForge, TrackChat, Banking System)
- LinkedIn note MUST be under 280 characters
- Hook MUST be exactly one compelling sentence

Return JSON only:
{
  "angle": "founder" | "hr" | "engineering" | "unknown",
  "angleDescription": "why this angle was chosen",
  "influencePrinciple": "which principle was applied",
  "hook": "One specific, compelling sentence referencing a REAL project",
  "linkedinNote": "Short LinkedIn connection note under 280 chars",
  "founderMessage": "3-4 sentence message tailored for a founder/CTO — show builder mentality",
  "hrMessage": "3-4 sentence message tailored for HR — show culture fit and structured achievements"
}`;

  try {
    const response = await callAIPsychological(prompt, { maxTokens: 800, temperature: 0.8 });
    const result = parseAIJson<HookResult>(response);

    // Enforce LinkedIn note length
    if (result.linkedinNote && result.linkedinNote.length > 280) {
      result.linkedinNote = result.linkedinNote.substring(0, 277) + '...';
    }

    return result;
  } catch (error) {
    console.error('[Hook] Generation failed, using defaults:', error);
    return {
      angle: 'engineering',
      angleDescription: 'Default angle — engineering/hiring manager',
      influencePrinciple: 'competence',
      hook: `I built FlowForge, a real-time CPM engine using LangChain and WebSocket that models project dependencies as live graphs — the kind of systems-level thinking I'd bring to ${company}.`,
      linkedinNote: `Hi, I built real-time systems with React/Node/WebSocket (FlowForge). Interested in the ${jobTitle} role at ${company}. Would love to connect!`,
      founderMessage: `Hi, I've been building real-time systems — FlowForge uses LangChain + WebSocket to orchestrate project dependencies as live graphs. I also freelanced full-stack management systems end-to-end for two clients. Would love to bring that builder energy to ${company}.`,
      hrMessage: `Hi, I'm a full-stack developer with freelance client delivery experience and projects featuring real-time systems (Socket.io, Redis). I'd bring reliability and structured execution to the ${jobTitle} role at ${company}.`,
    };
  }
}
