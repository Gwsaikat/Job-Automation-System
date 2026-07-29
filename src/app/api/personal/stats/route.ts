// ============================================
// Personal Coding Stats API Route
// Fetches REAL Live Data from GitHub REST API & LeetCode GraphQL API
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { CANDIDATE } from '@/lib/candidate-profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dbGh = await prisma.settings.findUnique({ where: { key: 'profile_github_username' } });
    const dbLc = await prisma.settings.findUnique({ where: { key: 'profile_leetcode_username' } });
    const dbCf = await prisma.settings.findUnique({ where: { key: 'profile_codeforces_username' } });

    const githubUsername = dbGh?.value || CANDIDATE.github.split('/').pop() || 'GwSaikat';
    const leetcodeUsername = dbLc?.value || CANDIDATE.leetcode.split('/').pop() || 'Alpha7679';
    const codeforcesUsername = dbCf?.value || '';

    // 1. Fetch REAL Live GitHub stats
    let githubStats = {
      username: githubUsername,
      publicRepos: 0,
      totalStars: 0,
      avatarUrl: `https://github.com/${githubUsername}.png`,
      profileUrl: `https://github.com/${githubUsername}`,
      chartUrl: `https://ghchart.rshah.org/059669/${githubUsername}`,
    };

    try {
      const ghRes = await fetch(`https://api.github.com/users/${githubUsername}`, {
        headers: { 'User-Agent': 'CareerFlow-App' },
        next: { revalidate: 1800 },
      });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        githubStats.publicRepos = ghData.public_repos ?? githubStats.publicRepos;
        githubStats.avatarUrl = ghData.avatar_url ?? githubStats.avatarUrl;
      }
    } catch {
      // Fallback
    }

    // 2. Fetch REAL Live LeetCode stats via Official LeetCode GraphQL API
    let leetcodeStats = {
      username: leetcodeUsername,
      profileUrl: `https://leetcode.com/u/${leetcodeUsername}`,
      realName: '',
      solvedTotal: 0,
      solvedEasy: 0,
      solvedMedium: 0,
      solvedHard: 0,
      totalSubmissions: 0,
      acceptanceRate: 'N/A',
      ranking: 0,
      streak: 0,
      totalActiveDays: 0,
      submissionCalendar: {} as Record<string, number>,
      avatarUrl: `https://leetcode.com/u/${leetcodeUsername}`,
    };

    try {
      const lcRes = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          query: `
            query getUserProfile($username: String!) {
              matchedUser(username: $username) {
                username
                profile {
                  realName
                  userAvatar
                  ranking
                }
                submitStats: submitStatsGlobal {
                  acSubmissionNum {
                    difficulty
                    count
                    submissions
                  }
                }
                userCalendar {
                  totalActiveDays
                  streak
                  submissionCalendar
                }
              }
            }
          `,
          variables: { username: leetcodeUsername },
        }),
        next: { revalidate: 1800 },
      });

      if (lcRes.ok) {
        const lcData = await lcRes.json();
        const matched = lcData?.data?.matchedUser;
        if (matched) {
          leetcodeStats.realName = matched.profile?.realName || leetcodeStats.realName;
          leetcodeStats.avatarUrl = matched.profile?.userAvatar || leetcodeStats.avatarUrl;
          leetcodeStats.ranking = matched.profile?.ranking || leetcodeStats.ranking;
          leetcodeStats.streak = matched.userCalendar?.streak || leetcodeStats.streak;
          leetcodeStats.totalActiveDays = matched.userCalendar?.totalActiveDays || leetcodeStats.totalActiveDays;

          const statsArr = matched.submitStats?.acSubmissionNum || [];
          const allObj = statsArr.find((s: any) => s.difficulty === 'All');
          const easyObj = statsArr.find((s: any) => s.difficulty === 'Easy');
          const medObj = statsArr.find((s: any) => s.difficulty === 'Medium');
          const hardObj = statsArr.find((s: any) => s.difficulty === 'Hard');

          if (allObj) leetcodeStats.solvedTotal = allObj.count;
          if (easyObj) leetcodeStats.solvedEasy = easyObj.count;
          if (medObj) leetcodeStats.solvedMedium = medObj.count;
          if (hardObj) leetcodeStats.solvedHard = hardObj.count;

          if (matched.userCalendar?.submissionCalendar) {
            try {
              leetcodeStats.submissionCalendar = JSON.parse(matched.userCalendar.submissionCalendar);
            } catch {
              // fallback
            }
          }
        }
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      candidateName: CANDIDATE.name,
      github: githubStats,
      leetcode: leetcodeStats,
    });
  } catch (error) {
    console.error('[API] Personal Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch coding stats' }, { status: 500 });
  }
}
