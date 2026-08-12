"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
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
 * Column-width hero loop for the public home page. Plays a small muted video
 * by default and falls back to the poster still when the visitor prefers
 * reduced motion.
 */
export function HeroMotion({ className }: HeroMotionProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <figure
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-sm border border-brand-gold/30 bg-brand-ink shadow-sm",
        className,
      )}
    >
      {reducedMotion ? (
        <Image
          src="/hero/builders-poster.jpg"
          alt={ALT}
          fill
          sizes="(min-width: 672px) 672px, 100vw"
          className="object-cover"
          priority={false}
        />
      ) : (
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
      )}
    </figure>
  );
}
