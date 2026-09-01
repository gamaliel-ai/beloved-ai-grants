import Link from "next/link";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getMailMode } from "@/lib/mail/client";
import { getOpenAIMode } from "@/lib/openai/client";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/mcp", label: "MCP" },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const actor = await requireAdmin();
  const openAIMode = getOpenAIMode();
  const mailMode = getMailMode();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-white/10 bg-brand-ink text-brand-parchment">
        <div className="safe-area-x safe-area-header mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 pb-3 sm:grid-cols-[auto_auto_minmax(1rem,1fr)_auto_auto_auto] sm:gap-x-4">
          <BrandMark
            href="/admin"
            subtitle="Admin"
            compact
            className="min-w-0"
          />
          <nav
            aria-label="Admin navigation"
            className="col-start-1 row-start-2 flex items-center gap-1 text-[11px] tracking-[0.18em] text-brand-gold uppercase sm:col-start-2 sm:row-start-1"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                className="flex min-h-11 items-center px-2 transition-colors hover:text-brand-parchment"
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="col-span-2 row-start-3 flex flex-wrap items-center gap-2 sm:col-span-1 sm:col-start-4 sm:row-start-1 sm:flex-nowrap">
            <Badge variant={openAIMode === "live" ? "default" : "secondary"}>
              OpenAI {openAIMode}
            </Badge>
            <Badge variant={mailMode === "live" ? "default" : "secondary"}>
              Email {mailMode}
            </Badge>
          </div>
          <span className="col-start-2 row-start-2 max-w-36 truncate text-right text-xs text-brand-parchment/70 sm:col-start-5 sm:row-start-1 sm:max-w-none sm:text-left sm:text-sm">
            {actor}
          </span>
          <form
            className="col-start-2 row-start-1 sm:col-start-6"
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-brand-gold/40 bg-transparent text-brand-parchment hover:bg-brand-gold/15 hover:text-brand-parchment"
            >
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main
        id="main-content"
        className="safe-area-x mx-auto w-full max-w-6xl flex-1 px-4 py-8"
      >
        {children}
      </main>
    </div>
  );
}
