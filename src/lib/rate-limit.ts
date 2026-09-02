/* Rate limiting ساده در حافظه — ضد تقلب/بات روی APIهای بازی و OTP
   در استقرار چند‌نمونه‌ای (production) باید به Redis منتقل شود. */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetInMs: windowMs };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetInMs: bucket.resetAt - now };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, resetInMs: bucket.resetAt - now };
}

// پاکسازی دوره‌ای برای جلوگیری از نشت حافظه
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }, 60_000);
  if (typeof timer === "object" && "unref" in timer) (timer as { unref: () => void }).unref();
}
