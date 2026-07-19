// ============================================
// CV PDF Serving API
// Reads the PDF from absolute/relative disk path and streams it.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '');
    if (!id) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      select: { cvPdfPath: true, jobTitle: true, company: true }
    });

    if (!job || !job.cvPdfPath) {
      return NextResponse.json({ error: 'CV PDF path not found for this job' }, { status: 404 });
    }

    // Standardize file path
    const resolvedPath = path.resolve(job.cvPdfPath);
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: `File not found on disk at ${job.cvPdfPath}` }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    
    // Clean filename for the content-disposition header
    const cleanJobTitle = (job.jobTitle || 'CV').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanCompany = (job.company || 'Job').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `CV_${cleanJobTitle}_${cleanCompany}.pdf`;

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('[API] CV serve error:', error);
    return NextResponse.json({ error: error.message || 'Failed to serve CV PDF' }, { status: 500 });
  }
}
