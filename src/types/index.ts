export type ToolStatus = "active" | "maintenance" | "experimental" | "archived";
export type ToolVisibility = "public" | "internal";

export type ToolTag =
  | "produtividade"
  | "automação"
  | "texto"
  | "arquivos"
  | "finanças"
  | "segurança"
  | "IA"
  | "pesquisa"
  | "devtools"
  | "dados"
  | "saúde"
  | "utilidades";

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  tags: ToolTag[];
  status: ToolStatus;
  visibility: ToolVisibility;
  href?: string;          // rota interna ex: /tools/nome ou URL externa
  githubUrl?: string;
  demoUrl?: string;
  featured?: boolean;
  createdAt: string;      // ISO date string
}
