import type { Tool } from "@/types";

// -------------------------------------------------------------------
// REGISTRY CENTRAL
// Para adicionar uma nova ferramenta, basta inserir um objeto aqui.
// -------------------------------------------------------------------

export const tools: Tool[] = [
  {
    id: "3",
    slug: "gastometro",
    name: "Gastômetro",
    description: "Importe o CSV do Nubank e veja seus gastos organizados por categoria.",
    longDescription: `Faça o upload do CSV exportado pelo Nubank e obtenha um breakdown
completo dos seus gastos por categoria, com totais e detalhamento de cada transação.

**Categorias detectadas automaticamente:**
- Delivery (iFood, Rappi…)
- Transporte (Uber, 99…)
- Restaurantes
- Entretenimento (Netflix, Spotify…)
- Assinaturas (GitHub, Notion…)
- Compras (Amazon, Mercado Livre…)
- Saúde (farmácias, drogarias…)
- Educação
- Contas (energia, internet…)
- Outros

**Como exportar:** Nubank → Perfil → Meus dados → Exportar CSV da fatura.

**Privacidade:** tudo processado localmente, nenhum dado sai do navegador.`,
    tags: ["finanças", "dados", "utilidades"],
    status: "active",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/gastometro",
    featured: true,
    createdAt: "2024-03-20",
  },
];

// Helpers
export const getFeaturedTools = () => tools.filter((t) => t.featured && t.visibility === "public");

export const getToolBySlug = (slug: string) => tools.find((t) => t.slug === slug);

export const getPublicTools = () => tools.filter((t) => t.visibility === "public");

export const getAllTags = (): string[] => {
  const tagSet = new Set<string>();
  tools.forEach((t) => t.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort();
};
