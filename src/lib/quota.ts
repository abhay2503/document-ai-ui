// The daily summary quota resets at 00:00 UTC (same day key the API uses).

/** Today's UTC day, e.g. "2026-11-24". */
export function utcDay(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** The next 00:00 UTC. */
export function nextQuotaReset(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
}

/** Reset time in the user's local timezone, e.g. "5:30 AM" in India. */
export function formatQuotaReset(now = new Date()): string {
  return nextQuotaReset(now).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
