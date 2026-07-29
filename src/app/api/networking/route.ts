// ============================================
// Networking & Hub API Route  
// DB-persistent Discussion Hub, Referral Market, Idea/Market Gap Posts
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { CANDIDATE } from '@/lib/candidate-profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const posts = await prisma.networkingPost.findMany({
      orderBy: { id: 'desc' },
    });

    const discussions = posts
      .filter((p) => p.postType === 'discussion')
      .map((p) => ({
        id: `disc-${p.id}`,
        author: p.author,
        avatar: p.avatar,
        companyOrRole: p.companyOrRole || '',
        title: p.title,
        content: p.content,
        category: p.category,
        upvotes: p.upvotes,
        commentsCount: p.commentsCount,
        timestamp: p.createdAt,
      }));

    const marketGaps = posts
      .filter((p) => p.postType === 'market_gap')
      .map((p) => ({
        id: `gap-${p.id}`,
        author: p.author,
        title: p.title,
        painPoint: p.painPoint || p.content,
        suggestedSaasSolution: p.suggestedSolution || '',
        targetAudience: p.targetAudience || 'Software Developers',
        upvotes: p.upvotes,
        responsesCount: p.commentsCount,
        status: p.status,
        timestamp: p.createdAt,
      }));

    // Referrals are curated recommendation data — not user-generated
    // In production, this would come from a partner API or admin panel
    const referrals: any[] = [];

    return NextResponse.json({
      discussions,
      referrals,
      marketGaps,
    });
  } catch (error) {
    console.error('[API] Networking GET error:', error);
    return NextResponse.json({ error: 'Failed to load networking data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, content, painPoint, suggestedSaasSolution, category } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    if (type === 'discussion') {
      const post = await prisma.networkingPost.create({
        data: {
          postType: 'discussion',
          author: CANDIDATE.name,
          avatar: 'SM',
          companyOrRole: 'Full Stack Engineer',
          title: title.trim(),
          content: content.trim(),
          category: category || 'General',
          createdAt: new Date().toISOString(),
        },
      });
      return NextResponse.json({ success: true, post });
    } else if (type === 'market_gap') {
      const gap = await prisma.networkingPost.create({
        data: {
          postType: 'market_gap',
          author: CANDIDATE.name,
          avatar: 'SM',
          title: title.trim(),
          content: content.trim(),
          painPoint: painPoint || content.trim(),
          suggestedSolution: suggestedSaasSolution || '',
          targetAudience: 'Software Developers & Job Seekers',
          status: 'Open Gap',
          createdAt: new Date().toISOString(),
        },
      });
      return NextResponse.json({ success: true, gap });
    }

    return NextResponse.json({ error: 'Invalid type. Use "discussion" or "market_gap".' }, { status: 400 });
  } catch (error) {
    console.error('[API] Networking POST error:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
