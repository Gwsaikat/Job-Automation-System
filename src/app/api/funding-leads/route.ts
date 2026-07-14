// ============================================
// Funding Leads API
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const leads = await prisma.fundingLead.findMany({
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('[API] Funding leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding leads' },
      { status: 500 }
    );
  }
}
