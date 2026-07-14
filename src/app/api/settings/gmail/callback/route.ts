// ============================================
// Gmail OAuth Callback
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/outreach/gmail';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/settings?error=' + encodeURIComponent(error), request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/settings?error=No+code+provided', request.url));
  }

  try {
    await exchangeCodeForTokens(code);
    return NextResponse.redirect(new URL('/settings?success=gmail_connected', request.url));
  } catch (err) {
    console.error('[API] Gmail callback error:', err);
    return NextResponse.redirect(
      new URL('/settings?error=Failed+to+exchange+token', request.url)
    );
  }
}
