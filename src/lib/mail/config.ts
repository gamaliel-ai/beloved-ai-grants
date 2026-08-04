import { getAppUrl, isLocalAppUrl } from "@/lib/app-url";
import { site } from "@/lib/site";

/** Non-secret mail product constants — not env. */
export const mailConfig = {
  fromLocalPart: "grants",
  fromName: site.name,
} as const;

export type MailMode = "live" | "fake";

/** Live only with a Resend secret and a non-local APP_URL. Not an env flag. */
export function getMailMode(): MailMode {
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
