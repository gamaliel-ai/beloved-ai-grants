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
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <BrandMark href="/admin" subtitle="Admin" compact />
            <nav
              aria-label="Admin navigation"
              className="flex items-center gap-1 text-[11px] tracking-[0.18em] text-brand-gold uppercase"
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
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant={openAIMode === "live" ? "default" : "secondary"}>
              OpenAI {openAIMode}
            </Badge>
            <Badge variant={mailMode === "live" ? "default" : "secondary"}>
              Email {mailMode}
            </Badge>
            <span className="text-brand-parchment/70">{actor}</span>
            <form
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
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
