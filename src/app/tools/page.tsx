import type { Metadata } from "next";
import { getPublicTools, getAllTags } from "@/data/tools";
import { ToolCatalog } from "@/components/ToolCatalog";

export const metadata: Metadata = {
  title: "Ferramentas",
  description: "Todas as mini ferramentas e utilitários disponíveis.",
};

export default function ToolsPage() {
  const tools = getPublicTools();
  const tags = getAllTags();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Cabeçalho */}
      <div className="mb-12">
        <p className="font-mono text-xs text-gold mb-3 tracking-widest uppercase">
          catálogo
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-light text-paper dark:text-paper mb-3">
          Ferramentas
        </h1>
        <p className="text-sm text-paper/40 font-mono">
          {tools.length} {tools.length === 1 ? "ferramenta" : "ferramentas"} publicadas
        </p>
      </div>

      {/* Catálogo interativo (client component) */}
      <ToolCatalog tools={tools} allTags={tags} />
    </div>
  );
}
