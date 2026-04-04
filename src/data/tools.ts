import type { Tool } from "@/types";

// -------------------------------------------------------------------
// REGISTRY CENTRAL
// Para adicionar uma nova ferramenta, basta inserir um objeto aqui.
// -------------------------------------------------------------------

export const tools: Tool[] = [
  {
    id: "6",
    slug: "viinee",
    name: "Viinee",
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
        url: "https://github.com/CaioJohnston/viinee/releases/latest/download/viinee-windows-amd64.exe",
        label: "(.exe)",
      },
    ],
    requirements: "Windows 10+ (64-bit)",
    githubUrl: "https://github.com/CaioJohnston/viinee",
    version: "1.0.0",
    featured: true,
    createdAt: "2026-04-04",
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
