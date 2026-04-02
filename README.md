# toolhub

Hub pessoal de mini ferramentas, utilitários e experimentos.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Vercel

---

## Setup local

```bash
# 1. Clonar o repositório
git clone https://github.com/seuusuario/toolhub.git
cd toolhub

# 2. Instalar dependências
npm install

# 3. Rodar em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

---

## Estrutura do projeto

```
src/
  app/
    page.tsx              # Home
    tools/
      page.tsx            # Catálogo completo
      [slug]/page.tsx     # Página individual de cada ferramenta
    layout.tsx            # Layout raiz (Nav, Footer, tema)
    globals.css           # CSS global + variáveis
  components/
    Nav.tsx               # Navegação + toggle de tema
    Footer.tsx
    ToolCard.tsx          # Card do catálogo
    ToolCatalog.tsx       # Grid com busca e filtro (client)
    Providers.tsx         # next-themes provider
  data/
    tools.ts              # REGISTRY CENTRAL DE FERRAMENTAS
  lib/
    utils.ts              # cn(), formatDate()
  types/
    index.ts              # Tipos TypeScript
```

---

## Como adicionar uma nova ferramenta

Edite `src/data/tools.ts` e insira um objeto no array `tools`:

```ts
{
  id: "4",                          // incrementar
  slug: "minha-ferramenta",         // usado na URL: /tools/minha-ferramenta
  name: "Minha Ferramenta",
  description: "Uma linha descrevendo o que faz.",
  longDescription: `Descrição completa.
Pode ter múltiplos parágrafos.

**Seções** em negrito são suportadas.

- item de lista
- outro item`,
  tags: ["produtividade", "texto"], // ver lista de tags disponíveis em src/types/index.ts
  status: "active",                 // active | experimental | maintenance | archived
  visibility: "public",             // public | internal
  href: "/tools/minha-ferramenta",  // rota interna OU URL externa
  githubUrl: "https://github.com/seuusuario/toolhub",
  featured: false,                  // aparecer na home?
  createdAt: "2024-06-01",
}
```

Isso é suficiente para a ferramenta aparecer no catálogo, ter página própria e ser indexada pelo buscador.

Se a ferramenta tiver uma interface própria, crie o arquivo:
```
src/app/tools/minha-ferramenta/page.tsx
```

---

## Tags disponíveis

`produtividade` `automação` `texto` `arquivos` `finanças` `segurança` `IA` `pesquisa` `devtools` `dados` `saúde` `utilidades`

Para adicionar uma nova tag, edite o tipo `ToolTag` em `src/types/index.ts`.

---

## Status de cada ferramenta

| Status | Significado |
|---|---|
| `active` | Estável, em uso |
| `experimental` | Funcional mas instável |
| `maintenance` | Temporariamente com problemas |
| `archived` | Descontinuada, mantida por registro |

---

## Deploy na Vercel (gratuito)

### Primeira vez

1. Crie conta em [vercel.com](https://vercel.com) com sua conta GitHub
2. Clique em **Add New Project**
3. Importe o repositório `toolhub`
4. Deixe as configurações padrão (Vercel detecta Next.js automaticamente)
5. Clique em **Deploy**

Pronto. A URL fica disponível em `seuusuario-toolhub.vercel.app`.

### Domínio próprio (opcional, gratuito no plano Hobby)

Em **Project Settings > Domains**, adicione seu domínio e configure o DNS conforme instrução da Vercel.

### Deploy automático

Todo `git push` na branch `main` dispara um deploy automático. Não precisa fazer nada manualmente.

```bash
# Publicar uma nova ferramenta
git add src/data/tools.ts
git commit -m "feat: adiciona ferramenta X"
git push
```

---

## Personalização obrigatória

Substitua nos arquivos abaixo:

| Arquivo | O que trocar |
|---|---|
| `src/app/page.tsx` | `[seu nome]` na seção "Sobre" |
| `src/components/Footer.tsx` | URL do GitHub |
| `src/components/Nav.tsx` | URL do GitHub |
| `src/app/layout.tsx` | `description` do metadata |
| `src/data/tools.ts` | `githubUrl` de cada ferramenta |

---

## Adicionar variável de ambiente (para tools com API)

```bash
# Localmente
cp .env.example .env.local
# Preencha as variáveis

# Na Vercel: Project Settings > Environment Variables
```

Variáveis com prefixo `NEXT_PUBLIC_` ficam expostas no client. Chaves de API devem ficar sem esse prefixo e ser usadas apenas em Route Handlers (`src/app/api/`).

---

## Comandos úteis

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção (testa erros antes do deploy)
npm run lint     # lint
```
