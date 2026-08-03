import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beloved AI Grants",
  description: "Practical AI building grants for early entrepreneurs.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <header className="border-b bg-card">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link className="font-semibold tracking-tight" href="/">
              Beloved AI Grants
            </Link>
            <Link
              className="text-sm text-muted-foreground hover:text-foreground"
              href="/admin"
            >
              Admin
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
