// ============================================
// Career OS — Analytics API Route
// Calculates 100% dynamic, real database-driven career metrics
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { CANDIDATE_SKILL_KEYWORDS } from '@/lib/candidate-profile';

export async function GET() {
  try {
    const allJobs = await prisma.job.findMany({
      select: {
        id: true,
        dateFound: true,
        createdAt: true,
        applicationStatus: true,
        coldMailSent: true,
        matchTier: true,
        overallScore: true,
        atsScore: true,
        source: true,
        jobTitle: true,
        jobDescription: true,
        locationType: true,
      },
    });

    const totalJobs = allJobs.length;
    const totalRejectedJobs = await prisma.rejectedJob.count();
    const totalScraped = totalJobs + totalRejectedJobs;

    // Filter statuses
    const pendingJobs = allJobs.filter((j) => j.applicationStatus === 'Pending');
    const appliedJobs = allJobs.filter((j) => j.applicationStatus === 'Applied');
    const interviewJobs = allJobs.filter((j) => j.applicationStatus === 'Interview');
    const offerJobs = allJobs.filter((j) => j.applicationStatus === 'Offer');
    const rejectedStatusJobs = allJobs.filter((j) => j.applicationStatus === 'Rejected');

    const totalApplications = appliedJobs.length + interviewJobs.length + offerJobs.length + rejectedStatusJobs.length;
    const coldMailSentCount = allJobs.filter((j) => j.coldMailSent === 1).length;

    const interviewCount = interviewJobs.length;
    const offerCount = offerJobs.length;

    // Response rate calculations
    const responseCount = interviewCount + offerCount;
    const recruiterResponseRate = coldMailSentCount > 0
      ? Math.min(100, Number(((responseCount / coldMailSentCount) * 100).toFixed(1)))
      : totalApplications > 0
      ? Math.min(100, Number(((responseCount / totalApplications) * 100).toFixed(1)))
      : 0;

    const interviewConversion = totalApplications > 0
      ? Number(((interviewCount / totalApplications) * 100).toFixed(1))
      : 0;

    const offerRate = totalApplications > 0
      ? Number(((offerCount / totalApplications) * 100).toFixed(1))
      : 0;

    // --- Monthly Progress (Last 6 Months) ---
    const monthlyMap: Record<string, { applications: number; interviews: number; offers: number; qualified: number }> = {};
    
    // Seed current and previous 5 months
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthlyMap[key] = { applications: 0, interviews: 0, offers: 0, qualified: 0 };
    }

    for (const job of allJobs) {
      let dateObj: Date;
      if (job.createdAt) {
        dateObj = new Date(job.createdAt);
      } else if (job.dateFound) {
        dateObj = new Date(job.dateFound);
      } else {
        dateObj = new Date();
      }

      if (!isNaN(dateObj.getTime())) {
        const monthKey = dateObj.toLocaleString('en-US', { month: 'short' });
        if (monthlyMap[monthKey]) {
          if (job.applicationStatus !== 'Pending') {
            monthlyMap[monthKey].applications++;
          }
          if (job.applicationStatus === 'Interview') {
            monthlyMap[monthKey].interviews++;
          }
          if (job.applicationStatus === 'Offer') {
            monthlyMap[monthKey].offers++;
          }
          if (job.matchTier === 'qualified') {
            monthlyMap[monthKey].qualified++;
          }
        }
      }
    }

    const monthlyData = Object.entries(monthlyMap).map(([month, stats]) => ({
      month,
      ...stats,
    }));

    // --- Application Outcome Breakdown ---
    const denom = Math.max(totalJobs, 1);
    const outcomeBreakdown = [
      {
        name: 'Interviewing',
        count: interviewCount,
        percentage: Number(((interviewCount / denom) * 100).toFixed(1)),
        color: '#34d399',
      },
      {
        name: 'Applied / Draft Ready',
        count: appliedJobs.length,
        percentage: Number(((appliedJobs.length / denom) * 100).toFixed(1)),
        color: '#6366f1',
      },
      {
        name: 'Offers Received',
        count: offerCount,
        percentage: Number(((offerCount / denom) * 100).toFixed(1)),
        color: '#818cf8',
      },
      {
        name: 'Pending Review',
        count: pendingJobs.length,
        percentage: Number(((pendingJobs.length / denom) * 100).toFixed(1)),
        color: '#22d3ee',
      },
      {
        name: 'Rejected / Archived',
        count: rejectedStatusJobs.length + totalRejectedJobs,
        percentage: Number((((rejectedStatusJobs.length + totalRejectedJobs) / Math.max(totalScraped, 1)) * 100).toFixed(1)),
        color: '#71717A',
      },
    ];

    // --- Tech Stack Demand in Database ---
    const targetSkills = [
      'React', 'Node.js', 'TypeScript', 'Next.js', 'Express',
      'MongoDB', 'Redis', 'LangChain', 'REST API', 'Socket.io', 'Docker', 'C++',
    ];
    const skillCounts: Record<string, number> = {};
    for (const skill of targetSkills) skillCounts[skill] = 0;

    for (const job of allJobs) {
      const text = `${job.jobTitle} ${job.jobDescription}`.toLowerCase();
      for (const skill of targetSkills) {
        if (text.includes(skill.toLowerCase())) {
          skillCounts[skill]++;
        }
      }
    }

    const topSkills = Object.entries(skillCounts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count);

    // --- Source Breakdown & Qualification Rates ---
    const sourceMap: Record<string, { total: number; qualified: number }> = {};
    for (const job of allJobs) {
      const src = job.source || 'Other';
      if (!sourceMap[src]) sourceMap[src] = { total: 0, qualified: 0 };
      sourceMap[src].total++;
      if (job.matchTier === 'qualified') sourceMap[src].qualified++;
    }

    const sourcePerformance = Object.entries(sourceMap).map(([source, stats]) => ({
      source,
      total: stats.total,
      qualified: stats.qualified,
      passRate: Number(((stats.qualified / stats.total) * 100).toFixed(1)),
    })).sort((a, b) => b.total - a.total);

    // --- Location Category Distribution ---
    const locMap: Record<string, number> = {};
    for (const job of allJobs) {
      const loc = job.locationType || 'Remote';
      locMap[loc] = (locMap[loc] || 0) + 1;
    }
    const locationDistribution = Object.entries(locMap).map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      summary: {
        totalScraped,
        totalJobs,
        totalApplications,
        coldMailSentCount,
        interviewCount,
        offerCount,
        recruiterResponseRate,
        interviewConversion,
        offerRate,
      },
      monthlyData,
      outcomeBreakdown,
      topSkills,
      sourcePerformance,
      locationDistribution,
    });
  } catch (error) {
    console.error('[API] Analytics endpoint error:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics data' },
      { status: 500 }
    );
  }
}
