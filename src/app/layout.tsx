import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stadium Intelligence · FIFA World Cup 2026",
  description: "AI-driven stadium operations command center for FIFA World Cup 2026.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className="h-full antialiased">
      {/*
        The <link> tags below intentionally load fonts via a plain
        stylesheet link rather than next/font/google, which fetches fonts
        at build time and requires network access to fonts.gstatic.com —
        not guaranteed in every build environment (e.g. offline/sandboxed
        CI). Placing <link> in the root layout's <head> is the documented,
        correct App Router pattern for this case; the no-page-custom-font
        ESLint rule predates the App Router and checks for pages/_document.js,
        which doesn't exist here — see
        https://github.com/vercel/next.js/issues/80963
      */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
