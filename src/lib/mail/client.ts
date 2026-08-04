import { getMailFrom, getMailMode } from "./config";
import { FakeMailSender } from "./fake";
import type { MailSender, TransactionalMail } from "./types";

type GlobalMail = typeof globalThis & {
  belovedMailSender?: MailSender;
};

export async function getMailSenderAsync(): Promise<MailSender> {
  const globals = globalThis as GlobalMail;
  if (globals.belovedMailSender) return globals.belovedMailSender;

  const from = getMailFrom().formatted;
  if (getMailMode() === "live") {
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) {
      throw new Error("RESEND_API_KEY is required for live mail.");
    }
    const { ResendMailSender } = await import("./resend");
    globals.belovedMailSender = new ResendMailSender(key, from);
  } else {
    globals.belovedMailSender = new FakeMailSender(from);
  }
  return globals.belovedMailSender;
}

/** Test helper: clear cached sender so mode/env changes take effect. */
export function resetMailSenderForTests() {
  delete (globalThis as GlobalMail).belovedMailSender;
}

export async function sendTransactionalMail(message: TransactionalMail) {
  return (await getMailSenderAsync()).send(message);
}

export { getMailFrom, getMailMode, mailConfig } from "./config";
export {
  clearFakeMailOutbox,
  getFakeMailOutbox,
} from "./fake";
export type { SentMail, TransactionalMail } from "./types";
