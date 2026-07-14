// ============================================
// Follow-Up Email Check — Section 6.5
// Daily at 10:00: checks for jobs needing follow-up
// (sent 7-14 days ago, still Pending/Applied, has HR email)
// ============================================

import prisma from '../db';
import { generateFollowUp } from '../outreach/emails';
import { createDraft, isGmailConnected } from '../outreach/gmail';

export async function runFollowUpCheck(): Promise<{
  checked: number;
  followUpsSent: number;
}> {
  console.log('[Follow-Up] Checking for jobs needing follow-up...');

  if (!(await isGmailConnected())) {
    console.warn('[Follow-Up] Gmail not connected, skipping');
    return { checked: 0, followUpsSent: 0 };
  }

  const now = Date.now();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();

  // Find jobs that need follow-up
  const jobs = await prisma.job.findMany({
    where: {
      coldMailSent: 1,
      applicationStatus: { in: ['Pending', 'Applied'] },
      hrEmail: { not: null },
      coldMailSentDate: { not: null },
      followUpDraftId: null, // Haven't followed up yet
    },
  });

  // Filter to 7-14 day window
  const needsFollowUp = jobs.filter((job) => {
    const sentDate = job.coldMailSentDate;
    if (!sentDate) return false;
    return sentDate >= fourteenDaysAgo && sentDate <= sevenDaysAgo;
  });

  console.log(`[Follow-Up] Found ${needsFollowUp.length} jobs needing follow-up`);

  let followUpsSent = 0;

  for (const job of needsFollowUp) {
    try {
      const daysSinceSent = Math.round(
        (now - new Date(job.coldMailSentDate!).getTime()) / (24 * 60 * 60 * 1000)
      );

      const followUpText = await generateFollowUp(
        job.hrName || 'Hiring Manager',
        job.company || 'Unknown',
        job.jobTitle || 'Software Engineer',
        daysSinceSent
      );

      // Parse subject and body
      const subjectMatch = followUpText.match(/^Subject:\s*(.+)/m);
      const subject = subjectMatch
        ? subjectMatch[1].trim()
        : `Following up: ${job.jobTitle} at ${job.company}`;
      const body = followUpText.replace(/^Subject:\s*.+\n*/m, '').trim();

      const draftId = await createDraft(job.hrEmail!, subject, body);

      await prisma.job.update({
        where: { id: job.id },
        data: { followUpDraftId: draftId },
      });

      followUpsSent++;
      console.log(`[Follow-Up] Draft created for ${job.company}: ${draftId}`);
    } catch (error) {
      console.error(`[Follow-Up] Failed for job ${job.id}:`, error);
    }
  }

  await prisma.appState.upsert({
    where: { key: 'last_followup_run' },
    update: { value: new Date().toISOString() },
    create: { key: 'last_followup_run', value: new Date().toISOString() },
  });

  return { checked: needsFollowUp.length, followUpsSent };
}
