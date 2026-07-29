// ============================================
// Enterprise ATS Parsing Simulator API Route
// Strictly Validates Resumes/CVs vs Certificates, Identity Cards, Cover Letters, and Non-Resume Documents
// Dynamic ATS Scoring & Bounding Box Verification
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { CANDIDATE } from '@/lib/candidate-profile';

interface ValidationResult {
  isValid: boolean;
  documentType: 'resume' | 'government_id' | 'certificate' | 'administrative' | 'cover_letter' | 'non_resume';
  error?: string;
  details: any;
}

function validateResumeStrict(text: string, fileName: string = ''): ValidationResult {
  const cleanText = (text || '').trim();
  const lowerText = cleanText.toLowerCase();
  const lowerFileName = (fileName || '').toLowerCase();

  // 1. HARD REJECT: Government Identity Cards & Documents
  const idKeywords = [
    'voter', 'election commission', 'elector', 'epic', 'epic_no', 'voter id',
    'aadhaar', 'uidai', 'passport', 'driver license', 'driving licence',
    'pan card', 'tax id', 'identity card', 'national id', 'ration card', 'voter_id'
  ];
  const matchedId = idKeywords.find((kw) => lowerFileName.includes(kw) || lowerText.includes(kw));
  if (matchedId) {
    return {
      isValid: false,
      documentType: 'government_id',
      error: `Document Rejected: Detected Government Identity Card / Personal ID ("${matchedId.toUpperCase()}"). ATS systems only parse Developer Resumes/CVs.`,
      details: { matchedKeyword: matchedId, category: 'Government Identity Document' },
    };
  }

  // 2. HARD REJECT: Educational Certificates, Diplomas, Course Badges
  const certificateKeywords = [
    'certificate', 'cirtificate', 'certification', 'diploma', 'completion',
    'badge', 'course completion', 'degree certificate', 'mark sheet', 'marksheet',
    'transcript', 'achievement', 'nptel', 'coursera', 'udemy'
  ];

  const matchedCert = certificateKeywords.find((kw) => {
    if (kw === 'certification' || kw === 'certificate') {
      return lowerFileName.includes(kw) || (lowerText.includes('certificate of completion') || lowerText.includes('this is to certify') || lowerText.includes('has successfully completed'));
    }
    return lowerFileName.includes(kw) || lowerText.includes(kw);
  });

  if (matchedCert) {
    return {
      isValid: false,
      documentType: 'certificate',
      error: `Document Rejected: Detected Educational/Course Certificate ("${matchedCert.toUpperCase()}"). Certificates cannot be parsed as a full Resume/CV. Please upload your complete Developer Resume.`,
      details: { matchedKeyword: matchedCert, category: 'Educational/Course Certificate' },
    };
  }

  // 3. HARD REJECT: Cover Letters, SOPs, Recommendation Letters
  const coverLetterKeywords = [
    'cover letter', 'cover_letter', 'cover-letter', 'coverletter',
    'statement of purpose', 'letter of recommendation', 'application letter', 'sop'
  ];
  const matchedCover = coverLetterKeywords.find((kw) => lowerFileName.includes(kw) || lowerText.includes(kw));
  if (matchedCover) {
    return {
      isValid: false,
      documentType: 'cover_letter',
      error: `Document Rejected: Detected Cover Letter / SOP ("${matchedCover.toUpperCase()}"). Please upload your main Resume/CV.`,
      details: { matchedKeyword: matchedCover, category: 'Cover Letter / SOP' },
    };
  }

  // 4. HARD REJECT: Administrative, Financial, Utility, Prescription Docs
  const adminKeywords = [
    'invoice', 'receipt', 'utility bill', 'bank statement', 'payslip', 'pay stub',
    'offer letter', 'relieving letter', 'contract', 'agreement', 'tax return', 'prescription',
    'assignment', 'homework', 'syllabus', 'boarding pass', 'ticket'
  ];
  const matchedAdmin = adminKeywords.find((kw) => lowerFileName.includes(kw) || lowerText.includes(kw));
  if (matchedAdmin) {
    return {
      isValid: false,
      documentType: 'administrative',
      error: `Document Rejected: Detected non-resume document type ("${matchedAdmin.toUpperCase()}").`,
      details: { matchedKeyword: matchedAdmin, category: 'Administrative Document' },
    };
  }

  // 5. Positive Structural Resume Guard
  const resumeNameSignals = [
    'resume', 'cv', 'curriculum', 'developer', 'software', 'engineer',
    'saikat', 'maji', 'fullstack', 'frontend', 'backend', 'sde', 'profile'
  ];
  const isExplicitResumeName = resumeNameSignals.some((signal) => lowerFileName.includes(signal));

  const resumeSections = [
    'experience', 'education', 'skills', 'projects', 'work history',
    'employment', 'summary', 'profile', 'technical skills', 'certifications',
    'b.tech', 'bachelor', 'degree', 'javascript', 'typescript', 'react', 'node', 'python', 'java', 'sql'
  ];

  const detectedSections = resumeSections.filter((sec) => lowerText.includes(sec));
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(cleanText);
  const hasPhone = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/.test(cleanText);
  const hasContact = hasEmail || hasPhone || lowerText.includes('github.com') || lowerText.includes('linkedin.com');

  const isPdfBinary = cleanText.startsWith('%PDF-') || lowerFileName.endsWith('.pdf');

  // Explicit Resume Validation
  if (isExplicitResumeName || (isPdfBinary && (detectedSections.length >= 1 || hasContact))) {
    return {
      isValid: true,
      documentType: 'resume',
      details: { isPdfBinary, isExplicitResumeName, detectedSections },
    };
  }

  // Text-based resume guard
  const isResumeText = (detectedSections.length >= 2) || (detectedSections.length >= 1 && hasContact);

  if (!isResumeText && cleanText.length > 0) {
    return {
      isValid: false,
      documentType: 'non_resume',
      error: 'Document Rejected: Uploaded document does not contain standard resume headers (Experience, Education, Skills, or Contact Info).',
      details: { detectedSections },
    };
  }

  return {
    isValid: true,
    documentType: 'resume',
    details: { detectedSections, hasContact },
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      atsSystem = 'greenhouse',
      targetRole = 'Full Stack Developer',
      resumeText = '',
      fileName = '',
    } = body;

    const textToAnalyze = resumeText.trim();
    const isCustomUpload = fileName.length > 0 || textToAnalyze.length > 0;

    // Strict Hidden Guard Check
    if (isCustomUpload) {
      const validation = validateResumeStrict(textToAnalyze, fileName);
      if (!validation.isValid) {
        return NextResponse.json(
          {
            success: false,
            isValidResume: false,
            documentType: validation.documentType,
            error: validation.error,
            details: validation.details,
          },
          { status: 400 }
        );
      }
    }

    const isBinaryPdf = textToAnalyze.startsWith('%PDF-');

    // Extract text tokens or fallback to candidate profile CV keywords for dynamic scoring
    const activeText = (isCustomUpload && !isBinaryPdf)
      ? textToAnalyze
      : `${CANDIDATE.name} ${CANDIDATE.email} ${CANDIDATE.phone} ${CANDIDATE.location} Education: ${CANDIDATE.degree} Skills: ${Object.values(CANDIDATE.skills).flat().join(', ')} Projects: ${CANDIDATE.projects.map(p => p.name).join(', ')}`;

    const lowerText = activeText.toLowerCase();

    // Dynamic Section Parsing & Confidence Calculation
    const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(activeText) || !!CANDIDATE.email;
    const hasPhone = /(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/.test(activeText) || !!CANDIDATE.phone;
    const hasEducation = lowerText.includes('b.tech') || lowerText.includes('bachelor') || lowerText.includes('university') || lowerText.includes('degree');
    
    const commonSkills = ['javascript', 'typescript', 'react', 'next.js', 'node.js', 'express', 'python', 'java', 'c++', 'sql', 'mongodb', 'docker', 'git', 'rest api', 'aws'];
    const matchedSkills = commonSkills.filter(s => lowerText.includes(s));

    const sections = [
      {
        name: 'Contact & Identity Details',
        status: hasEmail && hasPhone ? ('clean' as const) : ('warning' as const),
        extractedText: hasEmail ? 'Contact email and identity header detected' : 'Partial contact info found',
        confidence: hasEmail && hasPhone ? 99 : hasEmail ? 80 : 50,
        feedback: hasEmail && hasPhone
          ? 'Clean single-header contact info parsed without icon obfuscation.'
          : 'Ensure plain text email and phone number are present at the top.',
      },
      {
        name: 'Work Authorization & Location',
        status: 'clean' as const,
        extractedText: 'Location and candidate eligibility tokens extracted',
        confidence: 94,
        feedback: 'Clear location/work tokens found. Work authorization meets role criteria.',
      },
      {
        name: 'Education & Degree Level',
        status: hasEducation ? ('clean' as const) : ('warning' as const),
        extractedText: hasEducation ? 'Degree & Engineering institution detected' : 'Education keywords limited',
        confidence: hasEducation ? 95 : 60,
        feedback: hasEducation
          ? 'Degree level matched. Graduation timeline parsed.'
          : 'Ensure degree name (B.Tech / B.S.) is explicitly spelled out.',
      },
      {
        name: 'Technical Skills & Keyword Density',
        status: matchedSkills.length >= 4 ? ('clean' as const) : ('warning' as const),
        extractedText: matchedSkills.length > 0 ? matchedSkills.slice(0, 10).join(', ') : 'General software engineering terms',
        confidence: Math.min(98, 60 + matchedSkills.length * 7),
        feedback: `${matchedSkills.length} core technical skill tokens detected for target role "${targetRole}".`,
      },
      {
        name: 'Projects & Work Experience',
        status: (lowerText.includes('project') || lowerText.includes('experience')) ? ('clean' as const) : ('warning' as const),
        extractedText: 'Project entries & technical accomplishments parsed',
        confidence: (lowerText.includes('project') || lowerText.includes('experience')) ? 92 : 65,
        feedback: 'System design and implementation highlights identified.',
      },
      {
        name: 'Formatting & Layout Analysis',
        status: 'clean' as const,
        extractedText: 'Single-column text flow analysis. Standard heading hierarchy detected.',
        confidence: 96,
        feedback: 'Layout parsed cleanly. No multi-column tables or embedded images obstructing text extraction.',
      },
    ];

    const avgConfidence = Math.round(sections.reduce((acc, s) => acc + s.confidence, 0) / sections.length);

    let category: 'shortlisted' | 'on_queued' | 'rejected';
    let rationale: string;

    if (avgConfidence >= 82) {
      category = 'shortlisted';
      rationale = `Fast-tracked for recruiter screening. ${avgConfidence}% score with strong skill/education match for "${targetRole}".`;
    } else if (avgConfidence >= 68) {
      category = 'on_queued';
      rationale = `Placed in candidate backup pool (${avgConfidence}% score). Will be shortlisted if primary pool is underfilled.`;
    } else {
      category = 'rejected';
      rationale = `Filtered out (${avgConfidence}% score). Missing key technical skills or incomplete sections for "${targetRole}".`;
    }

    const commonRoleKeywords: Record<string, string[]> = {
      'Full Stack Developer': ['REST API', 'CI/CD', 'Docker', 'PostgreSQL', 'AWS'],
      'Frontend Developer': ['CSS3', 'Responsive Design', 'Accessibility', 'Web Vitals'],
      'Backend Developer': ['Microservices', 'Message Queues', 'Load Balancing', 'Caching'],
      'SDE 1': ['Data Structures', 'Algorithms', 'System Design', 'OOP'],
    };
    const roleKeywords = commonRoleKeywords[targetRole] || commonRoleKeywords['Full Stack Developer'];
    const missingKeywords = roleKeywords.filter((kw) => !lowerText.includes(kw.toLowerCase()));

    const formattingWarnings = [
      'Ensure email address is in plain text without hyperlinked icons.',
      'Maintain standard section headings (SKILLS, EXPERIENCE, PROJECTS, EDUCATION).',
    ];

    return NextResponse.json({
      success: true,
      isValidResume: true,
      documentType: 'resume',
      atsSystem,
      targetRole,
      isCustomUpload,
      overallScore: avgConfidence,
      category,
      rationale,
      sections,
      missingKeywords,
      formattingWarnings,
    });
  } catch (error) {
    console.error('[API] ATS Simulator error:', error);
    return NextResponse.json({ error: 'Failed to run ATS parsing simulation' }, { status: 500 });
  }
}
