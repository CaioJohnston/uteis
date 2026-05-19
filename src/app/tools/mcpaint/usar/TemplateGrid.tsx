"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { RecolorMode } from "./recolor";

export interface Template {
  id: string;
  label: string;
  labelEn: string;
  url: string;
  suggestedMode: RecolorMode;
  category: TemplateCategory;
}

export type TemplateCategory =
  | "generic"
  | "blocks"
  | "deepslate"
  | "nether"
  | "classic"
  | "items";

const CAT_LABELS: Record<TemplateCategory, { pt: string; en: string }> = {
  generic:  { pt: "Genérico",    en: "Generic"    },
  blocks:   { pt: "Blocos",      en: "Blocks"     },
  deepslate:{ pt: "Deepslate",   en: "Deepslate"  },
  nether:   { pt: "Nether",      en: "Nether"     },
  classic:  { pt: "Clássico 1.7",en: "Classic 1.7"},
  items:    { pt: "Itens",       en: "Items"      },
};

const T = (url: string, id: string, pt: string, en: string, mode: RecolorMode, cat: TemplateCategory): Template =>
  ({ id, label: pt, labelEn: en, url: `/mcpaint/templates/${url}`, suggestedMode: mode, category: cat });

export const BUNDLED: Template[] = [
  // ── Genérico ─────────────────────────────────────────────────────────
  T("normal_ore.png",      "normal_ore",      "Pedra normal",     "Normal stone",    "ore",   "generic"),
  T("deepslate_ore.png",   "deepslate_ore",   "Deepslate",        "Deepslate",       "ore",   "generic"),
  T("normal_ore_old.png",  "normal_ore_old",  "Pedra clássica",   "Classic stone",   "ore",   "generic"),

  // ── Blocos 1.20 ──────────────────────────────────────────────────────
  T("coal_ore.png",        "coal_ore",        "Carvão",           "Coal",            "ore",   "blocks"),
  T("copper_ore.png",      "copper_ore",      "Cobre",            "Copper",          "ore",   "blocks"),
  T("iron_ore.png",        "iron_ore",        "Ferro",            "Iron",            "ore",   "blocks"),
  T("gold_ore.png",        "gold_ore",        "Ouro",             "Gold",            "ore",   "blocks"),
  T("lapis_ore.png",       "lapis_ore",       "Lapis",            "Lapis",           "ore",   "blocks"),
  T("redstone_ore.png",    "redstone_ore",    "Redstone",         "Redstone",        "ore",   "blocks"),
  T("emerald_ore.png",     "emerald_ore",     "Esmeralda",        "Emerald",         "full",  "blocks"),
  T("diamond_ore.png",     "diamond_ore",     "Diamante",         "Diamond",         "full",  "blocks"),

  // ── Deepslate ────────────────────────────────────────────────────────
  T("deepslate_coal_ore.png",     "ds_coal",      "Carvão",     "Coal",     "ore",   "deepslate"),
  T("deepslate_copper_ore.png",   "ds_copper",    "Cobre",      "Copper",   "blend", "deepslate"),
  T("deepslate_iron_ore.png",     "ds_iron",      "Ferro",      "Iron",     "blend", "deepslate"),
  T("deepslate_gold_ore.png",     "ds_gold",      "Ouro",       "Gold",     "blend", "deepslate"),
  T("deepslate_lapis_ore.png",    "ds_lapis",     "Lapis",      "Lapis",    "blend", "deepslate"),
  T("deepslate_redstone_ore.png", "ds_redstone",  "Redstone",   "Redstone", "blend", "deepslate"),
  T("deepslate_emerald_ore.png",  "ds_emerald",   "Esmeralda",  "Emerald",  "full",  "deepslate"),
  T("deepslate_diamond_ore.png",  "ds_diamond",   "Diamante",   "Diamond",  "full",  "deepslate"),

  // ── Nether ───────────────────────────────────────────────────────────
  T("nether_gold_ore.png",   "nether_gold",   "Ouro Nether",   "Nether Gold",   "ore",   "nether"),
  T("nether_quartz_ore.png", "nether_quartz", "Quartzo Nether","Nether Quartz", "ore",   "nether"),

  // ── Clássico 1.7 ─────────────────────────────────────────────────────
  T("old_coal_ore.png",     "old_coal",     "Carvão",    "Coal",    "ore",  "classic"),
  T("old_iron_ore.png",     "old_iron",     "Ferro",     "Iron",    "ore",  "classic"),
  T("old_gold_ore.png",     "old_gold",     "Ouro",      "Gold",    "ore",  "classic"),
  T("old_lapis_ore.png",    "old_lapis",    "Lapis",     "Lapis",   "ore",  "classic"),
  T("old_redstone_ore.png", "old_redstone", "Redstone",  "Redstone","ore",  "classic"),
  T("old_quartz_ore.png",   "old_quartz",   "Quartzo",   "Quartz",  "ore",  "classic"),
  T("old_emerald_ore.png",  "old_emerald",  "Esmeralda", "Emerald", "full", "classic"),
  T("old_diamond_ore.png",  "old_diamond",  "Diamante",  "Diamond", "full", "classic"),

  // ── Itens ─────────────────────────────────────────────────────────────
  T("item_iron_ingot.png",      "item_iron_ingot",      "Lingote Ferro",      "Iron Ingot",      "full", "items"),
  T("item_gold_ingot.png",      "item_gold_ingot",      "Lingote Ouro",       "Gold Ingot",      "full", "items"),
  T("item_copper_ingot.png",    "item_copper_ingot",    "Lingote Cobre",      "Copper Ingot",    "full", "items"),
  T("item_netherite_ingot.png", "item_netherite_ingot", "Lingote Netherite",  "Netherite Ingot", "full", "items"),
  T("item_raw_iron.png",        "item_raw_iron",        "Ferro Bruto",        "Raw Iron",        "full", "items"),
  T("item_raw_gold.png",        "item_raw_gold",        "Ouro Bruto",         "Raw Gold",        "full", "items"),
  T("item_raw_copper.png",      "item_raw_copper",      "Cobre Bruto",        "Raw Copper",      "full", "items"),
  T("item_amethyst_shard.png",  "item_amethyst",        "Fragmento Ametista", "Amethyst Shard",  "full", "items"),
  T("old_item_iron_ingot.png",  "old_item_iron",        "Lingote Ferro 1.7",  "Iron Ingot 1.7",  "full", "items"),
  T("old_item_gold_ingot.png",  "old_item_gold",        "Lingote Ouro 1.7",   "Gold Ingot 1.7",  "full", "items"),
  T("old_item_diamond.png",     "old_item_diamond",     "Diamante 1.7",       "Diamond 1.7",     "full", "items"),
  T("old_item_emerald.png",     "old_item_emerald",     "Esmeralda 1.7",      "Emerald 1.7",     "full", "items"),
  T("old_item_ruby.png",        "old_item_ruby",        "Rubi 1.7",           "Ruby 1.7",        "full", "items"),
];

const CATEGORIES = Object.keys(CAT_LABELS) as TemplateCategory[];

interface Props {
  selected: Template | null;
  lang: "pt" | "en";
  onSelect: (t: Template) => void;
}

export function TemplateGrid({ selected, lang, onSelect }: Props) {
  const [cat, setCat] = useState<TemplateCategory>("generic");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onSelect({
      id: `custom_${Date.now()}`,
      label: file.name,
      labelEn: file.name,
      url: URL.createObjectURL(file),
      suggestedMode: "full",
      category: "generic",
    });
    e.target.value = "";
  }

  const visible = BUNDLED.filter((t) => t.category === cat);

  return (
    <div>
      <p className="text-xs font-mono text-paper/40 uppercase mb-3">
        {lang === "pt" ? "Template" : "Template"}
      </p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "px-2 py-1 text-[10px] font-mono border transition-colors",
              cat === c
                ? "border-gold text-gold bg-ink-surface"
                : "border-ink-border text-paper/40 hover:text-paper/60 hover:border-ink-muted"
            )}
          >
            {CAT_LABELS[c][lang]}
          </button>
        ))}
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-4 gap-1.5 max-h-52 overflow-y-auto pr-1 mb-2">
        {visible.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t)}
            className={cn(
              "flex flex-col items-center gap-1 p-1.5 border transition-colors",
              selected?.id === t.id
                ? "border-gold bg-ink-surface"
                : "border-ink-border hover:border-ink-muted bg-ink-surface/50"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={t.url}
              alt={t.label}
              width={32}
              height={32}
              style={{ imageRendering: "pixelated" }}
              className="w-8 h-8"
            />
            <span className="text-[9px] font-mono text-paper/50 text-center leading-tight w-full truncate">
              {lang === "pt" ? t.label : t.labelEn}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="w-full border border-dashed border-ink-border hover:border-ink-muted text-xs font-mono text-paper/40 hover:text-paper/60 py-2 transition-colors"
      >
        {lang === "pt" ? "+ enviar template custom" : "+ upload custom template"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={handleUpload}
      />

      {selected?.id.startsWith("custom_") && (
        <p className="mt-2 text-[10px] font-mono text-paper/30 truncate">
          custom: {selected.label}
        </p>
      )}
    </div>
  );
}
