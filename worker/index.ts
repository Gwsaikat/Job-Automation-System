// ============================================
// Background Worker — Section 2 / 11
// Runs independently of the Next.js app
// Uses node-cron for all scheduled tasks
// ============================================

import cron from 'node-cron';
import { runDailyScrapePipeline } from '../src/lib/pipeline/scrape';
import { pollTelegram } from '../src/lib/scrapers/telegram';
import { filterJobByLocation } from '../src/lib/pipeline/filter';
import { runFundingPipeline } from '../src/lib/funding/rss';
import { runFollowUpCheck } from '../src/lib/reporting/follow-up';
import { runWeeklyDigest } from '../src/lib/reporting/digest';
import { runSkillsGapReport } from '../src/lib/reporting/skills-gap';

// Load env variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('========================================');
console.log('  Job Automation System — Background Worker');
console.log('  Started at:', new Date().toISOString());
console.log('========================================');

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

// Every 3 minutes → Telegram Poll (Section 4.7)
safeCron('Telegram Poll', '*/3 * * * *', async () => {
  const jobs = await pollTelegram();
  if (jobs.length > 0) {
    console.log(`[Worker] Telegram: ${jobs.length} new jobs extracted`);
    // Process through the same location/salary pipeline
    for (const job of jobs) {
      const result = filterJobByLocation(job);
      if (result.passed) {
        console.log(`[Worker] Telegram job passed: ${job.title} at ${job.company}`);
      }
    }
  }
});

// Keep the process alive
console.log('\n[Worker] All jobs scheduled. Worker is running...\n');
