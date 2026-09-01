import type { ReactNode } from "react";
import Link from "next/link";
import { HeroMotion } from "@/components/hero-motion";
import { JoinForm } from "@/components/join-form";
import { getFeaturedEvent, links, site } from "@/lib/site";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-medium tracking-[0.24em] text-brand-gold-deep uppercase">
      {children}
    </p>
  );
}

/** Label and heading travel together as one group, tight against each other. */
function SectionHeading({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <SectionLabel>{label}</SectionLabel>
      <h2 className="font-display text-2xl font-light tracking-tight sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}

export default function HomePage() {
  const featuredEvent = getFeaturedEvent();

  return (
    <div className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
      <section className="space-y-6">
        <div className="space-y-2">
          <SectionLabel>{site.name}</SectionLabel>
          <h1 className="font-display text-4xl font-light tracking-tight text-balance sm:text-5xl md:text-6xl">
            A remarkable time to build.
          </h1>
        </div>
        <p className="text-lg font-light leading-relaxed text-muted-foreground text-pretty">
          AI has changed what a small team—or one determined person—can create.
          We want to inspire and support students and entrepreneurs across
          Africa and beyond as they find new ways to innovate, serve others, and
          grow businesses that help their communities flourish.
        </p>

        <div className="space-y-3 border-t border-brand-gold/30 pt-6">
          <p className="text-sm font-light text-foreground text-pretty">
            Part of a programme or forum? Enter the email you gave your
            organiser and we will send your claim link.
          </p>
          <JoinForm idPrefix="home-join" />
          <p className="text-sm font-light text-muted-foreground">
            <Link
              className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
              href="/faq"
            >
              Learn how the programme works
            </Link>
          </p>
        </div>

        <HeroMotion />
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <SectionHeading label="Why we are doing this">
          Tools in the hands of builders
        </SectionHeading>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          With AI, what once took a dozen engineers and millions of dollars can
          now begin with one determined person and the device already in their
          hand. That is good news for entrepreneurship in Kenya and beyond.
          Beloved AI Grants is a ministry of the{" "}
          <a
            className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
            href={links.belovedInChrist}
            rel="noopener noreferrer"
            target="_blank"
          >
            Beloved in Christ Foundation
          </a>
          : a practical way to put tools in the hands of builders who want to
          create with excellence and purpose.
        </p>
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <SectionHeading label="What we offer">
          Sponsored OpenAI access
        </SectionHeading>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          Approved participants receive a sponsored{" "}
          <span className="text-foreground">OpenAI API key</span>—a private code
          that lets your app use OpenAI models. Use it while you develop your
          idea, and to power what you launch.
        </p>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          We pay the usage bill. You do not need a credit card, and you do not
          need to set anything up with OpenAI yourself. Each grant has a budget
          so we can support many builders fairly; if you are near your limit and
          still building something meaningful, tell your organiser.
        </p>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          The work stays yours. Whenever you are ready, create your own OpenAI
          account and move your app across—usually a small change to one
          setting.
        </p>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          You get access through a programme you have joined. Use the email form
          above, open{" "}
          <Link
            className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
            href="/join"
          >
            /join
          </Link>
          , or follow the private invite link from your organiser.
        </p>
      </section>

      {featuredEvent ? (
        <section className="space-y-3 border-t border-brand-gold/30 pt-6 sm:pt-8">
          <SectionLabel>Launching at</SectionLabel>
          <p className="font-light leading-relaxed text-muted-foreground text-pretty">
            The {featuredEvent.name} in {featuredEvent.city} (
            {featuredEvent.dates}).{" "}
            <Link
              className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
              href={`/forum/${featuredEvent.slug}`}
            >
              Attending? See the forum details
            </Link>
            .
          </p>
        </section>
      ) : null}

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <SectionHeading label="Built by a builder">
          Faith and technology, practised daily
        </SectionHeading>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          Lew Cirne, founder of the Beloved in Christ Foundation, still writes
          code with AI almost every day—including{" "}
          <a
            className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
            href={links.gamaliel}
            rel="noopener noreferrer"
            target="_blank"
          >
            Gamaliel
          </a>
          , an AI-assisted Bible reader, and more experiments in faith and
          technology.
        </p>
      </section>

      <section className="border border-brand-gold/40 bg-brand-ink px-6 py-8 text-brand-parchment sm:px-10 sm:py-10">
        <SectionLabel>
          <span className="text-brand-gold">Have a programme invite?</span>
        </SectionLabel>
        <h2 className="mt-2 font-display text-2xl font-light tracking-tight text-brand-parchment">
          Start with your organiser link
        </h2>
        <p className="mt-4 max-w-lg font-light leading-relaxed text-brand-parchment/80 text-pretty">
          Open the private link or QR code from your programme organiser. Use
          the email you gave them—that is the address your invite is tied to.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link
            className="font-medium tracking-wide text-brand-gold underline underline-offset-4 hover:text-brand-parchment"
            href="/resources"
          >
            Getting started resources
          </Link>
          <Link
            className="font-medium tracking-wide text-brand-gold underline underline-offset-4 hover:text-brand-parchment"
            href="/faq"
          >
            Read the FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
