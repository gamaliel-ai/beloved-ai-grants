import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { forum, links, site } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-16">
      <section className="space-y-4">
        <p className="text-sm font-medium text-primary">{site.name}</p>
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          A remarkable time to build.
        </h1>
        <p className="text-lg text-muted-foreground text-pretty">
          AI has changed what one person can create. We want to inspire and
          support entrepreneurs in Kenya and beyond as they discover new ways to
          innovate, serve others, and grow businesses that help communities
          flourish.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm">
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="/join"
          >
            Claim with your email
          </Link>
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="/faq"
          >
            How the program works
          </Link>
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="/resources"
          >
            Getting started with AI
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Why we are doing this
        </h2>
        <p className="text-muted-foreground text-pretty">
          With AI, what once took a dozen engineers and millions of dollars can
          begin with a passionate founder and a laptop. There has never been a
          better time to build. That is good news for entrepreneurship in Kenya
          and beyond. Beloved AI Grants is a ministry of the{" "}
          <a
            className="font-medium text-foreground underline-offset-4 hover:underline"
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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">What we offer</h2>
        <p className="text-muted-foreground text-pretty">
          Approved participants receive a sponsored{" "}
          <span className="text-foreground">OpenAI API key</span>—so you can
          build with AI while you develop your product, and use it to power what
          you ship. There is no lock-in: as you grow, you can move to your own
          account anytime.
        </p>
        <p className="text-muted-foreground text-pretty">
          Access is by program registration. If you are part of a cohort or
          forum, open{" "}
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href="/join"
          >
            /join
          </Link>{" "}
          with your registered email, or use a private invite link from your
          organizer.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Launching in Nairobi
        </h2>
        <p className="text-muted-foreground text-pretty">
          We are launching this program at the{" "}
          <span className="text-foreground">{forum.name}</span> in{" "}
          {forum.city} ({forum.dates})—a gathering of Christian innovators,
          students, and business leaders around faith, entrepreneurship, and
          technology. If you are attending, you are exactly who this site is
          for.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">
          Built by a builder
        </h2>
        <p className="text-muted-foreground text-pretty">
          Lew Cirne, founder of the Beloved in Christ Foundation, still programs
          with AI almost every day. See projects underway at{" "}
          <a
            className="font-medium text-foreground underline-offset-4 hover:underline"
            href={links.lkcStudios}
            rel="noopener noreferrer"
            target="_blank"
          >
            LKC Studios
          </a>
          —including{" "}
          <a
            className="font-medium text-foreground underline-offset-4 hover:underline"
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

      <Card>
        <CardHeader>
          <CardTitle>Have a program invite?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Open the private link or QR from your program organizer. Use the
            email they registered for you—it must already be on the allowlist.
          </p>
          <p>
            New to building with AI? Start with our{" "}
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href="/resources"
            >
              resources
            </Link>{" "}
            or read the{" "}
            <Link
              className="font-medium text-foreground underline-offset-4 hover:underline"
              href="/faq"
            >
              FAQ
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
