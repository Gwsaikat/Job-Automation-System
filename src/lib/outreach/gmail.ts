// ============================================
// Gmail Integration — Section 9 + 6.6
// OAuth2 flow + draft creation (NEVER auto-send)
// ============================================

import { google } from 'googleapis';
import prisma from '../db';
import { getConfig } from '../config';
import * as fs from 'fs';
import * as path from 'path';

// ---- OAuth2 Client Setup ----

function getOAuth2Client() {
  const config = getConfig();
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.googleRedirectUri
  );
}

// ---- Step 1: Generate authorization URL ----

export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
  });
}

// ---- Step 2: Exchange code for tokens ----

export async function exchangeCodeForTokens(code: string): Promise<void> {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  // Store refresh token securely in settings table
  if (tokens.refresh_token) {
    await prisma.settings.upsert({
      where: { key: 'gmail_refresh_token' },
      update: { value: tokens.refresh_token },
      create: { key: 'gmail_refresh_token', value: tokens.refresh_token },
    });
  }

  if (tokens.access_token) {
    await prisma.settings.upsert({
      where: { key: 'gmail_access_token' },
      update: { value: tokens.access_token },
      create: { key: 'gmail_access_token', value: tokens.access_token },
    });
  }

  // Store connected email
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: 'me' });
  if (profile.data.emailAddress) {
    await prisma.settings.upsert({
      where: { key: 'gmail_email' },
      update: { value: profile.data.emailAddress },
      create: { key: 'gmail_email', value: profile.data.emailAddress },
    });
  }
}

// ---- Get authenticated Gmail client ----

async function getGmailClient() {
  const oauth2Client = getOAuth2Client();

  const refreshToken = await prisma.settings.findUnique({
    where: { key: 'gmail_refresh_token' },
  });

  if (!refreshToken?.value) {
    throw new Error('Gmail not connected. Please connect via Settings page.');
  }

  oauth2Client.setCredentials({ refresh_token: refreshToken.value });

  // Refresh the access token
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials(credentials);

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// ---- Check if Gmail is connected ----

export async function isGmailConnected(): Promise<boolean> {
  try {
    const refreshToken = await prisma.settings.findUnique({
      where: { key: 'gmail_refresh_token' },
    });
    return !!refreshToken?.value;
  } catch {
    return false;
  }
}

// ---- Create Gmail Draft (Section 6.6 — NEVER auto-send) ----

function createRawEmail(
  to: string,
  subject: string,
  body: string,
  attachmentPath?: string
): string {
  const boundary = `boundary_${Date.now()}`;

  let email = '';

  if (attachmentPath && fs.existsSync(attachmentPath)) {
    const filename = path.basename(attachmentPath);
    const fileContent = fs.readFileSync(attachmentPath).toString('base64');
    const mimeType = filename.endsWith('.pdf')
      ? 'application/pdf'
      : 'application/octet-stream';

    email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      body,
      '',
      `--${boundary}`,
      `Content-Type: ${mimeType}; name="${filename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${filename}"`,
      '',
      fileContent,
      `--${boundary}--`,
    ].join('\r\n');
  } else {
    email = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      body,
    ].join('\r\n');
  }

  // Encode to base64url
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function createDraft(
  to: string,
  subject: string,
  body: string,
  attachmentPath?: string
): Promise<string> {
  const gmail = await getGmailClient();

  const raw = createRawEmail(to, subject, body, attachmentPath);

  const result = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw },
    },
  });

  return result.data.id || '';
}

// ---- Send email to self (for digest/reports) ----

export async function sendToSelf(subject: string, body: string): Promise<void> {
  const gmail = await getGmailClient();

  const emailSetting = await prisma.settings.findUnique({
    where: { key: 'gmail_email' },
  });
  const userEmail = emailSetting?.value || 'me';

  const raw = createRawEmail(userEmail, subject, body);

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
}
