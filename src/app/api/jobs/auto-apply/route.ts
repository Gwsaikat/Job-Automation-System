// ============================================
// Auto-Apply API Route
// Triggers Playwright browser automation for ATS forms
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { runAutoApply } from '@/lib/outreach/auto-apply';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, dryRun = false, headless = true } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    console.log(`[API] Triggering Auto-Apply for Job ${jobId} (dryRun=${dryRun})...`);

    // Run Playwright auto-apply
    const result = await runAutoApply(Number(jobId), { headless, dryRun });

    if (result.success) {
      return NextResponse.json({
        success: true,
        result,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
        result,
      }, { status: 400 });
    }
  } catch (error) {
    console.error('[API] Auto-Apply error:', error);
    return NextResponse.json({ error: 'Failed to run Auto-Apply automation', details: String(error) }, { status: 500 });
  }
}
