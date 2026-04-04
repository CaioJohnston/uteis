"use client";

import { useLanguage } from "@/contexts/language";

export function ToolsHeader({ count }: { count: number }) {
  const { t } = useLanguage();

  return (
    <div className="mb-12">
      <p className="font-mono text-xs text-gold mb-3 tracking-widest uppercase">
        {t("catalog_eyebrow")}
      </p>
      <h1 className="font-display text-4xl md:text-5xl font-light text-ink dark:text-paper mb-3">
        {t("catalog_heading")}
      </h1>
      <p className="text-sm text-ink/40 dark:text-paper/40 font-mono">
        {count} {count === 1 ? t("tool_singular") : t("tool_plural")} {t("tools_published")}
      </p>
    </div>
  );
}
