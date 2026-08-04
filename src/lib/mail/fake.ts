import type { MailSender, SentMail, TransactionalMail } from "./types";

type GlobalFakeMail = typeof globalThis & {
  belovedFakeMailOutbox?: SentMail[];
};

export function getFakeMailOutbox(): SentMail[] {
  const globals = globalThis as GlobalFakeMail;
  if (!globals.belovedFakeMailOutbox) {
    globals.belovedFakeMailOutbox = [];
  }
  return globals.belovedFakeMailOutbox;
}

export function clearFakeMailOutbox() {
  getFakeMailOutbox().length = 0;
}

export class FakeMailSender implements MailSender {
  constructor(private readonly from: string) {}

  async send(message: TransactionalMail): Promise<SentMail> {
    const sent: SentMail = {
      ...message,
      id: `fake_${getFakeMailOutbox().length + 1}`,
      from: this.from,
      mode: "fake",
      sentAt: new Date().toISOString(),
    };
    getFakeMailOutbox().push(sent);
    return sent;
  }
}
