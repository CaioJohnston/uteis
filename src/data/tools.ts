import type { Tool } from "@/types";

// -------------------------------------------------------------------
// REGISTRY CENTRAL
// Para adicionar uma nova ferramenta, basta inserir um objeto aqui.
// -------------------------------------------------------------------

export const tools: Tool[] = [
  {
    id: "9",
    slug: "minehost",
    name: "Git-Craft",
    description:
      "Crie e gerencie um servidor Minecraft via GitHub Codespaces. Suporta Vanilla, Paper, Fabric e Forge. Console em tempo real no navegador.",
    longDescription: `O **Git-Craft** permite criar e controlar um servidor Minecraft usando GitHub Codespaces como infraestrutura — sem VPS, sem configuração de rede, sem cliente de SSH.

**Como funciona:**
1. Autentique com sua conta GitHub
2. Escolha o tipo de máquina (2 ou 4 núcleos)
3. Configure o tipo de servidor e versão
4. O Codespace inicializa, baixa o JAR e sobe o servidor automaticamente
5. Console em tempo real diretamente no navegador

**Tipos de servidor suportados:**
- **Vanilla** — servidor oficial da Mojang
- **Paper** — fork otimizado para performance
- **Fabric** — plataforma de mods leve
- **Forge** — plataforma de mods clássica
- **CurseForge** — modpacks

**Requisitos:**
- Conta GitHub com acesso a Codespaces (plano gratuito inclui 120h/mês)

> O servidor fica na sua conta GitHub. Você controla tudo.`,
    tags: ["gaming", "infra", "devtools"],
    status: "active",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/minehost/usar",
    githubUrl: "https://github.com/CaioJohnston/minecraft-server-template",
    featured: true,
    createdAt: "2026-05-02",
    i18n: {
      en: {
        name: "Git-Craft",
        description:
          "Create and manage a Minecraft server via GitHub Codespaces. Supports Vanilla, Paper, Fabric and Forge. Real-time console in the browser.",
        longDescription: `**Git-Craft** lets you create and control a Minecraft server using GitHub Codespaces as infrastructure — no VPS, no network config, no SSH client.

**How it works:**
1. Authenticate with your GitHub account
2. Choose machine type (2 or 4 cores)
3. Configure server type and version
4. The Codespace initializes, downloads the JAR and starts the server automatically
5. Real-time console directly in the browser

**Supported server types:**
- **Vanilla** — official Mojang server
- **Paper** — performance-optimized fork
- **Fabric** — lightweight mod platform
- **Forge** — classic mod platform
- **CurseForge** — modpacks

**Requirements:**
- GitHub account with Codespaces access (free plan includes 120h/month)

> The server lives in your GitHub account. You control everything.`,
      },
    },
  },
  {
    id: "8",
    slug: "open-u",
    name: "Open ú.",
    description:
      "Interface de chat com IA configurável. Conecte sua própria API (OpenAI, Anthropic, ou custom) e converse com documentos.",
    longDescription: `O **Open ú.** é um chatbot 100% client-side que permite conectar sua própria API de IA e conversar com modelos de linguagem diretamente no navegador.

**Recursos:**
- **Conexão flexível** — suporta OpenAI, Anthropic, ou qualquer endpoint compatível com OpenAI
- **Configuração completa** — ajuste temperature, max tokens, top-p, e system prompt
- **Upload de documentos** — anexe PDF, TXT, ou DOCX para usar como contexto na conversa
- **Privacidade total** — suas credenciais nunca saem do seu navegador
- **Streaming em tempo real** — respostas aparecem conforme são geradas

**Como usar:**
1. Configure sua API Key e endpoint nas configurações
2. (Opcional) Faça upload de documentos para contexto
3. Comece a conversar

**Segurança:** todas as credenciais são armazenadas apenas no localStorage do seu navegador e nunca são transmitidas para nenhum servidor.`,
    tags: ["IA", "produtividade", "texto"],
    status: "active",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/open-u/usar",
    githubUrl: "https://github.com/CaioJohnston/uteis",
    featured: true,
    createdAt: "2026-04-06",
    i18n: {
      en: {
        name: "Open ú.",
        description:
          "Configurable AI chat interface. Connect your own API (OpenAI, Anthropic, or custom) and chat with documents.",
        longDescription: `The **Open ú.** is a 100% client-side chatbot that lets you connect your own AI API and chat with language models directly in the browser.

**Features:**
- **Flexible connection** — supports OpenAI, Anthropic, or any OpenAI-compatible endpoint
- **Full configuration** — adjust temperature, max tokens, top-p, and system prompt
- **Document upload** — attach PDF, TXT, or DOCX to use as context in the conversation
- **Total privacy** — your credentials never leave your browser
- **Real-time streaming** — responses appear as they are generated

**How to use:**
1. Configure your API Key and endpoint in settings
2. (Optional) Upload documents for context
3. Start chatting

**Security:** all credentials are stored only in your browser's localStorage and are never transmitted to any server.`,
      },
    },
  },
  {
    id: "6",
    slug: "tapicius",
    name: "Tapicius",
    description:
      "AutoClicker para Windows com múltiplos pontos de clique, interface gráfica intuitiva e atalhos de teclado.",
    longDescription: `Um AutoClicker simples e eficiente para Windows, desenvolvido em Go com interface gráfica usando a biblioteca Walk.

**Recursos:**
- **Interface Intuitiva** — interface gráfica amigável construída com Walk
- **Múltiplos Pontos de Clique** — defina quantos pontos de clique precisar
- **Intervalo Configurável** — ajuste o tempo entre cliques em milissegundos
- **Atalho de Teclado** — use F6 para iniciar/parar rapidamente
- **Sobreposição Visual** — interface de sobreposição para facilitar a seleção dos pontos
- **Configuração Persistente** — suas configurações são salvas automaticamente

**Requisitos:**
- Windows 10 ou superior

> Ideal para automação de tarefas repetitivas e testes de interface.`,
    tags: ["automação", "utilidades"],
    status: "active",
    visibility: "public",
    hostingMode: "download",
    downloads: [
      {
        os: "windows",
        url: "https://github.com/CaioJohnston/tapicius/releases/latest/download/tapicius-windows-amd64.exe",
        label: "(.exe)",
      },
    ],
    requirements: "Windows 10+ (64-bit)",
    githubUrl: "https://github.com/CaioJohnston/tapicius",
    version: "1.0.0",
    featured: true,
    createdAt: "2026-04-04",
    i18n: {
      en: {
        description:
          "AutoClicker for Windows with multiple click points, intuitive GUI and keyboard shortcuts.",
        longDescription: `A simple and efficient AutoClicker for Windows, built in Go with a graphical interface using the Walk library.

**Features:**
- **Intuitive Interface** — friendly GUI built with Walk
- **Multiple Click Points** — define as many click points as you need
- **Configurable Interval** — adjust the time between clicks in milliseconds
- **Keyboard Shortcut** — use F6 to start/stop quickly
- **Visual Overlay** — overlay interface to help selecting click points
- **Persistent Config** — your settings are saved automatically

**Requirements:**
- Windows 10 or higher

> Ideal for automating repetitive tasks and UI testing.`,
        requirements: "Windows 10+ (64-bit)",
      },
    },
  },
  {
    id: "5",
    slug: "hagr",
    name: "HaGR",
    description:
      "Reconhecimento de gestos manuais em tempo real via câmera ou upload de imagem. Modelo treinado com o dataset HaGRID, interface web direta no navegador.",
    longDescription: `Classifica gestos manuais usando um modelo de Deep Learning treinado sobre o **HaGRID** (Hand Gesture Recognition Image Dataset).

**Modos de uso:**
- **Câmera ao vivo** — classifica gestos em tempo real pela webcam
- **Upload de imagem** — envie uma foto para reconhecimento estático
- **Interface web** — sem instalação, roda direto no navegador

**Stack:**
- Keras para o modelo de classificação
- Flask como servidor web
- HaGRID como base de dados de treinamento

> Projeto experimental. A acurácia varia conforme iluminação e enquadramento da mão.`,
    tags: ["IA", "dados"],
    status: "experimental",
    visibility: "public",
    hostingMode: "external",
    externalUrl: "https://ha-gr.vercel.app",
    iframeEnabled: true,
    githubUrl: "https://github.com/CaioJohnston/HaGR",
    featured: false,
    createdAt: "2026-04-03",
    i18n: {
      en: {
        description:
          "Real-time hand gesture recognition via camera or image upload. Model trained on the HaGRID dataset, web interface runs directly in the browser.",
        longDescription: `Classifies hand gestures using a Deep Learning model trained on the **HaGRID** (Hand Gesture Recognition Image Dataset).

**Usage modes:**
- **Live camera** — classifies gestures in real time via webcam
- **Image upload** — send a photo for static recognition
- **Web interface** — no installation, runs directly in the browser

**Stack:**
- Keras for the classification model
- Flask as the web server
- HaGRID as the training dataset

> Experimental project. Accuracy varies with lighting conditions and hand framing.`,
      },
    },
  },
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
    i18n: {
      en: {
        description:
          "Portable file encryptor with a graphical interface. Protect any file with AES-256-GCM and a password, no installation, no internet, no dependencies.",
        longDescription: `Built to live on a USB drive, external hard drive or any portable folder. Place the executable next to the files you want to protect and the vault is detected automatically.

**Features:**
- **Auto vault** — detects files in the executable's folder or in subfolders \`vault/\`, \`senhas/\`, \`secrets/\`
- **Lock / Unlock All** — processes all vault files at once with a single password
- **AES-256-GCM** — encryption with integrated authentication
- **Argon2id** — key derivation resistant to GPU/ASIC attacks
- **Integrity check** — SHA-256 hash embedded in each encrypted file
- **Password strength meter** — real-time visual feedback
- **Drag & Drop** — drag files directly into the window
- **Session password** — remembers the password during the session for multiple files
- **Portable** — single executable, runs from a USB drive

**Warning:** has not undergone a professional security audit. If you forget the password, the data cannot be recovered — by design.`,
      },
    },
  },
  {
    id: "7",
    slug: "silex",
    name: "Sílex",
    description:
      "Gera nomes criativos para projetos com base no que você está construindo e no que te inspira.",
    longDescription: `Descreva seu projeto e, opcionalmente, compartilhe referências pessoais — filmes, músicas, tecnologias, pessoas, qualquer coisa que te inspire.

O modelo gera **8 nomes únicos**, cada um acompanhado da explicação da sua origem. A ideia é que o nome tenha personalidade e faça sentido para quem o criou — assim como *úteis* e o próprio *Sílex* foram nomeados.

**O que você pode informar:**
- Descrição do projeto (obrigatório)
- Referências (filmes, músicas, livros, tecnologias…)
- Idiomas que você gosta
- Estilo / vibe estética

**Cada nome gerado inclui:**
- A origem da referência (música, conceito, idioma…)
- O tom do nome em poucas palavras

**Powered by Gemini Flash** — API gratuita do Google.`,
    tags: ["devtools", "IA", "produtividade"],
    status: "experimental",
    visibility: "public",
    hostingMode: "embedded",
    href: "/tools/silex/usar",
    githubUrl: "https://github.com/CaioJohnston/uteis",
    featured: false,
    createdAt: "2026-04-04",
    i18n: {
      en: {
        name: "Sílex",
        description:
          "Generates creative project names based on what you're building and what inspires you.",
        longDescription: `Describe your project and, optionally, share personal references — films, music, technologies, people, anything that inspires you.

The model generates **8 unique names**, each with an explanation of its origin. The idea is that the name has personality and makes sense to its creator — just like *úteis* and *Sílex* itself were named.

**What you can provide:**
- Project description (required)
- References (films, music, books, technologies…)
- Languages you like
- Style / aesthetic vibe

**Each generated name includes:**
- The origin of the reference (song, concept, language…)
- The tone of the name in a few words

**Powered by Gemini Flash** — Google's free API.`,
      },
    },
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
    i18n: {
      en: {
        name: "Gastômetro",
        description:
          "Import your Nubank CSV and see your expenses organized by category. Nubank only for now.",
        longDescription: `Upload the CSV exported from Nubank and get a complete breakdown of your expenses by category, with totals and details for each transaction.

**Automatically detected categories:**
- Delivery (iFood, Rappi…)
- Transport (Uber, 99…)
- Restaurants
- Entertainment (Netflix, Spotify…)
- Subscriptions (GitHub, Notion…)
- Shopping (Amazon, Mercado Livre…)
- Health (pharmacies, drugstores…)
- Education
- Bills (electricity, internet…)
- Other

**Privacy:** everything is processed locally, no data leaves your browser.`,
      },
    },
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
