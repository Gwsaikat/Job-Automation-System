// ============================================
// Playwright Auto-Apply Engine
// Targets security-less, public ATS portals:
// - Greenhouse (boards.greenhouse.io)
// - Lever (jobs.lever.co)
// - Ashby (jobs.ashbyhq.com)
// - Workable (jobs.workable.com)
// Safe, automated form filling & CV attachment
// ============================================

import { chromium, BrowserContext, Page } from 'playwright';
import prisma from '../db';
import { CANDIDATE } from '../candidate-profile';
import path from 'path';
import fs from 'fs';

export interface AutoApplyResult {
  success: boolean;
  jobId: number;
  atsType: 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'generic' | 'unsupported';
  message: string;
  screenshotPath?: string;
}

export interface AutoApplyOptions {
  headless?: boolean;
  dryRun?: boolean; // if true, fills form & takes screenshot without clicking final submit
}

// ---- ATS Detection ----

export function detectATSType(url: string): 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'generic' {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('greenhouse.io')) return 'greenhouse';
  if (lowerUrl.includes('lever.co')) return 'lever';
  if (lowerUrl.includes('ashbyhq.com')) return 'ashby';
  if (lowerUrl.includes('workable.com')) return 'workable';
  return 'generic';
}

// ---- Main Auto-Apply Handler ----

export async function runAutoApply(jobId: number, options: AutoApplyOptions = {}): Promise<AutoApplyResult> {
  const { headless = true, dryRun = false } = options;

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || !job.jobUrl) {
    return { success: false, jobId, atsType: 'unsupported', message: 'Job or jobUrl not found' };
  }

  const atsType = detectATSType(job.jobUrl);
  console.log(`[Auto-Apply] Starting browser automation for Job #${jobId} (${job.company} - ${job.jobTitle}) on ${atsType.toUpperCase()}...`);

  // Ensure CV PDF exists
  let cvPath = job.cvPdfPath;
  if (!cvPath || !fs.existsSync(cvPath)) {
    // Check if master PDF or fallback is available
    const fallbackPath = path.resolve(process.cwd(), 'storage/cvs/master_cv.pdf');
    if (fs.existsSync(fallbackPath)) {
      cvPath = fallbackPath;
    } else {
      cvPath = null;
    }
  }

  let browserContext: BrowserContext | null = null;
  try {
    const browser = await chromium.launch({
      headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    browserContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await browserContext.newPage();
    page.setDefaultTimeout(20000);

    console.log(`[Auto-Apply] Navigating to ${job.jobUrl}...`);
    await page.goto(job.jobUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    let filled = false;

    if (atsType === 'greenhouse') {
      filled = await fillGreenhouseForm(page, cvPath);
    } else if (atsType === 'lever') {
      filled = await fillLeverForm(page, cvPath);
    } else if (atsType === 'ashby') {
      filled = await fillAshbyForm(page, cvPath);
    } else {
      filled = await fillGenericForm(page, cvPath);
    }

    if (!filled) {
      await browser.close();
      return { success: false, jobId, atsType, message: `Could not auto-fill ${atsType} form fields` };
    }

    // Screenshot evidence
    const screenshotsDir = path.resolve(process.cwd(), 'storage/screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotsDir, `apply_${jobId}_${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    let finalMessage = 'Form auto-filled successfully';

    if (!dryRun) {
      // Submit form
      const submitted = await submitForm(page, atsType);
      if (submitted) {
        finalMessage = 'Form auto-filled and submitted successfully!';
        await prisma.job.update({
          where: { id: jobId },
          data: {
            applicationStatus: 'Applied',
            processingError: null,
            processedAt: new Date().toISOString(),
            notes: `[Auto-Apply] Submitted on ${new Date().toLocaleDateString()}`,
          },
        });
      } else {
        finalMessage = 'Form filled but submission required manual click (dry run / custom captcha)';
        await prisma.job.update({
          where: { id: jobId },
          data: {
            applicationStatus: 'Draft Ready',
            notes: `[Auto-Apply] Form pre-filled, review required`,
          },
        });
      }
    } else {
      finalMessage = '[Dry Run] Form filled successfully, preview screenshot saved';
    }

    await browser.close();

    return {
      success: true,
      jobId,
      atsType,
      message: finalMessage,
      screenshotPath,
    };
  } catch (error) {
    if (browserContext) {
      await browserContext.browser()?.close().catch(() => {});
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Auto-Apply] Automation failed for Job #${jobId}:`, message);
    return { success: false, jobId, atsType, message: `Browser automation error: ${message}` };
  }
}

// ---- Greenhouse Auto-Fill ----

async function fillGreenhouseForm(page: Page, cvPath: string | null): Promise<boolean> {
  try {
    // Fill First Name
    const firstNameInput = await page.$('input[id*="first_name"], input[name*="first_name"]');
    if (firstNameInput) await firstNameInput.fill('Saikat');

    // Fill Last Name
    const lastNameInput = await page.$('input[id*="last_name"], input[name*="last_name"]');
    if (lastNameInput) await lastNameInput.fill('Maji');

    // Full Name fallback
    const nameInput = await page.$('input[id*="name"]:not([id*="first"]):not([id*="last"])');
    if (nameInput) await nameInput.fill(CANDIDATE.name);

    // Email
    const emailInput = await page.$('input[id*="email"], input[type="email"]');
    if (emailInput) await emailInput.fill(CANDIDATE.email);

    // Phone
    const phoneInput = await page.$('input[id*="phone"], input[type="tel"]');
    if (phoneInput) await phoneInput.fill(CANDIDATE.phone);

    // Resume Attachment
    if (cvPath && fs.existsSync(cvPath)) {
      const fileInput = await page.$('input[type="file"][id*="resume"], input[type="file"][name*="resume"], input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(cvPath);
        console.log(`[Auto-Apply] Attached CV: ${cvPath}`);
      }
    }

    // LinkedIn
    const linkedinInput = await page.$('input[id*="linkedin"], input[name*="linkedin"], input[autocomplete*="linkedin"]');
    if (linkedinInput) await linkedinInput.fill(`https://${CANDIDATE.linkedin}`);

    // GitHub
    const githubInput = await page.$('input[id*="github"], input[name*="github"]');
    if (githubInput) await githubInput.fill(`https://${CANDIDATE.github}`);

    // Website / Portfolio
    const websiteInput = await page.$('input[id*="website"], input[name*="website"], input[id*="portfolio"]');
    if (websiteInput) await websiteInput.fill('https://client-one-bay-37.vercel.app/');

    return true;
  } catch (err) {
    console.warn('[Auto-Apply] Greenhouse fill error:', err);
    return false;
  }
}

// ---- Lever Auto-Fill ----

async function fillLeverForm(page: Page, cvPath: string | null): Promise<boolean> {
  try {
    // Lever usually has a "Apply for this job" button first
    const applyButton = await page.$('a[href*="apply"], button:has-text("Apply")');
    if (applyButton) {
      await applyButton.click().catch(() => {});
      await page.waitForTimeout(1500);
    }

    // Full Name
    const nameInput = await page.$('input[name="name"]');
    if (nameInput) await nameInput.fill(CANDIDATE.name);

    // Email
    const emailInput = await page.$('input[name="email"]');
    if (emailInput) await emailInput.fill(CANDIDATE.email);

    // Phone
    const phoneInput = await page.$('input[name="phone"]');
    if (phoneInput) await phoneInput.fill(CANDIDATE.phone);

    // Current Location
    const locationInput = await page.$('input[name="location"], input[id*="location"]');
    if (locationInput) await locationInput.fill(CANDIDATE.location);

    // Resume Attachment
    if (cvPath && fs.existsSync(cvPath)) {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.setInputFiles(cvPath);
      }
    }

    // Social Links
    const linkedinInput = await page.$('input[name*="urls[LinkedIn]"], input[name*="linkedin"]');
    if (linkedinInput) await linkedinInput.fill(`https://${CANDIDATE.linkedin}`);

    const githubInput = await page.$('input[name*="urls[GitHub]"], input[name*="github"]');
    if (githubInput) await githubInput.fill(`https://${CANDIDATE.github}`);

    const portfolioInput = await page.$('input[name*="urls[Portfolio]"], input[name*="portfolio"]');
    if (portfolioInput) await portfolioInput.fill('https://client-one-bay-37.vercel.app/');

    return true;
  } catch (err) {
    console.warn('[Auto-Apply] Lever fill error:', err);
    return false;
  }
}

// ---- Ashby Auto-Fill ----

async function fillAshbyForm(page: Page, cvPath: string | null): Promise<boolean> {
  try {
    // Name
    const nameInput = await page.$('input[name="name"], input[placeholder*="Name"]');
    if (nameInput) await nameInput.fill(CANDIDATE.name);

    // Email
    const emailInput = await page.$('input[name="email"], input[type="email"]');
    if (emailInput) await emailInput.fill(CANDIDATE.email);

    // Phone
    const phoneInput = await page.$('input[name="phone"], input[type="tel"]');
    if (phoneInput) await phoneInput.fill(CANDIDATE.phone);

    // Resume
    if (cvPath && fs.existsSync(cvPath)) {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) await fileInput.setInputFiles(cvPath);
    }

    return true;
  } catch (err) {
    console.warn('[Auto-Apply] Ashby fill error:', err);
    return false;
  }
}

// ---- Generic Form Auto-Fill ----

async function fillGenericForm(page: Page, cvPath: string | null): Promise<boolean> {
  try {
    // Fill text inputs by common attributes
    const nameInput = await page.$('input[name*="name"], input[placeholder*="Name"]');
    if (nameInput) await nameInput.fill(CANDIDATE.name);

    const emailInput = await page.$('input[type="email"], input[name*="email"]');
    if (emailInput) await emailInput.fill(CANDIDATE.email);

    const phoneInput = await page.$('input[type="tel"], input[name*="phone"]');
    if (phoneInput) await phoneInput.fill(CANDIDATE.phone);

    if (cvPath && fs.existsSync(cvPath)) {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) await fileInput.setInputFiles(cvPath);
    }

    return true;
  } catch (err) {
    return false;
  }
}

// ---- Form Submission ----

async function submitForm(page: Page, atsType: string): Promise<boolean> {
  try {
    let submitBtn = null;
    if (atsType === 'greenhouse') {
      submitBtn = await page.$('input[type="submit"][id="submit_app"], button#submit_app, input[type="submit"]');
    } else if (atsType === 'lever') {
      submitBtn = await page.$('button[type="submit"], button#btn-submit');
    } else {
      submitBtn = await page.$('button[type="submit"], input[type="submit"]');
    }

    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
