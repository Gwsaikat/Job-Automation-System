// ============================================
// v2.0 API: Generate Complete Outreach Suite
// POST /api/outreach/generate { jobId }
// Runs full pipeline for a job on demand
// ============================================

import { NextResponse } from 'next/server';
import { runOutreachPipeline } from '@/lib/outreach/pipeline';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }

    const result = await runOutreachPipeline(Number(jobId));

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('[API] Outreach generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Outreach generation failed' },
      { status: 500 },
    );
  }
}
