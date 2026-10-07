const hits = new Map<string, number[]>();

// ponytail: process-local limiter; move to shared storage if Hostinger runs multiple app instances.
export function rateLimit(key: string, limit: number, windowMs: number) {
  const cutoff = Date.now() - windowMs;
  const recent = (hits.get(key) || []).filter((time) => time > cutoff);
  if (recent.length >= limit) return false;
  recent.push(Date.now());
  hits.set(key, recent);
  return true;
}
