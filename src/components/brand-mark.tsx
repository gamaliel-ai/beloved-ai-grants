import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

type BrandMarkProps = {
  href?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
};

export function BrandMark({
  href = "/",
  subtitle = site.name,
  className,
  compact = false,
}: BrandMarkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 text-brand-gold transition-colors hover:text-brand-parchment",
        className,
      )}
    >
      <Image
        src="/brand/cross-mark.svg"
        alt=""
        width={compact ? 28 : 36}
        height={compact ? 28 : 36}
        className="shrink-0 opacity-95"
        unoptimized
      />
      <span className="min-w-0">
        <span
          className={cn(
            "block font-display font-light tracking-[0.28em] text-brand-gold uppercase",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          Beloved in Christ
        </span>
        <span
          className={cn(
            "mt-0.5 block truncate font-display tracking-wide text-brand-parchment",
            compact ? "text-sm" : "text-base",
          )}
        >
          {subtitle}
        </span>
      </span>
    </Link>
  );
}
