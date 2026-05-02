export type ToolStatus = "active" | "maintenance" | "experimental" | "archived";
export type ToolVisibility = "public" | "internal";
export type HostingMode = "embedded" | "external" | "download";
export type OsPlatform = "windows" | "macos-intel" | "macos-arm" | "linux";

export interface OsDownload {
  os: OsPlatform;
  url: string;
  label: string;
}

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
  | "utilidades"
  | "gaming"
  | "infra";

export interface Tool {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  tags: ToolTag[];
  status: ToolStatus;
  visibility: ToolVisibility;
  hostingMode: HostingMode;

  // embedded: rota interna
  href?: string;

  // external: URL da ferramenta em outro domínio
  externalUrl?: string;
  iframeEnabled?: boolean;

  // download: link direto para o arquivo ou release
  downloadUrl?: string;
  downloadLabel?: string;
  downloads?: OsDownload[];
  requirements?: string;

  // audio (opcional)
  audioUrl?: string;
  audioCredit?: string;

  // i18n
  i18n?: {
    en?: {
      name?: string;
      description?: string;
      longDescription?: string;
      requirements?: string;
    };
  };

  // comum
  githubUrl?: string;
  version?: string;
  featured?: boolean;
  createdAt: string;
}
