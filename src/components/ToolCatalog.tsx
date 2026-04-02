"use client";

import { useState, useMemo } from "react";
import type { Tool } from "@/types";
import { ToolCard } from "@/components/ToolCard";
import { cn } from "@/lib/utils";

interface ToolCatalogProps {
  tools: Tool[];
  allTags: string[];
}

export function ToolCatalog({ tools, allTags }: ToolCatalogProps) {
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
      {/* Busca */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar ferramenta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={cn(
            "w-full bg-ink-surface dark:bg-ink-surface border border-ink-border dark:border-ink-border",
            "px-4 py-3 text-sm font-sans text-paper dark:text-paper placeholder-paper/30",
            "focus:outline-none focus:border-gold/50 dark:focus:border-gold/50",
            "transition-colors duration-200"
          )}
        />
      </div>

      {/* Filtro por tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTag(null)}
          className={cn(
            "text-xs font-mono px-3 py-1 border transition-colors duration-150",
            !activeTag
              ? "border-gold text-gold bg-gold/10"
              : "border-ink-border text-paper/40 hover:border-paper/30 hover:text-paper/60"
          )}
        >
          todos
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            className={cn(
              "text-xs font-mono px-3 py-1 border transition-colors duration-150",
              activeTag === tag
                ? "border-gold text-gold bg-gold/10"
                : "border-ink-border text-paper/40 hover:border-paper/30 hover:text-paper/60"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="tool-grid border border-ink-border dark:border-ink-border">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      ) : (
        <p className="text-center py-16 text-paper/30 font-mono text-sm">
          nenhuma ferramenta encontrada.
        </p>
      )}

      {/* Contador */}
      <p className="mt-4 text-xs font-mono text-paper/30 dark:text-paper/30 text-right">
        {filtered.length} de {tools.length} ferramentas
      </p>
    </div>
  );
}
