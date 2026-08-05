import { afterEach, describe, expect, it } from "vitest";
import {
  isAdminEmail,
  normalizeEmail,
} from "@/lib/auth/admin-emails";

const originalAdminEmails = process.env.ADMIN_EMAILS;

afterEach(() => {
  process.env.ADMIN_EMAILS = originalAdminEmails;
});

describe("admin email authorization", () => {
  it("allows ADMIN_EMAILS entries and rejects others", () => {
    process.env.ADMIN_EMAILS =
      "lewiscirne@mac.com, mshandera@gamaliel.ai";

    expect(isAdminEmail("lewiscirne@mac.com")).toBe(true);
    expect(isAdminEmail(" LewisCirne@mac.com ")).toBe(true);
    expect(isAdminEmail("mshandera@gamaliel.ai")).toBe(true);
    expect(isAdminEmail("outsider@example.com")).toBe(false);
    expect(normalizeEmail(" Lewis@Example.COM ")).toBe("lewis@example.com");
  });

  it("denies everyone when ADMIN_EMAILS is empty", () => {
    process.env.ADMIN_EMAILS = "";
    expect(isAdminEmail("lewiscirne@mac.com")).toBe(false);
  });
});
