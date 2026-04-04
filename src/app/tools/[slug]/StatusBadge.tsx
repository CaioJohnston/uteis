"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language";
import type { Tool } from "@/types";

const statusClass: Record<Tool["status"], string> = {
  active: "badge-active",
  experimental: "badge-experimental",
  maintenance: "badge-maintenance",
  archived: "badge-archived",
};

export function StatusBadge({ status }: { status: Tool["status"] }) {
  const { t } = useLanguage();
  const label = {
    active: t("status_active"),
    experimental: t("status_experimental"),
    maintenance: t("status_maintenance"),
    archived: t("status_archived"),
  }[status];

  return (
    <span className={cn("text-xs font-mono px-2 py-0.5 rounded-sm", statusClass[status])}>
      {label}
    </span>
  );
}
