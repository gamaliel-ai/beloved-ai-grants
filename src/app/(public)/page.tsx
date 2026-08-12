import type { ReactNode } from "react";
import Link from "next/link";
import { HeroMotion } from "@/components/hero-motion";
import { JoinForm } from "@/components/join-form";
import { forum, links, site } from "@/lib/site";

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-medium tracking-[0.28em] text-brand-gold-deep uppercase">
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
          AI has changed what one person can create. We want to inspire and
          support entrepreneurs in Kenya and beyond as they discover new ways to
          innovate, serve others, and grow businesses that help communities
          flourish.
        </p>

        <div className="space-y-3 border-t border-brand-gold/30 pt-6">
          <p className="text-sm font-light text-foreground text-pretty">
            Part of a cohort or forum? Enter the email your organizer registered
            to get your claim link.
          </p>
          <JoinForm idPrefix="home-join" />
          <p className="text-sm font-light text-muted-foreground">
            <Link
              className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
              href="/faq"
            >
              Learn how the program works
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
          begin with a passionate founder and a laptop. There has never been a
          better time to build. That is good news for entrepreneurship in Kenya
          and beyond. Beloved AI Grants is a ministry of the{" "}
          <a
            className="font-normal text-brand-gold-deep underline-offset-4 hover:underline"
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
          <span className="text-foreground">OpenAI API key</span>—so you can
          build with AI while you develop your product, and use it to power what
          you ship. There is no lock-in: as you grow, you can move to your own
          account anytime.
        </p>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          Access is by program registration. Use the email form above, open{" "}
          <Link
            className="font-normal text-brand-gold-deep underline-offset-4 hover:underline"
            href="/join"
          >
            /join
          </Link>
          , or follow a private invite link from your organizer.
        </p>
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <SectionHeading label="Launching in Nairobi">
          {forum.name}
        </SectionHeading>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          We are launching this program at the {forum.name} in {forum.city} (
          {forum.dates})—a gathering of Christian innovators, students, and
          business leaders around faith, entrepreneurship, and technology. If
          you are attending, you are exactly who this site is for.
        </p>
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <SectionHeading label="Built by a builder">
          Faith and technology, practiced daily
        </SectionHeading>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          Lew Cirne, founder of the Beloved in Christ Foundation, still programs
          with AI almost every day. See projects underway at{" "}
          <a
            className="font-normal text-brand-gold-deep underline-offset-4 hover:underline"
            href={links.lkcStudios}
            rel="noopener noreferrer"
            target="_blank"
          >
            LKC Studios
          </a>
          —including{" "}
          <a
            className="font-normal text-brand-gold-deep underline-offset-4 hover:underline"
            href={links.gamaliel}
            rel="noopener noreferrer"
            target="_blank"
          >
            Gamaliel
          </a>
          , an AI-assisted Bible reader—and more experiments in faith and
          technology.
        </p>
      </section>

      <section className="border border-brand-gold/40 bg-brand-ink px-6 py-8 text-brand-parchment sm:px-10 sm:py-10">
        <SectionLabel>
          <span className="text-brand-gold">Have a program invite?</span>
        </SectionLabel>
        <h2 className="mt-2 font-display text-2xl font-light tracking-tight text-brand-parchment">
          Start with your organizer link
        </h2>
        <p className="mt-4 max-w-lg font-light leading-relaxed text-brand-parchment/80 text-pretty">
          Open the private link or QR from your program organizer. Use the email
          they registered for you—it must already be on the allowlist.
        </p>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <Link
            className="font-medium tracking-wide text-brand-gold underline-offset-4 hover:underline"
            href="/resources"
          >
            Getting started resources
          </Link>
          <Link
            className="font-medium tracking-wide text-brand-gold underline-offset-4 hover:underline"
            href="/faq"
          >
            Read the FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}
