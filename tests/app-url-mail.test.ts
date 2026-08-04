import { afterEach, describe, expect, it } from "vitest";
import {
  absoluteUrl,
  getAppUrl,
  isLocalAppUrl,
} from "@/lib/app-url";
import { getMailFrom, getMailMode } from "@/lib/mail/config";
import {
  clearFakeMailOutbox,
  FakeMailSender,
  getFakeMailOutbox,
} from "@/lib/mail/fake";

const originalAppUrl = process.env.APP_URL;
const originalResend = process.env.RESEND_API_KEY;

afterEach(() => {
  process.env.APP_URL = originalAppUrl;
  process.env.RESEND_API_KEY = originalResend;
  clearFakeMailOutbox();
});

describe("app url", () => {
  it("defaults to local port 3002 and builds absolute paths", () => {
    delete process.env.APP_URL;
    expect(getAppUrl()).toBe("http://localhost:3002");
    expect(absoluteUrl("/redeem/abc")).toBe(
      "http://localhost:3002/redeem/abc",
    );
    expect(isLocalAppUrl()).toBe(true);
  });

  it("strips trailing slash and rejects bad URLs", () => {
    process.env.APP_URL = "https://grants.example.com/";
    expect(getAppUrl()).toBe("https://grants.example.com");
    expect(isLocalAppUrl()).toBe(false);

    process.env.APP_URL = "not a url";
    expect(() => getAppUrl()).toThrow(/not a valid URL/);
  });
});

describe("mail config and fake sender", () => {
  it("derives From from APP_URL hostname", () => {
    process.env.APP_URL = "https://grants.example.com";
    expect(getMailFrom()).toEqual({
      address: "grants@grants.example.com",
      name: "Beloved AI Grants",
      formatted: "Beloved AI Grants <grants@grants.example.com>",
    });
  });

  it("stays fake on localhost even when RESEND_API_KEY is set", async () => {
    process.env.APP_URL = "http://localhost:3002";
    process.env.RESEND_API_KEY = "re_test";

    expect(getMailMode()).toBe("fake");

    const sender = new FakeMailSender(getMailFrom().formatted);
    const sent = await sender.send({
      purpose: "claim_link",
      to: "grantee@example.com",
      subject: "Your claim link",
      html: "<p>Hello</p>",
      text: "Hello",
      idempotencyKey: "claim:1",
    });

    expect(sent.mode).toBe("fake");
    expect(sent.from).toContain("grants@localhost");
    expect(getFakeMailOutbox()).toHaveLength(1);
    expect(getFakeMailOutbox()[0]?.purpose).toBe("claim_link");
  });
});
