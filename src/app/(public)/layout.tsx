import Link from "next/link";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4">
          <Link className="font-semibold tracking-tight" href="/">
            Beloved AI Grants
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="mx-auto flex max-w-5xl justify-end px-4">
          <Link
            className="text-xs text-muted-foreground/70 hover:text-muted-foreground"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
