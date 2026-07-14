// ============================================
// Cover Letter — Section 5.7
// Only generated if the JD explicitly asks for one
// Under 180 words, ATS-friendly, first person
// ============================================

import * as fs from 'fs';
import * as path from 'path';
import { callAIStandard } from '../ai';
import { MASTER_RESUME_TEXT } from './template';
import { getConfig } from '../config';

const COVER_LETTER_TRIGGERS = [
  'cover letter',
  'covering letter',
  'letter of interest',
  'motivation letter',
  'cover note',
];

export function requiresCoverLetter(jobDescription: string): boolean {
  const lower = jobDescription.toLowerCase();
  return COVER_LETTER_TRIGGERS.some((trigger) => lower.includes(trigger));
}

export async function generateCoverLetter(
  jobTitle: string,
  company: string,
  jobDescription: string
): Promise<string | null> {
  if (!requiresCoverLetter(jobDescription)) {
    return null;
  }

  const prompt = `Write a professional cover letter for this job application.

CANDIDATE RESUME:
${MASTER_RESUME_TEXT}

JOB TITLE: ${jobTitle}
COMPANY: ${company}
JOB DESCRIPTION:
${jobDescription}

RULES:
1. MAXIMUM 180 words — be concise and impactful
2. Write in first person
3. ATS-friendly formatting (no fancy formatting, plain text)
4. Reference specific projects/skills from the resume that match the JD
5. Sound human and genuine, not robotic or generic
6. Do NOT include any skills or experience not in the resume
7. End with a clear call to action

Write the cover letter now:`;

  const response = await callAIStandard(prompt, {
    maxTokens: 400,
    temperature: 0.4,
  });

  return response;
}

export async function saveCoverLetter(
  coverLetterText: string,
  jobId: number | string
): Promise<string> {
  const config = getConfig();
  const dir = path.resolve(config.storagePath, 'cover-letters');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = `cover_letter_${jobId}_${Date.now()}.txt`;
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, coverLetterText, 'utf-8');

  return filePath;
}
