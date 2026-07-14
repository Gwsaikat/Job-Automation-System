// ============================================
// Gmail OAuth Routes — Section 9
// /api/settings/gmail — POST to start flow
// /api/settings/gmail/callback — GET for redirect
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl, exchangeCodeForTokens } from '@/lib/outreach/gmail';

export async function POST() {
  try {
    const url = getAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error('[API] Gmail auth start error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth URL. Check your Google OAuth credentials in .env.local.' },
      { status: 500 }
    );
  }
}
