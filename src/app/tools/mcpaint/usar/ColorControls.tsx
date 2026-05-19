"use client";

import { cn } from "@/lib/utils";
import type { RGB, RecolorMode } from "./recolor";

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(rgb: RGB): string {
  return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("");
}

interface Props {
  color: RGB;
  threshold: number;
  brightness: number; // 0-100
  strength: number;   // 0-100
  mode: RecolorMode;
  lang: "pt" | "en";
  onColorChange: (c: RGB) => void;
  onThresholdChange: (t: number) => void;
  onBrightnessChange: (b: number) => void;
  onStrengthChange: (s: number) => void;
  onModeChange: (m: RecolorMode) => void;
}

const MODES: { id: RecolorMode; pt: string; en: string; desc_pt: string; desc_en: string }[] = [
  {
    id: "ore",
    pt: "Dois tons",
    en: "Two-zone",
    desc_pt: "Pixels escuros → recoloridos. Pixels claros (pedra) → mantidos.",
    desc_en: "Dark pixels → recolored. Light pixels (stone) → kept.",
  },
  {
    id: "full",
    pt: "Colorir",
    en: "Colorize",
    desc_pt: "Todos os pixels opacos são recoloridos.",
    desc_en: "All opaque pixels are recolored.",
  },
  {
    id: "blend",
    pt: "Mesclar",
    en: "Blend",
    desc_pt: "Mistura suave entre original e recolorido. Bom para qualquer textura.",
    desc_en: "Soft mix between original and recolored. Works on any texture.",
  },
];

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  leftHint?: string;
  rightHint?: string;
}

function SliderRow({ label, value, min, max, step = 1, onChange, leftHint, rightHint }: SliderRowProps) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-mono text-paper/40">{label}</span>
        <span className="text-xs font-mono text-gold">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-gold"
      />
      {(leftHint || rightHint) && (
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] font-mono text-paper/20">{leftHint}</span>
          <span className="text-[10px] font-mono text-paper/20">{rightHint}</span>
        </div>
      )}
    </div>
  );
}

export function ColorControls({
  color,
  threshold,
  brightness,
  strength,
  mode,
  lang,
  onColorChange,
  onThresholdChange,
  onBrightnessChange,
  onStrengthChange,
  onModeChange,
}: Props) {
  const hex = rgbToHex(color);
  const L = (pt: string, en: string) => (lang === "pt" ? pt : en);

  function handleHex(val: string) {
    if (/^#[0-9a-fA-F]{6}$/.test(val)) onColorChange(hexToRgb(val));
  }

  function handleChannel(idx: 0 | 1 | 2, val: string) {
    const n = Math.max(0, Math.min(255, parseInt(val) || 0));
    const next: RGB = [...color] as RGB;
    next[idx] = n;
    onColorChange(next);
  }

  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div>
        <p className="text-xs font-mono text-paper/40 uppercase mb-3">
          {L("Modo", "Mode")}
        </p>
        <div className="flex gap-1 mb-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              className={cn(
                "flex-1 py-1.5 text-[11px] font-mono transition-colors border",
                mode === m.id
                  ? "border-gold text-gold bg-ink-surface"
                  : "border-ink-border text-paper/40 hover:text-paper/60 hover:border-ink-muted"
              )}
            >
              {lang === "pt" ? m.pt : m.en}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-mono text-paper/25 leading-snug">
          {lang === "pt" ? currentMode.desc_pt : currentMode.desc_en}
        </p>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-mono text-paper/40 uppercase mb-3">
          {L("Cor", "Color")}
        </p>
        <div className="flex items-center gap-3 mb-3">
          <input
            type="color"
            value={hex}
            onChange={(e) => onColorChange(hexToRgb(e.target.value))}
            className="w-10 h-10 rounded cursor-pointer border border-ink-border bg-transparent p-0.5"
          />
          <input
            type="text"
            value={hex}
            onChange={(e) => handleHex(e.target.value)}
            maxLength={7}
            className={cn(
              "flex-1 bg-ink-surface border border-ink-border px-3 py-2",
              "text-sm font-mono text-paper uppercase focus:outline-none focus:border-gold"
            )}
            placeholder="#2B7FD9"
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(["R", "G", "B"] as const).map((ch, i) => (
            <div key={ch}>
              <label className="text-[10px] font-mono text-paper/30 block mb-1">{ch}</label>
              <input
                type="number"
                min={0}
                max={255}
                value={color[i]}
                onChange={(e) => handleChannel(i as 0 | 1 | 2, e.target.value)}
                className={cn(
                  "w-full bg-ink-surface border border-ink-border px-2 py-1.5",
                  "text-sm font-mono text-paper focus:outline-none focus:border-gold"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-4">
        <SliderRow
          label={L("Brilho", "Brightness")}
          value={brightness}
          min={0}
          max={100}
          step={5}
          onChange={onBrightnessChange}
          leftHint={L("escuro", "dark")}
          rightHint={L("vibrante", "vibrant")}
        />

        {mode === "ore" && (
          <SliderRow
            label={L("Limite de luminância", "Luminance threshold")}
            value={threshold}
            min={10}
            max={200}
            step={5}
            onChange={onThresholdChange}
            leftHint={L("menos minério", "less ore")}
            rightHint={L("mais minério", "more ore")}
          />
        )}

        {mode === "blend" && (
          <SliderRow
            label={L("Intensidade", "Intensity")}
            value={strength}
            min={0}
            max={100}
            step={5}
            onChange={onStrengthChange}
            leftHint={L("original", "original")}
            rightHint={L("total", "full")}
          />
        )}
      </div>
    </div>
  );
}
