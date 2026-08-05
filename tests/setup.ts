import "@testing-library/jest-dom/vitest";

/** Synthetic allowlist for unit tests (not production operator emails). */
process.env.ADMIN_EMAILS ??= "lewiscirne@mac.com";
