// ============================================
// Challenges API
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const challenges = await prisma.sdeChallenge.findMany({
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ challenges });
  } catch (error) {
    console.error('[API] Challenges error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
      { status: 500 }
    );
  }
}
