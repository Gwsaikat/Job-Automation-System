import prisma from './src/lib/db';

async function checkDB() {
  const jobCount = await prisma.job.count();
  const challengeCount = await prisma.sdeChallenge.count();
  const fundingCount = await prisma.fundingLead.count();
  const rejectedCount = await prisma.rejectedJob.count();

  console.log(`Jobs: ${jobCount}`);
  console.log(`Challenges: ${challengeCount}`);
  console.log(`Funding Leads: ${fundingCount}`);
  console.log(`Rejected Jobs: ${rejectedCount}`);
}

checkDB().catch(console.error);
