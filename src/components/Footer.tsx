"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-paper-border dark:border-ink-border mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="font-display text-sm text-ink/40 dark:text-paper/40 hover:text-gold transition-colors duration-200"
        >
          úteis<span className="text-gold">.</span>
        </Link>

        <div className="flex items-center gap-5">
          <Link
            href="/tools"
            className="text-xs font-mono text-ink/30 dark:text-paper/30 hover:text-ink/60 dark:hover:text-paper/60 transition-colors"
          >
            {t("footer_tools")}
          </Link>
          <a
            href="https://github.com/CaioJohnston"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-ink/30 dark:text-paper/30 hover:text-ink/60 dark:hover:text-paper/60 transition-colors"
          >
            github
          </a>
        </div>
      </div>
    </footer>
  );
}
