// ============================================
// Career OS — AI Interview Prep Pack Generator
// Generates company-specific & role-tailored technical & behavioral interview questions
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { callAIQuality, parseAIJson } from '@/lib/ai';
import { getSkillsSummary } from '@/lib/candidate-profile';

export interface InterviewQuestion {
  id: number;
  category: 'technical' | 'dsa' | 'system-design' | 'behavioral';
  question: string;
  keyConcept: string;
  expectedAnswerPoints: string[];
}

export interface InterviewPrepPack {
  jobId: number;
  company: string;
  role: string;
  overallStrategy: string;
  technicalFocusAreas: string[];
  questions: InterviewQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: Number(jobId) } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if notes already has saved interview prep
    if (job.notes && job.notes.includes('"overallStrategy"')) {
      try {
        const existingPack = JSON.parse(job.notes);
        return NextResponse.json({ success: true, prepPack: existingPack });
      } catch {
        // Fallthrough to generate
      }
    }

    const prompt = `You are a Principal Engineer and Hiring Manager at ${job.company || 'a Tech Company'}. Generate an elite, highly realistic 10-question Technical Interview Preparation Pack for a candidate interviewing for the ${job.jobTitle || 'Software Engineer'} role.

CANDIDATE SKILLS:
${getSkillsSummary()}

JOB DETAILS:
Title: ${job.jobTitle}
Company: ${job.company}
Description:
${(job.jobDescription || '').substring(0, 1500)}

Generate JSON only in this exact schema:
{
  "company": "${job.company || 'Company'}",
  "role": "${job.jobTitle || 'Role'}",
  "overallStrategy": "2-sentence high-level advice on how to pass this specific company's interview process",
  "technicalFocusAreas": ["3 key technical topics candidate MUST review before interview"],
  "questions": [
    {
      "id": 1,
      "category": "technical",
      "question": "Realistic core technical question tailored to JD & MERN stack",
      "keyConcept": "Core technical concept being evaluated",
      "expectedAnswerPoints": ["Key point 1 to hit", "Key point 2 to hit", "Key point 3 to hit"]
    },
    {
      "id": 2,
      "category": "technical",
      "question": "Another technical question",
      "keyConcept": "Concept",
      "expectedAnswerPoints": ["Point 1", "Point 2"]
    },
    {
      "id": 3,
      "category": "technical",
      "question": "Technical question",
      "keyConcept": "Concept",
      "expectedAnswerPoints": ["Point 1", "Point 2"]
    },
    {
      "id": 4,
      "category": "dsa",
      "question": "Data structure / algorithmic coding question typical for this company",
      "keyConcept": "Algorithm pattern (e.g. Sliding Window, BFS, Hash Table)",
      "expectedAnswerPoints": ["Optimal time complexity", "Edge cases to discuss", "Approach explanation"]
    },
    {
      "id": 5,
      "category": "dsa",
      "question": "Another DSA coding problem",
      "keyConcept": "Pattern",
      "expectedAnswerPoints": ["Point 1", "Point 2"]
    },
    {
      "id": 6,
      "category": "system-design",
      "question": "System design / API architecture question relevant to job description",
      "keyConcept": "System design concept (e.g. WebSocket scaling, Redis caching, DB indexing)",
      "expectedAnswerPoints": ["Key architectural decision", "Tradeoffs", "Bottleneck mitigation"]
    },
    {
      "id": 7,
      "category": "system-design",
      "question": "System design question",
      "keyConcept": "Concept",
      "expectedAnswerPoints": ["Point 1", "Point 2"]
    },
    {
      "id": 8,
      "category": "behavioral",
      "question": "Behavioral / situational question tailored to company culture",
      "keyConcept": "Behavioral trait evaluated",
      "expectedAnswerPoints": ["STAR method outline", "Specific metric or impact to mention"]
    },
    {
      "id": 9,
      "category": "behavioral",
      "question": "Behavioral question",
      "keyConcept": "Trait",
      "expectedAnswerPoints": ["Point 1", "Point 2"]
    },
    {
      "id": 10,
      "category": "behavioral",
      "question": "Closing question to ask interviewer about company tech challenges",
      "keyConcept": "Demonstrating high technical curiosity",
      "expectedAnswerPoints": ["Insightful question to ask them"]
    }
  ]
}`;

    const response = await callAIQuality(prompt, { maxTokens: 2000, temperature: 0.2 });
    const prepPack = parseAIJson<InterviewPrepPack>(response);
    prepPack.jobId = job.id;

    // Save generated prep pack into job notes for persistence
    await prisma.job.update({
      where: { id: job.id },
      data: { notes: JSON.stringify(prepPack) },
    });

    return NextResponse.json({ success: true, prepPack });
  } catch (error) {
    console.error('[API] Interview Prep generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate interview prep pack' }, { status: 500 });
  }
}
