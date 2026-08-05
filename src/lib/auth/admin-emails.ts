/** Admin allowlist — GitHub account emails only. Not a secret. */
const ADMIN_EMAILS = ["lewiscirne@mac.com"] as const;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function adminEmails() {
  return new Set(ADMIN_EMAILS.map(normalizeEmail));
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  return adminEmails().has(normalizeEmail(email));
}
