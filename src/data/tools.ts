import type { Tool } from "@/types";

// -------------------------------------------------------------------
// REGISTRY CENTRAL
// Para adicionar uma nova ferramenta, basta inserir um objeto aqui.
// -------------------------------------------------------------------

export const tools: Tool[] = [
  {
    id: "1",
    slug: "conversor-arquivos",
    name: "Conversor de Arquivos",
    description: "Converta arquivos entre formatos comuns sem instalar nada.",
    longDescription: `Ferramenta web para conversão rápida entre formatos de documento, imagem e dados.
Suporta CSV → JSON, JSON → CSV, imagens entre JPEG/PNG/WebP, e outros.
Tudo processado localmente no navegador, sem upload para servidores externos.

**Formatos suportados:**
- CSV ↔ JSON
- Markdown → HTML
- JPEG ↔ PNG ↔ WebP

**Como usar:**
1. Arraste o arquivo para a área indicada
2. Selecione o formato de saída
3. Baixe o resultado`,
    tags: ["arquivos", "produtividade", "utilidades"],
    status: "active",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/conversor-arquivos",
    githubUrl: "https://github.com/seuusuario/toolhub",
    featured: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    slug: "gerador-senhas",
    name: "Gerador de Senhas",
    description: "Gere senhas fortes e frases secretas com controle total sobre os critérios.",
    longDescription: `Gerador de senhas seguras com opções configuráveis: comprimento, símbolos, números,
letras maiúsculas e minúsculas. Também suporta geração de passphrases baseadas em palavras reais.

Nenhuma senha é enviada para a rede. Tudo gerado via Web Crypto API no próprio navegador.

**Funcionalidades:**
- Senhas aleatórias (8 a 128 caracteres)
- Passphrases (3 a 6 palavras)
- Avaliador de força em tempo real
- Cópia com um clique`,
    tags: ["segurança", "utilidades"],
    status: "active",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/gerador-senhas",
    githubUrl: "https://github.com/seuusuario/toolhub",
    featured: true,
    createdAt: "2024-02-03",
  },
  {
    id: "3",
    slug: "analisador-fatura",
    name: "Analisador de Fatura",
    description: "Cole o extrato do cartão e veja seus gastos organizados por categoria.",
    longDescription: `Ferramenta para análise rápida de faturas de cartão de crédito.
Cole o texto bruto da fatura (copiado do PDF ou do app do banco) e obtenha um breakdown
por categoria de gasto com gráficos simples.

**Categorias detectadas automaticamente:**
- Alimentação e delivery
- Transporte
- Entretenimento
- Assinaturas e serviços
- Compras online
- Outros

**Privacidade:** os dados ficam apenas no seu navegador.`,
    tags: ["finanças", "dados", "IA"],
    status: "experimental",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/analisador-fatura",
    githubUrl: "https://github.com/seuusuario/toolhub",
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
