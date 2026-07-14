// ============================================
// Weekly Digest — Section 7.2
// Summarizes the week's job activity → email to self
// ============================================

import prisma from '../db';
import { sendToSelf } from '../outreach/gmail';
import { callAIStandard } from '../ai';

export async function runWeeklyDigest(): Promise<void> {
  console.log('[Digest] Generating weekly digest...');

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Gather stats
  const allJobs = await prisma.job.findMany({
    where: { createdAt: { gte: oneWeekAgo } },
  });

  const appliedCount = allJobs.filter((j) => j.applicationStatus !== 'Pending').length;
  const coldEmailsSent = allJobs.filter((j) => j.coldMailSent === 1).length;
  const interviews = allJobs.filter((j) => j.applicationStatus === 'Interview').length;

  // ATS scores
  const scores = allJobs
    .filter((j) => j.atsScore !== null && j.atsScore !== undefined)
    .map((j) => j.atsScore as number);
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;
  const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

  // Top companies
  const companyCounts: Record<string, number> = {};
  for (const job of allJobs) {
    const company = job.company || 'Unknown';
    companyCounts[company] = (companyCounts[company] || 0) + 1;
  }
  const topCompanies = Object.entries(companyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => `${name} (${count})`)
    .join(', ');

  // Generate a motivating tip
  let tip = 'Keep building, keep applying — consistency wins.';
  try {
    const tipPrompt = `Generate ONE short, specific, motivating tip for a CS student job hunting. Be practical, not generic. Max 2 sentences.`;
    tip = await callAIStandard(tipPrompt, { maxTokens: 60, temperature: 0.7 });
  } catch {
    // Use default
  }

  const emailBody = `📊 Weekly Job Hunt Digest
============================

Period: Last 7 days
Jobs Found: ${allJobs.length}
Applications: ${appliedCount}
Cold Emails Sent: ${coldEmailsSent}
Interviews: ${interviews}

ATS Scores:
  Average: ${avgScore}/100
  Highest: ${highestScore}/100

Top Companies: ${topCompanies || 'N/A'}

💡 Tip of the Week:
${tip}

— Your Job Automation System`;

  try {
    await sendToSelf('📊 Weekly Job Hunt Digest', emailBody);
    console.log('[Digest] Weekly digest sent successfully');
  } catch (error) {
    console.error('[Digest] Failed to send digest:', error);
  }

  await prisma.appState.upsert({
    where: { key: 'last_digest_run' },
    update: { value: new Date().toISOString() },
    create: { key: 'last_digest_run', value: new Date().toISOString() },
  });
}
