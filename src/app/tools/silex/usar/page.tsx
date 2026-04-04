"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language";
import type { GeneratedName } from "@/app/api/nomear/route";

// ─── i18n ────────────────────────────────────────────────────────────────────

const ui = {
  pt: {
    back: "← Sílex",
    label_description: "Descreva seu projeto",
    placeholder_description:
      "Ex: uma ferramenta de linha de comando que organiza arquivos por data e tipo, com configuração via YAML",
    customize: "Personalizar resultados (opcional)",
    label_references: "Referências",
    placeholder_references: "Filmes, Músicas, Livros, Tecnologias, Pessoas...",
    label_languages: "Idiomas",
    placeholder_languages: "Português, Latim, Japonês, Inglês...",
    label_style: "Estilo",
    placeholder_style: "Minimalista, Sombrio, Poético, Técnico...",
    generate: "Gerar nomes →",
    generating: "gerando…",
    back_btn: "← voltar",
    regenerate: "gerar novamente",
    copy: "copiar",
    copied: "copiado",
  },
  en: {
    back: "← Sílex",
    label_description: "Describe your project",
    placeholder_description:
      "Ex: a command-line tool that organizes files by date and type, configured via YAML",
    customize: "Customize results (optional)",
    label_references: "References",
    placeholder_references: "Films, Music, Books, Technologies, People...",
    label_languages: "Languages",
    placeholder_languages: "Portuguese, Latin, Japanese, English...",
    label_style: "Style",
    placeholder_style: "Minimalist, Dark, Poetic, Technical...",
    generate: "Generate names →",
    generating: "generating…",
    back_btn: "← back",
    regenerate: "generate again",
    copy: "copy",
    copied: "copied",
  },
} as const;

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  description: string;
  references: string;
  languages: string;
  vibe: string;
}

const EMPTY_FORM: FormData = {
  description: "",
  references: "",
  languages: "",
  vibe: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function NameCard({
  item,
  copy,
  copied: copiedLabel,
}: {
  item: GeneratedName;
  copy: string;
  copied: string;
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.name);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1800);
  };

  return (
    <div className="group relative bg-ink-surface border border-ink-border rounded-sm p-6 flex flex-col gap-3 hover:border-gold/30 transition-colors duration-200">
      <div className="flex items-start justify-between gap-4">
        <span
          className="font-serif text-3xl text-gold leading-tight"
          style={{ fontFamily: "Cormorant, serif" }}
        >
          {item.name}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "shrink-0 mt-1 text-xs font-mono px-2 py-1 rounded border transition-colors duration-150",
            isCopied
              ? "border-gold/40 text-gold"
              : "border-ink-border text-paper/30 hover:border-paper/30 hover:text-paper/60"
          )}
        >
          {isCopied ? copiedLabel : copy}
        </button>
      </div>

      <p className="text-sm text-paper/60 leading-relaxed">{item.origin}</p>

      <div className="mt-auto pt-2">
        <span className="inline-block text-xs font-mono text-paper/30 border border-ink-border rounded-full px-2 py-0.5">
          {item.vibe}
        </span>
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-mono text-paper/40 uppercase tracking-widest">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-ink-surface border border-ink-border rounded-sm px-4 py-2.5 text-sm text-paper/80 placeholder:text-paper/20 focus:outline-none focus:border-gold/50 transition-colors duration-150"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SilexUsarPage() {
  const { lang } = useLanguage();
  const t = ui[lang];

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [showExtras, setShowExtras] = useState(false);
  const [names, setNames] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const generate = async () => {
    setError("");
    setLoading(true);
    setNames([]);

    try {
      const res = await fetch("/api/nomear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: form.description.trim(),
          references: form.references.trim() || undefined,
          languages: form.languages.trim() || undefined,
          vibe: form.vibe.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Erro ao gerar nomes.");
        return;
      }

      setNames(data.names);
    } catch {
      setError("Falha na conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setNames([]);
    setError("");
  };

  const canGenerate = form.description.trim().length >= 5 && !loading;
  const hasResults = names.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Link
        href="/tools/silex"
        className="inline-flex items-center gap-2 text-xs font-mono text-paper/30 hover:text-gold transition-colors duration-200 mb-12"
      >
        {t.back}
      </Link>

      <span className="gold-rule mb-10 block" />

      {/* Form */}
      <div className="space-y-6 max-w-2xl">
        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-paper/40 uppercase tracking-widest">
            {t.label_description}
          </label>
          <textarea
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            placeholder={t.placeholder_description}
            rows={6}
            maxLength={600}
            className="w-full bg-ink-surface border border-ink-border rounded-sm px-4 py-3 text-sm text-paper/80 placeholder:text-paper/20 focus:outline-none focus:border-gold/50 resize-none transition-colors duration-150"
          />
          <p className="text-xs font-mono text-paper/20 text-right">
            {form.description.length}/600
          </p>
        </div>

        {/* Optional extras */}
        <div className="border border-ink-border rounded-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowExtras((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-paper/40 hover:text-paper/60 hover:bg-ink-surface/50 transition-colors duration-150"
          >
            <span>{t.customize}</span>
            <span className="text-paper/20">{showExtras ? "−" : "+"}</span>
          </button>

          {showExtras && (
            <div className="px-4 pb-4 pt-2 space-y-4 border-t border-ink-border">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-widest">
                  {t.label_references}
                </label>
                <textarea
                  value={form.references}
                  onChange={(e) => set("references")(e.target.value)}
                  placeholder={t.placeholder_references}
                  rows={3}
                  className="w-full bg-ink-surface border border-ink-border rounded-sm px-4 py-2.5 text-sm text-paper/80 placeholder:text-paper/20 focus:outline-none focus:border-gold/50 resize-none transition-colors duration-150"
                />
              </div>
              <InputField
                label={t.label_languages}
                placeholder={t.placeholder_languages}
                value={form.languages}
                onChange={set("languages")}
              />
              <InputField
                label={t.label_style}
                placeholder={t.placeholder_style}
                value={form.vibe}
                onChange={set("vibe")}
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400/80 font-mono">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={hasResults ? reset : generate}
            disabled={!canGenerate && !hasResults}
            className={cn(
              "px-6 py-2.5 text-sm font-mono rounded-sm border transition-colors duration-150",
              hasResults
                ? "border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70"
                : canGenerate
                ? "bg-gold text-ink-DEFAULT border-gold hover:bg-gold/90"
                : "bg-gold/20 text-ink-DEFAULT/40 border-gold/20 cursor-not-allowed"
            )}
          >
            {hasResults ? t.back_btn : loading ? t.generating : t.generate}
          </button>

          {hasResults && (
            <button
              onClick={generate}
              disabled={loading}
              className="px-6 py-2.5 text-sm font-mono rounded-sm border border-ink-border text-paper/50 hover:border-gold/40 hover:text-gold transition-colors duration-150 disabled:opacity-40"
            >
              {loading ? t.generating : t.regenerate}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="mt-16 space-y-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-[72px] bg-ink-surface border border-ink-border rounded-sm animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && hasResults && (
        <div className="mt-16">
          <span className="gold-rule mb-8 block" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {names.map((item, i) => (
              <NameCard
                key={i}
                item={item}
                copy={t.copy}
                copied={t.copied}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
