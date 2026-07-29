// ============================================
// Jobs API — list, filter, update status
// Dynamic Experience Level & Title Filtering
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

const EXCLUDED_SENIOR_KEYWORDS = [
  'senior', 'sr.', 'lead', 'principal', 'staff', 'manager', 'architect',
  'devops', 'devsecops', 'sysadmin', 'director', 'vp', 'head of',
  '5+ years', '7+ years', '8+ years', '10+ years',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '150');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const search = searchParams.get('search');
    const matchTier = searchParams.get('matchTier');
    const expLevel = searchParams.get('expLevel') || 'fresh_graduate'; // 'fresh_graduate' | 'all'
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

    const [allJobs, totalCount] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.job.count({ where }),
    ]);

    // If expLevel is fresh_graduate (default), strictly filter out Senior / Lead / DevOps / Staff titles
    let filteredJobs = allJobs;
    if (expLevel === 'fresh_graduate') {
      filteredJobs = allJobs.filter((job) => {
        const titleLower = (job.jobTitle || '').toLowerCase();
        return !EXCLUDED_SENIOR_KEYWORDS.some((kw) => titleLower.includes(kw));
      });
    }

    const paginatedJobs = filteredJobs.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      jobs: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit),
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
