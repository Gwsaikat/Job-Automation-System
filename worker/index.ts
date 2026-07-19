// ============================================
// Background Worker — Section 2 / 11
// Runs independently of the Next.js app
// Uses node-cron for all scheduled tasks
// ============================================

// Load env variables FIRST — from .env (not .env.local)
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import cron from 'node-cron';
import { RawJob } from '../src/lib/scrapers/types';
import { runDailyScrapePipeline, processAndInsertJob } from '../src/lib/pipeline/scrape';
import { pollTelegram } from '../src/lib/scrapers/telegram';
import { runFundingPipeline } from '../src/lib/funding/rss';
import { runFollowUpCheck } from '../src/lib/reporting/follow-up';
import { runWeeklyDigest } from '../src/lib/reporting/digest';
import { runSkillsGapReport } from '../src/lib/reporting/skills-gap';
import prisma from '../src/lib/db';

console.log('========================================');
console.log('  Job Automation System — Background Worker');
console.log('  Started at:', new Date().toISOString());
console.log('========================================');

// ---- BUG #1 FIX: Environment sanity check ----
const requiredKeys = [
  'ADZUNA_APP_ID', 'RAPIDAPI_KEY', 'SERPER_API_KEY',
  'OPENROUTER_API_KEY', 'GROQ_API_KEY1', 'APOLLO_API_KEY', 'TELEGRAM_BOT_TOKEN',
];
console.log('[Worker] Environment check:');
for (const key of requiredKeys) {
  const val = process.env[key];
  console.log(`  ${key}: ${val ? '✅ loaded (' + val.slice(0, 6) + '...)' : '❌ MISSING'}`);
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const templateModule = require('../src/lib/cv/template');
  new Function('return `' + templateModule.MASTER_CV_HTML.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${') + '`');
  new Function('return `' + templateModule.MASTER_CV_LATEX.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${') + '`');
  console.log('[Worker] ✅ CV templates validated successfully');
} catch (e) {
  console.error('[Worker] ❌ CV templates validation failed:', e);
}

// ---- Helper to wrap cron jobs with error handling ----

function safeCron(name: string, schedule: string, task: () => Promise<void>) {
  cron.schedule(schedule, async () => {
    console.log(`\n[Worker] Running: ${name} at ${new Date().toISOString()}`);
    try {
      await task();
      console.log(`[Worker] Completed: ${name}`);
    } catch (error) {
      console.error(`[Worker] FAILED: ${name}`, error);
    }
  });
  console.log(`[Worker] Scheduled: ${name} → ${schedule}`);
}

// ---- Schedule all cron jobs ----

// 08:00 daily → Job Scraping Pipeline (Section 4)
safeCron('Job Scraping Pipeline', '0 8 * * *', async () => {
  const stats = await runDailyScrapePipeline();
  console.log('[Worker] Scrape stats:', JSON.stringify(stats, null, 2));
});

// 09:00 daily → Funding News Pipeline (Section 7.1)
safeCron('Funding News Pipeline', '0 9 * * *', async () => {
  const stats = await runFundingPipeline();
  console.log('[Worker] Funding stats:', JSON.stringify(stats, null, 2));
});

// 10:00 daily → Follow-Up Email Check (Section 6.5)
safeCron('Follow-Up Email Check', '0 10 * * *', async () => {
  const stats = await runFollowUpCheck();
  console.log('[Worker] Follow-up stats:', JSON.stringify(stats, null, 2));
});

// Sunday 09:00 → Weekly Digest Email (Section 7.2)
safeCron('Weekly Digest', '0 9 * * 0', async () => {
  await runWeeklyDigest();
});

// Sunday 10:00 → Skills Gap Report (Section 7.3)
safeCron('Skills Gap Report', '0 10 * * 0', async () => {
  await runSkillsGapReport();
});

// Every 3 minutes → Telegram Poll (Section 4.7) — BUG #3 FIXED
safeCron('Telegram Poll', '*/3 * * * *', async () => {
  const jobs = await pollTelegram();
  if (jobs.length > 0) {
    console.log(`[Worker] Telegram: ${jobs.length} new jobs extracted — processing...`);

    // Check existing source IDs to avoid re-processing
    const existing = await prisma.job.findMany({ select: { sourceId: true } });
    const rejectedExisting = await prisma.rejectedJob.findMany({ select: { sourceId: true } });
    const existingIds = new Set([
      ...existing.map(j => j.sourceId),
      ...rejectedExisting.map(r => r.sourceId),
    ]);

    for (const job of jobs) {
      if (existingIds.has(job.sourceId)) {
        console.log(`[Worker] Telegram job already processed, skipping: ${job.title}`);
        continue;
      }
      await processAndInsertJob(job);
    }
  }
});

// Keep the process alive
console.log('\n[Worker] All jobs scheduled. Worker is running...\n');
