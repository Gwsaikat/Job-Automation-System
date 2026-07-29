// ============================================
// Career OS — Main Pipeline Orchestrator
// Quality > Quantity pipeline:
// Scrape → Multi-gate Filter → Score → Threshold → CV → Outreach
// ============================================

import prisma from '../db';
import { RawJob, RawChallenge } from '../scrapers/types';
import { scrapeAdzunaIndia, scrapeAdzunaRemoteUK } from '../scrapers/adzuna';
import { scrapeJSearch } from '../scrapers/jsearch';
import { scrapeRemotive } from '../scrapers/remotive';
import { scrapeRemoteOK } from '../scrapers/remoteok';
import { scrapeUnstop } from '../scrapers/unstop';
import { scrapeSerper } from '../scrapers/serper';
import { scrapeHiddenJobs } from '../scrapers/hidden-jobs';
import { runAllFilterGates, filterJobByLocation } from './filter';
import { computeMatchScores, classifyTier, QUALIFIED_THRESHOLD } from './match-engine';
import { runCVPipeline } from '../cv/pipeline';
import { runOutreachPipeline } from '../outreach/pipeline';

// ---- Semaphore to limit concurrent CV+Outreach processing ----
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

// ---- Deduplication ----

async function getExistingSourceIds(): Promise<Set<string>> {
  const jobIds = await prisma.job.findMany({ select: { sourceId: true, jobUrl: true, company: true, jobTitle: true } });
  const challengeIds = await prisma.sdeChallenge.findMany({ select: { sourceId: true } });
  const rejectedIds = await prisma.rejectedJob.findMany({ select: { sourceId: true } });

  const set = new Set<string>();
  for (const j of jobIds) {
    if (j.sourceId) set.add(j.sourceId);
    if (j.jobUrl && j.jobUrl.length > 5) set.add(j.jobUrl.trim().toLowerCase());
    if (j.company && j.jobTitle) set.add(`hash_${j.company.trim().toLowerCase()}_${j.jobTitle.trim().toLowerCase()}`);
  }
  for (const c of challengeIds) if (c.sourceId) set.add(c.sourceId);
  for (const r of rejectedIds) if (r.sourceId) set.add(r.sourceId);
  return set;
}

// ---- Hiring Challenge Detection ----

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
  jobsBelowThreshold: number;
  jobsQualified: number;
  errors: string[];
  filterBreakdown: Record<string, number>;
}

// ---- Main Pipeline ----

export async function runDailyScrapePipeline(): Promise<PipelineStats> {
  const stats: PipelineStats = {
    totalFetched: 0,
    duplicatesSkipped: 0,
    challengesInserted: 0,
    jobsPassed: 0,
    jobsRejected: 0,
    jobsBelowThreshold: 0,
    jobsQualified: 0,
    errors: [],
    filterBreakdown: { visa: 0, role: 0, experience: 0, location: 0, techFit: 0 },
  };

  const today = new Date().toISOString().split('T')[0];

  console.log('[Pipeline] Starting Career OS daily pipeline...');

  // Step 0.5: Get funded companies for hidden job discovery
  let fundedCompanies: string[] = [];
  try {
    const fundingLeads = await prisma.fundingLead.findMany({
      select: { company: true },
      where: { company: { not: null } },
      take: 15,
      orderBy: { id: 'desc' },
    });
    fundedCompanies = fundingLeads.map(f => f.company).filter(Boolean) as string[];
  } catch {
    // Non-critical
  }

  // Step 1: Fetch from ALL sources in parallel (Promise.allSettled)
  const [
    adzunaIndiaResult,
    adzunaUKResult,
    jsearchResult,
    remotiveResult,
    remoteokResult,
    unstopResult,
    serperResult,
    hiddenJobsResult,
  ] = await Promise.allSettled([
    scrapeAdzunaIndia(),
    scrapeAdzunaRemoteUK(),
    scrapeJSearch(),
    scrapeRemotive(),
    scrapeRemoteOK(),
    scrapeUnstop(),
    scrapeSerper(),
    scrapeHiddenJobs(fundedCompanies),
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
    { name: 'Hidden Jobs', result: hiddenJobsResult },
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
    console.log(`[Pipeline] Challenges: ${unstopResult.value.length} challenges fetched`);
    allChallenges.push(...unstopResult.value);
  } else {
    const errMsg = `Challenges failed: ${unstopResult.reason}`;
    console.error(`[Pipeline] ${errMsg}`);
    stats.errors.push(errMsg);
  }

  stats.totalFetched = allRawJobs.length + allChallenges.length;

  // Step 2: Get existing source IDs for dedup
  const existingIds = await getExistingSourceIds();

  // Step 3: Insert challenges (zero AI cost)
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
          platform: challenge.platform || challenge.source,
          challengeType: challenge.challengeType || 'competition',
        },
      });
      stats.challengesInserted++;
      existingIds.add(challenge.sourceId);
    } catch (err) {
      if (String(err).includes('Unique constraint')) {
        stats.duplicatesSkipped++;
      } else {
        console.error('[Pipeline] Challenge insert error:', err);
      }
    }
  }

  // Step 4: Process jobs — multi-gate filter → score → threshold
  for (const rawJob of allRawJobs) {
    const jobUrlKey = rawJob.url ? rawJob.url.trim().toLowerCase() : '';
    const hashKey = rawJob.company && rawJob.title ? `hash_${rawJob.company.trim().toLowerCase()}_${rawJob.title.trim().toLowerCase()}` : '';

    // Check for hiring challenge pattern
    if (isHiringChallenge(rawJob)) {
      if (existingIds.has(rawJob.sourceId) || (jobUrlKey && existingIds.has(jobUrlKey)) || (hashKey && existingIds.has(hashKey))) {
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
            platform: rawJob.source,
            challengeType: 'hiring',
          },
        });
        stats.challengesInserted++;
        existingIds.add(rawJob.sourceId);
        if (jobUrlKey) existingIds.add(jobUrlKey);
        if (hashKey) existingIds.add(hashKey);
      } catch {
        stats.duplicatesSkipped++;
      }
      continue;
    }

    // Dedup check across sourceId, URL, and company_title hash
    if (existingIds.has(rawJob.sourceId) || (jobUrlKey && existingIds.has(jobUrlKey)) || (hashKey && existingIds.has(hashKey))) {
      stats.duplicatesSkipped++;
      continue;
    }

    existingIds.add(rawJob.sourceId);
    if (jobUrlKey) existingIds.add(jobUrlKey);
    if (hashKey) existingIds.add(hashKey);

    await processAndInsertJob(rawJob, stats);
  }

  console.log(`[Pipeline] Complete! Fetched: ${stats.totalFetched}, Qualified: ${stats.jobsQualified}, Below Threshold: ${stats.jobsBelowThreshold}, Rejected: ${stats.jobsRejected}, Challenges: ${stats.challengesInserted}, Duplicates Skipped: ${stats.duplicatesSkipped}`);
  console.log(`[Pipeline] Filter breakdown:`, JSON.stringify(stats.filterBreakdown));

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

  // ---- Multi-gate filter pipeline ----
  const filterResult = await runAllFilterGates(rawJob);

  if (!filterResult.passed) {
    // Log rejection with gate info
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
          rejectReason: `[${filterResult.rejectGate}] ${filterResult.rejectReason || 'Failed filter'}`,
          createdAt: new Date().toISOString(),
        },
      });
    } catch {
      // Ignore insert errors for rejected jobs
    }
    if (stats) {
      stats.jobsRejected++;
      if (filterResult.rejectGate) {
        stats.filterBreakdown[filterResult.rejectGate] = (stats.filterBreakdown[filterResult.rejectGate] || 0) + 1;
      }
    }
    return;
  }

  // ---- Match Scoring Engine ----
  const locFilter = filterResult.filterResult!;
  const matchScores = await computeMatchScores(rawJob, locFilter, false);
  const matchTier = classifyTier(matchScores.overallScore);

  // Insert the job into the database (ALL tiers stored, tailoring happens ONLY when user clicks)
  try {
    const inserted = await prisma.job.create({
      data: {
        sourceId: rawJob.sourceId,
        dateFound: today,
        jobTitle: rawJob.title,
        company: rawJob.company,
        location: rawJob.location,
        locationType: locFilter.category,
        salaryDisplay: locFilter.salaryDisplay,
        source: rawJob.source,
        jobUrl: rawJob.url,
        jobDescription: rawJob.description,
        locationPriority: locFilter.locationPriority,
        overallScore: matchScores.overallScore,
        matchScores: JSON.stringify(matchScores),
        matchTier,
        applicationStatus: 'Pending', // Stored as Pending — user clicks Tailor to generate CV
        createdAt: new Date().toISOString(),
      },
    });

    if (stats) {
      stats.jobsPassed++;
      if (matchTier === 'qualified') stats.jobsQualified++;
      else if (matchTier === 'below_threshold') stats.jobsBelowThreshold++;
    }
    console.log(`[Pipeline] Job STORED: ${rawJob.title} at ${rawJob.company} (id=${inserted.id}, score=${matchScores.overallScore}, tier=${matchTier}) — Ready for user click to tailor`);
  } catch (err) {
    if (String(err).includes('Unique constraint')) {
      if (stats) stats.duplicatesSkipped++;
    } else {
      console.error('[Pipeline] Job insert error:', err);
      if (stats) stats.errors.push(`Job insert error: ${rawJob.title} - ${err}`);
    }
  }
}
