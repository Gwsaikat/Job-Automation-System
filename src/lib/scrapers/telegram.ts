// ============================================
// Telegram Polling Scraper — Section 4.7
// Polls every 3 minutes via getUpdates (no webhook needed)
// Reads/writes telegram_last_update_id from app_state table
// ============================================

import { getConfig } from '../config';
import prisma from '../db';
import { RawJob } from './types';
import { callAIStandard, parseAIJson } from '../ai';

interface TelegramUpdate {
  update_id: number;
  message?: {
    text?: string;
    caption?: string;
    date?: number;
  };
  channel_post?: {
    text?: string;
    caption?: string;
    date?: number;
  };
}

interface TelegramResponse {
  ok: boolean;
  result: TelegramUpdate[];
}

interface ExtractedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary: string;
}

async function getLastUpdateId(): Promise<number> {
  const state = await prisma.appState.findUnique({
    where: { key: 'telegram_last_update_id' },
  });
  return state?.value ? parseInt(state.value, 10) : 0;
}

async function setLastUpdateId(updateId: number): Promise<void> {
  await prisma.appState.upsert({
    where: { key: 'telegram_last_update_id' },
    update: { value: String(updateId) },
    create: { key: 'telegram_last_update_id', value: String(updateId) },
  });
}

async function extractJobFromText(text: string): Promise<ExtractedJob | null> {
  const prompt = `Extract job information from this message. If it's not a job posting, return null.

Message:
${text}

Return a JSON object with these fields (or null if not a job posting):
{
  "title": "job title",
  "company": "company name",
  "location": "location",
  "description": "brief description",
  "url": "apply link if found, empty string otherwise",
  "salary": "salary if mentioned, empty string otherwise"
}

Return ONLY the JSON, no other text.`;

  try {
    const response = await callAIStandard(prompt, { maxTokens: 256, temperature: 0.1 });
    const parsed = parseAIJson<ExtractedJob | null>(response);
    return parsed;
  } catch {
    console.warn('[Telegram] Failed to extract job info from message');
    return null;
  }
}

export async function pollTelegram(): Promise<RawJob[]> {
  const config = getConfig();

  if (!config.telegramBotToken) {
    console.warn('[Telegram] Bot token not configured, skipping');
    return [];
  }

  const lastOffset = await getLastUpdateId();

  const url = `https://api.telegram.org/bot${config.telegramBotToken}/getUpdates?offset=${lastOffset}&timeout=5`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Telegram returned ${response.status}: ${await response.text()}`);
  }

  const data: TelegramResponse = await response.json();

  if (!data.ok || !data.result || data.result.length === 0) {
    return [];
  }

  const jobs: RawJob[] = [];
  let maxUpdateId = lastOffset;

  for (const update of data.result) {
    if (update.update_id >= lastOffset) {
      maxUpdateId = Math.max(maxUpdateId, update.update_id);

      const msg = update.message || update.channel_post;
      const text = msg?.text || msg?.caption || '';

      // Skip anything under 20 characters
      if (text.length < 20) continue;

      const extracted = await extractJobFromText(text);
      if (!extracted) continue;

      // Create a simple hash from the text for dedup
      let hash = 0;
      for (let i = 0; i < text.length && i < 100; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
      }

      jobs.push({
        sourceId: `telegram_${Math.abs(hash)}`,
        title: extracted.title,
        company: extracted.company,
        location: extracted.location,
        description: extracted.description || text.substring(0, 500),
        salaryMin: 0,
        salaryMax: 0,
        url: extracted.url || '',
        datePosted: msg?.date
          ? new Date(msg.date * 1000).toISOString()
          : new Date().toISOString(),
        source: 'Telegram Community',
      });
    }
  }

  // Write max update ID + 1 back so same message is never reprocessed
  if (maxUpdateId > lastOffset) {
    await setLastUpdateId(maxUpdateId + 1);
  }

  return jobs;
}
