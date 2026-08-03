import { afterEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() =>
  vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
);

vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

import { requireAdmin } from "@/lib/auth/require-admin";

const originalAdmins = process.env.ADMIN_EMAILS;
const originalBypass = process.env.AUTH_TEST_BYPASS;

afterEach(() => {
  process.env.ADMIN_EMAILS = originalAdmins;
  process.env.AUTH_TEST_BYPASS = originalBypass;
  authMock.mockReset();
  redirectMock.mockClear();
});

describe("requireAdmin", () => {
  it("returns an approved normalized GitHub email", async () => {
    delete process.env.AUTH_TEST_BYPASS;
    process.env.ADMIN_EMAILS = "Owner@Example.com";
    authMock.mockResolvedValue({ user: { email: "owner@example.com" } });

    await expect(requireAdmin()).resolves.toBe("owner@example.com");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects an authenticated but unapproved identity", async () => {
    delete process.env.AUTH_TEST_BYPASS;
    process.env.ADMIN_EMAILS = "owner@example.com";
    authMock.mockResolvedValue({ user: { email: "outsider@example.com" } });

    await expect(requireAdmin()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });
});
