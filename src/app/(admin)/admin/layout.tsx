import Link from "next/link";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getMailMode } from "@/lib/mail/client";
import { getOpenAIMode } from "@/lib/openai/client";
import { site } from "@/lib/site";
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
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <div className="flex flex-wrap items-center gap-6">
            <Link className="font-semibold tracking-tight" href="/admin">
              {site.name} Admin
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  className="text-muted-foreground hover:text-foreground"
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
            <span className="text-muted-foreground">{actor}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
    </div>
  );
}
