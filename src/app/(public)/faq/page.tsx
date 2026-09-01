import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getFeaturedEvent, links } from "@/lib/site";

const event = getFeaturedEvent();

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "How Beloved AI Grants works, who it is for, and what to expect when you redeem a sponsored OpenAI API key.",
};

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: "What is Beloved AI Grants?",
    answer: (
      <>
        A programme of the{" "}
        <a
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href={links.belovedInChrist}
          rel="noopener noreferrer"
          target="_blank"
        >
          Beloved in Christ Foundation
        </a>{" "}
        that sponsors OpenAI API access for people starting out—so you can
        experiment, launch products, and learn what AI makes possible without
        carrying the cost alone at the start.
      </>
    ),
  },
  {
    question: "Who is this for?",
    answer: (
      <>
        Primarily Christian young entrepreneurs and innovators—especially in
        Kenya and across Africa—who want to build with AI.
        {event ? (
          <>
            {" "}
            Our first guests are people gathering at the {event.name} in{" "}
            {event.city}.
          </>
        ) : null}{" "}
        Over time, we hope this becomes a wider invitation to hopeful builders
        with limited resources and a desire to create something that serves
        others.
      </>
    ),
  },
  {
    question: "How do I get access?",
    answer: (
      <>
        Access is by invite, not open sign-up. If you are registered for a
        programme, your organiser will share a private redeem link or QR code.
        Enter the email you gave them; we create a sponsored API key and show it
        to you once. Keep a secure copy—you will not see the full key again
        here.
      </>
    ),
  },
  {
    question: "Does this cost me anything? Do I need a credit card?",
    answer: (
      <>
        No, and no. We pay the OpenAI usage bill for your sponsored key, and you
        do not need a credit card or an OpenAI account of your own to start.
        Each grant has a budget so we can support many builders fairly—your
        organiser can tell you yours, and if you are near the limit while still
        building something meaningful, say so, because we can often help. Your
        own internet or mobile data costs are still your own.
      </>
    ),
  },
  {
    question: "What can I use the API key for?",
    answer: (
      <>
        Building and running applications that call OpenAI models—chatbots,
        assistants, analysis tools, product features, prototypes, and learning
        projects. Use it to develop your idea and, where it fits, to power what
        you put in front of users. Treat the key like a secret; never commit it
        to a public code repository or share it widely.
      </>
    ),
  },
  ...(event
    ? [
        {
          question: "How is this connected to the launch forum?",
          answer: (
            <>
              The programme launches at the {event.name} ({event.dates})—a
              faith-and-technology gathering organised with Dr. Goodwill Shana
              and centred on Lew Cirne&apos;s story as a founder and faith
              leader. If you are attending, the{" "}
              <Link
                className="font-medium text-foreground underline-offset-4 hover:underline"
                href={`/forum/${event.slug}`}
              >
                forum page
              </Link>{" "}
              has the claim steps and what to bring.
            </>
          ),
        },
      ]
    : []),
  {
    question: "Is this a ministry?",
    answer: (
      <>
        Yes—in a light-handed way. Beloved in Christ Foundation exists to serve
        people in need and to support work that bears good fruit. This programme
        is one expression of that: encouraging entrepreneurship, stewardship of
        new tools, and flourishing for communities in Kenya and beyond. You do
        not need to share every detail of our faith to receive a grant, but the
        &ldquo;why&rdquo; behind the program is rooted in Christian love and
        hope.
      </>
    ),
  },
  {
    question: "What about privacy and control?",
    answer: (
      <>
        We sponsor the key and pay the bill. We monitor usage and spend so we
        can run the programme responsibly; it is our policy not to routinely read
        your prompts or responses. We may revoke a key if misuse or other
        concerns appear. OpenAI&apos;s own policies still apply to traffic that
        reaches their platform.
      </>
    ),
  },
  {
    question: "Do I have to keep using your key forever?",
    answer: (
      <>
        No. The work stays yours. Whenever you are ready, create your own OpenAI
        account and key and move your app across—usually a small change to one
        setting. We celebrate when builders outgrow a sponsored start.
      </>
    ),
  },
  {
    question: "Where can I learn to build with AI?",
    answer: (
      <>
        See our{" "}
        <Link
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href="/resources"
        >
          resources
        </Link>{" "}
        page for starter docs, coding agents, and examples.
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-3">
        <p className="text-xs font-medium tracking-[0.24em] text-brand-gold-deep uppercase">
          FAQ
        </p>
        <h1 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
          Questions, answered simply
        </h1>
        <p className="font-light text-muted-foreground text-pretty">
          What this programme is, how invites work, and what to expect when you
          start building.
        </p>
      </div>

      <dl className="space-y-8">
        {faqs.map((item) => (
          <div key={item.question} className="space-y-2">
            <dt className="font-display text-lg font-normal tracking-tight">
              {item.question}
            </dt>
            <dd className="font-light text-muted-foreground text-pretty">
              {item.answer}
            </dd>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted-foreground">
        Still unsure? Ask your forum or programme organiser, or browse{" "}
        <Link
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href="/resources"
        >
          getting started resources
        </Link>
        .
      </p>
    </div>
  );
}
