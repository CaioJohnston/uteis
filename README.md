<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/logo-light.svg">
  <img src="docs/logo-dark.svg" alt="úteis" height="64">
</picture>

<br/>

**Hub pessoal de mini ferramentas, scripts utilitários e experimentos de IA.**

[![Deploy](https://img.shields.io/badge/vercel-deployed-black?style=flat-square&logo=vercel)](https://uteis.vercel.app)

</div>

---

## O que é

**úteis.** é uma coleção de aplicações, scripts, ferramentas e experimentos. Construídos para uso próprio. Compartilhados porque podem ser úteis.

---

## Ferramentas

| Ferramenta                     | Modo     | Status           | O que faz                                                                                                                                                  |
| ------------------------------ | -------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Git-Craft**           | embedded | `experimental` | Crie e gerencie um servidor Minecraft via GitHub Codespaces. Console em tempo real no navegador, sem VPS nem SSH                                         |
| **Open ú.**             | embedded | `active`       | Chat client-side com IA configurável. Conecte sua própria API (OpenAI, Anthropic ou qualquer endpoint compatível) e converse diretamente no navegador |
| **Gastômetro**          | embedded | `active`       | Importe o CSV do Nubank e veja seus gastos organizados por categoria, tudo processado localmente                                                           |
| **Saucerful of Secrets** | download | `active`       | Criptografador de arquivos portátil com AES-256-GCM + Argon2id; roda a partir de pen drive, sem instalação                                              |
| **Tapicius**             | download | `active`       | AutoClicker para Windows com múltiplos pontos de clique                                                                                                   |
| **Sílex**               | embedded | `experimental` | Gera nomes criativos para projetos com base na descrição e nas referências pessoais do usuário                                                         |
| **HaGR**                 | external | `experimental` | Reconhecimento de gestos manuais em tempo real via webcam ou imagem, modelo treinado com HaGRID                                                            |

### Modos de hospedagem

| Modo         | Comportamento                                                   |
| ------------ | --------------------------------------------------------------- |
| `embedded` | Interface integrada ao hub — código neste repositório        |
| `external` | Ferramenta em outro domínio; hub exibe a vitrine e redireciona |
| `download` | Binário ou script que roda localmente na máquina do usuário  |

---

## Stack

|           |                                           |
| --------- | ----------------------------------------- |
| Framework | Next.js 14 (App Router)                   |
| Linguagem | TypeScript strict                         |
| Estilos   | Tailwind CSS                              |
| Tema      | next-themes — dark/light, padrão escuro |
| 3D        | Three.js                                  |
| Deploy    | Vercel Hobby                              |
| Fontes    | Cormorant · Manrope · JetBrains Mono    |

---

## Variáveis de ambiente

```bash
# Copie para .env.local e preencha os valores
# Obter chave em: https://aistudio.google.com/apikey
GEMINI_API_KEY=   # Usada por Sílex e outras tools com IA
```

---

## Rodando localmente

```bash
git clone https://github.com/CaioJohnston/uteis.git
cd uteis
npm install
npm run dev       # http://localhost:3000
```

```bash
npm run build     # verifica o build antes de subir
npm run lint
```

---

## Como adicionar uma ferramenta

1. Inserir objeto em `src/data/tools.ts` com o `hostingMode` correto
2. Se `embedded`: criar `src/app/tools/[slug]/page.tsx` com a interface
3. Se `external` ou `download`: a página de detalhe já é gerada automaticamente

```ts
// embedded — roda dentro do hub
{ hostingMode: "embedded", href: "/tools/minha-ferramenta" }

// external — redireciona para outro domínio
{ hostingMode: "external", externalUrl: "https://meuapp.streamlit.app" }

// download — usuário baixa e roda local
{ hostingMode: "download", downloadUrl: "https://github.com/…/releases/…/arquivo.exe" }
```

---

<div align="center">
  <sub>feito por <a href="https://github.com/CaioJohnston">Caio Johnston</a></sub>
</div>
