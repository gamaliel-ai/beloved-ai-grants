import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { forum, links } from "@/lib/site";

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
        A program of the{" "}
        <a
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href={links.belovedInChrist}
          rel="noopener noreferrer"
          target="_blank"
        >
          Beloved in Christ Foundation
        </a>{" "}
        that sponsors OpenAI API access for early entrepreneurs—so builders can
        experiment, ship products, and learn what AI makes possible without
        carrying the full cost alone at the start.
      </>
    ),
  },
  {
    question: "Who is this for?",
    answer: (
      <>
        Primarily Christian young entrepreneurs and innovators—especially in
        Kenya and across Africa—who want to build with AI. Our first guests are
        people gathering at the {forum.name} in {forum.city}. Over time, we hope
        this becomes a wider invitation to hopeful founders with limited
        resources and a desire to create something that serves others.
      </>
    ),
  },
  {
    question: "How do I get access?",
    answer: (
      <>
        Access is invite-based, not open signup. If you are on a program
        allowlist, your organizer will share a private redeem link or QR code.
        Enter the email they have on file; we create a sponsored API key and show
        it to you once. Keep a secure copy—you will not see the full key again
        here.
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
        to public repos or share it widely.
      </>
    ),
  },
  {
    question: "Is there a spending limit?",
    answer: (
      <>
        Yes. Every grant has a budget so we can sponsor many builders fairly. If
        you are approaching a limit and still building something meaningful,
        tell your program organizer—we can often help.
      </>
    ),
  },
  {
    question: "How is this connected to the Nairobi forum?",
    answer: (
      <>
        The program launches at the {forum.name} ({forum.dates})—a
        faith-and-technology gathering organized with Dr. Goodwill Shana and
        centered on Lew Cirne&apos;s story as a founder and faith leader. Forum
        participants are the first people we hope to encourage with sponsored
        AI access and practical resources.
      </>
    ),
  },
  {
    question: "Is this a ministry?",
    answer: (
      <>
        Yes—in a light-handed way. Beloved in Christ Foundation exists to serve
        people in need and to support work that bears good fruit. This program
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
        can run the program responsibly; it is our policy not to routinely read
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
        No. There is no lock-in. Whenever you are ready, create your own OpenAI
        account and key and switch your app—usually a small config change. We
        celebrate when builders outgrow a sponsored start.
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
        page for starter docs, coding agents, and examples—including projects
        from{" "}
        <a
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href={links.lkcStudios}
          rel="noopener noreferrer"
          target="_blank"
        >
          LKC Studios
        </a>
        .
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <div className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.28em] text-brand-gold-deep uppercase">
          FAQ
        </p>
        <h1 className="font-display text-3xl font-light tracking-tight sm:text-4xl">
          Questions, answered simply
        </h1>
        <p className="font-light text-muted-foreground text-pretty">
          What this program is, how invites work, and what to expect when you
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
        Still unsure? Ask your forum or program organizer, or browse{" "}
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
