import { getAppUrl, isLocalAppUrl } from "@/lib/app-url";
import { site } from "@/lib/site";

/** Non-secret mail product constants — not env. */
export const mailConfig = {
  fromLocalPart: "grants",
  fromName: site.name,
} as const;

export type MailMode = "live" | "fake";

export function getMailMode(): MailMode {
  const configured = process.env.EMAIL_MODE?.trim().toLowerCase();
  if (configured === "live" || configured === "fake") return configured;
  if (!process.env.RESEND_API_KEY?.trim()) return "fake";
  if (isLocalAppUrl()) return "fake";
  return "live";
}

/** RFC5322 From value derived from APP_URL hostname. */
export function getMailFrom() {
  const hostname = new URL(getAppUrl()).hostname;
  const address = `${mailConfig.fromLocalPart}@${hostname}`;
  return {
    address,
    name: mailConfig.fromName,
    formatted: `${mailConfig.fromName} <${address}>`,
  };
}
