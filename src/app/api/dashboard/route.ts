// ============================================
// Dashboard API — aggregated stats + chart data
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Summary cards
    const jobsToday = await prisma.job.count({
      where: { dateFound: today },
    });

    const pendingApplications = await prisma.job.count({
      where: { applicationStatus: 'Pending' },
    });

    const allScores = await prisma.job.findMany({
      where: { atsScore: { not: null } },
      select: { atsScore: true },
    });
    const avgAtsScore = allScores.length > 0
      ? Math.round(
          allScores.reduce((sum, j) => sum + (j.atsScore || 0), 0) / allScores.length
        )
      : 0;

    const coldEmailsPending = await prisma.job.count({
      where: {
        coldMailDraftId: { not: null },
        coldMailSent: 0,
      },
    });

    // Chart: jobs by source
    const allJobs = await prisma.job.findMany({
      select: { source: true },
    });
    const sourceCountMap: Record<string, number> = {};
    for (const job of allJobs) {
      const source = job.source || 'Unknown';
      sourceCountMap[source] = (sourceCountMap[source] || 0) + 1;
    }
    const jobsBySource = Object.entries(sourceCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Chart: application status breakdown
    const statuses = ['Pending', 'Applied', 'Interview', 'Rejected', 'Offer'];
    const statusBreakdown = await Promise.all(
      statuses.map(async (status) => ({
        name: status,
        count: await prisma.job.count({ where: { applicationStatus: status } }),
      }))
    );

    // Chart: ATS score distribution
    const scoreRanges = [
      { name: '0-60', min: 0, max: 60 },
      { name: '61-70', min: 61, max: 70 },
      { name: '71-80', min: 71, max: 80 },
      { name: '81-90', min: 81, max: 90 },
      { name: '91-100', min: 91, max: 100 },
    ];
    const atsDistribution = scoreRanges.map((range) => ({
      name: range.name,
      count: allScores.filter(
        (j) => (j.atsScore || 0) >= range.min && (j.atsScore || 0) <= range.max
      ).length,
    }));

    // Recent activity
    const recentJobs = await prisma.job.findMany({
      orderBy: { id: 'desc' },
      take: 5,
      select: {
        id: true,
        jobTitle: true,
        company: true,
        source: true,
        locationType: true,
        atsScore: true,
        applicationStatus: true,
        dateFound: true,
      },
    });

    // Last run timestamps
    const lastRuns = await prisma.appState.findMany({
      where: {
        key: {
          in: [
            'last_scrape_run',
            'last_funding_run',
            'last_followup_run',
            'last_digest_run',
            'last_skillsgap_run',
          ],
        },
      },
    });
    const lastRunMap: Record<string, string> = {};
    for (const run of lastRuns) {
      lastRunMap[run.key] = run.value || '';
    }

    return NextResponse.json({
      summary: {
        jobsToday,
        pendingApplications,
        avgAtsScore,
        coldEmailsPending,
        totalJobs: allJobs.length,
      },
      charts: {
        jobsBySource,
        statusBreakdown,
        atsDistribution,
      },
      recentJobs,
      lastRuns: lastRunMap,
    });
  } catch (error) {
    console.error('[API] Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard data' },
      { status: 500 }
    );
  }
}
