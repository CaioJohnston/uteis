"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/language";
import { TextureCanvas, type TextureCanvasHandle } from "./TextureCanvas";
import { TemplateGrid, BUNDLED, type Template } from "./TemplateGrid";
import { ColorControls } from "./ColorControls";
import { HistoryPanel, type HistoryEntry } from "./HistoryPanel";
import type { RGB, RecolorMode } from "./recolor";

// ─── i18n ────────────────────────────────────────────────────────────────────

const ui = {
  pt: {
    back: "← MC Paint",
    download: "Baixar PNG",
    saved: "salvo no histórico",
  },
  en: {
    back: "← MC Paint",
    download: "Download PNG",
    saved: "saved to history",
  },
} as const;

// ─── localStorage ─────────────────────────────────────────────────────────────

const LS_KEY = "mcpaint_history";
const HISTORY_MAX = 10;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
  catch { return []; }
}

function saveHistory(entries: HistoryEntry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries.slice(0, HISTORY_MAX)));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function McPaintPage() {
  const { lang } = useLanguage();
  const t = ui[lang];

  const [selected, setSelected] = useState<Template | null>(null);
  const [color, setColor] = useState<RGB>([41, 119, 199]);
  const [mode, setMode] = useState<RecolorMode>("ore");
  const [threshold, setThreshold] = useState(60);
  const [brightness, setBrightness] = useState(50);  // 0-100
  const [strength, setStrength] = useState(70);       // 0-100, blend mode
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [flash, setFlash] = useState(false);

  const canvasRef = useRef<TextureCanvasHandle>(null);

  useEffect(() => { setHistory(loadHistory()); }, []);

  function handleSelectTemplate(t: Template) {
    setSelected(t);
    setMode(t.suggestedMode);
  }

  function handleDownload() {
    if (!selected) return;
    const url = canvasRef.current?.getDataURL();
    if (!url) return;

    const hex = "#" + color.map((v) => v.toString(16).padStart(2, "0")).join("");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.id}_${hex.replace("#", "")}.png`;
    a.click();

    const entry: HistoryEntry = {
      id: `${Date.now()}`,
      thumbnail: url,
      templateId: selected.id,
      templateLabel: lang === "pt" ? selected.label : selected.labelEn,
      color,
      threshold,
      brightness,
      strength,
      mode,
      timestamp: Date.now(),
    };

    setHistory((prev) => {
      const next = [entry, ...prev].slice(0, HISTORY_MAX);
      saveHistory(next);
      return next;
    });

    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  }

  const handleRestore = useCallback((entry: HistoryEntry) => {
    const bundled = BUNDLED.find((b) => b.id === entry.templateId);
    if (bundled) setSelected(bundled);
    setColor(entry.color);
    setThreshold(entry.threshold);
    setBrightness(entry.brightness);
    setStrength(entry.strength);
    setMode(entry.mode);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-10">
      <Link
        href="/tools/mcpaint"
        className="inline-flex items-center gap-2 text-xs font-mono text-paper/30 hover:text-gold transition-colors"
      >
        {t.back}
      </Link>

      <span className="gold-rule block" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10">
        {/* ── Controls ── */}
        <div className="space-y-8">
          <TemplateGrid
            selected={selected}
            lang={lang}
            onSelect={handleSelectTemplate}
          />

          <ColorControls
            color={color}
            threshold={threshold}
            brightness={brightness}
            strength={strength}
            mode={mode}
            lang={lang}
            onColorChange={setColor}
            onThresholdChange={setThreshold}
            onBrightnessChange={setBrightness}
            onStrengthChange={setStrength}
            onModeChange={setMode}
          />
        </div>

        {/* ── Preview ── */}
        <div className="flex flex-col items-center gap-4 lg:w-72">
          <TextureCanvas
            ref={canvasRef}
            sourceUrl={selected?.url ?? null}
            color={color}
            threshold={threshold}
            brightness={brightness / 100}
            strength={strength / 100}
            mode={mode}
          />

          <button
            onClick={handleDownload}
            disabled={!selected}
            className={
              !selected
                ? "w-full py-2.5 text-sm font-mono text-ink/50 bg-gold/30 cursor-not-allowed"
                : "w-full py-2.5 text-sm font-mono text-ink bg-gold hover:bg-gold/80 transition-colors"
            }
          >
            {t.download}
          </button>

          {flash && (
            <p className="text-[10px] font-mono text-gold/60">{t.saved}</p>
          )}
        </div>
      </div>

      <HistoryPanel
        entries={history}
        lang={lang}
        onRestore={handleRestore}
        onDelete={handleDelete}
      />
    </div>
  );
}
