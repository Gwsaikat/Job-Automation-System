import { runFundingPipeline } from './src/lib/funding/rss';
async function main() {
  console.log('Running Funding Pipeline...');
  await runFundingPipeline();
}
main().catch(console.error);
