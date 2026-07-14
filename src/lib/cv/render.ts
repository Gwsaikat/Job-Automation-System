// ============================================
// CV PDF Rendering — Section 5.5
// Puppeteer HTML→PDF at A4 size with 1-page enforcement
// ============================================

import puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { getConfig } from '../config';

const execAsync = promisify(exec);

// Dynamically import pdf-parse (it's a CJS module)
async function getPdfPageCount(pdfBuffer: Buffer): Promise<number> {
  const pdfParse = (await import('pdf-parse')).default;
  const data = await pdfParse(pdfBuffer);
  return data.numpages;
}

interface RenderResult {
  pdfPath: string;
  pageCount: number;
  wasAutoShrunk: boolean;
}

/**
 * Renders HTML to a one-page A4 PDF.
 * If the result is >1 page, automatically reduces font-size/margins
 * and re-renders up to 2 times. Falls back to master CV if still >1 page.
 */
export async function renderCVtoPDF(
  html: string,
  jobId: number | string,
  masterHtml: string
): Promise<RenderResult> {
  const config = getConfig();
  const storageDir = path.resolve(config.storagePath, 'cvs');

  // Ensure storage directory exists
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const filename = `cv_${jobId}_${Date.now()}.pdf`;
  const pdfPath = path.join(storageDir, filename);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // CSS adjustments for shrinking if needed
    const shrinkCSS = [
      '', // Attempt 0: no changes
      `<style>body { font-size: 9.5px !important; } .resume { padding: 10mm 12mm !important; } .section { margin-bottom: 3px !important; } .entry { margin-bottom: 3px !important; } .entry li { margin-bottom: 0 !important; }</style>`,
      `<style>body { font-size: 9px !important; } .resume { padding: 8mm 10mm !important; } .section { margin-bottom: 2px !important; } .entry { margin-bottom: 2px !important; } .entry li { margin-bottom: 0 !important; } .header { margin-bottom: 4px !important; } .section-title { margin-bottom: 2px !important; }</style>`,
    ];

    let finalPageCount = 0;
    let wasAutoShrunk = false;

    for (let attempt = 0; attempt < shrinkCSS.length; attempt++) {
      const modifiedHtml = html.replace('</head>', `${shrinkCSS[attempt]}</head>`);

      await page.setContent(modifiedHtml, { waitUntil: 'domcontentloaded' });

      const pdfBuffer = await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });

      // Count pages
      const buffer = Buffer.from(pdfBuffer);
      finalPageCount = await getPdfPageCount(buffer);

      if (finalPageCount <= 1) {
        if (attempt > 0) wasAutoShrunk = true;
        return { pdfPath, pageCount: finalPageCount, wasAutoShrunk };
      }

      console.warn(
        `[CV] Attempt ${attempt + 1}: PDF has ${finalPageCount} pages, trying shrink...`
      );
    }

    // All attempts failed — fall back to master CV (already verified to be 1 page)
    console.warn(
      `[CV] Could not fit tailored CV to 1 page after ${shrinkCSS.length} attempts. Falling back to master CV.`
    );

    await page.setContent(masterHtml, { waitUntil: 'domcontentloaded' });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    return { pdfPath, pageCount: 1, wasAutoShrunk: false };
  } finally {
    await browser.close();
  }
}

/**
 * Renders LaTeX to a PDF using local pdflatex.
 * If >1 page, falls back to master LaTeX.
 */
export async function renderLatexToPDF(
  latex: string,
  jobId: number | string,
  masterLatex: string
): Promise<RenderResult> {
  const config = getConfig();
  const storageDir = path.resolve(config.storagePath, 'cvs');

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  const baseName = `cv_${jobId}_${Date.now()}`;
  const pdfPath = path.join(storageDir, `${baseName}.pdf`);
  const texPath = path.join(storageDir, `${baseName}.tex`);

  // Write tailored latex
  fs.writeFileSync(texPath, latex, 'utf8');

  try {
    // Run pdflatex (non-interactive)
    await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${storageDir}" "${texPath}"`);
    
    let pdfBuffer = fs.readFileSync(pdfPath);
    let finalPageCount = await getPdfPageCount(pdfBuffer);

    if (finalPageCount > 1) {
      console.warn(`[CV] Tailored LaTeX PDF has ${finalPageCount} pages. Falling back to master LaTeX.`);
      fs.writeFileSync(texPath, masterLatex, 'utf8');
      await execAsync(`pdflatex -interaction=nonstopmode -output-directory="${storageDir}" "${texPath}"`);
      pdfBuffer = fs.readFileSync(pdfPath);
      finalPageCount = await getPdfPageCount(pdfBuffer);
    }

    return { pdfPath, pageCount: finalPageCount, wasAutoShrunk: false };
  } catch (error) {
    console.error('[CV] LaTeX compilation failed:', error);
    throw error;
  } finally {
    // Cleanup temp files generated by pdflatex
    const exts = ['.tex', '.aux', '.log', '.out'];
    for (const ext of exts) {
      const p = path.join(storageDir, `${baseName}${ext}`);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  }
}
