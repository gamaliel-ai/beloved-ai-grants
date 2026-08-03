/** Current calendar month in UTC (inclusive start, exclusive end). */
export function currentUtcMonthPeriod(now = new Date()) {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return { start, end, label: formatPeriodLabel(start, end) };
}

export function formatPeriodLabel(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  // Month window: show month name of start.
  if (
    start.getUTCDate() === 1 &&
    end.getUTCMonth() === (start.getUTCMonth() + 1) % 12
  ) {
    return formatter.format(start);
  }
  return `${formatter.format(start)} – ${formatter.format(
    new Date(end.getTime() - 1),
  )}`;
}

export function formatUsdCents(cents: number | null | undefined) {
  if (cents == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function formatCompactNumber(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-US", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatRelativeAge(date: Date | null | undefined, now = new Date()) {
  if (!date) return "never";
  const seconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86_400)} day${seconds >= 172_800 ? "s" : ""} ago`;
}

/** Sync older than this is considered stale for dashboard freshness. */
export const STALE_SYNC_MS = 6 * 60 * 60 * 1000;
