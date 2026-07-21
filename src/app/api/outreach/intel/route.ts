// ============================================
// v2.0 API: Company Intelligence for a specific job
// POST /api/outreach/intel { jobId }
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { gatherCompanyIntel } from '@/lib/outreach/company-intel';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const domain = job.companyDomain || (job.company || '').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';
    const intel = await gatherCompanyIntel(job.company || 'Unknown', domain);

    // Update job record with intel
    await prisma.job.update({
      where: { id: jobId },
      data: {
        companyIntel: JSON.stringify(intel),
        companyStage: intel.stage,
        companyDomain: domain,
      },
    });

    return NextResponse.json({
      success: true,
      intel,
    });
  } catch (error) {
    console.error('[API] Company intel error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Intel gathering failed' },
      { status: 500 },
    );
  }
}
