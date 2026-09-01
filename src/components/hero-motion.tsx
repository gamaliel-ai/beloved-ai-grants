"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

type HeroMotionProps = {
  className?: string;
};

const ALT =
  "Three builders working together around a table—two on laptops, one sketching an idea on a whiteboard.";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * Column-width hero for the public home page. The optimized poster loads by
 * default; video sources are mounted only after the visitor asks to play.
 */
export function HeroMotion({ className }: HeroMotionProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [playing, setPlaying] = useState(false);
  const showVideo = playing && !reducedMotion;

  return (
    <figure
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-sm border border-brand-gold/30 bg-brand-ink shadow-sm",
        className,
      )}
    >
      {showVideo ? (
        <video
          className="h-full w-full object-cover"
          poster="/hero/builders-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-label={ALT}
        >
          <source src="/hero/builders.webm" type="video/webm" />
          <source src="/hero/builders.mp4" type="video/mp4" />
        </video>
      ) : (
        <Image
          src="/hero/builders-poster.jpg"
          alt={ALT}
          fill
          sizes="(min-width: 672px) 672px, 100vw"
          className="object-cover"
          priority={false}
        />
      )}
      {!reducedMotion && !playing ? (
        <button
          type="button"
          className="absolute bottom-3 left-3 inline-flex min-h-11 items-center gap-2 rounded-sm bg-primary px-4 text-sm font-medium tracking-wide text-primary-foreground shadow-sm transition-colors hover:bg-brand-gold-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-brand-ink"
          onClick={() => setPlaying(true)}
        >
          <Play aria-hidden="true" className="size-4 fill-current" />
          Play video
        </button>
      ) : null}
    </figure>
  );
}
