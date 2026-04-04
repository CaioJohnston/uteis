"use client";

import { AudioPlayer } from "@/components/AudioPlayer";
import { StatusBadge } from "./StatusBadge";
import { useLocalizedTool, useTagLabel } from "@/contexts/language";
import type { Tool } from "@/types";

type Segment =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "blockquote"; text: string };

function renderInline(text: string) {
  return text.split(/\*\*(.*?)\*\*/g).map((part, j) =>
    j % 2 === 1 ? (
      <strong key={j} className="text-ink/90 dark:text-paper/90 font-medium">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function parseSegments(longDescription: string): Segment[] {
  const segments: Segment[] = [];
  const lines = longDescription.split("\n").map((l) => l.trim());
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line) { i++; continue; }
    if (line.startsWith("-")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("-")) {
        items.push(lines[i].replace(/^-\s*/, ""));
        i++;
      }
      segments.push({ type: "list", items });
    } else if (line.startsWith(">")) {
      segments.push({ type: "blockquote", text: line.replace(/^>\s*/, "") });
      i++;
    } else {
      segments.push({ type: "p", text: line });
      i++;
    }
  }
  return segments;
}

export function ToolContent({ tool: rawTool }: { tool: Tool }) {
  const tool = useLocalizedTool(rawTool);
  const tagLabel = useTagLabel();
  const segments = parseSegments(tool.longDescription);

  return (
    <div className="lg:col-span-2">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <StatusBadge status={tool.status} />
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono text-ink/30 dark:text-paper/30 border border-paper-border dark:border-ink-border px-2 py-0.5 rounded-sm"
            >
              {tagLabel(tag)}
            </span>
          ))}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-light text-ink dark:text-paper mb-4">
          {tool.name}
        </h1>
        <p className="text-base text-ink/60 dark:text-paper/60 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <span className="gold-rule mb-8 block" />

      {/* Descrição longa */}
      <div className="space-y-3">
        {segments.map((seg, idx) => {
          if (seg.type === "blockquote") {
            return (
              <blockquote key={idx} className="pl-4 border-l-2 border-gold/30 text-xs font-mono text-ink/40 dark:text-paper/40 leading-relaxed">
                {renderInline(seg.text)}
              </blockquote>
            );
          }
          if (seg.type === "list") {
            return (
              <ul key={idx} className="space-y-1.5 pl-4 border-l border-gold/20">
                {seg.items.map((item, j) => (
                  <li key={j} className="text-sm text-ink/60 dark:text-paper/60">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={idx} className="text-sm text-ink/60 dark:text-paper/60 leading-relaxed">
              {renderInline(seg.text)}
            </p>
          );
        })}
      </div>

      {/* Audio + crédito */}
      {rawTool.audioUrl && (
        <div className="mt-10 pt-8 border-t border-paper-border dark:border-ink-border space-y-3">
          <AudioPlayer src={rawTool.audioUrl} />
          {rawTool.audioCredit && (
            <p className="text-xs font-mono text-ink/25 dark:text-paper/25 leading-relaxed whitespace-pre-line">
              {rawTool.audioCredit.split(/\*\*(.*?)\*\*/g).map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className="text-ink/40 dark:text-paper/40 font-medium">{part}</strong>
                ) : (
                  part
                )
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
