import type { Metadata } from "next";
import Link from "next/link";
import { links } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Starter links for building with AI—OpenAI docs, coding agents, and projects from LKC Studios.",
};

type Resource = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

const learn: Resource[] = [
  {
    title: "OpenAI platform overview",
    description:
      "How the API works, models, and what you can build once you have a key.",
    href: links.openaiPlatform,
    external: true,
  },
  {
    title: "OpenAI quickstart",
    description:
      "Make your first API call in minutes—ideal right after you redeem a grant.",
    href: links.openaiQuickstart,
    external: true,
  },
  {
    title: "OpenAI Cookbook",
    description:
      "Practical recipes and patterns from OpenAI for real product features.",
    href: links.openaiCookbook,
    external: true,
  },
];

const tools: Resource[] = [
  {
    title: "Cursor",
    description:
      "An AI-native code editor many builders use to write working software faster.",
    href: links.cursor,
    external: true,
  },
  {
    title: "Cursor docs",
    description: "How to pair an editor agent with your codebase day to day.",
    href: links.cursorDocs,
    external: true,
  },
  {
    title: "Claude",
    description:
      "Another strong coding and writing partner—useful alongside your API work.",
    href: links.anthropicClaude,
    external: true,
  },
];

const inspiration: Resource[] = [
  {
    title: "LKC Studios",
    description:
      "Lew Cirne’s project site—see what he is building with AI almost daily.",
    href: links.lkcStudios,
    external: true,
  },
  {
    title: "Gamaliel",
    description:
      "An AI-assisted Bible reader: one example of faith and technology working together.",
    href: links.gamaliel,
    external: true,
  },
  {
    title: "Beloved in Christ Foundation",
    description:
      "The foundation sponsoring this programme and serving partners around the world.",
    href: links.belovedInChrist,
    external: true,
  },
];

function ResourceList({ items }: { items: Resource[] }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item.href} className="space-y-1">
          <a
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={item.href}
            {...(item.external
              ? { rel: "noopener noreferrer", target: "_blank" }
              : {})}
          >
            {item.title}
          </a>
          <p className="text-sm text-muted-foreground text-pretty">
            {item.description}
          </p>
        </li>
      ))}
    </ul>
  );
}

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-12">
      <div className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.28em] text-brand-gold-deep uppercase">
          Resources
        </p>
        <h1 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
          Get started building with AI
        </h1>
        <p className="font-light text-muted-foreground text-pretty">
          A sponsored API key is a beginning—not the whole journey. These links
          help you make your first calls, use coding agents wisely, and see
          examples of products shaped by faith and craft.
        </p>
      </div>

      <section className="space-y-4 border-t border-brand-gold/30 pt-10">
        <h2 className="font-display text-xl font-light tracking-tight">
          Learn the API
        </h2>
        <ResourceList items={learn} />
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-10">
        <h2 className="font-display text-xl font-light tracking-tight">
          Build faster with agents
        </h2>
        <p className="text-sm font-light text-muted-foreground text-pretty">
          Many builders start in an AI coding editor, then use an API key once
          their product needs models running live. Both paths matter.
        </p>
        <ResourceList items={tools} />
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-10">
        <h2 className="font-display text-xl font-light tracking-tight">
          Inspiration
        </h2>
        <ResourceList items={inspiration} />
      </section>

      <p className="text-sm text-muted-foreground">
        Have a programme invite? Redeem it when your organiser shares the link.
        Questions about the programme itself are covered in the{" "}
        <Link
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href="/faq"
        >
          FAQ
        </Link>
        .
      </p>
    </div>
  );
}
