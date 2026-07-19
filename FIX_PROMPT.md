# FIX PROMPT — Job-Automation-System repo (Gwsaikat/Job-Automation-System)

**This is not a rebuild. I read the actual code in this repository — not just skimmed it, but directly tested key pieces (see "Verified" section below) — and the implementation is genuinely solid. The problem is a small number of specific, concrete bugs, listed below in priority order. Fix them in this exact order and test after each one.**

## What I directly verified is working correctly (not assumed — actually checked)

- **CV content fidelity**: FlowForge, TrackChat, Banking System, Thiranex internship, Forage simulation, LangChain/RAG skills, CCNA + Generative AI certifications — all present and correct across the HTML, plain-text, and LaTeX versions of the CV template.
- **The LaTeX backslash-escaping fix actually works** — tested by parsing `src/lib/cv/template.ts` directly as JavaScript; it's syntactically valid. (Note: this was fixed via a one-time patch script `fix_escape.js` that ran once and modified the file — see "Hardening" section below for why that's still worth addressing properly.)
- **One-page PDF enforcement is real**, not just a prompt instruction — `src/lib/cv/render.ts` uses `pdf-parse` to actually count rendered pages, retries with progressively tighter CSS up to 2 times, and falls back to the already-verified-one-page master CV if it still doesn't fit. This is exactly the kind of programmatic verification that matters.
- **The "never invent a fake skill" safeguard is real** — `src/lib/cv/tailor.ts` has a `validateNoNewSkills()` function that scans the tailored output against a list of common tech terms not in the candidate's master skill list, and **rejects the tailored version, falling back to the master CV**, if anything unexpected appears.
- **The Serper broad-search implementation is correct** — exact queries against Greenhouse/Lever/Ashby/Workable/SmartRecruiters/Workday, correct company-name extraction from each platform's URL structure, correct `X-API-KEY` header usage.
- **The referral message uses the exact agreed wording**, hardcoded as a template with only the psychological-hook sentence and personal details filled in — not left to the AI to rephrase or restructure.
- **Gmail draft creation is real and functional**, including proper MIME multipart construction so the CV PDF is actually attached to the draft — this goes beyond the original spec, which is a good sign of care in the implementation.

## What I have NOT checked (being fully transparent, not just claiming "all good")

I did not open every file. Specifically still unverified: `src/lib/outreach/hook.ts`, `src/lib/outreach/pipeline.ts`, `src/lib/cv/score.ts`, `src/lib/cv/cover-letter.ts`, `src/lib/funding/rss.ts`, `src/lib/reporting/*.ts` (digest, follow-up, skills-gap), `src/lib/scrapers/telegram.ts` / `remoteok.ts` / `remotive.ts` / `unstop.ts` (implementation internals — only their *wiring* into the worker was checked), `src/lib/retry.ts`, `src/lib/db.ts`, `src/lib/utils.ts`, every frontend page and component under `src/app/` and `src/components/`, and the full Prisma schema beyond the `Job` model. Given the consistent quality of everything actually checked, these are lower-risk than the bugs below — but "lower-risk" is not "confirmed," so if a fix below doesn't fully resolve things, these are the next places to look.

---

## BUG #1 (fix this first — almost certainly explains "nothing works at all")

**File:** `worker/index.ts`
**Line:** `dotenv.config({ path: '.env.local' })`

**The problem:** The background worker — which runs 100% of the actual scraping, AI calls, CV generation, Apollo lookups, and email drafting — loads its environment variables from a file literally named `.env.local`. If the environment file actually created on disk is named `.env` (not `.env.local`), this call finds nothing, every `getConfig()` call in every scraper/AI/Apollo/Gmail module returns empty strings, and every single feature fails immediately and silently at the "API key not configured" stage. Meanwhile, the Next.js frontend auto-loads `.env` on its own (Next.js does this automatically), so the **dashboard might look like it's running fine** while the **worker silently does nothing** — which matches exactly what was reported ("no features are working").

**The fix:**
1. Check what the actual env file is named on disk. Whatever it is, make `worker/index.ts` load that same file.
2. Best practice: standardize on a single file named `.env` for both the Next.js app and the worker (Next.js reads `.env` automatically; explicitly point the worker at it too):
   ```typescript
   dotenv.config({ path: require('path').resolve(process.cwd(), '.env') });
   ```
3. After fixing, add a startup sanity check to `worker/index.ts` that prints which keys were actually loaded (masked), so this exact failure mode is visible immediately next time instead of silent:
   ```typescript
   const requiredKeys = ['ADZUNA_APP_ID','RAPIDAPI_KEY','SERPER_API_KEY','OPENROUTER_API_KEY','GROQ_API_KEY1','APOLLO_API_KEY','TELEGRAM_BOT_TOKEN'];
   console.log('[Worker] Environment check:');
   for (const key of requiredKeys) {
     const val = process.env[key];
     console.log(`  ${key}: ${val ? '✅ loaded (' + val.slice(0,6) + '...)' : '❌ MISSING'}`);
   }
   ```

---

## BUG #2 — env variable name mismatch for Groq keys

**File:** `src/lib/config.ts`

**The problem:**
```typescript
groqApiKeys: [
  getEnv('GROQ_API_KEY1'),
  getEnv('GROQ_API_KEY2'),
  getEnv('GROQ_API_KEY3'),
  getEnv('GROQ_API_KEY'),
].filter(Boolean),
```
This reads `GROQ_API_KEY1`, `GROQ_API_KEY2`, `GROQ_API_KEY3`, `GROQ_API_KEY`. Confirm the actual `.env` file uses these exact names. If it instead has `GROQ_API_KEY_A`/`GROQ_API_KEY_B`/`GROQ_API_KEY_C` or any other naming, none of the Groq keys load, `groqApiKeys` is an empty array, and every Groq call in `src/lib/ai.ts` throws `"groq API key not configured"` on the first attempt in the fallback chain (it then tries OpenRouter next, so this alone wouldn't cause 100% failure, but it removes 3 of the 4 fallback attempts for every single AI call).

**The fix:** Make the `.env` file's variable names and `config.ts`'s `getEnv()` calls match exactly. Pick one naming convention and use it consistently in both places.

---

## BUG #3 — Telegram-sourced jobs are discovered but never saved

**File:** `worker/index.ts`, inside the `safeCron('Telegram Poll', ...)` block

**The problem:**
```typescript
for (const job of jobs) {
  const result = filterJobByLocation(job);
  if (result.passed) {
    console.log(`[Worker] Telegram job passed: ${job.title} at ${job.company}`);
  }
}
```
This runs the location filter and then just **logs to the console**. It never calls `filterJobByTechFit()`, never calls `prisma.job.create()`, never triggers `runCVPipeline()` or `runOutreachPipeline()`. Every Telegram-sourced job discovered this way is discovered and then immediately thrown away. This is a complete dead end, not a partial bug.

**The fix:** Replace that block with the same insert-and-process logic already used correctly in `src/lib/pipeline/scrape.ts` (dedup check → tech-fit filter → `prisma.job.create()` with `locationType`/`salaryDisplay` from the filter result → trigger CV+outreach pipeline). Consider extracting the shared "process one raw job" logic out of `scrape.ts` into its own function (e.g. `processAndInsertJob(rawJob: RawJob)`) so both the main scrape pipeline and the Telegram poller call the exact same code path instead of duplicating (and potentially re-diverging) the logic.

---

## BUG #4 — background pipeline failures are invisible to the user

**Files:** `src/lib/pipeline/scrape.ts` (the auto-trigger block) and `src/app/api/pipeline/run/route.ts` (the manual "Run Now" trigger)

**The problem:** Both places kick off CV + Outreach processing like this:
```typescript
setTimeout(async () => {
  try {
    await runCVPipeline(jobId);
    await runOutreachPipeline(jobId);
    await prisma.job.update({ where: { id: jobId }, data: { applicationStatus: 'Applied' } });
  } catch (error) {
    console.error(`...failed for Job ${jobId}:`, error);
  }
}, 0);
```
If anything inside `runCVPipeline` or `runOutreachPipeline` throws — a bad API key, a rate limit exhausted across the whole fallback chain, Puppeteer failing to launch, whatever — the **only** trace of that failure is a `console.error` in the terminal. The job record itself is never updated to reflect the failure. From the dashboard, that job just sits at `applicationStatus: 'Pending'` forever with zero indication of what went wrong or why. This makes every future bug (not just the ones listed here) effectively undebuggable from the UI.

**The fix, in two parts:**

1. **Add a `processingError` field to the Job model** (`prisma/schema.prisma`):
   ```prisma
   processingError String? @map("processing_error")
   processedAt     String? @map("processed_at")
   ```
   Run `prisma db push` (or a proper migration) after adding this.

2. **Catch and record the failure on the job itself**, not just the console:
   ```typescript
   setTimeout(async () => {
     try {
       await runCVPipeline(jobId);
       await runOutreachPipeline(jobId);
       await prisma.job.update({
         where: { id: jobId },
         data: { applicationStatus: 'Applied', processingError: null, processedAt: new Date().toISOString() },
       });
     } catch (error) {
       const message = error instanceof Error ? error.message : String(error);
       console.error(`[Pipeline] Failed for Job ${jobId}:`, error);
       await prisma.job.update({
         where: { id: jobId },
         data: { processingError: message.slice(0, 500), processedAt: new Date().toISOString() },
       }).catch(() => {}); // don't let a logging failure mask the original error
     }
   }, 0);
   ```

3. **Show it in the UI** — in `src/app/jobs/page.tsx`, if a job row has a non-null `processingError`, render a red badge/tooltip showing the error message instead of (or alongside) the status dropdown, so failures are visible at a glance without needing to check the terminal.

---

## HARDENING NOTE A — the LaTeX escaping fix is a one-time patch, not a structural guarantee

**File:** `fix_escape.js` (repo root) + `src/lib/cv/template.ts`

`fix_escape.js` is a standalone script that was run once to fix backslash-escaping in the LaTeX version of the CV template (LaTeX commands like `\textbf`, `\item` break JavaScript string parsing if not double-escaped). I verified the current file IS correctly escaped and valid. But this was fixed by *patching the output file after the fact*, not by generating it correctly in the first place. If `template.ts` is ever regenerated, hand-edited, or the AI IDE touches the `MASTER_CV_LATEX` string again, this exact bug can silently reappear with no warning. **Fix:** delete `fix_escape.js` from the repo (it's a one-time tool, not part of the app) and add a startup check in `worker/index.ts` that attempts to `new Function()`-parse the exported template strings and logs an error if either one fails — this turns a silent future regression into an immediately visible one.

## HARDENING NOTE B — the LaTeX PDF path depends on a system-level `pdflatex` install

**File:** `src/lib/cv/render.ts`, function `renderLatexToPDF`

This calls `pdflatex` via `child_process.exec`, which requires a full LaTeX distribution (TeX Live or MiKTeX, often 1–4 GB) installed separately on the machine and available on `PATH`. This is exactly the kind of external dependency the original HTML+Puppeteer recommendation was meant to avoid. It's not currently causing failures because `cv_type` defaults to `'html'` — but if that setting is ever flipped (in Settings, or by a future default-seed change), every CV generation will throw immediately on any machine without `pdflatex` installed. **Recommendation:** either remove the LaTeX rendering path entirely (the HTML/Puppeteer path already covers the same need without the dependency), or clearly surface in the Settings UI that choosing "LaTeX" requires a local LaTeX installation, with a link to install instructions.

## BUG #5 (hardening, not a hard failure — fix after 1–4) — unbounded concurrent pipeline execution

**Files:** same two locations as Bug #4

**The problem:** Every job that passes the filter in a single scrape run fires its own detached `setTimeout(..., 0)` immediately. If 15 jobs pass in one run, 15 full CV+ATS+Outreach chains (each potentially 6–10 sequential AI calls) all start at the same instant. The `RateLimiter` class in `src/lib/ai.ts` will still enforce correct spacing between individual HTTP calls, but having 15 independent chains all racing through their own sequences of `await` steps at once creates unnecessary contention, makes logs hard to read, and — more importantly — spins up that many concurrent Puppeteer PDF-render calls, which is a real memory/CPU risk on a personal laptop (each Puppeteer instance is a full headless Chrome process).

**The fix:** Add a simple concurrency cap so at most N jobs (start with N=2) are being fully processed (CV+outreach) at the same time, with the rest queued. A minimal semaphore is enough:
```typescript
class Semaphore {
  private running = 0;
  private queue: (() => void)[] = [];
  constructor(private max: number) {}
  async acquire() {
    if (this.running >= this.max) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
  }
  release() {
    this.running--;
    const next = this.queue.shift();
    if (next) next();
  }
}
export const jobProcessingSemaphore = new Semaphore(2);
```
Wrap the `runCVPipeline` + `runOutreachPipeline` calls in both locations with `await jobProcessingSemaphore.acquire()` ... `finally { jobProcessingSemaphore.release(); }`.

---

## VERIFICATION STEPS — run these after fixing 1–4 (5 is a nice-to-have)

1. Run `npm run dev`. In the worker's terminal output, confirm the environment check (added in Bug #1's fix) shows all keys as `✅ loaded`, not `❌ MISSING`.
2. From the Settings page, click "Run Pipeline Now" (or hit `POST /api/pipeline/run` with `{"pipeline":"scrape"}` directly via curl/Postman if there's no button yet).
3. Watch the worker terminal — confirm each scraper logs a non-zero fetched count for at least Adzuna, Remotive, and RemoteOK (these need the fewest/no keys, so they're the fastest sanity check).
4. Check the `jobs` table (via Prisma Studio: `npx prisma studio`, or the `/jobs` dashboard page) — confirm rows are appearing with `locationType` and `salaryDisplay` populated (proves the filter is running, not just the scraper).
5. Pick one job row, confirm `cvPdfPath` gets populated within a minute or two, and that the PDF at that path actually opens and is legible.
6. Confirm `hrEmail` OR the fallback LinkedIn/Google links are populated on at least one job (proves Apollo — or its fallback — ran).
7. Check Gmail's Drafts folder for a draft matching that job (proves the outreach pipeline and Gmail OAuth are both working end to end).
8. If any job shows a red error badge (from Bug #4's fix), read the `processingError` message directly — it will now tell you exactly what failed instead of requiring a terminal log dive.

Do not consider this fixed until step 7 (a real Gmail draft appearing) succeeds for at least one real job — that's the true end of the pipeline and confirms every stage in between actually ran.
