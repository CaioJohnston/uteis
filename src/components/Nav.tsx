"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-sm text-xs font-mono",
        "transition-colors duration-200",
        "border border-ink-border dark:border-ink-border",
        "text-paper-muted dark:text-paper/50 hover:text-gold dark:hover:text-gold",
        "hover:border-gold/40 dark:hover:border-gold/40",
        "bg-transparent"
      )}
    >
      {isDark ? "☀" : "◑"}
    </button>
  );
}

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/tools", label: "Ferramentas" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-ink-border dark:border-ink-border bg-ink/90 dark:bg-ink/90 light:bg-paper/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-medium tracking-tight text-paper dark:text-paper light:text-ink hover:text-gold transition-colors duration-200"
        >
          toolhub<span className="text-gold">.</span>
        </Link>

        {/* Nav links + toggle */}
        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-5">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "text-sm font-sans transition-colors duration-200",
                  pathname === href
                    ? "text-gold"
                    : "text-paper/50 dark:text-paper/50 hover:text-paper dark:hover:text-paper"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
