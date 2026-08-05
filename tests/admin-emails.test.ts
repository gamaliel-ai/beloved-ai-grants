import { describe, expect, it } from "vitest";
import {
  isAdminEmail,
  normalizeEmail,
} from "@/lib/auth/admin-emails";

describe("admin email authorization", () => {
  it("allows hardcoded admins and rejects others", () => {
    expect(isAdminEmail("lewiscirne@mac.com")).toBe(true);
    expect(isAdminEmail(" LewisCirne@mac.com ")).toBe(true);
    expect(isAdminEmail("outsider@example.com")).toBe(false);
    expect(normalizeEmail(" Lewis@Example.COM ")).toBe("lewis@example.com");
  });
});
