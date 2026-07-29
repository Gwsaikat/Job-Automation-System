// ============================================
// Centralized configuration
// Priority: Database-stored keys > .env values > defaults
// ============================================

import prisma from './db';

export interface AppConfig {
  // Job Scraping APIs
  adzunaAppId: string;
  adzunaAppKey: string;
  rapidApiKey: string;
  serperApiKey: string;

  // AI Providers
  openrouterApiKey: string;
  groqApiKeys: string[];

  // Outreach
  apolloApiKey: string;

  // Telegram
  telegramBotToken: string;

  // Google OAuth
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;

  // App
  storagePath: string;
}

function getEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * Synchronous config — reads from .env only (for worker/startup use).
 * For runtime, prefer getConfigAsync() which checks DB first.
 */
export function getConfig(): AppConfig {
  return {
    adzunaAppId: getEnv('ADZUNA_APP_ID'),
    adzunaAppKey: getEnv('ADZUNA_APP_KEY'),
    rapidApiKey: getEnv('RAPIDAPI_KEY'),
    serperApiKey: getEnv('SERPER_API_KEY'),
    openrouterApiKey: getEnv('OPENROUTER_API_KEY'),
    groqApiKeys: [
      getEnv('GROQ_API_KEY1'),
      getEnv('GROQ_API_KEY2'),
      getEnv('GROQ_API_KEY3'),
      getEnv('GROQ_API_KEY'),
    ].filter(Boolean),
    apolloApiKey: getEnv('APOLLO_API_KEY'),
    telegramBotToken: getEnv('TELEGRAM_BOT_TOKEN'),
    googleClientId: getEnv('GOOGLE_CLIENT_ID'),
    googleClientSecret: getEnv('GOOGLE_CLIENT_SECRET'),
    googleRedirectUri: getEnv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/api/settings/gmail/callback'),
    storagePath: getEnv('STORAGE_PATH', './storage'),
  };
}

/**
 * Helper to get a single key: DB first, then .env fallback
 */
async function getKeyFromDbOrEnv(keyName: string): Promise<string> {
  try {
    const dbKey = `api_key_${keyName}`;
    const setting = await prisma.settings.findUnique({ where: { key: dbKey } });
    if (setting?.value && setting.value.trim().length > 0) {
      return setting.value.trim();
    }
  } catch {
    // DB not available, fall through to env
  }
  return getEnv(keyName);
}

/**
 * Async config — checks database first for user-stored keys,
 * then falls back to .env values.
 * Use this in API routes and pipelines.
 */
export async function getConfigAsync(): Promise<AppConfig> {
  const [
    adzunaAppId, adzunaAppKey, rapidApiKey, serperApiKey,
    openrouterApiKey, groqKey1, groqKey2, groqKey3,
    apolloApiKey, telegramBotToken, googleClientId, googleClientSecret,
  ] = await Promise.all([
    getKeyFromDbOrEnv('ADZUNA_APP_ID'),
    getKeyFromDbOrEnv('ADZUNA_APP_KEY'),
    getKeyFromDbOrEnv('RAPIDAPI_KEY'),
    getKeyFromDbOrEnv('SERPER_API_KEY'),
    getKeyFromDbOrEnv('OPENROUTER_API_KEY'),
    getKeyFromDbOrEnv('GROQ_API_KEY1'),
    getKeyFromDbOrEnv('GROQ_API_KEY2'),
    getKeyFromDbOrEnv('GROQ_API_KEY3'),
    getKeyFromDbOrEnv('APOLLO_API_KEY'),
    getKeyFromDbOrEnv('TELEGRAM_BOT_TOKEN'),
    getKeyFromDbOrEnv('GOOGLE_CLIENT_ID'),
    getKeyFromDbOrEnv('GOOGLE_CLIENT_SECRET'),
  ]);

  return {
    adzunaAppId,
    adzunaAppKey,
    rapidApiKey,
    serperApiKey,
    openrouterApiKey,
    groqApiKeys: [groqKey1, groqKey2, groqKey3, getEnv('GROQ_API_KEY')].filter(Boolean),
    apolloApiKey,
    telegramBotToken,
    googleClientId,
    googleClientSecret,
    googleRedirectUri: getEnv('GOOGLE_REDIRECT_URI', 'http://localhost:3000/api/settings/gmail/callback'),
    storagePath: getEnv('STORAGE_PATH', './storage'),
  };
}

export function isKeyConfigured(key: string): boolean {
  const value = process.env[key];
  return !!value && value.trim().length > 0;
}
