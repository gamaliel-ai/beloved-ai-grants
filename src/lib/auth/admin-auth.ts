import { isAdminEmail, normalizeEmail } from "./admin-emails";

export class AdminAuthError extends Error {
  constructor(message = "Admin authentication required.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function isAuthTestBypassActive() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.AUTH_TEST_BYPASS === "1"
  );
}

export function getAuthTestEmail() {
  return normalizeEmail(
    process.env.AUTH_TEST_EMAIL ?? "test-admin@example.com",
  );
}

/** Shared allowlist check for cookie sessions and MCP bearer tokens. */
export function assertAdminEmail(email: string | null | undefined): string {
  if (!email) {
    throw new AdminAuthError();
  }
  const normalized = normalizeEmail(email);
  if (isAdminEmail(normalized)) {
    return normalized;
  }
  if (isAuthTestBypassActive() && normalized === getAuthTestEmail()) {
    return normalized;
  }
  throw new AdminAuthError();
}
