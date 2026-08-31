/** Public marketing links and shared site copy helpers. */

export const site = {
  name: "Beloved AI Grants",
  tagline: "AI access for hopeful builders",
  description:
    "Beloved AI Grants sponsors OpenAI API access for students and entrepreneurs building with AI. We pay the usage bill, and you do not need a credit card.",
} as const;

export const links = {
  belovedInChrist: "https://www.belovedinchristfoundation.org/",
  lkcStudios: "https://lkc-studios.vercel.app",
  gamaliel: "https://gamaliel.ai",
  openaiPlatform: "https://platform.openai.com/docs/overview",
  openaiQuickstart: "https://platform.openai.com/docs/quickstart",
  openaiCookbook: "https://cookbook.openai.com/",
  cursor: "https://cursor.com/",
  cursorDocs: "https://docs.cursor.com/",
  anthropicClaude: "https://claude.ai/",
} as const;

export type ForumEvent = {
  /** Stable URL segment. Printed on QR codes, so never reuse or rename one. */
  slug: string;
  name: string;
  shortName: string;
  city: string;
  dates: string;
  venue: string;
};

export const events: readonly ForumEvent[] = [
  {
    slug: "nairobi-2026",
    name: "Digital Technology & Faith Forum",
    shortName: "DTF Forum",
    city: "Nairobi, Kenya",
    dates: "17–18 September 2026",
    venue: "AEA Plaza & Media Centre",
  },
];

/**
 * The event promoted on the home page and served at /forum. Set to null between
 * events so evergreen pages stop advertising one that has passed.
 */
export const featuredEventSlug: string | null = "nairobi-2026";

export function findEvent(slug: string): ForumEvent | undefined {
  return events.find((event) => event.slug === slug);
}

export function getFeaturedEvent(): ForumEvent | null {
  if (!featuredEventSlug) return null;
  return findEvent(featuredEventSlug) ?? null;
}
