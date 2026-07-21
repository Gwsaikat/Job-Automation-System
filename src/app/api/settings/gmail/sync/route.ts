// ============================================
// Career OS — Recruiter Email Auto-Sync Engine
// Parses incoming Gmail messages to automatically update job status
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isGmailConnected } from '@/lib/outreach/gmail';
import { google } from 'googleapis';
import { getConfig } from '@/lib/config';

export async function POST() {
  try {
    if (!(await isGmailConnected())) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

    // Fetch OAuth tokens from Settings
    const tokenSetting = await prisma.settings.findUnique({ where: { key: 'gmail_tokens' } });
    if (!tokenSetting?.value) {
      return NextResponse.json({ error: 'Gmail tokens missing' }, { status: 400 });
    }

    const tokens = JSON.parse(tokenSetting.value);
    const config = getConfig();

    const oAuth2Client = new google.auth.OAuth2(
      config.googleClientId,
      config.googleClientSecret,
      config.googleRedirectUri
    );
    oAuth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Search inbox messages from past 14 days
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'newer_than:14d (interview OR application OR offer OR recruiter OR candidate OR "job application")',
      maxResults: 30,
    });

    const messages = res.data.messages || [];
    let checkedCount = 0;
    let updatedCount = 0;
    const updatesLog: Array<{ company: string; oldStatus: string; newStatus: string }> = [];

    // Fetch all active jobs with HR emails or company names
    const activeJobs = await prisma.job.findMany({
      where: {
        applicationStatus: { in: ['Pending', 'Applied', 'Draft Ready'] },
      },
    });

    for (const msgRef of messages) {
      checkedCount++;
      const msg = await gmail.users.messages.get({
        userId: 'me',
        id: msgRef.id!,
        format: 'full',
      });

      const payload = msg.data.payload;
      if (!payload) continue;

      const headers = payload.headers || [];
      const subject = (headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || '').toLowerCase();
      const from = (headers.find((h) => h.name?.toLowerCase() === 'from')?.value || '').toLowerCase();
      const snippet = (msg.data.snippet || '').toLowerCase();
      const fullText = `${subject} ${from} ${snippet}`;

      // Match against active jobs in DB
      for (const job of activeJobs) {
        const companyLower = (job.company || '').toLowerCase();
        const hrEmailLower = (job.hrEmail || '').toLowerCase();

        const matchesCompany = companyLower.length > 2 && fullText.includes(companyLower);
        const matchesHrEmail = hrEmailLower.length > 3 && from.includes(hrEmailLower);

        if (matchesCompany || matchesHrEmail) {
          let newStatus: string | null = null;

          // Determine status update
          if (
            fullText.includes('offer') ||
            fullText.includes('congratulations') ||
            fullText.includes('pleased to offer')
          ) {
            newStatus = 'Offer';
          } else if (
            fullText.includes('interview') ||
            fullText.includes('schedule') ||
            fullText.includes('screening') ||
            fullText.includes('call') ||
            fullText.includes('availability')
          ) {
            newStatus = 'Interview';
          } else if (
            fullText.includes('regret') ||
            fullText.includes('pursuing other candidates') ||
            fullText.includes('not moving forward')
          ) {
            newStatus = 'Rejected';
          }

          if (newStatus && newStatus !== job.applicationStatus) {
            await prisma.job.update({
              where: { id: job.id },
              data: {
                applicationStatus: newStatus,
                processedAt: new Date().toISOString(),
              },
            });

            updatedCount++;
            updatesLog.push({
              company: job.company || 'Unknown',
              oldStatus: job.applicationStatus,
              newStatus,
            });

            // Log activity to AppState
            await prisma.appState.upsert({
              where: { key: 'last_recruiter_reply' },
              update: { value: new Date().toISOString() },
              create: { key: 'last_recruiter_reply', value: new Date().toISOString() },
            });

            break; // Stop checking other jobs for this email
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkedCount,
      updatedCount,
      updatesLog,
    });
  } catch (error) {
    console.error('[API] Recruiter email sync error:', error);
    return NextResponse.json({ error: 'Failed to sync recruiter emails' }, { status: 500 });
  }
}
