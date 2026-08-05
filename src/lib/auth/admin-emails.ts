/** Admin allowlist — GitHub account emails from ADMIN_EMAILS (comma-separated). */

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((part) => normalizeEmail(part))
    .filter((email) => email.length > 0);
}

export function adminEmails() {
  return new Set(parseAdminEmails());
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return adminEmails().has(normalizeEmail(email));
}
