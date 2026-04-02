# úteis — contexto do projeto

Hub pessoal de mini ferramentas, utilitários e experimentos de IA.
O nome é uma referência ao `utils` do Python e à palavra portuguesa "úteis".
Construído para uso próprio e compartilhado publicamente.

Site: **úteis** (sempre em minúsculo, inclusive no logo e metadados)

---

## Conceito central

Ferramentas `external` e `download` vivem em repositórios próprios — o hub é a vitrine e o ponto de entrada.
Ferramentas `embedded` têm o código da interface **integrado a este repositório**. Se houver um `githubUrl`, ele serve apenas como espelho/arquivo do código, não como fonte ativa.

---

## Três modos de hospedagem de ferramentas

Cada ferramenta no registry (`src/data/tools.ts`) declara seu `hostingMode`:

### 1. `embedded`
A ferramenta roda **dentro do hub**, com a identidade visual do úteis.
- Interface construída em Next.js/React, dentro de `src/app/tools/[slug]/page.tsx`
- Usa a paleta, fontes e componentes do hub
- **O código da interface vive neste repositório** — é parte do úteis, não de um repo externo
- Se houver `githubUrl`, é apenas um espelho para referência; a versão em execução é sempre a deste repo
- Lógica pesada pode chamar uma API externa ou Route Handler
- Exemplos: analisador de fatura de cartão de crédito

### 2. `external`
A ferramenta tem **interface própria em outro domínio** (ex: Streamlit, Gradio, outro Next.js).
- O hub exibe a descrição, tags e status da ferramenta
- O botão principal redireciona para a URL externa (`externalUrl`)
- Pode abrir em nova aba ou em iframe (definido por `iframeEnabled`)
- Exemplos: apps Python com Streamlit

### 3. `download`
A ferramenta **roda localmente na máquina do usuário**.
- O hub exibe descrição, instruções de uso e requisitos
- Botão principal faz download do arquivo ou redireciona para o release no GitHub
- Campo `downloadUrl` aponta para o asset (zip, exe, script, etc.)
- Exemplos: saucerful (um CODEX de senhas/cofre portátil)

---

## Stack

- Next.js 14 (App Router, sem Pages Router)
- TypeScript (strict)
- Tailwind CSS
- next-themes (dark/light, padrão escuro)
- Vercel (deploy gratuito)
- Sem banco de dados, sem CMS, sem autenticação (por enquanto)

---

## Identidade visual

- Nome do site: `úteis` (sempre minúsculo)
- Tema padrão: escuro
- Acento principal: dourado `#c9933a`
- Fontes:
  - Display/títulos: `Cormorant` (serif elegante)
  - Corpo: `DM Sans` (sans limpo)
  - Tags/meta/código: `JetBrains Mono`
- Paleta dark: fundo `#0c0b0a`, superfície `#141312`, borda `#252320`
- Paleta light: fundo `#fafaf8`, superfície `#f2f0ec`, borda `#e2dfd8`
- Estética: editorial refinada, minimalista, sem gradientes coloridos

Nunca use fontes genéricas (Inter, Roboto, Arial) nem padrões visuais de template genérico.

---

## Estrutura de pastas

```
src/
  app/
    page.tsx                    # Home com hero + featured tools
    not-found.tsx               # 404 customizada
    layout.tsx                  # Layout raiz: Nav, Footer, Providers
    globals.css                 # Variáveis CSS, reset, utilitários
    tools/
      page.tsx                  # Catálogo com busca e filtro por tag
      [slug]/
        page.tsx                # Página de detalhe (gerada dinamicamente)
        # ferramentas embedded têm sua interface aqui
  components/
    Nav.tsx                     # Sticky nav + toggle de tema
    Footer.tsx
    Providers.tsx               # ThemeProvider (next-themes)
    ToolCard.tsx                # Card do catálogo
    ToolCatalog.tsx             # Grid interativo com busca/filtro (client)
  data/
    tools.ts                    # REGISTRY CENTRAL — único ponto de edição
  lib/
    utils.ts                    # cn(), formatDate()
  types/
    index.ts                    # Tool, ToolStatus, ToolTag, ToolVisibility, HostingMode
```

---

## Tipo Tool (src/types/index.ts)

```ts
export type HostingMode = "embedded" | "external" | "download";

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
  downloadLabel?: string;        // ex: "Baixar script (.py)"
  requirements?: string;         // ex: "Python 3.10+, pandas"

  // comum
  githubUrl?: string;            // repo da ferramenta (pode ser repo separado)
  featured?: boolean;
  createdAt: string;
}
```

---

## Registry de ferramentas (src/data/tools.ts)

Único arquivo a editar para registrar, atualizar ou remover ferramentas.
O `githubUrl` deve apontar para o repositório correto de cada ferramenta (pode ser repo diferente do hub).

Ferramentas registradas atualmente:

| slug | nome | hostingMode | status | interface pronta? |
|---|---|---|---|---|
| `conversor-arquivos` | Conversor de Arquivos | embedded | active | não |
| `gerador-senhas` | Gerador de Senhas | embedded | active | não |
| `analisador-fatura` | Analisador de Fatura | embedded | experimental | não |

---

## Como adicionar uma nova ferramenta

1. Inserir objeto em `src/data/tools.ts` com o `hostingMode` correto
2. Se `embedded`: criar `src/app/tools/[slug]/page.tsx` com a interface
3. Se `external` ou `download`: a página de detalhe já é gerada automaticamente
4. Nada mais precisa ser alterado

Exemplos por modo:

```ts
// EMBEDDED — roda dentro do hub
{
  hostingMode: "embedded",
  href: "/tools/gerador-senhas",
  githubUrl: "https://github.com/seuusuario/gerador-senhas",
}

// EXTERNAL — redireciona para outro domínio (Streamlit, etc.)
{
  hostingMode: "external",
  externalUrl: "https://seuapp.streamlit.app",
  iframeEnabled: false,
  githubUrl: "https://github.com/seuusuario/meu-app-streamlit",
}

// DOWNLOAD — usuário baixa e roda local
{
  hostingMode: "download",
  downloadUrl: "https://github.com/seuusuario/meu-script/releases/latest/download/script.zip",
  downloadLabel: "Baixar script (.py)",
  requirements: "Python 3.10+, pandas",
  githubUrl: "https://github.com/seuusuario/meu-script",
}
```

---

## Comportamento da página de detalhe por hostingMode

`src/app/tools/[slug]/page.tsx` renderiza diferente conforme o modo:

- `embedded`: botão "Usar ferramenta →" leva para a interface dentro do hub
- `external`: botão "Abrir ferramenta ↗" abre `externalUrl` em nova aba; se `iframeEnabled`, oferecer opção de iframe
- `download`: botão com `downloadLabel`, seção de requisitos e instruções de uso

---

## Convenções de código

- Componentes: PascalCase, um por arquivo
- Client components: declarar `"use client"` na primeira linha
- Server components: padrão (sem declaração)
- Classes: sempre usar `cn()` de `@/lib/utils`
- Imports: alias `@/` sempre (nunca caminhos relativos longos)
- Sem `any` no TypeScript

---

## Regras de estilo para interfaces embedded

- Container: `max-w-5xl mx-auto px-6`
- Inputs: `bg-ink-surface border border-ink-border focus:border-gold/50`
- Botões primários: `bg-gold text-ink-DEFAULT hover:bg-gold-light`
- Botões secundários: `border border-ink-border text-paper/60 hover:border-paper/30`
- Feedback de estado (loading, erro, sucesso) sempre visível
- Processar no client quando possível
- API externa: usar Route Handler em `src/app/api/`

---

## Deploy

- Hub: Vercel (plano Hobby, gratuito), trigger em push na `main`
- Ferramentas external: hospedadas em seus próprios serviços (Streamlit Cloud, Hugging Face Spaces, Railway, etc.)
- Ferramentas download: assets nos releases do GitHub de cada repositório

---

## O que ainda não foi feito

- [ ] Atualizar `src/types/index.ts` com `HostingMode` e campos novos
- [ ] Atualizar `src/data/tools.ts` com `hostingMode` em cada ferramenta
- [ ] Atualizar `src/app/tools/[slug]/page.tsx` para renderizar por `hostingMode`
- [ ] Atualizar `ToolCard.tsx` para indicar visualmente o modo (embedded / external / download)
- [ ] Renomear referências de "toolhub" para "úteis" nos metadados e layout
- [ ] Interface da ferramenta `gerador-senhas` (embedded)
- [ ] Interface da ferramenta `conversor-arquivos` (embedded)
- [ ] Interface da ferramenta `analisador-fatura` (embedded)
- [ ] Subir para o GitHub
- [ ] Conectar ao Vercel e fazer primeiro deploy