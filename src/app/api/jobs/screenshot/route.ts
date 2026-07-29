// ============================================
// Application Screenshot API
// Serves Playwright auto-apply PNG screenshots for proof
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('id');

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: Number(jobId) } });
    if (!job || !job.notes) {
      return NextResponse.json({ error: 'Job or notes not found' }, { status: 444 });
    }

    // Extract screenshot path from notes
    const match = job.notes.match(/Screenshot:\s*(.+)$/m);
    if (!match || !match[1]) {
      // Check default fallback screenshot pattern
      const screenshotsDir = path.resolve(process.cwd(), 'storage/screenshots');
      if (fs.existsSync(screenshotsDir)) {
        const files = fs.readdirSync(screenshotsDir).filter(f => f.startsWith(`apply_${jobId}_`));
        if (files.length > 0) {
          const latestFile = files.sort().pop()!;
          const filePath = path.join(screenshotsDir, latestFile);
          const imageBuffer = fs.readFileSync(filePath);
          return new NextResponse(imageBuffer, {
            headers: {
              'Content-Type': 'image/png',
              'Content-Disposition': `inline; filename="${latestFile}"`,
            },
          });
        }
      }
      return NextResponse.json({ error: 'No screenshot found for this application' }, { status: 404 });
    }

    const filePath = match[1].trim();
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Screenshot file does not exist on disk' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(filePath);
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="apply_${jobId}.png"`,
      },
    });
  } catch (error) {
    console.error('[API] Screenshot error:', error);
    return NextResponse.json({ error: 'Failed to retrieve screenshot' }, { status: 500 });
  }
}
