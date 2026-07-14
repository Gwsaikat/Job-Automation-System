// ============================================
// Centralized configuration — reads from .env.local
// ============================================

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

export function isKeyConfigured(key: string): boolean {
  const value = process.env[key];
  return !!value && value.trim().length > 0;
}
