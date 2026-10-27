/**
 * Supabase Request Resiliency, Deduplication, Caching & Rate-Limit Handler
 *
 * Implements:
 * 1. Exponential backoff retry with jitter for retryable network/429 errors.
 * 2. In-flight request deduplication for concurrent identical requests.
 * 3. In-memory TTL cache with automatic invalidation on mutations.
 * 4. Error classification (Auth rate-limit vs PostgREST 429 vs network).
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();

/**
 * Executes a database operation with in-flight deduplication and optional caching.
 */
export async function cachedOrInFlight<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttlMs = 60000 // default 60s
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && cached.expiry > now) {
    return cached.data;
  }

  // Deduplicate in-flight requests
  const existingPromise = inFlightRequests.get(cacheKey);
  if (existingPromise) {
    return existingPromise as Promise<T>;
  }

  const promise = (async () => {
    try {
      const data = await executeWithRetry(fetcher);
      if (ttlMs > 0 && data !== undefined && data !== null) {
        memoryCache.set(cacheKey, {
          data,
          expiry: Date.now() + ttlMs,
        });
      }
      return data;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise as Promise<T>;
}

/**
 * Invalidates cache by exact key or prefix.
 */
export function invalidateCache(keyOrPrefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key === keyOrPrefix || key.startsWith(`${keyOrPrefix}:`)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Clears entire memory cache.
 */
export function clearAllCache(): void {
  memoryCache.clear();
  inFlightRequests.clear();
}

/**
 * Detects whether an error is a rate limit error (HTTP 429 or GoTrue limit).
 */
export function isRateLimitError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.statusCode || err.code;
  const msg = (err.message || '').toLowerCase();

  return (
    status === 429 ||
    status === '429' ||
    status === 'over_email_send_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('email rate limit exceeded')
  );
}

/**
 * Executes an operation with exponential backoff retry for transient network and 429 errors.
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T> | PromiseLike<T> | any,
  maxRetries = 2,
  baseDelayMs = 500
): Promise<T> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (err: any) {
      attempt++;

      // Non-retryable errors: validation, duplicate keys, RLS policies, syntax errors
      const isRateLimit = isRateLimitError(err);
      const isNetworkError =
        err?.message?.includes('fetch failed') ||
        err?.message?.includes('network') ||
        err?.message?.includes('ENOTFOUND');

      if (attempt > maxRetries || (!isRateLimit && !isNetworkError)) {
        throw err;
      }

      // Respect Retry-After if provided in error response
      let delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      const jitter = Math.random() * 200;
      const retryAfter = err?.headers?.get?.('Retry-After');
      if (retryAfter) {
        const parsed = parseInt(retryAfter, 10);
        if (!isNaN(parsed) && parsed > 0) {
          delayMs = parsed * 1000;
        }
      }

      const totalDelay = Math.min(delayMs + jitter, 5000);
      console.warn(`[SupabaseHelper] Retryable error encountered (attempt ${attempt}/${maxRetries}). Backing off for ${Math.round(totalDelay)}ms:`, err?.message || err);
      await new Promise((res) => setTimeout(res, totalDelay));
    }
  }

  throw new Error('Operation failed after retries.');
}

export const queryCache = {
  getOrFetch: cachedOrInFlight,
  invalidate: invalidateCache,
  clearAll: clearAllCache,
};

