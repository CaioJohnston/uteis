import type { Tool } from "@/types";

// -------------------------------------------------------------------
// REGISTRY CENTRAL
// Para adicionar uma nova ferramenta, basta inserir um objeto aqui.
// -------------------------------------------------------------------

export const tools: Tool[] = [
  {
    id: "4",
    slug: "saucerful",
    name: "Saucerful of Secrets",
    description:
      "Criptografador de arquivos portátil com interface gráfica. Proteja qualquer arquivo com AES-256-GCM e senha, sem instalação, sem internet, sem dependências.",
    longDescription: `Feito para viver no pen drive, HD externo ou qualquer pasta portátil. Coloque o executável junto dos arquivos que quer proteger e o vault é detectado automaticamente.

**Funcionalidades:**
- **Vault automático** — detecta arquivos na pasta do executável ou em subpastas
  - "vault" / "senhas" / "secrets"
- **Travar / Destravar Tudo** — processa todos os arquivos do vault de uma vez com uma única senha
- **AES-256-GCM** — criptografia com autenticação integrada
- **Argon2id** — derivação de chave resistente a ataques por GPU/ASIC
- **Verificação de integridade** — hash SHA-256 embutido em cada arquivo cifrado
- **Medidor de força de senha** — feedback visual em tempo real
- **Drag & Drop** — arraste arquivos diretamente para a janela
- **Senha de sessão** — lembra a senha durante a sessão para múltiplos arquivos
- **Portátil** — executável único, funciona a partir de pen drive

**Aviso:** não passou por auditoria de segurança profissional. Se esquecer a senha, os dados não podem ser recuperados.`,
    tags: ["segurança", "arquivos", "utilidades"],
    status: "active",
    visibility: "public",
    hostingMode: "download",
    downloads: [
      {
        os: "windows",
        url: "https://github.com/CaioJohnston/saucerful-of-secrets/releases/latest/download/saucerful-windows-amd64.exe",
        label: "(.exe)",
      },
    ],
    requirements: "Windows 10+ (64-bit)",
    audioUrl: "/audio/let-there-be-more-light.mp3",
    audioCredit: "**Let There Be More Light** — **Pink Floyd**.\n© 1968 Pink Floyd Music Ltd. Do álbum **A Saucerful of Secrets**.\nTodos os direitos reservados. Uso não-comercial.",
    githubUrl: "https://github.com/CaioJohnston/saucerful-of-secrets",
    version: "3.0.0",
    featured: true,
    createdAt: "2026-04-02",
  },
  {
    id: "3",
    slug: "gastometro",
    name: "Gastômetro",
    description: "Importe o CSV do Nubank e veja seus gastos organizados por categoria. Por enquanto só Nubank.",
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

  **Privacidade:** tudo processado localmente, nenhum dado sai do navegador.`,
    tags: ["finanças", "dados", "utilidades"],
    status: "active",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/gastometro/usar",
    githubUrl: "https://github.com/CaioJohnston/uteis",
    version: "0.1.0",
    featured: true,
    createdAt: "2026-04-02",
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
