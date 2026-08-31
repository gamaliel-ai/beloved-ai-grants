import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JoinForm } from "@/components/join-form";
import { events, findEvent, site } from "@/lib/site";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = findEvent(slug);
  if (!event) return { title: "Forum" };

  return {
    title: event.name,
    description: `${site.name} at the ${event.name} in ${event.city}, ${event.dates}. How to claim your sponsored OpenAI API key at the event.`,
  };
}

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="font-display text-brand-gold-deep shrink-0 text-sm">
        {n}
      </span>
      <span className="font-light leading-relaxed text-pretty">{children}</span>
    </li>
  );
}

export default async function ForumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = findEvent(slug);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-10 sm:space-y-12">
      <section className="space-y-4">
        <p className="text-[11px] font-medium tracking-[0.28em] text-brand-gold-deep uppercase">
          {event.shortName}
        </p>
        <h1 className="font-display text-3xl font-light tracking-tight text-balance sm:text-4xl">
          {event.name}
        </h1>
        <dl className="space-y-1 text-sm font-light text-muted-foreground">
          <div className="flex gap-2">
            <dt className="text-foreground">Dates</dt>
            <dd>{event.dates}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-foreground">Venue</dt>
            <dd>
              {event.venue}, {event.city}
            </dd>
          </div>
        </dl>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          {site.name} is launching at this forum. If you are attending, this
          page is everything you need to claim your sponsored OpenAI API key.
        </p>
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <h2 className="font-display text-2xl font-light tracking-tight">
          How to claim at the forum
        </h2>
        <ol className="space-y-3 text-muted-foreground">
          <Step n={1}>
            Open the private link or QR code your organiser shares during the
            session.
          </Step>
          <Step n={2}>
            Enter the email you gave your organiser when you registered. It must
            be the same address.
          </Step>
          <Step n={3}>
            We create your key and show it{" "}
            <span className="text-foreground">once</span>. Copy it somewhere
            safe before you leave the page.
          </Step>
        </ol>
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <h2 className="font-display text-2xl font-light tracking-tight">
          What to bring
        </h2>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          A phone is enough to claim your key and store it safely. Bring a
          laptop if you have one, since that is where you will do most of your
          building. Either way, come with the idea you want to work on.
        </p>
      </section>

      <section className="space-y-4 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <h2 className="font-display text-2xl font-light tracking-tight">
          If your email is not recognised
        </h2>
        <p className="font-light leading-relaxed text-muted-foreground text-pretty">
          It usually means a different address was registered, or a spelling
          difference. Find your organiser at the forum—they can check the list
          and add you. You do not need to start over.
        </p>
      </section>

      <section className="space-y-3 border-t border-brand-gold/30 pt-6 sm:pt-8">
        <h2 className="font-display text-2xl font-light tracking-tight">
          Already registered?
        </h2>
        <p className="text-sm font-light text-foreground text-pretty">
          Enter the email you gave your organiser and we will send your claim
          link.
        </p>
        <JoinForm idPrefix="forum-join" />
        <p className="text-sm font-light text-muted-foreground">
          <Link
            className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
            href="/faq"
          >
            Read the FAQ
          </Link>{" "}
          or browse{" "}
          <Link
            className="font-normal text-brand-gold-deep underline underline-offset-4 hover:text-brand-ink"
            href="/resources"
          >
            getting started resources
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
