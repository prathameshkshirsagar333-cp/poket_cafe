/**
 * Simple In-Memory Rate Limiter
 * Provides brute-force protection to specific endpoints based on IP or Email.
 */
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 3,
  windowMs: number = 60000 // default 1 min
): { success: boolean; message?: string } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record) {
    rateLimitMap.set(identifier, { count: 1, windowStart: now });
    return { success: true };
  }

  // If window passed, reset
  if (now - record.windowStart > windowMs) {
    rateLimitMap.set(identifier, { count: 1, windowStart: now });
    return { success: true };
  }

  // If over limit, block
  if (record.count >= limit) {
    return { 
      success: false, 
      message: `Too many requests. Please try again in ${Math.ceil((windowMs - (now - record.windowStart)) / 1000)}s.`
    };
  }

  // Increment
  record.count += 1;
  return { success: true };
}
