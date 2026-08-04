/** Canonical public origin for links, OAuth, and mail. */

const DEFAULT_APP_URL = "http://localhost:3002";

export function getAppUrl() {
  const raw = process.env.APP_URL?.trim() || DEFAULT_APP_URL;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`APP_URL is not a valid URL: ${raw}`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`APP_URL must be http(s): ${raw}`);
  }
  // Strip trailing slash; keep origin only (no path/query).
  return url.origin;
}

export function absoluteUrl(path: string) {
  const base = getAppUrl();
  if (!path.startsWith("/")) {
    return `${base}/${path}`;
  }
  return `${base}${path}`;
}

export function isLocalAppUrl(appUrl = getAppUrl()) {
  const { hostname } = new URL(appUrl);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname.endsWith(".localhost")
  );
}
