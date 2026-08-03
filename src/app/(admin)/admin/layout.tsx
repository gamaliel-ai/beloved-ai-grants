import Link from "next/link";
import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getOpenAIMode } from "@/lib/openai/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./admin-nav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const actor = await requireAdmin();
  const openAIMode = getOpenAIMode();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link className="text-lg font-semibold tracking-tight" href="/admin">
              Beloved Admin
            </Link>
            <Badge
              variant={openAIMode === "live" ? "destructive" : "secondary"}
            >
              {openAIMode}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{actor}</span>
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
        <div className="mx-auto max-w-7xl px-6">
          <AdminNav pendingApplications={0} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
