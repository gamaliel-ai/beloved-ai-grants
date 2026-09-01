import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { getFeaturedEvent, links, site } from "@/lib/site";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const featuredEvent = getFeaturedEvent();
  const nav = [
    { href: "/join", label: "Join" },
    ...(featuredEvent
      ? [{ href: `/forum/${featuredEvent.slug}`, label: "Forum" }]
      : []),
    { href: "/faq", label: "FAQ" },
    { href: "/resources", label: "Resources" },
  ];

  return (
    <>
      <header className="border-b border-white/10 bg-brand-ink text-brand-parchment">
        <div className="safe-area-x safe-area-header mx-auto flex max-w-5xl flex-col items-stretch gap-3 px-4 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
          <BrandMark />
          <nav
            aria-label="Primary navigation"
            className="flex w-full items-center justify-stretch gap-1 text-[11px] font-medium tracking-[0.14em] text-brand-gold uppercase sm:w-auto sm:justify-end sm:gap-1 sm:tracking-[0.18em]"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                className="flex min-h-11 min-w-0 flex-1 items-center justify-center px-1 text-center transition-colors hover:text-brand-parchment sm:flex-none sm:px-2"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main
        id="main-content"
        className="safe-area-x mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:py-14"
      >
        {children}
      </main>
      <footer className="border-t border-brand-gold/25 bg-brand-ink text-brand-parchment">
        <div className="safe-area-x safe-area-footer mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md space-y-4">
            <BrandMark compact subtitle={site.name} />
            <p className="text-sm leading-relaxed text-brand-parchment/75 text-pretty">
              A ministry of the{" "}
              <a
                className="text-brand-gold underline-offset-4 hover:underline"
                href={links.belovedInChrist}
                rel="noopener noreferrer"
                target="_blank"
              >
                Beloved in Christ Foundation
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] tracking-[0.18em] text-brand-gold uppercase">
            <Link className="hover:text-brand-parchment" href="/faq">
              FAQ
            </Link>
            <Link className="hover:text-brand-parchment" href="/resources">
              Resources
            </Link>
            <Link className="hover:text-brand-parchment" href="/admin">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
