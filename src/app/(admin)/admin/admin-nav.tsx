"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV: { href: string; label: string; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/grants", label: "Grants" },
  { href: "/admin/grantees", label: "Grantees" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/program", label: "Program" },
];

export function AdminNav({ pendingApplications = 0 }: { pendingApplications?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin"
      className="flex flex-wrap gap-1 border-b"
    >
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
            {item.href === "/admin/applications" && pendingApplications > 0 ? (
              <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-md bg-primary/15 px-1.5 text-xs text-primary">
                {pendingApplications}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
