// ============================================
// Jobs API — list, filter, update status
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const matchTier = searchParams.get('matchTier');
    const sortBy = searchParams.get('sortBy') || 'overallScore';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: any = {};
    if (matchTier && matchTier !== 'all') {
      where.matchTier = matchTier;
    }
    if (status && status !== 'all') {
      where.applicationStatus = status;
    }
    if (source && source !== 'all') {
      where.source = { contains: source };
    }
    if (search) {
      where.OR = [
        { jobTitle: { contains: search } },
        { company: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API] Jobs list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 });
    }

    // Only allow updating certain fields
    const allowedFields = [
      'applicationStatus', 'notes', 'coldMailSent', 'coldMailSentDate',
    ];
    const safeUpdates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        safeUpdates[field] = updates[field];
      }
    }

    const updated = await prisma.job.update({
      where: { id },
      data: safeUpdates,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API] Job update error:', error);
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    );
  }
}
