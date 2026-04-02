import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getToolBySlug, getPublicTools } from "@/data/tools";
import { cn, formatDate } from "@/lib/utils";
import type { Tool } from "@/types";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getPublicTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return {
    title: tool.name,
    description: tool.description,
  };
}

const statusLabel: Record<Tool["status"], string> = {
  active: "ativo",
  experimental: "experimental",
  maintenance: "em manutenção",
  archived: "arquivado",
};

const statusClass: Record<Tool["status"], string> = {
  active: "badge-active",
  experimental: "badge-experimental",
  maintenance: "badge-maintenance",
  archived: "badge-archived",
};

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  // Converte quebras de linha duplas em parágrafos simples (sem MDX)
  const paragraphs = tool.longDescription
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Voltar */}
      <Link
        href="/tools"
        className="inline-flex items-center gap-2 text-xs font-mono text-paper/30 hover:text-gold transition-colors duration-200 mb-12"
      >
        ← ferramentas
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Conteúdo principal */}
        <div className="lg:col-span-2">
          {/* Header da ferramenta */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  "text-xs font-mono px-2 py-0.5 rounded-sm",
                  statusClass[tool.status]
                )}
              >
                {statusLabel[tool.status]}
              </span>
              {tool.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono text-paper/30 border border-ink-border px-2 py-0.5 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-light text-paper dark:text-paper mb-4">
              {tool.name}
            </h1>
            <p className="text-base text-paper/60 leading-relaxed">
              {tool.description}
            </p>
          </div>

          {/* Linha decorativa */}
          <span className="gold-rule mb-8 block" />

          {/* Descrição longa */}
          <div className="space-y-4">
            {paragraphs.map((para, i) => {
              if (para.startsWith("**") || para.includes("**")) {
                // Destaque simples de texto bold
                const parts = para.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={i} className="text-sm text-paper/60 leading-relaxed">
                    {parts.map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="text-paper/90 font-medium">
                          {part}
                        </strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              }
              if (para.startsWith("-")) {
                const items = para.split("\n").filter((l) => l.startsWith("-"));
                return (
                  <ul key={i} className="space-y-1.5 pl-4 border-l border-gold/20">
                    {items.map((item, j) => (
                      <li key={j} className="text-sm text-paper/60">
                        {item.replace(/^-\s*/, "")}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-sm text-paper/60 leading-relaxed">
                  {para}
                </p>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Links de ação */}
          <div className="border border-ink-border p-5 space-y-3">
            <p className="text-xs font-mono text-paper/30 uppercase tracking-widest mb-4">
              Links
            </p>

            {tool.hostingMode === "embedded" && tool.href && (
              <Link
                href={tool.href}
                className="flex items-center justify-between w-full bg-gold text-ink text-sm font-sans font-medium px-4 py-2.5 hover:bg-gold-light transition-colors"
              >
                Usar ferramenta
                <span className="font-mono text-xs">→</span>
              </Link>
            )}

            {tool.hostingMode === "external" && tool.externalUrl && (
              <a
                href={tool.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full bg-gold text-ink text-sm font-sans font-medium px-4 py-2.5 hover:bg-gold-light transition-colors"
              >
                Abrir ferramenta
                <span className="font-mono text-xs">↗</span>
              </a>
            )}

            {tool.hostingMode === "download" && tool.downloadUrl && (
              <a
                href={tool.downloadUrl}
                className="flex items-center justify-between w-full bg-gold text-ink text-sm font-sans font-medium px-4 py-2.5 hover:bg-gold-light transition-colors"
              >
                {tool.downloadLabel ?? "Baixar"}
                <span className="font-mono text-xs">↓</span>
              </a>
            )}

            {tool.githubUrl && (
              <a
                href={tool.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between w-full border border-ink-border text-paper/60 text-sm font-sans px-4 py-2.5 hover:border-paper/30 hover:text-paper transition-colors"
              >
                {tool.hostingMode === "embedded" ? "Repositório (espelho)" : "Código fonte"}
                <span className="font-mono text-xs">↗</span>
              </a>
            )}
          </div>

          {/* Requisitos (download only) */}
          {tool.hostingMode === "download" && tool.requirements && (
            <div className="border border-ink-border p-5">
              <p className="text-xs font-mono text-paper/30 uppercase tracking-widest mb-3">
                Requisitos
              </p>
              <p className="text-xs font-mono text-paper/60">{tool.requirements}</p>
            </div>
          )}

          {/* Metadados */}
          <div className="border border-ink-border p-5 space-y-3">
            <p className="text-xs font-mono text-paper/30 uppercase tracking-widest mb-4">
              Metadados
            </p>
            <div className="flex justify-between text-xs">
              <span className="font-mono text-paper/30">publicado</span>
              <span className="font-mono text-paper/60">{formatDate(tool.createdAt)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-mono text-paper/30">status</span>
              <span className="font-mono text-paper/60">{statusLabel[tool.status]}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="font-mono text-paper/30">visibilidade</span>
              <span className="font-mono text-paper/60">{tool.visibility}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
