"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/shared/utils/cn";

const NAV_ITEMS = [
  { href: "/organizer", label: "Organizer" },
  { href: "/fan", label: "Fan" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/staff", label: "Staff" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [clock, setClock] = useState("--:--:--");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex items-center gap-5 border-b border-border bg-panel/50 px-5 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-gradient-to-br from-turf to-[#14a85c] font-display text-[15px] font-bold text-[#06170d] shadow-[0_0_24px_var(--turf-dim)]">
            26
          </div>
          <div className="leading-tight">
            <div className="font-display text-[14.5px] font-semibold">Stadium Intelligence</div>
            <div className="font-mono text-[10.5px] uppercase tracking-wide text-text-faint">
              FIFA World Cup 2026 · Ops Copilot
            </div>
          </div>
        </div>

        <nav className="ml-4 flex items-center gap-1" aria-label="Role navigation">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 font-body text-[13px] font-semibold transition",
                  active
                    ? "bg-turf-dim text-turf"
                    : "text-text-dim hover:bg-panel-2 hover:text-text"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex-1" />
        <div className="font-mono text-[13px] text-text-dim">{clock}</div>
        <button
          type="button"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-panel-2 text-text-dim hover:text-text"
        >
          ◐
        </button>
      </header>

      <main className="flex-1 px-5 py-5">{children}</main>

      <p className="px-5 pb-4 text-center font-mono text-[11px] text-text-faint">
        Next.js build — the live map runs on free, no-key MapLibre/OpenFreeMap tiles.
        Supabase/Gemini activate automatically once configured. See SETUP.md.
      </p>
    </div>
  );
}
