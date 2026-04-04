"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-6 py-32 text-center">
      <p className="font-mono text-xs text-gold mb-4 tracking-widest uppercase">404</p>
      <h1 className="font-display text-5xl font-light text-ink dark:text-paper mb-4">
        {t("not_found_title")}
      </h1>
      <p className="text-sm text-ink/40 dark:text-paper/40 mb-10">
        {t("not_found_desc")}
      </p>
      <Link
        href="/tools"
        className="text-sm font-mono text-gold hover:text-gold-light transition-colors"
      >
        {t("not_found_back")}
      </Link>
    </div>
  );
}
