"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language";

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Alternar tema"
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-sm text-xs font-mono",
        "transition-colors duration-200",
        "border border-paper-border dark:border-ink-border",
        "text-ink/50 dark:text-paper/50",
        "hover:text-gold hover:border-gold/40",
        "bg-transparent"
      )}
    >
      {isDark ? "☀" : "◑"}
    </button>
  );
}

function LangToggle() {
  const { lang, toggle } = useLanguage();
  return (
    <button
      onClick={toggle}
      aria-label="Alternar idioma"
      className={cn(
        "w-8 h-8 flex items-center justify-center rounded-sm text-xs font-mono",
        "transition-colors duration-200",
        "border border-paper-border dark:border-ink-border",
        "text-ink/50 dark:text-paper/50",
        "hover:text-gold hover:border-gold/40",
        "bg-transparent"
      )}
    >
      {lang === "pt" ? "en" : "pt"}
    </button>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-paper-border dark:border-ink-border bg-paper/95 dark:bg-ink/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-xl font-medium tracking-tight text-ink dark:text-paper hover:text-gold transition-colors duration-200"
        >
          ú<span className="text-gold">.</span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-5">
            <Link
              href="/tools"
              className={cn(
                "text-sm font-sans transition-colors duration-200",
                pathname === "/tools"
                  ? "text-gold"
                  : "text-ink/50 dark:text-paper/50 hover:text-ink dark:hover:text-paper"
              )}
            >
              {t("nav_tools")}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <LangToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
