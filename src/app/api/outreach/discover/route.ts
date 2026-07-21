// ============================================
// v2.0 API: Contact Discovery for a specific job
// POST /api/outreach/discover { jobId }
// ============================================

import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { discoverContacts } from '@/lib/outreach/contact-discovery';

export async function POST(request: Request) {
  try {
    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: 'jobId required' }, { status: 400 });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const result = await discoverContacts(
      job.company || 'Unknown',
      job.jobTitle || 'Software Engineer',
      job.jobUrl || '',
    );

    // Pick primary contact
    const primaryContact = result.contacts[0] || null;

    // Update job record
    await prisma.job.update({
      where: { id: jobId },
      data: {
        hrName: primaryContact?.name || null,
        hrEmail: primaryContact?.email || null,
        hrTitle: primaryContact?.title || null,
        contactSource: primaryContact?.source || null,
        contactConfidence: primaryContact?.confidence || null,
        linkedinContactUrl: primaryContact?.linkedinUrl || null,
        linkedinPeopleSearch: result.fallbackLinks.linkedinPeopleSearch,
        linkedinCompanyPage: result.fallbackLinks.linkedinCompanyPage,
        googleLinkedinSearch: result.fallbackLinks.googleLinkedinSearch,
        companyDomain: result.companyDomain,
      },
    });

    return NextResponse.json({
      success: true,
      contacts: result.contacts,
      companyDomain: result.companyDomain,
      emailPattern: result.emailPattern,
      fallbackLinks: result.fallbackLinks,
      discoveryLog: result.discoveryLog,
    });
  } catch (error) {
    console.error('[API] Contact discovery error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Discovery failed' },
      { status: 500 },
    );
  }
}
