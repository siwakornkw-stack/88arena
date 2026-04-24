import { describe, it, expect } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

describe('rateLimit', () => {
  it('allows requests under the limit', () => {
    const config = { limit: 3, windowMs: 60_000 };
    const key = `test-under-${Date.now()}`;

    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);
  });

  it('blocks requests over the limit', () => {
    const config = { limit: 2, windowMs: 60_000 };
    const key = `test-over-${Date.now()}`;

    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(true);
    const blocked = rateLimit(key, config);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('decrements remaining count', () => {
    const config = { limit: 5, windowMs: 60_000 };
    const key = `test-remaining-${Date.now()}`;

    const r1 = rateLimit(key, config);
    expect(r1.remaining).toBe(4);
    const r2 = rateLimit(key, config);
    expect(r2.remaining).toBe(3);
  });

  it('resets after the window expires', async () => {
    const config = { limit: 1, windowMs: 50 };
    const key = `test-reset-${Date.now()}`;

    expect(rateLimit(key, config).success).toBe(true);
    expect(rateLimit(key, config).success).toBe(false);

    await new Promise((r) => setTimeout(r, 60));
    expect(rateLimit(key, config).success).toBe(true);
  });

  it('isolates keys', () => {
    const config = { limit: 1, windowMs: 60_000 };
    const k1 = `iso-a-${Date.now()}`;
    const k2 = `iso-b-${Date.now()}`;

    expect(rateLimit(k1, config).success).toBe(true);
    expect(rateLimit(k2, config).success).toBe(true);
    expect(rateLimit(k1, config).success).toBe(false);
  });
});
