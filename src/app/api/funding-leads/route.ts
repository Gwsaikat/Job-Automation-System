// ============================================
// Funding Leads API Route
// Automatically seeds and fetches high-growth tech startup funding leads
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

const INITIAL_FUNDING_LEADS = [
  {
    sourceId: 'fund-anysphere-2026',
    dateFound: '2026-07-28',
    company: 'Anysphere (Cursor AI)',
    fundingAmount: '$60M',
    stage: 'Series A',
    sector: 'AI Developer Tools',
    domain: 'cursor.com',
    newsLink: 'https://cursor.com/blog/series-a',
    hiringProbability: 95,
    hiringSignals: JSON.stringify([
      'Fresh $60M Series A round led by Andreessen Horowitz',
      'Scaling core AI inference & editor infrastructure team',
      'Founders actively seeking Senior Systems & Full-Stack Engineers',
    ]),
    techStackMatch: 96,
    status: 'Not Contacted',
    notes: 'Direct founder outreach recommended via Twitter/LinkedIn.',
  },
  {
    sourceId: 'fund-modal-2026',
    dateFound: '2026-07-27',
    company: 'Modal Labs',
    fundingAmount: '$35M',
    stage: 'Series A',
    sector: 'Cloud Infrastructure & GPU Computing',
    domain: 'modal.com',
    newsLink: 'https://modal.com/blog/funding',
    hiringProbability: 92,
    hiringSignals: JSON.stringify([
      'Raised $35M from Redpoint to expand serverless Python GPU cloud',
      'Expanding Distributed Systems and Cloud Backend team',
      'Strong engineering culture & remote-friendly compensation',
    ]),
    techStackMatch: 94,
    status: 'Not Contacted',
    notes: 'High tech stack alignment with Python/Node/Cloud infrastructure.',
  },
  {
    sourceId: 'fund-cognition-2026',
    dateFound: '2026-07-25',
    company: 'Cognition AI (Devin)',
    fundingAmount: '$175M',
    stage: 'Series B',
    sector: 'Autonomous AI Software Engineers',
    domain: 'cognition.ai',
    newsLink: 'https://cognition.ai/blog/series-b',
    hiringProbability: 98,
    hiringSignals: JSON.stringify([
      'Valuation hit $2B post Series B led by Founders Fund',
      'Aggressively hiring Applied AI & Infrastructure Engineers',
      'Looking for competitive programmers & algorithmic engineers',
    ]),
    techStackMatch: 98,
    status: 'Not Contacted',
    notes: 'Ideal match for DSA / Algorithm background.',
  },
  {
    sourceId: 'fund-supabase-2026',
    dateFound: '2026-07-22',
    company: 'Supabase',
    fundingAmount: '$80M',
    stage: 'Series C',
    sector: 'Open-Source Database & Auth',
    domain: 'supabase.com',
    newsLink: 'https://supabase.com/blog/funding',
    hiringProbability: 90,
    hiringSignals: JSON.stringify([
      'Accelerating enterprise PostgreSQL & Realtime engine features',
      'Hiring Remote Full Stack Engineers (Node.js/React/PostgreSQL)',
      'Open-source contribution history gives priority shortlist',
    ]),
    techStackMatch: 95,
    status: 'Not Contacted',
    notes: 'Matches PostgreSQL/Node.js tech stack.',
  },
  {
    sourceId: 'fund-langchain-2026',
    dateFound: '2026-07-20',
    company: 'LangChain',
    fundingAmount: '$25M',
    stage: 'Series A',
    sector: 'LLM Orchestration Framework',
    domain: 'langchain.com',
    newsLink: 'https://blog.langchain.dev/series-a',
    hiringProbability: 88,
    hiringSignals: JSON.stringify([
      'Scaling LangGraph enterprise workflow orchestrators',
      'Expanding TypeScript & Python SDK core maintainers team',
    ]),
    techStackMatch: 92,
    status: 'Not Contacted',
    notes: 'TypeScript / Node.js AI orchestration alignment.',
  },
  {
    sourceId: 'fund-anyscale-2026',
    dateFound: '2026-07-18',
    company: 'Anyscale (Ray.io)',
    fundingAmount: '$99M',
    stage: 'Series C',
    sector: 'Distributed AI Computing',
    domain: 'anyscale.com',
    newsLink: 'https://anyscale.com/news',
    hiringProbability: 86,
    hiringSignals: JSON.stringify([
      'Growing distributed computing platform for AI workloads',
      'Hiring Systems & Full Stack Infrastructure Engineers',
    ]),
    techStackMatch: 90,
    status: 'Not Contacted',
    notes: 'Ray & Python distributed systems match.',
  },
];

export async function GET() {
  try {
    let leads = await prisma.fundingLead.findMany({
      orderBy: { id: 'desc' },
    });

    // If database table is empty, auto-seed funding leads
    if (leads.length === 0) {
      for (const lead of INITIAL_FUNDING_LEADS) {
        await prisma.fundingLead.upsert({
          where: { sourceId: lead.sourceId },
          update: {},
          create: lead,
        });
      }
      leads = await prisma.fundingLead.findMany({
        orderBy: { id: 'desc' },
      });
    }

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('[API] Funding leads error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding leads' },
      { status: 500 }
    );
  }
}
