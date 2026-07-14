// ============================================
// Manual Paste API — Section 4.8
// WhatsApp/manual job paste handler
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAIStandard, parseAIJson } from '@/lib/ai';
import { filterJobByLocation } from '@/lib/pipeline/filter';
import { RawJob } from '@/lib/scrapers/types';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: 'Please paste a meaningful job posting (at least 20 characters)' },
        { status: 400 }
      );
    }

    // Extract job info via AI
    const prompt = `Extract job information from this pasted message. This was shared in a WhatsApp/community group.

MESSAGE:
${text}

Return JSON:
{
  "title": "job title",
  "company": "company name",
  "location": "location (city, country, or 'Remote')",
  "description": "job description summary",
  "url": "apply link if found, empty string otherwise",
  "salary": "salary if mentioned, empty string otherwise",
  "salaryMin": 0,
  "salaryMax": 0
}

If salary is mentioned in LPA format (e.g., "6 LPA"), convert to annual: salaryMin = 600000.
Return ONLY the JSON.`;

    const response = await callAIStandard(prompt, { maxTokens: 300, temperature: 0.1 });
    const extracted = parseAIJson<{
      title: string;
      company: string;
      location: string;
      description: string;
      url: string;
      salary: string;
      salaryMin: number;
      salaryMax: number;
    }>(response);

    // Create RawJob for filter
    const rawJob: RawJob = {
      sourceId: `whatsapp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: extracted.title,
      company: extracted.company,
      location: extracted.location,
      description: extracted.description,
      salaryMin: extracted.salaryMin || 0,
      salaryMax: extracted.salaryMax || 0,
      url: extracted.url || '',
      datePosted: new Date().toISOString(),
      source: 'WhatsApp Community',
    };

    // Apply location/salary filter
    const filterResult = filterJobByLocation(rawJob);

    if (!filterResult.passed) {
      // Still save as rejected for tracking
      await prisma.rejectedJob.create({
        data: {
          sourceId: rawJob.sourceId,
          dateFound: new Date().toISOString().split('T')[0],
          jobTitle: rawJob.title,
          company: rawJob.company,
          location: rawJob.location,
          source: 'WhatsApp Community',
          jobUrl: rawJob.url,
          rejectReason: filterResult.rejectReason || 'Failed filter',
          createdAt: new Date().toISOString(),
        },
      });

      return NextResponse.json({
        status: 'rejected',
        reason: filterResult.rejectReason,
        extracted,
      });
    }

    // Insert to jobs table
    const job = await prisma.job.create({
      data: {
        sourceId: rawJob.sourceId,
        dateFound: new Date().toISOString().split('T')[0],
        jobTitle: rawJob.title,
        company: rawJob.company,
        location: rawJob.location,
        locationType: filterResult.category,
        salaryDisplay: filterResult.salaryDisplay,
        source: 'WhatsApp Community',
        jobUrl: rawJob.url,
        jobDescription: rawJob.description,
        createdAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      status: 'accepted',
      job,
      category: filterResult.category,
    });
  } catch (error) {
    console.error('[API] Manual paste error:', error);
    return NextResponse.json(
      { error: 'Failed to process job posting' },
      { status: 500 }
    );
  }
}
