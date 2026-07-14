// ============================================
// Psychological Hook Research — Section 6.2
// Determines recipient angle and generates a
// project-specific hook for outreach messages
// ============================================

import { callAIPsychological, parseAIJson } from '../ai';

export type RecipientAngle = 'founder' | 'hr' | 'engineering' | 'unknown';

export interface HookResult {
  angle: RecipientAngle;
  hook: string;            // One sentence referencing a specific real project
  angleDescription: string;
}

export async function generateHook(
  recipientTitle: string,
  company: string,
  jobTitle: string
): Promise<HookResult> {
  const prompt = `You are a career outreach strategist. Based on the recipient's title and the company/role, determine the best communication angle and generate a one-sentence hook.

RECIPIENT TITLE: ${recipientTitle || 'Unknown'}
COMPANY: ${company}
JOB TITLE: ${jobTitle}

CANDIDATE'S KEY PROJECTS:
1. FlowForge — Real-Time Critical Path Orchestration Engine (LangChain, OpenAI, Socket.io, Redis, MongoDB)
2. TrackChat — Real-Time Chat & Device Tracking App (MERN, Socket.io, Leaflet.js)
3. Banking System — Full-Stack Banking Application (React.js, Express.js, Node.js)
4. Freelance work — Full-stack management systems for a gym and a diagnostic center

ANGLE RULES:
- Founder/CTO at an early-stage startup → angle: ownership, speed, building from scratch
- HR/Talent Acquisition at a larger company → angle: culture fit, structured achievement, reliability
- Engineering/Hiring Manager → angle: technical depth, problem-solving, code quality
- Unknown → default to Engineering/Hiring Manager angle

Return JSON only:
{
  "angle": "founder" | "hr" | "engineering" | "unknown",
  "angleDescription": "brief description of why this angle was chosen",
  "hook": "One compelling sentence referencing a SPECIFIC real project above — never generic"
}`;

  try {
    const response = await callAIPsychological(prompt, { maxTokens: 500, temperature: 0.8 });
    return parseAIJson<HookResult>(response);
  } catch (error) {
    console.error('[Hook] Generation failed, using default:', error);
    return {
      angle: 'engineering',
      angleDescription: 'Default angle — engineering/hiring manager',
      hook: 'I recently built FlowForge, a real-time critical path orchestration engine using LangChain and WebSocket that models project dependencies as live graphs — the kind of systems-level thinking I\'d bring to your team.',
    };
  }
}
