// ============================================
// Main Scraping Pipeline Orchestrator — Section 4
// runDailyScrapePipeline(): fetches from all sources,
// deduplicates, filters, and inserts into database
// ============================================

import prisma from '../db';
import { RawJob, RawChallenge } from '../scrapers/types';
import { scrapeAdzunaIndia, scrapeAdzunaRemoteUK } from '../scrapers/adzuna';
import { scrapeJSearch } from '../scrapers/jsearch';
import { scrapeRemotive } from '../scrapers/remotive';
import { scrapeRemoteOK } from '../scrapers/remoteok';
import { scrapeUnstop } from '../scrapers/unstop';
import { scrapeSerper } from '../scrapers/serper';
import { filterJobByLocation, filterJobByTechFit } from './filter';
import { runCVPipeline } from '../cv/pipeline';
import { runOutreachPipeline } from '../outreach/pipeline';

// ---- BUG #5 FIX: Semaphore to limit concurrent CV+Outreach processing ----
export class Semaphore {
  private running = 0;
  private queue: (() => void)[] = [];
  constructor(private max: number) {}
  async acquire() {
    if (this.running >= this.max) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
  }
  release() {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }
}
export const jobProcessingSemaphore = new Semaphore(2);

// ---- Deduplication (Section 4.5) ----

async function getExistingSourceIds(): Promise<Set<string>> {
  const jobIds = await prisma.job.findMany({ select: { sourceId: true } });
  const challengeIds = await prisma.sdeChallenge.findMany({ select: { sourceId: true } });
  const rejectedIds = await prisma.rejectedJob.findMany({ select: { sourceId: true } });

  const set = new Set<string>();
  for (const j of jobIds) set.add(j.sourceId);
  for (const c of challengeIds) set.add(c.sourceId);
  for (const r of rejectedIds) set.add(r.sourceId);
  return set;
}

// ---- Hiring Challenge Detection (Section 4.4) ----

function isHiringChallenge(job: RawJob): boolean {
  const text = `${job.title} ${job.description}`.toLowerCase();
  return (
    text.includes('hiring challenge') ||
    text.includes('coding challenge') ||
    text.includes('sde challenge') ||
    text.includes('hackathon')
  );
}

// ---- Pipeline Stats ----

export interface PipelineStats {
  totalFetched: number;
  duplicatesSkipped: number;
  challengesInserted: number;
  jobsPassed: number;
  jobsRejected: number;
  errors: string[];
}

// ---- Main Pipeline ----

export async function runDailyScrapePipeline(): Promise<PipelineStats> {
  const stats: PipelineStats = {
    totalFetched: 0,
    duplicatesSkipped: 0,
    challengesInserted: 0,
    jobsPassed: 0,
    jobsRejected: 0,
    errors: [],
  };

  const today = new Date().toISOString().split('T')[0];

  console.log('[Pipeline] Starting daily scrape pipeline...');

  // Step 1: Fetch from ALL sources in parallel (Promise.allSettled — Section 4.1)
  const [
    adzunaIndiaResult,
    adzunaUKResult,
    jsearchResult,
    remotiveResult,
    remoteokResult,
    unstopResult,
    serperResult,
  ] = await Promise.allSettled([
    scrapeAdzunaIndia(),
    scrapeAdzunaRemoteUK(),
    scrapeJSearch(),
    scrapeRemotive(),
    scrapeRemoteOK(),
    scrapeUnstop(),
    scrapeSerper(),
  ]);

  // Collect all raw jobs
  const allRawJobs: RawJob[] = [];
  const allChallenges: RawChallenge[] = [];

  const jobResults = [
    { name: 'Adzuna India', result: adzunaIndiaResult },
    { name: 'Adzuna UK', result: adzunaUKResult },
    { name: 'JSearch', result: jsearchResult },
    { name: 'Remotive', result: remotiveResult },
    { name: 'RemoteOK', result: remoteokResult },
    { name: 'Serper', result: serperResult },
  ];

  for (const { name, result } of jobResults) {
    if (result.status === 'fulfilled') {
      console.log(`[Pipeline] ${name}: ${result.value.length} jobs fetched`);
      allRawJobs.push(...result.value);
    } else {
      const errMsg = `${name} failed: ${result.reason}`;
      console.error(`[Pipeline] ${errMsg}`);
      stats.errors.push(errMsg);
    }
  }

  // Unstop goes directly to challenges
  if (unstopResult.status === 'fulfilled') {
    console.log(`[Pipeline] Unstop: ${unstopResult.value.length} challenges fetched`);
    allChallenges.push(...unstopResult.value);
  } else {
    const errMsg = `Unstop failed: ${unstopResult.reason}`;
    console.error(`[Pipeline] ${errMsg}`);
    stats.errors.push(errMsg);
  }

  stats.totalFetched = allRawJobs.length + allChallenges.length;

  // Step 2: Get existing source IDs for dedup (Section 4.5)
  const existingIds = await getExistingSourceIds();

  // Step 3: Insert challenges (zero AI cost — Section 4.4)
  for (const challenge of allChallenges) {
    if (existingIds.has(challenge.sourceId)) {
      stats.duplicatesSkipped++;
      continue;
    }

    try {
      await prisma.sdeChallenge.create({
        data: {
          sourceId: challenge.sourceId,
          dateFound: today,
          challengeName: challenge.challengeName,
          company: challenge.company,
          source: challenge.source,
          applyLink: challenge.applyLink,
          deadline: challenge.deadline,
        },
      });
      stats.challengesInserted++;
      existingIds.add(challenge.sourceId);
    } catch (err) {
      // Unique constraint violation = already exists
      if (String(err).includes('Unique constraint')) {
        stats.duplicatesSkipped++;
      } else {
        console.error('[Pipeline] Challenge insert error:', err);
      }
    }
  }

  // Step 4: Process jobs — split hiring challenges, dedup, filter
  for (const rawJob of allRawJobs) {
    // Check for hiring challenge pattern
    if (isHiringChallenge(rawJob)) {
      if (existingIds.has(rawJob.sourceId)) {
        stats.duplicatesSkipped++;
        continue;
      }

      try {
        await prisma.sdeChallenge.create({
          data: {
            sourceId: rawJob.sourceId,
            dateFound: today,
            challengeName: rawJob.title,
            company: rawJob.company,
            source: rawJob.source,
            applyLink: rawJob.url,
            deadline: '',
          },
        });
        stats.challengesInserted++;
        existingIds.add(rawJob.sourceId);
      } catch {
        stats.duplicatesSkipped++;
      }
      continue;
    }

    // Dedup check
    if (existingIds.has(rawJob.sourceId)) {
      stats.duplicatesSkipped++;
      continue;
    }

    existingIds.add(rawJob.sourceId);
    await processAndInsertJob(rawJob, stats);
  }

  console.log(`[Pipeline] Complete! Fetched: ${stats.totalFetched}, Passed: ${stats.jobsPassed}, Rejected: ${stats.jobsRejected}, Challenges: ${stats.challengesInserted}, Dupes: ${stats.duplicatesSkipped}`);

  // Update last scrape run timestamp
  await prisma.appState.upsert({
    where: { key: 'last_scrape_run' },
    update: { value: new Date().toISOString() },
    create: { key: 'last_scrape_run', value: new Date().toISOString() },
  });

  return stats;
}

export async function processAndInsertJob(rawJob: RawJob, stats?: PipelineStats): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  // Location + salary filter (Section 4.6)
  const filterResult = filterJobByLocation(rawJob);

  if (!filterResult.passed) {
    // Log rejection for skills gap analysis (Section 7.3)
    try {
      await prisma.rejectedJob.create({
        data: {
          sourceId: rawJob.sourceId,
          dateFound: today,
          jobTitle: rawJob.title,
          company: rawJob.company,
          location: rawJob.location,
          source: rawJob.source,
          jobUrl: rawJob.url,
          rejectReason: filterResult.rejectReason || 'Failed location/salary filter',
          createdAt: new Date().toISOString(),
        },
      });
    } catch {
      // Ignore insert errors for rejected jobs
    }
    if (stats) {
      stats.jobsRejected++;
    }
    return;
  }

  // AI Tech Fit Filter
  const techFitResult = await filterJobByTechFit(rawJob);
  if (!techFitResult.passed) {
    try {
      await prisma.rejectedJob.create({
        data: {
          sourceId: rawJob.sourceId,
          dateFound: today,
          jobTitle: rawJob.title,
          company: rawJob.company,
          location: rawJob.location,
          source: rawJob.source,
          jobUrl: rawJob.url,
          rejectReason: techFitResult.rejectReason || 'Failed AI tech fit filter',
          createdAt: new Date().toISOString(),
        },
      });
    } catch {}
    if (stats) {
      stats.jobsRejected++;
    }
    return;
  }

  // Insert the job into the database
  let insertedJobId: number | null = null;
  try {
    const inserted = await prisma.job.create({
      data: {
        sourceId: rawJob.sourceId,
        dateFound: today,
        jobTitle: rawJob.title,
        company: rawJob.company,
        location: rawJob.location,
        locationType: filterResult.category,
        salaryDisplay: filterResult.salaryDisplay,
        source: rawJob.source,
        jobUrl: rawJob.url,
        jobDescription: rawJob.description,
        createdAt: new Date().toISOString(),
      },
    });

    insertedJobId = inserted.id;
    if (stats) {
      stats.jobsPassed++;
    }
    console.log(`[Pipeline] Job INSERTED: ${rawJob.title} at ${rawJob.company} (id=${insertedJobId})`);
  } catch (err) {
    if (String(err).includes('Unique constraint')) {
      if (stats) {
        stats.duplicatesSkipped++;
      }
    } else {
      console.error('[Pipeline] Job insert error:', err);
      if (stats) {
        stats.errors.push(`Job insert error: ${rawJob.title} - ${err}`);
      }
    }
    return;
  }

  // Trigger CV+Outreach with semaphore cap and error recording
  if (insertedJobId) {
    const jobId = insertedJobId;
    setTimeout(async () => {
      await jobProcessingSemaphore.acquire();
      try {
        console.log(`[Pipeline] Auto-triggering CV and Outreach for Job ${jobId}`);
        await runCVPipeline(jobId);
        await runOutreachPipeline(jobId);
        await prisma.job.update({
          where: { id: jobId },
          data: {
            applicationStatus: 'Applied',
            processingError: null,
            processedAt: new Date().toISOString(),
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[Pipeline] Auto-processing failed for Job ${jobId}:`, error);
        await prisma.job.update({
          where: { id: jobId },
          data: {
            processingError: message.slice(0, 500),
            processedAt: new Date().toISOString(),
          },
        }).catch(() => {}); // don't let a logging failure mask the original error
      } finally {
        jobProcessingSemaphore.release();
      }
    }, 0);
  }
}

