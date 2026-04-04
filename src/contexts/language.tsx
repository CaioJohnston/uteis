"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Tool } from "@/types";

type Lang = "pt" | "en";

const translations = {
  pt: {
    // Nav
    nav_tools: "Ferramentas",
    // Tool detail
    back: "← ferramentas",
    links: "Links",
    use_tool: "Usar ferramenta",
    open_tool: "Abrir ferramenta",
    download_label: "Baixar",
    source_code: "Código fonte",
    mirror_repo: "Repositório (espelho)",
    requirements: "Requisitos",
    metadata: "Metadados",
    published: "publicado",
    version: "versão",
    status: "status",
    visibility: "visibilidade",
    // Status
    status_active: "ativo",
    status_experimental: "experimental",
    status_maintenance: "em manutenção",
    status_archived: "arquivado",
    // ToolCard actions
    card_use: "usar →",
    card_open: "abrir ↗",
    card_download: "baixar ↓",
    // Catalog page
    catalog_eyebrow: "catálogo",
    catalog_heading: "Ferramentas",
    tool_singular: "ferramenta",
    tool_plural: "ferramentas",
    tools_published: "publicadas",
    // ToolCatalog
    search_placeholder: "Buscar ferramenta...",
    filter_all: "todos",
    no_results: "nenhuma ferramenta encontrada.",
    tools_of: "de",
    // Home
    home_desc_1: "Uma coleção de aplicações, scripts, ferramentas e experimentos.",
    home_desc_2: "Construídos para uso próprio. Compartilhados porque podem ser",
    home_cta: "Ver ferramentas",
    home_featured: "Em destaque",
    home_see_all: "ver todas →",
    home_about_title: "Sobre o projeto",
    home_about_body:
      "Este site é um arquivo pessoal de utilidades. Cada ferramenta aqui existe porque eu precisei dela em algum momento e decidi transformá-la em algo com interface. O código é aberto, a intenção é simples.",
    home_author: "Caio Johnston · Brasil",
    // Footer
    footer_tools: "ferramentas",
    // 404
    not_found_title: "Não encontrado",
    not_found_desc: "Esta ferramenta não existe ou foi removida.",
    not_found_back: "← voltar ao catálogo",
  },
  en: {
    // Nav
    nav_tools: "Tools",
    // Tool detail
    back: "← tools",
    links: "Links",
    use_tool: "Use tool",
    open_tool: "Open tool",
    download_label: "Download",
    source_code: "Source code",
    mirror_repo: "Repository (mirror)",
    requirements: "Requirements",
    metadata: "Metadata",
    published: "published",
    version: "version",
    status: "status",
    visibility: "visibility",
    // Status
    status_active: "active",
    status_experimental: "experimental",
    status_maintenance: "maintenance",
    status_archived: "archived",
    // ToolCard actions
    card_use: "use →",
    card_open: "open ↗",
    card_download: "download ↓",
    // Catalog page
    catalog_eyebrow: "catalog",
    catalog_heading: "Tools",
    tool_singular: "tool",
    tool_plural: "tools",
    tools_published: "published",
    // ToolCatalog
    search_placeholder: "Search tools...",
    filter_all: "all",
    no_results: "no tools found.",
    tools_of: "of",
    // Home
    home_desc_1: "A collection of apps, scripts, tools and experiments.",
    home_desc_2: "Built for personal use. Shared because they might be",
    home_cta: "Browse tools",
    home_featured: "Featured",
    home_see_all: "see all →",
    home_about_title: "About",
    home_about_body:
      "This site is a personal archive of utilities. Each tool here exists because I needed it at some point and decided to give it an interface. The code is open, the intention is simple.",
    home_author: "Caio Johnston · Brazil",
    // Footer
    footer_tools: "tools",
    // 404
    not_found_title: "Not found",
    not_found_desc: "This tool doesn't exist or was removed.",
    not_found_back: "← back to catalog",
  },
} as const;

type TKey = keyof typeof translations.pt;

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  t: (key: TKey) => string;
}

const LanguageContext = createContext<LangCtx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("pt");
  const toggle = () => setLang((l) => (l === "pt" ? "en" : "pt"));
  const t = (key: TKey): string => translations[lang][key];
  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be within LanguageProvider");
  return ctx;
}

export function useLocalizedTool(tool: Tool): Tool {
  const { lang } = useLanguage();
  if (lang === "pt" || !tool.i18n?.en) return tool;
  const en = tool.i18n.en;
  return {
    ...tool,
    name: en.name ?? tool.name,
    description: en.description ?? tool.description,
    longDescription: en.longDescription ?? tool.longDescription,
    requirements: en.requirements ?? tool.requirements,
  };
}

const tagTranslations: Record<string, string> = {
  segurança: "security",
  arquivos: "files",
  utilidades: "utilities",
  finanças: "finance",
  dados: "data",
  produtividade: "productivity",
  automação: "automation",
  texto: "text",
  saúde: "health",
  IA: "AI",
  pesquisa: "research",
  devtools: "devtools",
};

export function useTagLabel() {
  const { lang } = useLanguage();
  return (tag: string) => lang === "en" ? (tagTranslations[tag] ?? tag) : tag;
}
