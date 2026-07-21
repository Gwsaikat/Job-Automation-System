// ============================================
// Career OS — Salary & Offer Negotiation Script Generator
// High-leverage compensation counter-offer scripts & geographic pushback strategies
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { callAIPsychological, parseAIJson } from '@/lib/ai';

export interface NegotiationResult {
  company: string;
  role: string;
  offeredSalary: string;
  counterOfferTarget: string;
  counterEmailSubject: string;
  counterEmailBody: string;
  phoneTalkingPoints: string[];
  geoDiscountPushbackScript?: string;
  equityBonusStrategy: string;
}

export async function POST(request: NextRequest) {
  try {
    const { company, role, offeredSalary, targetSalary, currency, location, isRemote } = await request.json();

    if (!company || !role || !offeredSalary) {
      return NextResponse.json({ error: 'company, role, and offeredSalary are required' }, { status: 400 });
    }

    const prompt = `You are a Principal Software Engineer and Negotiation Coach. Draft a high-leverage, extremely professional salary counter-offer negotiation pack.

DETAILS:
Company: ${company}
Role: ${role}
Offered Salary: ${offeredSalary}
Target Desired Salary: ${targetSalary || '25% higher than offered'}
Currency: ${currency || '₹ / INR / USD'}
Location: ${location || 'Kolkata / Remote'}
Is Remote Job: ${isRemote ? 'Yes' : 'No'}

CANDIDATE STRENGTHS TO LEVERAGE:
- Production MERN & TypeScript experience
- Real-time systems (WebSocket/Redis) & AI (LangChain/RAG) integration expertise
- Proven ability to deliver full-stack systems independently

Generate JSON only:
{
  "company": "${company}",
  "role": "${role}",
  "offeredSalary": "${offeredSalary}",
  "counterOfferTarget": "Recommended counter offer number",
  "counterEmailSubject": "Professional subject line for counter offer",
  "counterEmailBody": "Complete, polite, highly persuasive counter-offer email body leveraging candidate market value without sounding aggressive",
  "phoneTalkingPoints": ["Bullet 1 for verbal negotiation call", "Bullet 2 for verbal negotiation call", "Bullet 3"],
  "geoDiscountPushbackScript": "Script pushing back if company offers location-based discount for remote work",
  "equityBonusStrategy": "Advice on asking for joining bonus, performance review timeline, or tech allowance"
}`;

    const response = await callAIPsychological(prompt, { maxTokens: 1200, temperature: 0.3 });
    const result = parseAIJson<NegotiationResult>(response);

    return NextResponse.json({ success: true, negotiation: result });
  } catch (error) {
    console.error('[API] Negotiation script generation failed:', error);
    return NextResponse.json({ error: 'Failed to generate negotiation scripts' }, { status: 500 });
  }
}
