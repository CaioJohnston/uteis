import { notFound, redirect } from "next/navigation";
import { getToolBySlug } from "@/data/tools";
import { IframeView } from "./IframeView";
import { BackLink } from "../BackLink";
import { ToolContent } from "../ToolContent";
import { ToolSidebar } from "../ToolSidebar";

interface Props {
  params: { slug: string };
}

export default function IframePage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  if (tool.hostingMode !== "external" || !tool.iframeEnabled || !tool.externalUrl) {
    redirect(`/tools/${params.slug}`);
  }

  return (
    <>
      {/* Página de detalhe como fundo — fica visível durante a animação do clip-path */}
      <div
        className="max-w-5xl mx-auto px-6 py-16 pointer-events-none select-none"
        aria-hidden="true"
      >
        <BackLink />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <ToolContent tool={tool} />
          <ToolSidebar tool={tool} />
        </div>
      </div>

      {/* Overlay do iframe — anima sobre o conteúdo acima */}
      <IframeView slug={params.slug} externalUrl={tool.externalUrl} />
    </>
  );
}
