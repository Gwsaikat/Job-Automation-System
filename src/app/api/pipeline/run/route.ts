// ============================================
// Pipeline Run API
// Manually triggers the background pipelines
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { runDailyScrapePipeline } from '@/lib/pipeline/scrape';
import { runFundingPipeline } from '@/lib/funding/rss';
import { runFollowUpCheck } from '@/lib/reporting/follow-up';
import { runCVPipeline } from '@/lib/cv/pipeline';
import { runOutreachPipeline } from '@/lib/outreach/pipeline';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pipeline, jobId } = body;

    // Run specific job CV + Outreach pipeline
    if (pipeline === 'job' && jobId) {
      console.log(`[API] Manual trigger: CV + Outreach for job ${jobId}`);
      
      // We run this asynchronously so we don't timeout the request
      // In a real production app, you'd use a queue system (BullMQ etc)
      // but for this local single-user app, running in the background is fine
      setTimeout(async () => {
        try {
          await runCVPipeline(jobId);
          await runOutreachPipeline(jobId);
          await prisma.job.update({
            where: { id: jobId },
            data: { applicationStatus: 'Applied' } // Mark as applied once draft is ready
          });
        } catch (error) {
          console.error(`[API] Background job pipeline failed for ${jobId}:`, error);
        }
      }, 0);

      return NextResponse.json({ success: true, message: 'Job pipeline started in background' });
    }

    // Run scraping pipeline
    if (pipeline === 'scrape') {
      console.log('[API] Manual trigger: Scrape Pipeline');
      
      // Run async
      setTimeout(async () => {
        try {
          await runDailyScrapePipeline();
        } catch (error) {
          console.error('[API] Background scrape pipeline failed:', error);
        }
      }, 0);

      return NextResponse.json({ success: true, message: 'Scrape pipeline started in background' });
    }

    // Run funding pipeline
    if (pipeline === 'funding') {
      console.log('[API] Manual trigger: Funding Pipeline');
      
      // Run async
      setTimeout(async () => {
        try {
          await runFundingPipeline();
        } catch (error) {
          console.error('[API] Background funding pipeline failed:', error);
        }
      }, 0);

      return NextResponse.json({ success: true, message: 'Funding pipeline started in background' });
    }

    return NextResponse.json({ error: 'Unknown pipeline or missing parameters' }, { status: 400 });
  } catch (error) {
    console.error('[API] Pipeline run error:', error);
    return NextResponse.json({ error: 'Failed to start pipeline' }, { status: 500 });
  }
}
