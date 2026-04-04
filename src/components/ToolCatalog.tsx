"use client";

import { useState, useMemo } from "react";
import type { Tool } from "@/types";
import { ToolCard } from "@/components/ToolCard";
import { cn } from "@/lib/utils";
import { useLanguage, useTagLabel } from "@/contexts/language";

interface ToolCatalogProps {
  tools: Tool[];
  allTags: string[];
}

export function ToolCatalog({ tools, allTags }: ToolCatalogProps) {
  const { t } = useLanguage();
  const tagLabel = useTagLabel();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
        !search ||
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase());
      const matchesTag = !activeTag || tool.tags.includes(activeTag as Tool["tags"][number]);
      return matchesSearch && matchesTag;
    });
  }, [tools, search, activeTag]);

  return (
    <div>
      <div className="mb-6">
        <input
          type="text"
          placeholder={t("search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full bg-paper-surface dark:bg-ink-surface",
            "border border-paper-border dark:border-ink-border",
            "px-4 py-3 text-sm font-sans text-ink dark:text-paper",
            "placeholder-ink/30 dark:placeholder-paper/30",
            "focus:outline-none focus:border-gold/50",
            "transition-colors duration-200"
          )}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTag(null)}
          className={cn(
            "text-xs font-mono px-3 py-1 border transition-colors duration-150",
            !activeTag
              ? "border-gold text-gold bg-gold/10"
              : "border-paper-border dark:border-ink-border text-ink/40 dark:text-paper/40 hover:border-ink/30 dark:hover:border-paper/30 hover:text-ink/70 dark:hover:text-paper/60"
          )}
        >
          {t("filter_all")}
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={cn(
              "text-xs font-mono px-3 py-1 border transition-colors duration-150",
              activeTag === tag
                ? "border-gold text-gold bg-gold/10"
                : "border-paper-border dark:border-ink-border text-ink/40 dark:text-paper/40 hover:border-ink/30 dark:hover:border-paper/30 hover:text-ink/70 dark:hover:text-paper/60"
            )}
          >
            {tagLabel(tag)}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="tool-grid border border-paper-border dark:border-ink-border">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="text-center py-16 text-ink/30 dark:text-paper/30 font-mono text-sm">
          {t("no_results")}
        </p>
      )}

      <p className="mt-4 text-xs font-mono text-ink/30 dark:text-paper/30 text-right">
        {filtered.length} {t("tools_of")} {tools.length}{" "}
        {tools.length === 1 ? t("tool_singular") : t("tool_plural")}
      </p>
    </div>
  );
}
