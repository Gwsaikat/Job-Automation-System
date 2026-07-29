// ============================================
// Database Clear API — deletes all data from all tables
// Used for resetting the database & storage (dev/reset purposes)
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function DELETE() {
  try {
    // Delete all tables in correct order
    const [jobs, rejected, challenges, funding, appState] = await Promise.all([
      prisma.job.deleteMany({}),
      prisma.rejectedJob.deleteMany({}),
      prisma.sdeChallenge.deleteMany({}),
      prisma.fundingLead.deleteMany({}),
      prisma.appState.deleteMany({}),
    ]);

    // Clear PDF storage files
    const storageDir = path.resolve(process.cwd(), 'storage/cvs');
    let deletedFiles = 0;
    if (fs.existsSync(storageDir)) {
      const files = fs.readdirSync(storageDir);
      for (const file of files) {
        if (file.endsWith('.pdf')) {
          try {
            fs.unlinkSync(path.join(storageDir, file));
            deletedFiles++;
          } catch {
            // ignore individual file delete error
          }
        }
      }
    }

    console.log('[API] Database & Storage cleared:', {
      jobs: jobs.count,
      rejected: rejected.count,
      challenges: challenges.count,
      funding: funding.count,
      appState: appState.count,
      deletedFiles,
    });

    return NextResponse.json({
      success: true,
      message: 'Database and CV storage cleared successfully',
      deleted: {
        jobs: jobs.count,
        rejectedJobs: rejected.count,
        sdeChallenge: challenges.count,
        fundingLeads: funding.count,
        appState: appState.count,
        cvPdfFiles: deletedFiles,
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

