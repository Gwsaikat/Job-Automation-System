// ============================================
// Skills Gap Report — Section 7.3
// Analyzes rejected jobs to find recurring missing skills
// ============================================

import prisma from '../db';
import { sendToSelf } from '../outreach/gmail';
import { callAIStandard, parseAIJson } from '../ai';

interface SkillGap {
  skill: string;
  occurrences: number;
  estimatedLearningTime: string;
  freeResource: string;
}

export async function runSkillsGapReport(): Promise<void> {
  console.log('[Skills Gap] Generating skills gap report...');

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get rejected jobs from this week
  const rejectedJobs = await prisma.rejectedJob.findMany({
    where: { createdAt: { gte: oneWeekAgo } },
  });

  if (rejectedJobs.length === 0) {
    console.log('[Skills Gap] No rejected jobs this week, skipping report');
    return;
  }

  // Gather all job titles and rejection reasons
  const jobSummaries = rejectedJobs
    .slice(0, 30) // Limit to avoid huge prompts
    .map((j) => `- ${j.jobTitle || 'Unknown'} at ${j.company || 'Unknown'}: ${j.rejectReason}`)
    .join('\n');

  const prompt = `Analyze these job rejections/listings and identify the top 3 recurring skills that the candidate is missing.

The candidate's current skills: JavaScript, TypeScript, React.js, Next.js, Node.js, Express.js, MongoDB, Redis, Docker (basics), Socket.io, LangChain, REST APIs, Git, C++, SQL

REJECTED/FILTERED JOBS THIS WEEK:
${jobSummaries}

For each missing skill, provide:
1. The skill name
2. How many jobs required it (estimate)
3. Estimated time to reach proficiency (e.g., "2-3 weeks")
4. One specific free learning resource (course URL or platform)

Also suggest ONE concrete action for the coming week.

Return JSON:
{
  "gaps": [
    {
      "skill": "skill name",
      "occurrences": 5,
      "estimatedLearningTime": "2-3 weeks",
      "freeResource": "https://..."
    }
  ],
  "weeklyAction": "One specific thing to do this week"
}`;

  try {
    const response = await callAIStandard(prompt, { maxTokens: 500, temperature: 0.3 });
    const analysis = parseAIJson<{
      gaps: SkillGap[];
      weeklyAction: string;
    }>(response);

    const emailBody = `🎯 Weekly Skills Gap Report
================================

Jobs Analyzed: ${rejectedJobs.length} rejected/filtered jobs this week

Top Missing Skills:
${analysis.gaps
  .map(
    (g, i) =>
      `${i + 1}. ${g.skill}
   Required by: ~${g.occurrences} jobs
   Learning time: ${g.estimatedLearningTime}
   Resource: ${g.freeResource}`
  )
  .join('\n\n')}

📌 This Week's Action Item:
${analysis.weeklyAction}

— Your Job Automation System`;

    await sendToSelf('🎯 Weekly Skills Gap Report', emailBody);
    console.log('[Skills Gap] Report sent successfully');
  } catch (error) {
    console.error('[Skills Gap] Report generation failed:', error);
  }

  await prisma.appState.upsert({
    where: { key: 'last_skillsgap_run' },
    update: { value: new Date().toISOString() },
    create: { key: 'last_skillsgap_run', value: new Date().toISOString() },
  });
}
