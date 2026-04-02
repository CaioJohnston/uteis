# úteis

Hub pessoal de mini ferramentas, utilitários e experimentos de IA.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Vercel

**Repo:** [github.com/CaioJohnston/uteis](https://github.com/CaioJohnston/uteis)

---

## Setup local

```bash
git clone https://github.com/CaioJohnston/uteis.git
cd uteis
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## Ferramentas disponíveis

| Nome | Modo | Status |
|---|---|---|
| Gastometro | embedded | active |

---

## Como adicionar uma ferramenta

Edite `src/data/tools.ts` e insira um objeto no array `tools`. Cada ferramenta declara um `hostingMode`:

### `embedded` — roda dentro do úteis

```ts
{
  id: "4",
  slug: "minha-ferramenta",
  name: "Minha Ferramenta",
  description: "Uma linha descrevendo o que faz.",
  longDescription: `Descrição completa.`,
  tags: ["utilidades"],
  status: "active",
  visibility: "public",
  hostingMode: "embedded",
  href: "/tools/minha-ferramenta",
  featured: false,
  createdAt: "2025-01-01",
}
```

Crie também a interface em `src/app/tools/minha-ferramenta/page.tsx`.

### `external` — redireciona para outro domínio

```ts
{
  hostingMode: "external",
  externalUrl: "https://meuapp.streamlit.app",
  iframeEnabled: false,
}
```

### `download` — o usuário baixa e roda localmente

```ts
{
  hostingMode: "download",
  downloadUrl: "https://github.com/CaioJohnston/uteis/releases/latest/download/script.zip",
  downloadLabel: "Baixar script (.py)",
  requirements: "Python 3.10+",
}
```

Para `external` e `download` a página de detalhe é gerada automaticamente. Nenhum outro arquivo precisa ser criado.

---

## Tags disponíveis

`produtividade` `automacao` `texto` `arquivos` `financas` `seguranca` `IA` `pesquisa` `devtools` `dados` `saude` `utilidades`

Para adicionar uma nova tag, edite o tipo `ToolTag` em `src/types/index.ts`.

---

## Status de cada ferramenta

| Status | Significado |
|---|---|
| `active` | Estavel, em uso |
| `experimental` | Funcional mas instavel |
| `maintenance` | Temporariamente com problemas |
| `archived` | Descontinuada, mantida por registro |

---

## Deploy

O site roda na Vercel com deploy automatico a cada push na `main`.

```bash
npm run build   # testa o build antes de subir
```

---

## Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de producao
npm run lint     # lint
```
