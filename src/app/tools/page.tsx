import type { Metadata } from "next";
import { getPublicTools, getAllTags } from "@/data/tools";
import { ToolCatalog } from "@/components/ToolCatalog";
import { ToolsHeader } from "./ToolsHeader";

export const metadata: Metadata = {
  title: "Ferramentas",
  description: "Todas as mini ferramentas e utilitários disponíveis.",
};

export default function ToolsPage() {
  const tools = getPublicTools();
  const tags = getAllTags();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <ToolsHeader count={tools.length} />
      <ToolCatalog tools={tools} allTags={tags} />
    </div>
  );
}
