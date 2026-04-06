"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  content: string;
}

interface ChatSettings {
  apiKey: string;
  model: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  systemPrompt: string;
  provider: "openai" | "anthropic" | "custom";
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY_SETTINGS = "uteis-openu-settings";
const STORAGE_KEY_MESSAGES = "uteis-openu-messages";

const DEFAULT_SETTINGS: ChatSettings = {
  apiKey: "",
  model: "gpt-4o-mini",
  baseUrl: "https://api.openai.com/v1",
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  systemPrompt: "Você é um assistente útil e amigável. Responda de forma clara e concisa.",
  provider: "openai",
};

const PROVIDER_PRESETS = {
  openai: {
    baseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  anthropic: {
    baseUrl: "https://api.anthropic.com/v1",
    models: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"],
  },
  custom: {
    baseUrl: "",
    models: [],
  },
};

const FUNNY_LOADING_MESSAGES = [
  "Consultando o Oráculos...",
  "Perguntando ao ChatGPT...",
  "Batendo cabeça...",
  "Googling...",
  "Imitando o Borges...",
  "Digitando com uma mão só...",
  "Contando neurônios...",
  "Consultando a Wikipédia...",
  "Traduzindo do binário para o humano...",
  "Meditando...",
  "Lendo Machado de Assis...",
  "42...",
  "Ligando pro passado (VG Style)"
];

// =============================================================================
// HELPERS
// =============================================================================

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// =============================================================================
// DOCUMENT PARSING
// =============================================================================

async function parseDocument(file: File): Promise<string> {
  const type = file.type;
  const name = file.name.toLowerCase();

  // Plain text files
  if (type === "text/plain" || name.endsWith(".txt")) {
    return await file.text();
  }

  // PDF - basic text extraction
  if (type === "application/pdf" || name.endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    return extractTextFromPDF(arrayBuffer);
  }

  // DOCX - basic text extraction
  if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || name.endsWith(".docx")) {
    const arrayBuffer = await file.arrayBuffer();
    return extractTextFromDOCX(arrayBuffer);
  }

  throw new Error(`Formato não suportado: ${file.name}. Use PDF, TXT, ou DOCX.`);
}

function extractTextFromPDF(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    let text = "";
    
    // Simple PDF text extraction by looking for text streams
    const decoder = new TextDecoder("utf-8");
    const str = decoder.decode(bytes);
    
    // Look for text between BT (Begin Text) and ET (End Text) markers
    const btRegex = /BT\s*[\s\S]*?ET/g;
    const matches = str.match(btRegex);
    
    if (matches) {
      for (const match of matches) {
        // Extract text from TJ and Tj operators
        const tjRegex = /\[([^\]]+)\]\s*TJ|\(([^)]+)\)\s*Tj/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(match)) !== null) {
          const content = tjMatch[1] || tjMatch[2] || "";
          // Handle hex strings and regular strings
          if (content.includes("\\")) {
            // Handle escape sequences
            text += content
              .replace(/\\\(/g, "(")
              .replace(/\\\)/g, ")")
              .replace(/\\\\/g, "\\")
              .replace(/\\n/g, "\n")
              .replace(/\\r/g, "\r")
              .replace(/\\t/g, "\t")
              .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
          } else {
            text += content;
          }
        }
        text += " ";
      }
    }
    
    // Fallback: extract readable text from the whole PDF
    if (!text.trim()) {
      const readableRegex = /\(([^)]{3,500})\)/g;
      let match;
      const extracted: string[] = [];
      while ((match = readableRegex.exec(str)) !== null) {
        const content = match[1];
        if (/[a-zA-Z]{3,}/.test(content) && !content.startsWith("http")) {
          extracted.push(content);
        }
      }
      text = extracted.join(" ");
    }
    
    return text.trim() || "[PDF: Não foi possível extrair texto. O arquivo pode estar protegido ou conter apenas imagens.]";
  } catch (err) {
    throw new Error("Erro ao processar PDF: " + (err instanceof Error ? err.message : "Erro desconhecido"));
  }
}

function extractTextFromDOCX(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("utf-8");
    const str = decoder.decode(bytes);
    
    // DOCX is a ZIP file, so we look for document.xml content
    // Simple extraction: look for text between <w:t> tags
    const textRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
    const texts: string[] = [];
    let match;
    
    while ((match = textRegex.exec(str)) !== null) {
      if (match[1].trim()) {
        texts.push(match[1]);
      }
    }
    
    return texts.join(" ") || "[DOCX: Não foi possível extrair texto do documento.]";
  } catch (err) {
    throw new Error("Erro ao processar DOCX: " + (err instanceof Error ? err.message : "Erro desconhecido"));
  }
}

// =============================================================================
// API CALLS
// =============================================================================

async function* streamChatCompletion(
  settings: ChatSettings,
  messages: Message[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const { apiKey, baseUrl, model, temperature, maxTokens, topP, systemPrompt, provider } = settings;

  if (!apiKey) {
    throw new Error("API Key não configurada. Por favor, adicione sua chave nas configurações.");
  }

  // Prepare messages
  const apiMessages: Array<{ role: string; content: string }> = [];
  
  // Add system prompt if present
  if (systemPrompt.trim()) {
    apiMessages.push({ role: "system", content: systemPrompt });
  }

  // Add conversation messages
  for (const msg of messages) {
    if (msg.role === "system") continue; // Skip system messages in conversation
    
    let content = msg.content;
    
    // Include attachment content if present
    if (msg.attachments && msg.attachments.length > 0) {
      const attachmentContent = msg.attachments
        .map((att) => `--- ${att.name} ---\n${att.content.substring(0, 8000)}${att.content.length > 8000 ? "\n[... conteúdo truncado ...]" : ""}`)
        .join("\n\n");
      content = `[Documentos anexos]:\n${attachmentContent}\n\n[Mensagem do usuário]:\n${content}`;
    }
    
    apiMessages.push({ role: msg.role, content });
  }

  // Determine endpoint and headers based on provider
  let endpoint: string;
  let headers: Record<string, string>;
  let body: Record<string, unknown>;

  if (provider === "anthropic") {
    endpoint = `${baseUrl}/messages`;
    headers = {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    };
    body = {
      model,
      max_tokens: maxTokens,
      temperature,
      top_p: topP,
      messages: apiMessages.filter(m => m.role !== "system").map(m => ({
        role: m.role,
        content: m.content,
      })),
      system: apiMessages.find(m => m.role === "system")?.content,
      stream: true,
    };
  } else {
    // OpenAI-compatible endpoint
    endpoint = `${baseUrl}/chat/completions`;
    headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    };
    body = {
      model,
      messages: apiMessages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: true,
    };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Erro desconhecido");
    let errorMessage = `Erro ${response.status}: ${errorText}`;
    
    if (response.status === 401) {
      errorMessage = "API Key inválida. Verifique suas configurações.";
    } else if (response.status === 429) {
      errorMessage = "Limite de requisições atingido. Tente novamente em alguns instantes.";
    } else if (response.status === 404) {
      errorMessage = `Modelo '${model}' não encontrado. Verifique se o modelo está disponível no seu endpoint.`;
    }
    
    throw new Error(errorMessage);
  }

  if (!response.body) {
    throw new Error("Resposta vazia do servidor.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;
        if (!trimmed.startsWith("data: ")) continue;

        try {
          const data = JSON.parse(trimmed.slice(6));
          
          if (provider === "anthropic") {
            // Anthropic streaming format
            if (data.type === "content_block_delta" && data.delta?.text) {
              yield data.delta.text;
            }
          } else {
            // OpenAI streaming format
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          }
        } catch {
          // Ignore parse errors for malformed chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ChatbotPage() {
  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------
  
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_SETTINGS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---------------------------------------------------------------------------
  // PERSISTENCE
  // ---------------------------------------------------------------------------

  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
      
      const savedMessages = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    }
    setIsSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (isSettingsLoaded) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    }
  }, [settings, isSettingsLoaded]);

  useEffect(() => {
    if (isSettingsLoaded && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    }
  }, [messages, isSettingsLoaded]);

  // ---------------------------------------------------------------------------
  // SCROLL
  // ---------------------------------------------------------------------------

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ---------------------------------------------------------------------------
  // LOADING MESSAGES EFFECT
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isStreaming) {
      setLoadingMessage("");
      return;
    }

    // Pick a random message once per streaming session
    setLoadingMessage(FUNNY_LOADING_MESSAGES[Math.floor(Math.random() * FUNNY_LOADING_MESSAGES.length)]);
  }, [isStreaming]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: inputText.trim(),
      timestamp: Date.now(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setAttachments([]);
    setIsStreaming(true);
    setError(null);

    const assistantMessage: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    abortControllerRef.current = new AbortController();

    // Retry logic for rate limit errors
    let attempt = 0;
    const maxAttempts = 2;
    let lastError: Error | null = null;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const stream = streamChatCompletion(
          settings,
          [...messages, userMessage],
          abortControllerRef.current.signal
        );

        let fullContent = "";
        for await (const chunk of stream) {
          fullContent += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: fullContent } : m
            )
          );
        }
        // Success - exit retry loop
        break;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled - keep partial content and exit
          break;
        }

        lastError = err instanceof Error ? err : new Error("Erro desconhecido");
        
        // Check if it's a rate limit error and we haven't exceeded max attempts
        const isRateLimit = lastError.message.includes("Limite de requisições atingido") || 
                           lastError.message.includes("429");
        
        if (isRateLimit && attempt < maxAttempts) {
          // Wait a bit before retry (500ms)
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }
        
        // Not a rate limit error or max attempts reached - show error
        setError(lastError.message);
        setMessages((prev) =>
          prev.filter((m) => m.id !== assistantMessage.id)
        );
        break;
      }
    }
    
    // Reset streaming state after all attempts (success or failure)
    setIsStreaming(false);
    abortControllerRef.current = null;
  }, [inputText, attachments, messages, settings, isStreaming]);

  const handleStopStreaming = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const handleClearChat = useCallback(() => {
    setShowClearConfirm(true);
  }, []);

  const confirmClearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY_MESSAGES);
    setShowClearConfirm(false);
  }, []);

  const cancelClearChat = useCallback(() => {
    setShowClearConfirm(false);
  }, []);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    const newAttachments: Attachment[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`Arquivo ${file.name} é muito grande. Limite: 10MB.`);
        continue;
      }

      try {
        const content = await parseDocument(file);
        newAttachments.push({
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          content,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : `Erro ao processar ${file.name}`);
      }
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleProviderChange = useCallback((provider: ChatSettings["provider"]) => {
    const preset = PROVIDER_PRESETS[provider];
    setSettings((prev) => ({
      ...prev,
      provider,
      baseUrl: preset.baseUrl,
      model: preset.models[0] || prev.model,
    }));
  }, []);

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/tools/open-u"
          className="inline-flex items-center gap-2 text-xs font-mono text-ink/30 dark:text-paper/30 hover:text-gold transition-colors duration-200"
        >
          ← Open ú.
        </Link>
      </div>

      <span className="gold-rule mb-8 block" />

      {/* Main content */}
      <div className="space-y-6">
        {/* Settings Panel */}
        <div className="border border-ink-border dark:border-ink-border">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-ink-muted/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-paper/80">Configurações</span>
              <span className={cn(
                "text-xs font-mono px-2 py-0.5 rounded",
                settings.apiKey
                  ? "text-emerald-400 bg-emerald-400/10"
                  : "text-amber-400 bg-amber-400/10"
              )}>
                {settings.apiKey ? "API Key configurada" : "API Key pendente"}
              </span>
            </div>
            <span className={cn("text-paper/40 transition-transform", showSettings && "rotate-180")}>
              ▼
            </span>
          </button>

          {showSettings && (
            <div className="border-t border-ink-border p-5 space-y-5">
              {/* Provider selection */}
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                  Provedor
                </label>
                <div className="flex gap-2">
                  {(["openai", "anthropic", "custom"] as const).map((provider) => (
                    <button
                      key={provider}
                      onClick={() => handleProviderChange(provider)}
                      className={cn(
                        "px-3 py-1.5 text-sm transition-colors",
                        settings.provider === provider
                          ? "bg-gold text-ink"
                          : "border border-ink-border text-paper/60 hover:border-paper/30"
                      )}
                    >
                      {provider === "openai" && "OpenAI"}
                      {provider === "anthropic" && "Anthropic"}
                      {provider === "custom" && "Custom"}
                    </button>
                  ))}
                </div>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder="sk-... ou sua chave personalizada"
                  className="w-full bg-ink-surface dark:bg-ink-surface border border-ink-border px-3 py-2 text-sm text-paper/80 placeholder:text-paper/20 focus:border-gold/50 focus:outline-none transition-colors"
                />
                <p className="mt-1 text-xs font-mono text-paper/25">
                  Armazenada apenas no localStorage do seu navegador.
                </p>
              </div>

              {/* Base URL */}
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={settings.baseUrl}
                  onChange={(e) => setSettings((s) => ({ ...s, baseUrl: e.target.value }))}
                  placeholder="https://api.openai.com/v1"
                  className="w-full bg-ink-surface dark:bg-ink-surface border border-ink-border px-3 py-2 text-sm text-paper/80 placeholder:text-paper/20 focus:border-gold/50 focus:outline-none transition-colors"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                  Modelo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={settings.model}
                    onChange={(e) => setSettings((s) => ({ ...s, model: e.target.value }))}
                    placeholder="gpt-4o-mini"
                    className="flex-1 bg-ink-surface dark:bg-ink-surface border border-ink-border px-3 py-2 text-sm text-paper/80 placeholder:text-paper/20 focus:border-gold/50 focus:outline-none transition-colors"
                    list="model-suggestions"
                  />
                  <datalist id="model-suggestions">
                    {PROVIDER_PRESETS[settings.provider].models.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) => setSettings((s) => ({ ...s, temperature: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-ink-surface dark:bg-ink-surface border border-ink-border px-3 py-2 text-sm text-paper/80 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8192"
                    step="1"
                    value={settings.maxTokens}
                    onChange={(e) => setSettings((s) => ({ ...s, maxTokens: parseInt(e.target.value) || 2048 }))}
                    className="w-full bg-ink-surface dark:bg-ink-surface border border-ink-border px-3 py-2 text-sm text-paper/80 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                    Top-p
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.topP}
                    onChange={(e) => setSettings((s) => ({ ...s, topP: parseFloat(e.target.value) || 1 }))}
                    className="w-full bg-ink-surface dark:bg-ink-surface border border-ink-border px-3 py-2 text-sm text-paper/80 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-xs font-mono text-paper/40 uppercase tracking-wider mb-2">
                  System Prompt
                </label>
                <textarea
                  value={settings.systemPrompt}
                  onChange={(e) => setSettings((s) => ({ ...s, systemPrompt: e.target.value }))}
                  placeholder="Instruções para o assistente..."
                  rows={3}
                  className="w-full bg-ink-surface dark:bg-ink-surface border border-ink-border px-3 py-2 text-sm text-paper/80 placeholder:text-paper/20 focus:border-gold/50 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Reset button */}
              <button
                onClick={() => {
                  if (confirm("Restaurar configurações padrão?")) {
                    setSettings(DEFAULT_SETTINGS);
                  }
                }}
                className="text-xs font-mono text-paper/40 hover:text-red-400 transition-colors"
              >
                Restaurar padrões ↺
              </button>
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="border border-ink-border min-h-[400px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-5 space-y-4 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-paper/40">
                  Configure sua API nas configurações acima e comece a conversar.
                </p>
                <p className="text-xs font-mono text-paper/25 mt-2">
                  Você também pode anexar documentos PDF, TXT ou DOCX.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.role === "user" ? "flex-row" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-mono",
                      message.role === "user"
                        ? "bg-gold text-ink"
                        : "bg-ink-muted text-paper"
                    )}
                  >
                    {message.role === "user" ? "V" : "IA"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-paper/60">
                        {message.role === "user" ? "Você" : "Assistente"}
                      </span>
                      <span className="text-xs font-mono text-paper/25">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                    
                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {message.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="inline-flex items-center gap-2 px-2 py-1 bg-ink-muted/20 border border-ink-border text-xs"
                          >
                            <span className="text-paper/60">{att.name}</span>
                            <span className="text-paper/30 font-mono">
                              {formatFileSize(att.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Message content */}
                    <div className="text-sm text-paper/80 whitespace-pre-wrap leading-relaxed">
                      {message.content || (isStreaming && message.role === "assistant" ? (
                        <span className="italic animate-pulse bg-gold/20 text-gold-light px-1 selection:bg-gold selection:text-ink">
                          {loadingMessage}
                        </span>
                      ) : null)}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error display */}
          {error && (
            <div className="px-5 py-3 border-t border-red-900/30 bg-red-950/10">
              <p className="text-xs font-mono text-red-400 flex items-center gap-2">
                <span>✗</span>
                {error}
              </p>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-ink-border p-5 space-y-3">
            {/* Attachment preview */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/30 text-xs"
                  >
                    <span className="text-paper/80">{att.name}</span>
                    <span className="text-paper/40 font-mono">
                      {formatFileSize(att.size)}
                    </span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-paper/40 hover:text-red-400 ml-1"
                      title="Remover"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  rows={2}
                  disabled={isStreaming}
                  className="w-full bg-ink-surface dark:bg-ink-surface border border-ink-border px-4 py-3 text-sm text-paper/80 placeholder:text-paper/20 focus:border-gold/50 focus:outline-none transition-colors resize-none pr-12"
                />
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isStreaming || isUploading}
                  className="px-4 py-2 border border-ink-border text-paper/60 hover:border-paper/30 hover:text-paper/80 transition-colors text-sm disabled:opacity-50"
                  title="Anexar documento"
                >
                  {isUploading ? "..." : "📎"}
                </button>
                {isStreaming ? (
                  <button
                    onClick={handleStopStreaming}
                    className="px-4 py-2 bg-red-900/30 border border-red-900/50 text-red-400 hover:bg-red-900/50 transition-colors text-sm"
                    title="Parar"
                  >
                    ■
                  </button>
                ) : (
                  <button
                    onClick={handleSendMessage}
                    disabled={(!inputText.trim() && attachments.length === 0) || !settings.apiKey}
                    className="px-4 py-2 bg-gold text-ink hover:bg-gold-light transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar
                  </button>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />

            <div className="flex items-center justify-between">
              <p className="text-xs font-mono text-paper/25">
                Shift + Enter para nova linha
              </p>
              {messages.length > 0 && !showClearConfirm && (
                <button
                  onClick={handleClearChat}
                  className="text-xs font-mono text-paper/30 hover:text-red-400 transition-colors"
                >
                  Limpar conversa ↺
                </button>
              )}
              {showClearConfirm && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-paper/50">
                    Limpar tudo?
                  </span>
                  <button
                    onClick={confirmClearChat}
                    className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors"
                  >
                    Sim
                  </button>
                  <button
                    onClick={cancelClearChat}
                    className="text-xs font-mono text-paper/40 hover:text-paper/60 transition-colors"
                  >
                    Não
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
