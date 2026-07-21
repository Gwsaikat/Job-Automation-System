// ============================================
// AI Provider Wrapper — Section 8 of BUILD_PROMPT
// Supports OpenRouter + Groq with fallback chains and rate limiting
// ============================================

import { getConfig } from './config';

// ---- Rate Limiter (Section 8.4) ----

class RateLimiter {
  private queue: number[] = [];

  constructor(private maxPerMinute: number) {}

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.queue = this.queue.filter((t) => now - t < 60_000);
    if (this.queue.length >= this.maxPerMinute) {
      const waitMs = 60_000 - (now - this.queue[0]) + 100;
      await new Promise((r) => setTimeout(r, waitMs));
      return this.waitForSlot();
    }
    this.queue.push(Date.now());
  }
}

// Stay under published limits with margin (Section 8.4)
const groqLimiter = new RateLimiter(25);       // Groq: 30/min limit
const openrouterLimiter = new RateLimiter(17); // OpenRouter: 20/min limit

// ---- Provider Config ----

type ProviderName = 'openrouter' | 'groq';
export type TaskType = 'email' | 'psychological' | 'heavy' | 'default';

interface ProviderConfig {
  endpoint: string;
  getApiKey: (taskType: TaskType) => string;
  limiter: RateLimiter;
}

let currentGroqKeyIndex = 0;

const PROVIDERS: Record<ProviderName, ProviderConfig> = {
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    getApiKey: () => getConfig().openrouterApiKey,
    limiter: openrouterLimiter,
  },
  groq: {
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    getApiKey: (taskType: TaskType) => {
      const keys = getConfig().groqApiKeys;
      if (keys.length === 0) return '';
      
      // Key 1 for Emails, Key 2 for Psychological, Key 3 for ATS/CV Heavy
      if (taskType === 'email' && keys.length >= 1) return keys[0];
      if (taskType === 'psychological' && keys.length >= 2) return keys[1];
      if (taskType === 'heavy' && keys.length >= 3) return keys[2];

      // Round-robin selection of the Groq API keys as fallback
      const key = keys[currentGroqKeyIndex % keys.length];
      currentGroqKeyIndex++;
      return key;
    },
    limiter: groqLimiter,
  },
};

// ---- Error Classification ----

function isRateLimitOrModelUnavailable(error: unknown): boolean {
  if (error instanceof AIProviderError) {
    // 429 = rate limit, 503 = service unavailable, 502 = bad gateway
    if ([429, 503, 502].includes(error.statusCode)) return true;
    // OpenRouter specific: model not available
    if (error.message.includes('no endpoints available')) return true;
    if (error.message.includes('model not found')) return true;
    if (error.message.includes('is currently overloaded')) return true;
  }
  return false;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public provider: string,
    public model: string
  ) {
    super(message);
    this.name = 'AIProviderError';
  }
}

// ---- Core Provider Call with Exponential Backoff ----

async function callProvider(
  provider: ProviderName,
  model: string,
  prompt: string,
  opts: { maxTokens: number; temperature: number; systemPrompt?: string; taskType: TaskType }
): Promise<string> {
  const config = PROVIDERS[provider];
  const apiKey = config.getApiKey(opts.taskType);

  if (!apiKey) {
    throw new AIProviderError(
      `${provider} API key not configured`,
      401,
      provider,
      model
    );
  }

  // Wait for rate limit slot
  await config.limiter.waitForSlot();

  const messages: Array<{ role: string; content: string }> = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  // Build body as a real object, then stringify (Section 8.5)
  const body = {
    model,
    messages,
    max_tokens: opts.maxTokens,
    temperature: opts.temperature,
  };

  // Exponential backoff on 429 (2s, 4s, 8s then give up)
  const backoffDelays = [2000, 4000, 8000];

  for (let attempt = 0; attempt <= backoffDelays.length; attempt++) {
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 429 && attempt < backoffDelays.length) {
          console.warn(
            `[AI] ${provider}/${model} rate limited (429), retrying in ${backoffDelays[attempt]}ms...`
          );
          await new Promise((r) => setTimeout(r, backoffDelays[attempt]));
          continue;
        }

        throw new AIProviderError(
          `${provider}/${model} returned ${response.status}: ${errorText}`,
          response.status,
          provider,
          model
        );
      }

      const data = await response.json();

      // Standard OpenAI-compatible response shape
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new AIProviderError(
          `${provider}/${model} returned empty content`,
          200,
          provider,
          model
        );
      }

      return content.trim();
    } catch (error) {
      if (error instanceof AIProviderError) throw error;

      // Network errors — retry with backoff
      if (attempt < backoffDelays.length) {
        console.warn(
          `[AI] ${provider}/${model} network error, retrying in ${backoffDelays[attempt]}ms...`,
          error
        );
        await new Promise((r) => setTimeout(r, backoffDelays[attempt]));
        continue;
      }

      throw new AIProviderError(
        `${provider}/${model} network error: ${error instanceof Error ? error.message : String(error)}`,
        0,
        provider,
        model
      );
    }
  }

  throw new AIProviderError(
    `${provider}/${model} exhausted all retry attempts`,
    429,
    provider,
    model
  );
}

// ---- Main callAI with Fallback Chain (Section 8.3) ----

export interface AICallOptions {
  maxTokens?: number;
  temperature?: number;
  taskType?: TaskType;
  systemPrompt?: string;
}

export async function callAI(
  prompt: string,
  opts: AICallOptions = {}
): Promise<string> {
  const {
    maxTokens = 1024,
    temperature = 0.3,
    taskType = 'default',
    systemPrompt,
  } = opts;

  let chain: Array<{ provider: ProviderName; model: string }> = [];

  if (taskType === 'heavy') {
    chain = [
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },
      { provider: 'groq', model: 'llama-3.1-8b-instant' },
      { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct' },
    ];
  } else if (taskType === 'psychological') {
    chain = [
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },
      { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct' },
      { provider: 'groq', model: 'llama-3.1-8b-instant' },
    ];
  } else if (taskType === 'email') {
    chain = [
      { provider: 'groq', model: 'llama-3.1-8b-instant' },
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },
      { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct' },
    ];
  } else {
    // Default / Scraping / Filtering tasks
    chain = [
      { provider: 'groq', model: 'llama-3.1-8b-instant' },
      { provider: 'groq', model: 'llama-3.3-70b-versatile' },
      { provider: 'openrouter', model: 'meta-llama/llama-3.3-70b-instruct' },
    ];
  }

  const errors: string[] = [];

  for (const { provider, model } of chain) {
    try {
      console.log(`[AI] Trying ${provider}/${model}...`);
      const result = await callProvider(provider, model, prompt, {
        maxTokens,
        temperature,
        systemPrompt,
        taskType,
      });
      console.log(`[AI] Success with ${provider}/${model}`);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      errors.push(`${provider}/${model}: ${errorMsg}`);
      console.warn(`[AI] ${provider}/${model} failed: ${errorMsg}`);

      if (isRateLimitOrModelUnavailable(err)) {
        console.log(`[AI] Rate limit/unavailable — trying next in chain...`);
        continue;
      }

      // Real error (bad request, auth) — don't silently swallow
      // But still try the next provider as a fallback
      console.warn(`[AI] Non-transient error, trying next provider...`);
      continue;
    }
  }

  throw new Error(
    `All AI providers in the fallback chain failed:\n${errors.join('\n')}`
  );
}

// ---- Convenience wrappers for common tasks ----

/** Quality-critical tasks: CV tailoring, ATS scoring */
export async function callAIQuality(
  prompt: string,
  opts: Omit<AICallOptions, 'taskType'> = {}
): Promise<string> {
  return callAI(prompt, { ...opts, taskType: 'heavy' });
}

/** Standard tasks: relevance check, generic extraction */
export async function callAIStandard(
  prompt: string,
  opts: Omit<AICallOptions, 'taskType'> = {}
): Promise<string> {
  return callAI(prompt, { ...opts, taskType: 'default' });
}

/** Outreach specific tasks */
export async function callAIEmail(
  prompt: string,
  opts: Omit<AICallOptions, 'taskType'> = {}
): Promise<string> {
  return callAI(prompt, { ...opts, taskType: 'email' });
}

export async function callAIPsychological(
  prompt: string,
  opts: Omit<AICallOptions, 'taskType'> = {}
): Promise<string> {
  return callAI(prompt, { ...opts, taskType: 'psychological' });
}

/** 
 * Parse JSON from AI response — robust extraction that handles:
 * - Markdown code fences (```json ... ```)
 * - Leading/trailing prose ("Here's the JSON:", etc.)
 * - Trailing commas
 * - Control characters in strings
 */
export function parseAIJson<T>(response: string): T {
  let cleaned = response.trim();

  // Strip markdown code fences (```json ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?[\s\n]*/, '').replace(/[\n\s]*```\s*$/, '');
  }

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue to more aggressive extraction
  }

  // Extract JSON object from response text
  // Find the first { and last matching }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    let jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
    
    // Remove control characters that break JSON (except normal whitespace)
    jsonCandidate = jsonCandidate.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ' ');
    
    // Fix trailing commas before } or ]
    jsonCandidate = jsonCandidate.replace(/,\s*([}\]])/g, '$1');
    
    try {
      return JSON.parse(jsonCandidate);
    } catch {
      // Continue to array extraction
    }
  }

  // Try extracting JSON array
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    let jsonCandidate = cleaned.substring(firstBracket, lastBracket + 1);
    jsonCandidate = jsonCandidate.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ' ');
    jsonCandidate = jsonCandidate.replace(/,\s*([}\]])/g, '$1');
    
    try {
      return JSON.parse(jsonCandidate);
    } catch {
      // Fall through
    }
  }

  // Last resort: try the original cleaned string
  throw new Error(`Could not extract valid JSON from AI response: ${cleaned.substring(0, 200)}...`);
}
