"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Types

interface Transaction {
  date: string;
  title: string;
  amount: number;
  category: string;
}

interface CategorySummary {
  name: string;
  total: number;
  count: number;
  transactions: Transaction[];
}

// Category rules (ordem importa: mais específico primeiro)

const CATEGORY_RULES: Array<{ name: string; keywords: string[] }> = [
  {
    name: "Delivery",
    keywords: ["ifood", "ifd*", "ifd ", "rappi", "uber eats", "ubereats", "james delivery", "aiqfome"],
  },
  {
    name: "Transporte",
    keywords: ["uber*", "uber ", "99app", "99taxi", "99 ", "taxi", "urentcar", "jetshr", "bom bilhete", "sptrans"],
  },
  {
    name: "Entretenimento",
    keywords: ["netflix", "spotify", "youtube premium", "disney", "hbomax", "hbo ", "prime video", "amazon prime", "apple.com/bill", "twitch", "steam", "playstation", "xbox", "nintendo", "deezer", "globoplay", "telecine", "mubi", "crunchyroll"],
  },
  {
    name: "Assinaturas",
    keywords: ["openai", "chatgpt", "github", "notion", "adobe", "figma", "canva", "dropbox", "google one", "icloud", "microsoft 365", "office 365", "1password", "linear", "vercel", "railway", "netlify"],
  },
  {
    name: "Saúde",
    keywords: ["drogasil", "raia drog", "drogaria", "farmacia", "farmácia", "panvel", "pague menos", "ultrafarma", "pacheco", "droga raia", "nissei", "hapvida", "unimed", "bradesco saude", "sulamerica"],
  },
  {
    name: "Restaurantes",
    keywords: ["restaurante", "lanchonete", "pizzaria", "sushi", "burger king", "mcdonalds", "mcdonald", "mc donalds", "subway", "giraffas", "bob's", "bobs", "outback", "madero", "applebees", "taco bell", "kfc", "popeyes", "padaria", "confeitaria", "cafe", "café"],
  },
  {
    name: "Compras",
    keywords: ["amazon", "mercado livre", "carrefour", "pao de acucar", "pão de açúcar", "extra ", "casas bahia", "magalu", "magazine luiza", "renner", "shopee", "aliexpress", "kabum", "americanas", "centauro", "netshoes", "dafiti", "zattini", "havan"],
  },
  {
    name: "Educação",
    keywords: ["coursera", "udemy", "alura", "duolingo", "faculdade", "universidade", "descomplica", "hotmart", "eduzz", "kiwify"],
  },
  {
    name: "Contas",
    keywords: ["energia eletrica", "energia elétrica", "cpfl", "enel ", "light sa", "cemig", "sabesp", "copasa", "cedae", " agua ", " água ", " gas ", " gás ", "comgas", "vivo ", "claro ", " oi ", " tim ", "nextel", "net combo", "claro net", "vivo fibra"],
  },
];

function categorize(title: string): string {
  const lower = title.toLowerCase();
  for (const { name, keywords } of CATEGORY_RULES) {
    if (keywords.some((kw) => lower.includes(kw.replace("*", "").trim()))) {
      return name;
    }
  }
  return "Outros";
}

// CSV Parsing

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseNubankCsv(text: string): Transaction[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((l) => l.trim());

  if (lines.length < 2) throw new Error("Arquivo vazio ou sem transações.");

  const header = lines[0].toLowerCase();
  if (!header.includes("date") || !header.includes("title") || !header.includes("amount")) {
    throw new Error(
      'Formato não reconhecido. O CSV deve ter as colunas "date", "title" e "amount" (padrão Nubank).'
    );
  }

  const headerCols = parseCsvLine(lines[0]);
  const dateIdx = headerCols.findIndex((c) => c.toLowerCase() === "date");
  const titleIdx = headerCols.findIndex((c) => c.toLowerCase() === "title");
  const amountIdx = headerCols.findIndex((c) => c.toLowerCase() === "amount");

  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length <= Math.max(dateIdx, titleIdx, amountIdx)) continue;

    const date = cols[dateIdx] ?? "";
    const title = cols[titleIdx] ?? "";
    const amount = parseFloat((cols[amountIdx] ?? "0").replace(",", "."));

    if (isNaN(amount) || amount <= 0) continue;

    transactions.push({ date, title, amount, category: categorize(title) });
  }

  if (transactions.length === 0) {
    throw new Error("Nenhuma despesa encontrada. Verifique se o arquivo é da fatura correta.");
  }

  return transactions;
}

// Helpers

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  if (!iso || !iso.includes("-")) return iso;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function buildSummary(txs: Transaction[]): CategorySummary[] {
  const map = new Map<string, CategorySummary>();
  for (const t of txs) {
    if (!map.has(t.category)) {
      map.set(t.category, { name: t.category, total: 0, count: 0, transactions: [] });
    }
    const cat = map.get(t.category)!;
    cat.total += t.amount;
    cat.count++;
    cat.transactions.push(t);
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

// Page

export default function GastometroUsarPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const process = useCallback((file: File) => {
    setError("");
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Envie um arquivo .csv exportado pelo Nubank.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseNubankCsv(e.target?.result as string);
        setTransactions(parsed);
        setExpanded(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao processar o arquivo.");
      }
    };
    reader.readAsText(file, "utf-8");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) process(file);
    },
    [process]
  );

  const reset = () => {
    setTransactions([]);
    setError("");
    setExpanded(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const summary = buildSummary(transactions);
  const total = transactions.reduce((s, t) => s + t.amount, 0);
  const maxTotal = summary[0]?.total ?? 1;

  const dates = [...transactions.map((t) => t.date)].sort();
  const period =
    dates.length > 0
      ? dates[0] === dates[dates.length - 1]
        ? formatDate(dates[0])
        : `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`
      : "";

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Link
        href="/tools/gastometro"
        className="inline-flex items-center gap-2 text-xs font-mono text-paper/30 hover:text-gold transition-colors duration-200 mb-12"
      >
        ← Gastômetro
      </Link>

      <span className="gold-rule mb-10 block" />

      {transactions.length === 0 ? (
        <div className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "border-2 border-dashed p-20 flex flex-col items-center justify-center gap-5 cursor-pointer transition-colors duration-200",
              dragging
                ? "border-gold/60 bg-gold/5"
                : "border-ink-border hover:border-paper/20"
            )}
          >
            <span className="text-4xl font-mono text-paper/20 select-none leading-none">↑</span>
            <div className="text-center space-y-1.5">
              <p className="text-sm text-paper/60">
                Arraste o CSV aqui ou{" "}
                <span className="text-gold underline underline-offset-2">clique para selecionar</span>
              </p>
              <p className="text-xs font-mono text-paper/30">
                Nubank: Perfil &rarr; Meus dados &rarr; Exportar CSV da fatura
              </p>
            </div>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={(e) => { const file = e.target.files?.[0]; if (file) process(file); }}
            className="hidden"
          />

          {error && (
            <p className="text-xs font-mono text-red-400 border border-red-900/40 bg-red-950/20 px-4 py-3">
              ✗ {error}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="border border-ink-border p-5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-wrap gap-8">
              <div>
                <p className="text-xs font-mono text-paper/30 uppercase tracking-widest mb-1">total gasto</p>
                <p className="font-display text-3xl text-gold font-light">{formatBRL(total)}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-paper/30 uppercase tracking-widest mb-1">transações</p>
                <p className="font-display text-3xl text-paper font-light">{transactions.length}</p>
              </div>
              <div>
                <p className="text-xs font-mono text-paper/30 uppercase tracking-widest mb-1">período</p>
                <p className="font-display text-3xl text-paper font-light">{period}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="text-xs font-mono text-paper/30 hover:text-gold transition-colors"
            >
              trocar arquivo ↺
            </button>
          </div>

          <div className="space-y-px">
            {summary.map((cat) => {
              const pct = (cat.total / total) * 100;
              const barWidth = (cat.total / maxTotal) * 100;
              const isOpen = expanded === cat.name;

              return (
                <div key={cat.name} className="border border-ink-border overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : cat.name)}
                    className="w-full px-5 py-4 text-left hover:bg-ink-muted/5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2.5">
                      <span className="text-sm text-paper/80">{cat.name}</span>
                      <div className="flex items-baseline gap-4">
                        <span className="text-xs font-mono text-paper/30">
                          {cat.count} {cat.count === 1 ? "item" : "itens"}
                        </span>
                        <span className="text-xs font-mono text-paper/40">{pct.toFixed(1)}%</span>
                        <span className="font-mono text-sm text-paper/80">{formatBRL(cat.total)}</span>
                        <span className={cn("text-xs font-mono text-paper/30 transition-transform duration-200", isOpen && "rotate-180 inline-block")}>
                          ↓
                        </span>
                      </div>
                    </div>
                    <div className="h-px bg-ink-border overflow-hidden">
                      <div className="h-full bg-gold/50 transition-all duration-700" style={{ width: `${barWidth}%` }} />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-ink-border divide-y divide-ink-border/40">
                      {cat.transactions
                        .slice()
                        .sort((a, b) => b.amount - a.amount)
                        .map((t, i) => (
                          <div key={i} className="px-5 py-2.5 flex items-center gap-4">
                            <span className="text-xs font-mono text-paper/30 w-20 flex-shrink-0">{formatDate(t.date)}</span>
                            <span className="text-sm text-paper/60 flex-1 truncate">{t.title}</span>
                            <span className="font-mono text-sm text-paper/70 flex-shrink-0">{formatBRL(t.amount)}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
