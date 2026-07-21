// ============================================
// Dashboard API — aggregated stats + chart data
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isGmailConnected } from '@/lib/outreach/gmail';

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

    // Interview count
    const interviewCount = await prisma.job.count({
      where: { applicationStatus: 'Interview' },
    });

    // Active pipeline (Interview + Applied)
    const activePipelineCount = await prisma.job.count({
      where: { applicationStatus: { in: ['Interview', 'Applied'] } },
    });

    // Average ATS score for tailored CVs only
    const tailoredCvScores = await prisma.job.findMany({
      where: { cvUpdated: 1, atsScore: { not: null } },
      select: { atsScore: true },
    });
    const avgTailoredAtsScore = tailoredCvScores.length > 0
      ? Math.round(
          tailoredCvScores.reduce((sum, j) => sum + (j.atsScore || 0), 0) / tailoredCvScores.length
        )
      : 0;

    // Highest salary found in qualified jobs
    const salaryJobs = await prisma.job.findMany({
      where: { matchTier: 'qualified', salaryDisplay: { not: null } },
      select: { salaryDisplay: true },
    });

    const coldEmailsPending = await prisma.job.count({
      where: {
        coldMailDraftId: { not: null },
        coldMailSent: 0,
      },
    });

    // Career OS: tier counts
    const qualifiedCount = await prisma.job.count({
      where: { matchTier: 'qualified' },
    });
    const belowThresholdCount = await prisma.job.count({
      where: { matchTier: 'below_threshold' },
    });

    // Career OS: overall score average
    const allOverallScores = await prisma.job.findMany({
      where: { overallScore: { not: null } },
      select: { overallScore: true },
    });
    const avgOverallScore = allOverallScores.length > 0
      ? Math.round(
          allOverallScores.reduce((sum, j) => sum + (j.overallScore || 0), 0) / allOverallScores.length
        )
      : 0;

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

    // Career OS: overall score distribution
    const overallScoreDistribution = [
      { name: '<70', count: allOverallScores.filter(j => (j.overallScore || 0) < 70).length },
      { name: '70-84', count: allOverallScores.filter(j => (j.overallScore || 0) >= 70 && (j.overallScore || 0) < 85).length },
      { name: '85-94', count: allOverallScores.filter(j => (j.overallScore || 0) >= 85 && (j.overallScore || 0) < 95).length },
      { name: '95-100', count: allOverallScores.filter(j => (j.overallScore || 0) >= 95).length },
    ];

    // Career OS: quality pipeline funnel
    const totalScraped = await prisma.job.count() + await prisma.rejectedJob.count();
    const passedFilter = await prisma.job.count();
    const cvGenerated = await prisma.job.count({ where: { cvPdfPath: { not: null } } });
    const outreachSent = await prisma.job.count({ where: { coldMailDraftId: { not: null } } });
    const qualityFunnel = [
      { stage: 'Scraped', count: totalScraped },
      { stage: 'Passed Filter', count: passedFilter },
      { stage: 'Scored ≥85%', count: qualifiedCount },
      { stage: 'CV Generated', count: cvGenerated },
      { stage: 'Outreach Staged', count: outreachSent },
    ];

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
        overallScore: true,
        matchTier: true,
        applicationStatus: true,
        dateFound: true,
      },
    });

    // Recent pipeline activity from AppState
    const activityKeys = [
      'last_scrape_run',
      'last_funding_run',
      'last_followup_run',
      'last_digest_run',
      'last_skillsgap_run',
    ];
    const activityLabels: Record<string, { label: string; color: string }> = {
      last_scrape_run: { label: 'Job scraping pipeline completed', color: '#6366f1' },
      last_funding_run: { label: 'Funding news pipeline completed', color: '#34d399' },
      last_followup_run: { label: 'Follow-up email check completed', color: '#c084fc' },
      last_digest_run: { label: 'Weekly digest email sent', color: '#fbbf24' },
      last_skillsgap_run: { label: 'Skills gap report generated', color: '#22d3ee' },
    };

    const activityStates = await prisma.appState.findMany({
      where: { key: { in: activityKeys } },
    });

    const recentActivity = activityStates
      .filter(s => s.value)
      .map(s => ({
        label: activityLabels[s.key]?.label || s.key,
        color: activityLabels[s.key]?.color || '#6366f1',
        timestamp: s.value!,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 3);

    // Gmail connection status
    let gmailConnected = false;
    try {
      gmailConnected = await isGmailConnected();
    } catch { /* non-critical */ }

    // Cold emails sent count
    const coldEmailsSent = await prisma.job.count({
      where: { coldMailSent: 1 },
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
        avgOverallScore,
        avgTailoredAtsScore,
        coldEmailsPending,
        coldEmailsSent,
        totalJobs: allJobs.length,
        qualifiedCount,
        belowThresholdCount,
        interviewCount,
        activePipelineCount,
        gmailConnected,
      },
      charts: {
        jobsBySource,
        statusBreakdown,
        atsDistribution,
        overallScoreDistribution,
        qualityFunnel,
      },
      recentJobs,
      recentActivity,
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
