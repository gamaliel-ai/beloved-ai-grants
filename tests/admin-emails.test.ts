import { afterEach, describe, expect, it } from "vitest";
import {
  isAdminEmail,
  normalizeEmail,
} from "@/lib/auth/admin-emails";

const original = process.env.ADMIN_EMAILS;

afterEach(() => {
  process.env.ADMIN_EMAILS = original;
});

describe("admin email authorization", () => {
  it("normalizes configured and presented identities", () => {
    process.env.ADMIN_EMAILS = " Owner@Example.com,second@example.com ";
    expect(isAdminEmail("owner@example.com")).toBe(true);
    expect(isAdminEmail(" SECOND@example.com ")).toBe(true);
    expect(isAdminEmail("outsider@example.com")).toBe(false);
    expect(normalizeEmail(" Lewis@Example.COM ")).toBe("lewis@example.com");
  });
});
