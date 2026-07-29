// ============================================
// Settings API — CV Template, API Key Storage & Status
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { isKeyConfigured, getConfig } from '@/lib/config';
import { isGmailConnected } from '@/lib/outreach/gmail';

export const dynamic = 'force-dynamic';

// All API key names that can be stored in the database
const API_KEY_NAMES = [
  'ADZUNA_APP_ID', 'ADZUNA_APP_KEY', 'RAPIDAPI_KEY', 'SERPER_API_KEY',
  'OPENROUTER_API_KEY', 'GROQ_API_KEY1', 'GROQ_API_KEY2', 'GROQ_API_KEY3',
  'APOLLO_API_KEY', 'TELEGRAM_BOT_TOKEN', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
];

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

    // Serper credit balance
    const serperCredits = await prisma.appState.findUnique({
      where: { key: 'serper_credits_remaining' },
    });

    // Check env-based API key status
    const apiKeys = {
      adzuna: isKeyConfigured('ADZUNA_APP_ID') && isKeyConfigured('ADZUNA_APP_KEY'),
      rapidApi: isKeyConfigured('RAPIDAPI_KEY'),
      serper: isKeyConfigured('SERPER_API_KEY'),
      openrouter: isKeyConfigured('OPENROUTER_API_KEY'),
      groq: getConfig().groqApiKeys.length > 0,
      apollo: isKeyConfigured('APOLLO_API_KEY'),
      telegram: isKeyConfigured('TELEGRAM_BOT_TOKEN'),
    };

    // Load stored API keys from database (return masked values)
    const storedApiKeys: Record<string, string> = {};
    for (const keyName of API_KEY_NAMES) {
      const dbKey = `api_key_${keyName}`;
      const setting = await prisma.settings.findUnique({ where: { key: dbKey } });
      if (setting?.value && setting.value.trim().length > 0) {
        storedApiKeys[keyName] = setting.value;
      }
    }

    // Profile settings
    const githubUsernameSetting = await prisma.settings.findUnique({ where: { key: 'profile_github_username' } });
    const leetcodeUsernameSetting = await prisma.settings.findUnique({ where: { key: 'profile_leetcode_username' } });
    const codeforcesUsernameSetting = await prisma.settings.findUnique({ where: { key: 'profile_codeforces_username' } });
    const targetRoleSetting = await prisma.settings.findUnique({ where: { key: 'profile_target_role' } });
    const targetLocationSetting = await prisma.settings.findUnique({ where: { key: 'profile_target_location' } });

    return NextResponse.json({
      masterCvHtml: masterCvSetting?.value || '',
      masterCvLatex: masterCvLatex?.value || '',
      cvType: cvType?.value || 'html',
      gmailConnected,
      gmailEmail: gmailEmail?.value || null,
      apiKeys,
      storedApiKeys,
      serperCreditsRemaining: serperCredits?.value ? parseInt(serperCredits.value, 10) : null,
      profile: {
        githubUsername: githubUsernameSetting?.value || '',
        leetcodeUsername: leetcodeUsernameSetting?.value || '',
        codeforcesUsername: codeforcesUsernameSetting?.value || '',
        targetRole: targetRoleSetting?.value || 'Full Stack Developer',
        targetLocation: targetLocationSetting?.value || 'India / Remote',
      },
    });
  } catch (error) {
    console.error('[API] Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { masterCvHtml, masterCvLatex, cvType, apiKeys, profile } = body;

    if (profile && typeof profile === 'object') {
      const keysMap: Record<string, string> = {
        githubUsername: 'profile_github_username',
        leetcodeUsername: 'profile_leetcode_username',
        codeforcesUsername: 'profile_codeforces_username',
        targetRole: 'profile_target_role',
        targetLocation: 'profile_target_location',
      };
      for (const [prop, dbKey] of Object.entries(keysMap)) {
        if (profile[prop] !== undefined) {
          await prisma.settings.upsert({
            where: { key: dbKey },
            update: { value: String(profile[prop]).trim() },
            create: { key: dbKey, value: String(profile[prop]).trim() },
          });
        }
      }
    }

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

    // Save/update API keys in the database
    if (apiKeys && typeof apiKeys === 'object') {
      for (const [keyName, keyValue] of Object.entries(apiKeys)) {
        if (!API_KEY_NAMES.includes(keyName)) continue;
        const dbKey = `api_key_${keyName}`;
        const value = String(keyValue || '').trim();

        if (value.length === 0) {
          // Delete the key from DB
          await prisma.settings.deleteMany({ where: { key: dbKey } });
        } else {
          // Upsert the key
          await prisma.settings.upsert({
            where: { key: dbKey },
            update: { value },
            create: { key: dbKey, value },
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
