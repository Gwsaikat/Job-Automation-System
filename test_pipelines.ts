import { runDailyScrapePipeline } from './src/lib/pipeline/scrape';
import { runFundingPipeline } from './src/lib/funding/rss';
import prisma from './src/lib/db';

async function main() {
  console.log('Clearing database...');
  await prisma.job.deleteMany({});
  await prisma.rejectedJob.deleteMany({});
  await prisma.sdeChallenge.deleteMany({});
  await prisma.fundingLead.deleteMany({});
  
  console.log('Running Scrape Pipeline...');
  await runDailyScrapePipeline();
  
  console.log('Running Funding Pipeline...');
  await runFundingPipeline();
}

main().catch(console.error);
