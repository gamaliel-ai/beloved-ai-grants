import Link from "next/link";
import { links, site } from "@/lib/site";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-4">
          <Link className="font-semibold tracking-tight" href="/">
            {site.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {children}
      </main>
      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md space-y-2">
            <p className="font-medium text-foreground">{site.name}</p>
            <p className="text-pretty">
              A ministry of the{" "}
              <a
                className="underline-offset-4 hover:underline"
                href={links.belovedInChrist}
                rel="noopener noreferrer"
                target="_blank"
              >
                Beloved in Christ Foundation
              </a>
              . Founder projects at{" "}
              <a
                className="underline-offset-4 hover:underline"
                href={links.lkcStudios}
                rel="noopener noreferrer"
                target="_blank"
              >
                LKC Studios
              </a>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className="hover:text-foreground" href="/faq">
              FAQ
            </Link>
            <Link className="hover:text-foreground" href="/resources">
              Resources
            </Link>
            <Link className="hover:text-foreground" href="/admin">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
