"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/language";

export function BackLink() {
  const { t } = useLanguage();
  return (
    <Link
      href="/tools"
      className="inline-flex items-center gap-2 text-xs font-mono text-ink/30 dark:text-paper/30 hover:text-gold transition-colors duration-200 mb-12"
    >
      {t("back")}
    </Link>
  );
}
