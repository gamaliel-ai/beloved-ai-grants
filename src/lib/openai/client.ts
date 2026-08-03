import "server-only";
import {
  FakeOpenAIAdminGateway,
  type OpenAIAdminGateway,
} from "./gateway";
import { RealOpenAIAdminGateway } from "./real-gateway";

type GlobalGateway = typeof globalThis & {
  belovedOpenAIGateway?: OpenAIAdminGateway;
};

export function getOpenAIMode(): "live" | "fake" {
  const configured = process.env.OPENAI_MODE?.trim().toLowerCase();
  if (configured === "live" || configured === "fake") return configured;
  return process.env.OPENAI_ADMIN_KEY ? "live" : "fake";
}

export function getOpenAIAdminGateway() {
  const globals = globalThis as GlobalGateway;
  if (globals.belovedOpenAIGateway) return globals.belovedOpenAIGateway;

  if (getOpenAIMode() === "live") {
    const key = process.env.OPENAI_ADMIN_KEY;
    if (!key) {
      throw new Error(
        "OPENAI_ADMIN_KEY is required when OPENAI_MODE is live.",
      );
    }
    globals.belovedOpenAIGateway = new RealOpenAIAdminGateway(key);
  } else {
    globals.belovedOpenAIGateway = new FakeOpenAIAdminGateway();
  }
  return globals.belovedOpenAIGateway;
}
