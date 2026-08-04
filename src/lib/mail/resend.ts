import { Resend } from "resend";
import type { MailSender, SentMail, TransactionalMail } from "./types";

export class ResendMailSender implements MailSender {
  private readonly client: Resend;

  constructor(
    apiKey: string,
    private readonly from: string,
  ) {
    this.client = new Resend(apiKey);
  }

  async send(message: TransactionalMail): Promise<SentMail> {
    const { data, error } = await this.client.emails.send(
      {
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
      },
      message.idempotencyKey
        ? { idempotencyKey: message.idempotencyKey }
        : undefined,
    );

    if (error || !data?.id) {
      throw new Error(
        error?.message ?? "Resend did not return a message id.",
      );
    }

    return {
      ...message,
      id: data.id,
      from: this.from,
      mode: "live",
      sentAt: new Date().toISOString(),
    };
  }
}
