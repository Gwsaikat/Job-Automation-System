// ============================================
// Database Clear API — deletes all data from all tables
// Used for resetting the database (dev/reset purposes)
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function DELETE() {
  try {
    // Delete all tables in correct order (respect relations)
    const [jobs, rejected, challenges, funding, appState] = await Promise.all([
      prisma.job.deleteMany({}),
      prisma.rejectedJob.deleteMany({}),
      prisma.sdeChallenge.deleteMany({}),
      prisma.fundingLead.deleteMany({}),
      prisma.appState.deleteMany({}),
    ]);

    console.log('[API] Database cleared:', { jobs: jobs.count, rejected: rejected.count, challenges: challenges.count, funding: funding.count, appState: appState.count });

    return NextResponse.json({
      success: true,
      message: 'Database cleared successfully',
      deleted: {
        jobs: jobs.count,
        rejectedJobs: rejected.count,
        sdeChallenge: challenges.count,
        fundingLeads: funding.count,
        appState: appState.count,
      },
    });
  } catch (error) {
    console.error('[API] Database clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear database', details: String(error) },
      { status: 500 }
    );
  }
}
