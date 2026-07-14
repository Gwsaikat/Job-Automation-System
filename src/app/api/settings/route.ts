// ============================================
// Settings API — CV Template & API Key Status
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isKeyConfigured, getConfig } from '@/lib/config';
import { isGmailConnected } from '@/lib/outreach/gmail';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const masterCvSetting = await prisma.settings.findUnique({
      where: { key: 'master_cv_html' },
    });
    
    const masterCvLatex = await prisma.settings.findUnique({
      where: { key: 'master_cv_latex' },
    });

    const cvType = await prisma.settings.findUnique({
      where: { key: 'cv_type' },
    });

    const gmailEmail = await prisma.settings.findUnique({
      where: { key: 'gmail_email' },
    });

    const gmailConnected = await isGmailConnected();

    // Just check if they exist in env for the frontend status indicators
    const apiKeys = {
      adzuna: isKeyConfigured('ADZUNA_APP_ID') && isKeyConfigured('ADZUNA_APP_KEY'),
      rapidApi: isKeyConfigured('RAPIDAPI_KEY'),
      serper: isKeyConfigured('SERPER_API_KEY'),
      openrouter: isKeyConfigured('OPENROUTER_API_KEY'),
      groq: getConfig().groqApiKeys.length > 0,
      apollo: isKeyConfigured('APOLLO_API_KEY'),
      telegram: isKeyConfigured('TELEGRAM_BOT_TOKEN'),
    };

    return NextResponse.json({
      masterCvHtml: masterCvSetting?.value || '',
      masterCvLatex: masterCvLatex?.value || '',
      cvType: cvType?.value || 'html',
      gmailConnected,
      gmailEmail: gmailEmail?.value || null,
      apiKeys,
    });
  } catch (error) {
    console.error('[API] Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { masterCvHtml, masterCvLatex, cvType } = await request.json();

    if (masterCvHtml !== undefined) {
      await prisma.settings.upsert({
        where: { key: 'master_cv_html' },
        update: { value: masterCvHtml },
        create: { key: 'master_cv_html', value: masterCvHtml },
      });
    }

    if (masterCvLatex !== undefined) {
      await prisma.settings.upsert({
        where: { key: 'master_cv_latex' },
        update: { value: masterCvLatex },
        create: { key: 'master_cv_latex', value: masterCvLatex },
      });
    }

    if (cvType !== undefined) {
      await prisma.settings.upsert({
        where: { key: 'cv_type' },
        update: { value: cvType },
        create: { key: 'cv_type', value: cvType },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
