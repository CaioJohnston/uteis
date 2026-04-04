"use client";

import Link from "next/link";
import type { Tool } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { useLanguage, useLocalizedTool, useTagLabel } from "@/contexts/language";

const statusClass: Record<Tool["status"], string> = {
  active: "badge-active",
  experimental: "badge-experimental",
  maintenance: "badge-maintenance",
  archived: "badge-archived",
};

interface ToolCardProps {
  tool: Tool;
  variant?: "default" | "featured";
}

export function ToolCard({ tool: rawTool, variant = "default" }: ToolCardProps) {
  const { t } = useLanguage();
  const tool = useLocalizedTool(rawTool);
  const tagLabel = useTagLabel();
  const href = `/tools/${tool.slug}`;
  const isFeatured = variant === "featured";

  const statusLabel = {
    active: t("status_active"),
    experimental: t("status_experimental"),
    maintenance: t("status_maintenance"),
    archived: t("status_archived"),
  };

  const modeLabel: Record<import("@/types").HostingMode, string> = {
    embedded: t("card_use"),
    external: t("card_open"),
    download: t("card_download"),
  };

  return (
    <Link
      href={href}
      className={cn(
        "group block p-6 border border-paper-border dark:border-ink-border",
        "bg-paper-surface dark:bg-ink-surface",
        "hover:bg-paper dark:hover:bg-ink-muted/10",
        "transition-all duration-200 relative overflow-hidden",
        isFeatured && "lg:p-8"
      )}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-gold/0 via-gold/60 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className={cn(
            "font-display font-medium text-ink dark:text-paper group-hover:text-gold transition-colors duration-200",
            isFeatured ? "text-2xl" : "text-xl"
          )}
        >
          {tool.name}
        </h3>
        <span className={cn("shrink-0 text-xs font-mono px-2 py-0.5 rounded-sm", statusClass[tool.status])}>
          {statusLabel[tool.status]}
        </span>
      </div>

      <p className="text-sm text-ink/60 dark:text-paper/60 leading-relaxed mb-4 line-clamp-2">
        {tool.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {tool.tags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-mono text-ink/40 dark:text-paper/40 px-2 py-0.5 border border-paper-border dark:border-ink-border rounded-sm"
          >
            {tagLabel(tag)}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-paper-border/50 dark:border-ink-border/50 flex items-center justify-between">
        <span className="text-xs font-mono text-ink/30 dark:text-paper/30">
          {formatDate(tool.createdAt)}
        </span>
        <span className="text-xs text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-mono">
          {modeLabel[tool.hostingMode]}
        </span>
      </div>
    </Link>
  );
}
