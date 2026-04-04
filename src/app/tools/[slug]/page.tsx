import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getToolBySlug, getPublicTools } from "@/data/tools";
import { ToolSidebar } from "./ToolSidebar";
import { BackLink } from "./BackLink";
import { ToolContent } from "./ToolContent";

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

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <BackLink />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <ToolContent tool={tool} />
        <ToolSidebar tool={tool} />
      </div>
    </div>
  );
}
