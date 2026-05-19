"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RGB, RecolorMode } from "./recolor";

export interface HistoryEntry {
  id: string;
  thumbnail: string;
  templateId: string;
  templateLabel: string;
  color: RGB;
  threshold: number;
  brightness: number;
  strength: number;
  mode: RecolorMode;
  timestamp: number;
}

interface Props {
  entries: HistoryEntry[];
  lang: "pt" | "en";
  onRestore: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ entries, lang, onRestore, onDelete }: Props) {
  const [open, setOpen] = useState(false);

  if (entries.length === 0) return null;

  function hexOf(color: RGB) {
    return "#" + color.map((v) => v.toString(16).padStart(2, "0")).join("");
  }

  return (
    <div className="border border-ink-border">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-ink-surface/50 transition-colors"
      >
        <span className="text-xs font-mono text-paper/50 uppercase">
          {lang === "pt" ? "Histórico" : "History"}{" "}
          <span className="text-paper/30">({entries.length})</span>
        </span>
        <span className="text-xs font-mono text-paper/30">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-ink-border p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="relative group border border-ink-border bg-ink-surface/50 p-2 cursor-pointer hover:border-gold transition-colors"
                onClick={() => onRestore(entry)}
                title={lang === "pt" ? "Restaurar" : "Restore"}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
                  className={cn(
                    "absolute top-1 right-1 w-4 h-4 text-[10px] font-mono",
                    "text-paper/20 hover:text-paper/60 transition-colors",
                    "opacity-0 group-hover:opacity-100"
                  )}
                >
                  ×
                </button>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.thumbnail}
                  alt={entry.templateLabel}
                  className="w-full aspect-square mb-1"
                  style={{ imageRendering: "pixelated" }}
                />
                <div className="flex items-center gap-1 mb-0.5">
                  <div
                    className="w-2.5 h-2.5 rounded-sm border border-ink-border flex-shrink-0"
                    style={{ backgroundColor: hexOf(entry.color) }}
                  />
                  <span className="text-[9px] font-mono text-paper/30 truncate">
                    {hexOf(entry.color)}
                  </span>
                </div>
                <p className="text-[9px] font-mono text-paper/20 truncate">
                  {entry.templateLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
