# BUILD PROMPT — Saikat's Job Application Automation System (Web App)

**Paste this entire document into Google Antigravity / GPT Codex / your AI coding tool as the build instruction. It is written to be read and executed literally, section by section, in order.**

---

## 0. CONTEXT FOR THE BUILDING AI

You are building a **local, single-user, self-hosted web application** for a final-year Computer Science student (graduating May 2026) who is job hunting. This replaces an earlier n8n (visual workflow tool) implementation that was abandoned because of platform-specific bugs (silent body-field corruption, an expression parser that truncated strings at the wrong closing brace, rate-limit handling that didn't work as documented). **None of those bugs are relevant here** — they were caused by n8n's own UI/expression engine, not by the underlying logic. Implement the logic directly in code, test it, and it will work.

**Non-negotiable build principle:** After building each module, write a small test/script that actually runs it end-to-end with real (or realistic dummy) data and confirms the output before moving to the next module. Do not hand back untested code.

---

## 1. TECH STACK (use exactly this — do not substitute)

| Layer | Choice | Why |
|---|---|---|
| Frontend + API routes | **Next.js 14+ (App Router), TypeScript** | Matches the user's own skill set (React/Next.js/TypeScript), one framework for UI + backend |
| Styling | **Tailwind CSS + shadcn/ui** | Fast to build, looks professional out of the box, dark mode support |
| Charts | **Recharts** | For the dashboard stats (applications over time, ATS score distribution, source breakdown) |
| Background worker | **Separate plain Node.js process (TypeScript), using `node-cron`** | Scheduled jobs must NOT depend on a browser tab being open or a serverless function timing out. This process runs independently, writes to the same database, and the Next.js app just reads/displays. |
| Database | **SQLite via `better-sqlite3` (or Prisma with SQLite provider)** | Zero-config, file-based, no separate DB server to install, plenty fast for single-user scale, fully queryable for the dashboard |
| PDF generation for CVs | **Puppeteer (HTML + CSS → PDF)** — see Section 5 for why this replaces LaTeX | Removes a real external dependency (a third-party LaTeX-compilation API) that could go down and silently break every CV. Puppeteer runs 100% locally. |
| Job queue / retry logic | Plain async/await with a custom `withRetry()` helper (Section 8) | No need for a heavy queue library at this scale |
| Email (Gmail) | **`googleapis` npm package, OAuth2 client** | Official Google library, well documented |
| Scheduling | `node-cron` inside the worker process | Simple, in-process, reliable |

Do not introduce Python, Docker, or any external hosted service unless explicitly listed in this document.

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌─────────────────────────────┐        ┌──────────────────────────────┐
│   Next.js Web App (UI)      │◄──────►│   SQLite Database (file)      │
│   - Dashboard               │  reads │   - jobs                      │
│   - Jobs table              │  writes│   - sde_challenges            │
│   - Funding leads           │        │   - funding_leads              │
│   - Settings (API keys, CV) │        │   - app_state (cron timestamps,│
│   - "Paste WhatsApp job" box│        │     telegram offset, etc.)     │
│   - "Run Now" manual trigger│        └──────────────────────────────┘
└─────────────────────────────┘                     ▲
                                                     │ reads/writes
┌─────────────────────────────────────────────────────────────────────┐
│                    Background Worker (Node.js + node-cron)          │
│  08:00  → Job Scraping Pipeline (Section 4)                          │
│  09:00  → Funding News Pipeline (Section 7)                          │
│  10:00  → Follow-Up Email Check (Section 6.5)                        │
│  Sun 09 → Weekly Digest Email (Section 7.2)                          │
│  Sun 10 → Skills Gap Report (Section 7.3)                            │
│  */3min → Telegram Poll (Section 4.7)                                │
└─────────────────────────────────────────────────────────────────────┘
```

Both processes are started with a single command (see Section 11 — use `concurrently` npm package to run both with one `npm run dev` / `npm run start`).

---

## 3. DATABASE SCHEMA

Create these tables exactly (SQLite syntax, adapt types if using Prisma):

```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT UNIQUE NOT NULL,        -- dedup key: source name + original job ID/URL hash
  date_found TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  location TEXT,
  location_type TEXT,                    -- 'Remote (Worldwide)' | 'Kolkata (₹XL)' | 'Other India (₹XL)' | etc
  salary_display TEXT,                   -- '₹9L' or 'Not Mentioned'
  source TEXT,
  job_url TEXT,
  job_description TEXT,                  -- full JD text, stored for reference/re-scoring
  cv_pdf_path TEXT,                       -- local file path under /storage/cvs/
  cv_updated INTEGER,                     -- 0 or 1 (was master CV used as-is, or tailored)
  ats_score INTEGER,
  ats_feedback TEXT,
  cover_letter_path TEXT,                 -- nullable, only if JD required one
  hr_email TEXT,
  hr_name TEXT,
  hr_title TEXT,
  cold_mail_draft_id TEXT,                -- Gmail draft ID
  cold_mail_sent INTEGER,                 -- 0 or 1
  cold_mail_sent_date TEXT,               -- for follow-up timing
  referral_draft_id TEXT,
  follow_up_draft_id TEXT,
  application_status TEXT DEFAULT 'Pending', -- Pending | Applied | Interview | Rejected | Offer
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sde_challenges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT UNIQUE NOT NULL,
  date_found TEXT,
  challenge_name TEXT,
  company TEXT,
  source TEXT,
  apply_link TEXT,
  deadline TEXT,
  status TEXT DEFAULT 'Not Applied',
  notes TEXT
);

CREATE TABLE funding_leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id TEXT UNIQUE NOT NULL,
  date_found TEXT,
  company TEXT,
  funding_amount TEXT,
  stage TEXT,
  sector TEXT,
  problem_solved TEXT,
  is_indian INTEGER,
  domain TEXT,
  emails_found TEXT,                      -- JSON array stringified
  linkedin_people_search TEXT,
  linkedin_company_page TEXT,
  google_linkedin_search TEXT,
  news_link TEXT,
  status TEXT DEFAULT 'Not Contacted',
  notes TEXT
);

CREATE TABLE app_state (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- rows used: 'telegram_last_update_id', 'last_scrape_run', 'last_funding_run',
--            'last_followup_run', 'last_digest_run', 'last_skillsgap_run'

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- rows used: 'master_cv_html' (the editable CV template, see Section 5),
--            'master_resume_text' (plain-text summary for AI context)
```

---

## 4. JOB SCRAPING PIPELINE (runs daily at 08:00 via worker cron)

Build one function `runDailyScrapePipeline()` that does the following, IN ORDER:

### 4.1 Fetch from all sources in parallel (`Promise.allSettled`, not `Promise.all` — one source failing must never kill the others)

| Source | Endpoint | Notes |
|---|---|---|
| Adzuna India | `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id={ADZUNA_APP_ID}&app_key={ADZUNA_APP_KEY}&what=full stack developer react nodejs javascript&results_per_page=50&sort_by=date&max_days_old=2` | |
| Adzuna Remote/UK | Same pattern, `/gb/` region, `what=react nextjs nodejs remote fresher entry level junior` | |
| JSearch (RapidAPI) — run ALL of these as separate calls: | `https://jsearch.p.rapidapi.com/search` with header `X-RapidAPI-Key: {RAPIDAPI_KEY}`, `X-RapidAPI-Host: jsearch.p.rapidapi.com` | |
| — India Fresher | `query=full stack developer react nodejs fresher 2026 India remote Kolkata` | |
| — FAANG batch 1 | `query=Google Amazon Netflix software engineer SDE fresher new grad 2026 India` | |
| — FAANG batch 2 | `query=Meta Microsoft Apple Adobe Salesforce software engineer fresher India 2026` | |
| — Indian Unicorns batch 1 | `query=Zepto Razorpay CRED Groww Setu Krutrim Dezerv Jar software engineer fresher India` | |
| — Indian Unicorns batch 2 | `query=Flipkart Swiggy Zomato Ola Meesho PhonePe Paytm software engineer SDE fresher India 2026` | |
| — Funded Startups | `query=funded startup India software engineer react nodejs fresher series A B 2026 remote` | |
| — Hidden Gems 1 | `query=Zerodha Groww CloudKaptan Qualcomm Postman BrowserStack Chargebee Freshworks software engineer fresher India 2026` | |
| — Hidden Gems 2 | `query=Juspay Sarvam AI MuSigma Scaler Bounce Yulu Unacademy Vedantu software developer fresher India 2026` | |
| — Indian IT Giants | `query=TCS Infosys Wipro HCL Tech Mahindra Cognizant fresher software engineer 2026 India react nodejs` | |
| — Global Remote | `query=remote full stack developer react nodejs entry level junior 0-1 year worldwide 2026` | |
| Remotive | `https://remotive.com/api/remote-jobs?category=software-dev&search=react nodejs javascript&limit=50` | No key needed |
| RemoteOK | `https://remoteok.com/api?tag=javascript` | No key needed. **Must send a `User-Agent` header** (e.g. `Mozilla/5.0 (compatible; JobBot/1.0)`) or the request is rejected. First array element is metadata — skip it. |
| Unstop (SDE Challenges) | `https://unstop.com/api/public/opportunity/search-result?opportunity=competitions&per_page=20&oppstatus=open&title=SDE hiring challenge software engineer` | Route these into `sde_challenges` table, NOT `jobs` — see 4.4 |
| Serper.dev (broad ATS-platform search — this is the important one, see below) | `POST https://google.serper.dev/search`, header `X-API-KEY: {SERPER_API_KEY}` | See 4.2 |

### 4.2 Why the Serper search matters (do not skip this)

Do **not** hardcode a fixed list of company names to search for — companies change, new ones raise funding constantly, and a hardcoded list goes stale. Instead, search across the application-tracking platforms that tens of thousands of companies (funded startups AND large orgs) actually use to host their job postings:

```
Query 1: (site:boards.greenhouse.io OR site:jobs.lever.co OR site:jobs.ashbyhq.com OR site:jobs.workable.com OR site:smartrecruiters.com OR site:myworkdayjobs.com) (react OR nodejs OR nextjs OR "full stack" OR javascript) (fresher OR "entry level" OR "0-1 year" OR "new grad") 2026

Query 2: (site:boards.greenhouse.io OR site:jobs.lever.co OR site:jobs.ashbyhq.com) "remote" (react OR node.js OR full stack developer) (junior OR fresher OR graduate) apply
```

Parse the `organic` array from Serper's response; extract `title`, `link`, `snippet` as job title/URL/description. This single technique covers far more ground than any hardcoded company list ever could, and it self-updates as new companies adopt these ATS platforms.

### 4.3 Normalize all results into one common shape

```typescript
interface RawJob {
  sourceId: string;       // e.g. `adzuna_${originalId}` — used for dedup
  title: string;
  company: string;
  location: string;
  description: string;
  salaryMin: number;      // 0 if unknown
  salaryMax: number;
  url: string;
  datePosted: string;
  source: string;
}
```

### 4.4 Split: SDE Challenge vs regular job

If the item came from Unstop or matched "hiring challenge" pattern → insert directly into `sde_challenges` table. **Do not run any AI call on these at all** — no relevance check, no CV tailoring, no cost. Just log title/company/link/deadline and move on. This is a deliberate zero-token-cost path.

### 4.5 Deduplicate

Before processing, query `SELECT source_id FROM jobs UNION SELECT source_id FROM sde_challenges`, build a Set, and skip any incoming item whose `sourceId` (or normalized `url`) is already present. This is a real SQL query against a real table — infinitely more reliable than re-reading a spreadsheet on every run.

### 4.6 Location + salary filter

Apply this exact logic to every remaining job:

```
isRemote = location contains "remote"/"wfh"/"work from home" OR title contains "remote" OR description contains "fully remote"/"100% remote"/"work from anywhere"
isKolkata = location contains "kolkata"/"calcutta"/"west bengal"
isOtherIndia = !isKolkata AND location contains any of: india, bengaluru, bangalore, mumbai, delhi, hyderabad, pune, chennai, noida, gurgaon, gurugram, ahmedabad
highSalary = max(salaryMin, salaryMax)
noSalary = salaryMin === 0 AND salaryMax === 0

IF isRemote → PASS, category = "Remote (Worldwide)"
ELSE IF isKolkata:
    IF noSalary OR highSalary >= 500000 → PASS, category = "Kolkata (₹XL)" or "Kolkata (Salary TBD)"
    ELSE → REJECT
ELSE IF isOtherIndia:
    IF !noSalary AND highSalary >= 600000 → PASS, category = "Other India (₹XL)"
    ELSE → REJECT
ELSE → REJECT ("Outside India")
```

(Kolkata threshold is ₹5 LPA, other India cities threshold is ₹6 LPA — these are deliberately different, do not merge them.)

### 4.7 Telegram polling (separate cron, every 3 minutes — no webhook, no public URL needed)

```typescript
// GET https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates?offset={lastOffset}&timeout=5
// Read lastOffset from app_state table (key: 'telegram_last_update_id'), default 0
// For each update: if update_id >= lastOffset, extract message.text or message.caption
// Skip anything under 20 characters (too short to be a real job post)
// Push through the SAME relevance/location pipeline as scraped jobs (source = "Telegram Community")
// After processing, write (maxUpdateId + 1) back to app_state so the same message is never reprocessed
```

### 4.8 WhatsApp — simplified compared to n8n (no webhook needed at all)

Because this is now a real app, do NOT build a webhook. Just add a text box directly on the dashboard: **"Paste a WhatsApp job post"** with a Submit button that calls an internal API route (`POST /api/jobs/manual-paste`) with the pasted text. That route runs the same AI extraction + relevance + location filter as everything else, tagging `source = "WhatsApp Community"`.

---

## 5. CV GENERATION PIPELINE (per relevant job)

### 5.1 Why HTML + Puppeteer instead of LaTeX (do this, don't argue for LaTeX)

The original build used LaTeX compiled through a free third-party API (latexonline.cc). This is a real single point of failure — if that service is ever slow or down, every single CV generation fails, and it's not something we control. **Use HTML + CSS rendered to PDF via Puppeteer instead.** This runs 100% locally, gives equally precise visual control via CSS, and removes the external dependency entirely. Visual quality can match or exceed the LaTeX version.

### 5.2 The master CV — convert this exact content into an HTML/CSS template (one page, ATS-clean)

Store this as editable HTML in the `settings` table (key: `master_cv_html`) so the user can tweak it later from a Settings page. Build the initial template with this exact content and structure (do not invent different content):

```
HEADER:
  SAIKAT MAJI
  +91-8509233422 | Saikatmaji200@gmail.com | linkedin.com/in/saikat-maji- | github.com/GwSaikat | leetcode.com/u/Alpha7679

SUMMARY:
  Computer Science graduate and full-stack developer skilled in building production-style MERN
  applications, real-time systems, and AI-integrated features with LangChain and RAG. Proficient
  in React.js, Node.js/Express.js, REST API design, and core CS fundamentals (DSA, OOP, DBMS,
  System Design). Seeking a Software Engineer / Full-Stack Developer role.

TECHNICAL SKILLS:
  Languages: JavaScript (ES6+), TypeScript, C++, SQL, HTML, CSS
  Frontend/Backend: React.js, Next.js | Node.js, Express.js, REST APIs, WebSocket
  AI/LLM: LangChain, RAG, AI Integration (OpenAI API)
  Databases & Infra/Auth: MongoDB, Redis, Docker (Basics) | JWT, bcrypt, RBAC
  Dev Tools & Deployment: Git, GitHub, Vercel, Netlify, Render
  Core CS: Data Structures & Algorithms, OOP, DBMS, System Design, Operating Systems

EXPERIENCE:
  Freelance Full-Stack Developer | 2025–Present | Self-Employed, Remote
    - Designed and deployed full-stack management systems for two clients (a gym and a
      diagnostic center), from initial requirements through production launch.
    - Built responsive, role-based web apps that digitized scheduling, client records, and
      daily operations, replacing manual processes.
    - Owned the full development lifecycle — requirements, architecture, development, testing,
      and deployment — while handling client communication directly.

  Virtual Internship — Thiranex (Full-Stack Development)
    - Built a Task Management Application enabling task creation, assignment, and status tracking.
    - Developed an E-Commerce Web Application with product browsing, cart, and order management.
    - Created a Blog Platform with Comments, including content publishing and threaded discussions.

  Software Engineering Job Simulation — Forage
    - Completed a virtual job simulation performing realistic software engineering tasks for a
      Y Combinator–style startup application.
    - Implemented frontend improvements from user feedback and shipped new backend features.
    - Analyzed product/feature releases to evaluate user impact and guide development decisions.

PROJECTS:
  FlowForge — Real-Time Critical Path Orchestration Engine [GitHub] [Live Demo]
    - Engineered a real-time CPM engine modeling projects as dependency graphs, implementing
      topological sort, DFS cycle detection, and CPM forward/backward-pass algorithms from scratch.
    - Integrated LangChain and OpenAI API for AI-driven features: automated standup-brief generator
      and semantic dependency detector for hidden task relationships.
    - Built a real-time layer with Socket.io/WebSocket, Express.js, Redis broadcasting graph
      updates within milliseconds; deployed on Render/Vercel with MongoDB Atlas.

  TrackChat — Real-Time Chat & Device Tracking App (In Progress) | MERN, Socket.io, WebSocket
    - Building a real-time chat app with live device-location tracking via Socket.io, WebSocket,
      and HTML5 Geolocation API, rendered on an interactive Leaflet.js map.
    - Architecting an event-driven Node.js/Express.js backend with MongoDB for message
      persistence, read receipts, typing indicators, and group chat.
    - Implementing JWT refresh-token rotation with a mobile-first React.js frontend.

  Banking System — Full-Stack Banking Application [GitHub] [Live Demo]
    - Engineered a full-stack banking application (React.js frontend, RESTful Express.js/Node.js
      API) handling core banking operations such as accounts and transactions.
    - Structured the codebase into independently deployable frontend/backend modules.
    - Deployed a unified pipeline: backend on Render, frontend on Vercel.

EDUCATION:
  JIS University, Kolkata, India — B.Tech Computer Science and Engineering — Aug 2022 – May 2026

CERTIFICATIONS:
  Cisco Certified Network Associate — Collaboration (CCNA-C), Simplilearn — Jul 2024
  Generative AI for Developers (Advanced), Google Skills — In Progress
```

Mark the Summary, Skills, and Project-bullet sections with HTML comments like `<!-- AI_EDITABLE_SUMMARY_START -->...<!-- AI_EDITABLE_SUMMARY_END -->` so the tailoring step (5.4) can safely find-and-replace only those regions, never touching the header, Experience, Education, or Certifications sections.

### 5.3 "Should this CV be tailored?" — token-saving decision

Before generating anything, ask the AI a cheap yes/no question: given the master CV content and this specific JD, is there a mandatory keyword/skill genuinely missing from the current CV that the candidate does have evidence of elsewhere? If not, **use the master CV as-is** (`cv_updated = 0`) — this should be the common case (~60-70% of jobs) and saves real cost/time.

### 5.4 Tailoring (only when needed)

If tailoring is needed, ask the AI to rewrite ONLY the marked editable regions (summary phrasing, skill ordering, project bullet emphasis) to better match the JD. Hard rule, enforce via prompt AND a post-generation sanity check: **never introduce a skill or claim not present in the master CV.** After generation, diff the skills mentioned against the master skill list — if new ones appear that weren't there before, reject the output and fall back to the master CV unchanged.

### 5.5 Render to PDF and enforce ONE PAGE — programmatically, not by trusting the AI

```typescript
// Use Puppeteer to render the HTML to PDF at A4 size.
// Actually COUNT the resulting PDF's page count (e.g. via pdf-lib or pdf-parse).
// If it's more than 1 page:
//   - Try reducing font-size/margins slightly (a small automated CSS adjustment), re-render, re-check.
//   - If still >1 page after 2 attempts, fall back to the master CV (untailored) which is
//     already verified to be exactly one page, and log a note on the job record explaining why.
// This is a real, verifiable check — never just trust a prompt instruction saying "keep it one page."
```

### 5.6 ATS scoring + retry loop

Ask the AI to score the generated CV against the JD (0–100: keyword match 40%, skill alignment 30%, role relevance 20%, ATS formatting readability 10%). Require ≥95 to "pass."

- If it fails, regenerate up to 2 more times, each time feeding back the specific missing keywords and previous score.
- After all attempts, **keep whichever version scored highest** — never block the pipeline entirely waiting for a perfect score. Store the final `ats_score` and `ats_feedback` on the job record regardless of pass/fail.

### 5.7 Cover letter — only if the JD explicitly asks for one

Scan the JD text for phrases like "cover letter", "covering letter", "letter of interest", "motivation letter", "cover note". Only generate one if a match is found. Keep it under 180 words, ATS-friendly, first person.

---

## 6. OUTREACH PIPELINE

### 6.1 Apollo.io — HR/founder contact lookup

```
POST https://api.apollo.io/api/v1/mixed_people/search
Headers: Content-Type: application/json, X-Api-Key: {APOLLO_API_KEY}
```
**Critical: Apollo requires the API key in the `X-Api-Key` HEADER, not in the request body.** (This changed on Apollo's side — sending it in the body returns "API key must be passed in the X-Api-Key header.")

Body: `{ "q_organization_name": "<company>", "person_titles": ["recruiter","talent acquisition","hr manager","head of people","hiring manager","people operations"], "per_page": 3, "page": 1 }`

If Apollo returns zero people (common for very small/early startups), do NOT fail — instead generate three clickable fallback links and store them for the user to try manually:
- LinkedIn people search: `https://www.linkedin.com/search/results/people/?keywords=<company>+recruiter+hiring+India`
- LinkedIn company page: `https://www.linkedin.com/search/results/companies/?keywords=<company>`
- Google site-search: `https://www.google.com/search?q=site:linkedin.com+"<company>"+recruiter+OR+hiring+India`

### 6.2 Psychological hook research (run before writing any outreach message)

Ask the AI to look at the recipient's title (from Apollo, if found) and the company/role, and decide:
- **Founder/CTO at an early-stage startup** → angle: ownership, speed, building from scratch
- **HR/Talent Acquisition at a larger company** → angle: culture fit, structured achievement, reliability
- **Engineering/Hiring Manager** → angle: technical depth, problem-solving, code quality
- **Unknown** → default to the Hiring Manager angle

Have it return a one-sentence "hook" referencing a specific real project (FlowForge / TrackChat / Banking System / freelance work) — never generic. Feed this hook into the cold email, referral message, and cover letter generation prompts so the tone is deliberately different per recipient type, not a templated form-letter feel.

### 6.3 Cold email — under 120 words, human-sounding, uses the hook + a one-sentence company research brief

### 6.4 Referral message — fill this EXACT template (do not restructure it), using the hook to add one natural extra sentence:

```
Hi [Name], I noticed [Company] is hiring for [Role], and my background in [most relevant
skill] lines up closely with the description.

[one natural sentence using the psychological hook]

Would you be open to passing my resume along, or a quick intro to the hiring manager?

Totally understand if it's not the right fit. Either way, appreciate you considering it.

Thanks,
Saikat Maji
CV: [link]
LinkedIn: linkedin.com/in/saikat-maji- | GitHub: github.com/GwSaikat
```

### 6.5 Follow-up email (part of the 10:00 daily cron)

Query jobs where `cold_mail_sent = 1`, `application_status` is still `Pending`/`Applied`, `hr_email` is set, and `cold_mail_sent_date` is 7–14 days ago. Generate a short (<60 words) human follow-up with a punchy opening line (explicitly avoid "I hope this finds you well").

### 6.6 CRITICAL — all outreach is a Gmail DRAFT, never auto-sent

Cold email, referral message, and follow-up email must all be created as **Gmail drafts** (`gmail.users.drafts.create`), never sent directly. The user reviews and clicks Send manually inside Gmail. Store the returned draft ID on the job record so it's traceable.

---

## 7. FUNDING NEWS + REPORTING PIPELINES

### 7.1 Funding news (daily 09:00)

Pull RSS feeds: YourStory (`https://yourstory.com/feed`), Inc42 (`https://inc42.com/feed/`), TechCrunch funding tag (`https://techcrunch.com/tag/funding/feed/`), Economic Times Startups (`https://economictimes.indiatimes.com/tech/startups/rssfeeds/78570561.cms`). Combine all items, keep only ones matching ≥2 of these keywords: funding, raised, million, crore, seed, series a, series b, startup, saas, fintech, api, developer, investment. Deduplicate by normalized title. For each, ask the AI to extract: company, amount, sector, one-sentence problem statement, likely-needs-developers (boolean), domain, is-Indian (boolean), stage. Only proceed to Apollo lookup if `needsDev` is true. Log everything to `funding_leads`.

### 7.2 Weekly digest (Sunday 09:00)

Summarize the week's `jobs` table activity (applied count, cold emails sent, replies/interviews, top 3 companies, average/highest ATS score, one motivating tip) into a short email, sent to the user's own Gmail address.

### 7.3 Skills gap report (Sunday 10:00)

Look at jobs that were scraped this week but rejected at the relevance-check stage (log these rejections with a reason, don't just silently drop them — add a `rejected_jobs` log table if useful), extract the top 3 recurring skills the candidate is missing, estimate learning time for each, suggest one free resource, and suggest one concrete action for the coming week. Email to self.

---

## 8. AI PROVIDER STRATEGY — read this carefully, it is the most important section

### 8.1 Do not use Gemini for the core pipeline

Google's free-tier Gemini API has a known, currently-ongoing issue where unverified Google Cloud projects get a hard quota of **zero** — not "quota exceeded," a permanent zero — until a billing account is linked. This is an account-verification wall, not a rate limit, and it is completely independent of whatever platform makes the request. Avoid it entirely for this build. If the user ever wants to use Gemini later, they must first link a billing account at `console.cloud.google.com/billing` (no charge occurs while staying under free-tier usage) — but do not build a dependency on it.

### 8.2 Use these two providers, both OpenAI-compatible (identical request/response shape — huge advantage over Gemini's bespoke format)

| Task category | Provider | Model | Why |
|---|---|---|---|
| CV tailoring generation + all ATS scoring/retries | **OpenRouter** | `openai/gpt-oss-120b:free` | Strongest free structured-output model available; these are the quality-critical steps |
| Everything else (relevance check, CV-update decision, cold email/referral/follow-up/cover-letter writing, WhatsApp/Telegram extraction, funding analysis, weekly digest, skills gap, psychological hook) | **Groq** | `llama-3.3-70b-versatile` | Fast, reliable, generous published limits |

Both use this exact request shape:
```
POST {endpoint}
Headers: Content-Type: application/json, Authorization: Bearer {API_KEY}
Body: { "model": "...", "messages": [{"role":"user","content": "..."}], "max_tokens": N, "temperature": T }
Response: response.choices[0].message.content
```
- OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Groq endpoint: `https://api.groq.com/openai/v1/chat/completions`

**OpenRouter account setup note:** the user must enable two toggles at `openrouter.ai/settings/privacy` — "Free endpoints that may train on request data" and "Free endpoints that may publish prompts" — or every `:free` model call will fail with a "no endpoints available matching your guardrail restrictions" error. This is a one-time account setting, not something the code can work around.

### 8.3 Model fallback chain (build this in — do not skip)

For every AI call, implement a **priority list of models to try**, not a single hardcoded model string:

```typescript
async function callAI(prompt: string, opts: { maxTokens: number; temperature: number; preferQuality: boolean }) {
  const chain = opts.preferQuality
    ? [
        { provider: 'openrouter', model: 'openai/gpt-oss-120b:free' },
        { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' },
        { provider: 'groq', model: 'llama-3.3-70b-versatile' },
      ]
    : [
        { provider: 'groq', model: 'llama-3.3-70b-versatile' },
        { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct:free' },
      ];

  for (const { provider, model } of chain) {
    try {
      return await callProvider(provider, model, prompt, opts);
    } catch (err) {
      if (isRateLimitOrModelUnavailable(err)) continue; // try next in chain
      throw err; // real error (bad request, auth) — don't silently swallow
    }
  }
  throw new Error('All AI providers in the fallback chain failed');
}
```

This is the single most important resilience feature in this whole build: if OpenRouter deprecates a specific free model (this has already happened once with a different model on that platform), the system keeps working without anyone needing to notice or intervene.

### 8.4 Real rate limiting — implement this yourself, do not rely on any platform's built-in "batching" option

```typescript
class RateLimiter {
  private queue: number[] = []; // timestamps of recent requests
  constructor(private maxPerMinute: number) {}

  async waitForSlot() {
    const now = Date.now();
    this.queue = this.queue.filter(t => now - t < 60_000);
    if (this.queue.length >= this.maxPerMinute) {
      const waitMs = 60_000 - (now - this.queue[0]) + 100;
      await new Promise(r => setTimeout(r, waitMs));
      return this.waitForSlot();
    }
    this.queue.push(Date.now());
  }
}

const groqLimiter = new RateLimiter(25);       // stay under Groq's 30/min with margin
const openrouterLimiter = new RateLimiter(17); // stay under OpenRouter's 20/min with margin
```

Call `await groqLimiter.waitForSlot()` immediately before every Groq request, same pattern for OpenRouter. Also implement exponential backoff on any 429 response as a second layer of defense (wait 2s, 4s, 8s, then give up and move to the next item in the fallback chain).

### 8.5 JSON body construction — a non-issue in real code, but state it explicitly

Always build request bodies with `JSON.stringify({...})` using a real object literal — never manually concatenate strings to build JSON-looking text. This was a major source of bugs in the previous n8n build specifically because n8n's expression editor made it easy to accidentally do unsafe string concatenation; in TypeScript this risk doesn't exist as long as you build a real object and stringify it.

---

## 9. GOOGLE OAUTH (Gmail) — required, same complexity regardless of platform

This one piece of setup is real and unavoidable in any implementation:

1. Go to `console.cloud.google.com` → create a new project (or reuse an existing one)
2. Enable the **Gmail API**
3. Go to "OAuth consent screen" → set up as "External" / "Testing" mode (fine for personal use) → add the user's own Gmail as a test user
4. Go to "Credentials" → Create OAuth Client ID → Application type: **Desktop app**
5. Download the client ID + client secret
6. In the app, implement a one-time local OAuth flow (the `google-auth-library` npm package has a standard pattern for this: opens a browser window, user approves, a local redirect captures the authorization code, exchange it for a refresh token, store the refresh token securely in the local SQLite `settings` table or an encrypted local file)
7. After this one-time setup, the app uses the stored refresh token indefinitely to create Gmail drafts without asking the user to log in again

Build a simple **Settings page** in the app with a "Connect Gmail" button that triggers this flow, and shows a green checkmark once connected.

---

## 10. FRONTEND / DASHBOARD PAGES

1. **`/` Dashboard** — summary cards (jobs found today, applications pending, avg ATS score, cold emails awaiting review), a chart of jobs found per source, a chart of application status breakdown
2. **`/jobs`** — full sortable/filterable table matching the `jobs` schema, with inline status editing (dropdown: Pending/Applied/Interview/Rejected/Offer), a "View CV" button (opens the generated PDF), a "View Draft" button linking to the Gmail draft
3. **`/challenges`** — SDE Challenges table
4. **`/funding-leads`** — Funding Leads table with clickable LinkedIn/Google search buttons
5. **`/paste-job`** — the WhatsApp/manual job paste textbox described in 4.8
6. **`/settings`** — Connect Gmail button, editable master CV HTML (with a live PDF preview), API key status indicators (green/red per provider, based on a lightweight test call), "Run Pipeline Now" manual trigger button

Use a dark, clean, modern aesthetic (Tailwind + shadcn/ui components: Card, Table, Badge, Button, Dialog). This should look and feel like a real product, not a spreadsheet.

---

## 11. RUNNING THE APP

```
package.json scripts:
  "dev": "concurrently \"next dev\" \"tsx watch worker/index.ts\""
  "build": "next build"
  "start": "concurrently \"next start\" \"tsx worker/index.ts\""
```

One command starts both the dashboard and the background worker together.

---

## 12. BUILD ORDER (build and test in this sequence, not all at once)

1. Database schema + migrations
2. Job scraping for ONE source (Adzuna) end-to-end, confirm rows land in `jobs`
3. Add remaining scraping sources one at a time, confirm each independently
4. Location/salary filter + dedup logic, with unit tests on the filter function specifically
5. AI provider wrapper (Section 8) — test the fallback chain and rate limiter with real calls before building anything on top of it
6. Relevance check + CV-update decision
7. CV HTML template + Puppeteer PDF rendering + one-page enforcement (test this thoroughly — render several different job descriptions and manually confirm every output is one page)
8. ATS scoring + retry loop
9. Apollo integration + psychological hook + cold email/referral/cover-letter generation
10. Gmail OAuth + draft creation
11. Follow-up cron, weekly digest, skills gap report
12. Telegram polling
13. Frontend dashboard pages, wired to the now-working backend
14. Full end-to-end test: trigger a full pipeline run manually from the Settings page, confirm a real job flows all the way from scraping to a Gmail draft appearing

---

## 13. THINGS THAT MUST NEVER HAPPEN (explicit constraints, matching what the user has emphasized repeatedly)

- CVs must **never** claim a skill or experience the candidate doesn't have — enforce with the diff-check in 5.4
- CVs must **always** be exactly one page — enforce programmatically (5.5), never just by prompt instruction
- No outreach email is ever sent automatically — everything is a Gmail draft awaiting manual approval
- SDE Challenges never go through the AI/CV pipeline — zero token cost for that category
- Cover letters are only generated when the JD explicitly requires one
- Never let one failing job source crash the whole scraping run (`Promise.allSettled`)
- Never let one AI provider's outage or rate-limit stop the pipeline (fallback chain, Section 8.3)
