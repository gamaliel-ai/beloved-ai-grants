export type TransactionalMail = {
  /** Stable purpose for audit / idempotency (e.g. claim_link). */
  purpose: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  idempotencyKey?: string;
};

export type SentMail = TransactionalMail & {
  id: string;
  from: string;
  mode: "live" | "fake";
  sentAt: string;
};

export type MailSender = {
  send(message: TransactionalMail): Promise<SentMail>;
};
