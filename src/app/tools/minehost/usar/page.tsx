"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ConsolePanel } from "./ConsolePanel";
import { CreateForm, type CreatePayload } from "./CreateForm";
import { ServerStatus, type ServerInfo } from "./ServerStatus";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Codespace {
  name: string;
  state: string;
  web_url: string;
  created_at: string;
  machine?: { display_name: string };
}

type PageState =
  | { tag: "loading" }
  | { tag: "error"; message: string }
  | { tag: "unauthenticated" }
  | { tag: "no-server" }
  | { tag: "provisioning"; codespace: Codespace; gist_id: string }
  | { tag: "console"; codespace: Codespace; gist_id: string };

interface ConfirmState {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROVISIONING_STATES = new Set([
  "Queued",
  "Provisioning",
  "Created",
  "Awaiting",
  "Starting",
  "Rebuilding",
  "Updating",
]);

const EMPTY_SERVER_INFO: ServerInfo = { running: false, server_ip: null, playit_claim: null, config: null, ram: null };

type StoredSession = { name: string; gist_id: string };

function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem("minehost_session");
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function saveSession(name: string, gist_id: string) {
  try { localStorage.setItem("minehost_session", JSON.stringify({ name, gist_id })); } catch {}
}

function clearSession() {
  try { localStorage.removeItem("minehost_session"); } catch {}
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-ink-surface border border-ink-border rounded-sm p-6 max-w-sm w-full space-y-5 shadow-2xl">
        <div className="space-y-1.5">
          <h3 className="text-base text-paper font-mono">{title}</h3>
          <p className="text-sm text-paper/50 leading-relaxed">{body}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 text-sm font-mono rounded-sm border border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70 transition-colors duration-150"
          >
            cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 text-sm font-mono rounded-sm bg-red-900/30 border border-red-900/60 text-red-400 hover:bg-red-900/50 hover:border-red-400/40 transition-colors duration-150"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MineHostPage() {
  return (
    <Suspense fallback={null}>
      <MineHostContent />
    </Suspense>
  );
}

function MineHostContent() {
  const [state, setState] = useState<PageState>({ tag: "loading" });
  const [serverInfo, setServerInfo] = useState<ServerInfo>(EMPTY_SERVER_INFO);
  // Merge partial updates to avoid wiping existing fields (e.g. server_ip from polling)
  const mergeServerInfo = useCallback((partial: Partial<ServerInfo>) => {
    setServerInfo((prev) => ({ ...prev, ...partial }));
  }, []);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const searchParams = useSearchParams();
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // After clicking start, tolerate up to N polls returning "Shutdown" before giving up
  const startRetriesRef = useRef(0);
  const START_SHUTDOWN_TOLERANCE = 3;


  // ── Apply codespace state to page state ──────────────────────────────────

  const applyCodespace = useCallback(async (space: Codespace, gist_id: string) => {
    saveSession(space.name, gist_id);

    if (PROVISIONING_STATES.has(space.state)) {
      startRetriesRef.current = 0;
      setState({ tag: "provisioning", codespace: space, gist_id });
      return;
    }

    // After a start action, GitHub can briefly return "Shutdown" before queuing
    if (space.state === "Shutdown" && startRetriesRef.current > 0) {
      startRetriesRef.current--;
      setState({ tag: "provisioning", codespace: { ...space, state: "Starting" }, gist_id });
      return;
    }

    startRetriesRef.current = 0;

    if (space.state === "Available" && gist_id) {
      const statusRes = await fetch(`/api/minehost/server?gist_id=${gist_id}`, { cache: "no-store" }).catch(() => null);
      const statusData = statusRes?.ok ? await statusRes.json().catch(() => ({})) : {};
      mergeServerInfo({
        running: statusData.running ?? false,
        server_ip: statusData.server_ip ?? null,
        playit_claim: statusData.playit_claim ?? null,
        config: statusData.config ?? null,
        ram: statusData.ram ?? null,
      });
    }

    setState({ tag: "console", codespace: space, gist_id });
  }, [mergeServerInfo]);

  // ── Find gist for a codespace (fallback when localStorage has no gist_id) ──

  const findGistId = useCallback(async (codespaceName: string): Promise<string> => {
    const res = await fetch("/api/minehost/gist/find?name=" + codespaceName, { cache: "no-store" }).catch(() => null);
    if (!res?.ok) return "";
    const data = await res.json().catch(() => ({}));
    return data.gist_id ?? "";
  }, []);

  // ── Fetch specific codespace by name ──────────────────────────────────────

  const refreshCodespace = useCallback(async (name: string, gist_id: string) => {
    const res = await fetch(`/api/minehost/codespace?name=${name}`, { cache: "no-store" });
    if (res.status === 401) { setState({ tag: "unauthenticated" }); return; }
    if (!res.ok) { clearSession(); setState({ tag: "no-server" }); return; }
    const data = await res.json();
    await applyCodespace(data.codespace, gist_id);
  }, [applyCodespace]);

  // ── Initial load ──────────────────────────────────────────────────────────

  const loadCodespaces = useCallback(async () => {
    const res = await fetch("/api/minehost/codespace", { cache: "no-store" });
    if (res.status === 401) { setState({ tag: "unauthenticated" }); return; }
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setState({ tag: "error", message: (data as { error?: string }).error ?? "Erro ao conectar com GitHub." });
      return;
    }

    const data = await res.json();
    const spaces: Codespace[] = (data as { codespaces?: Codespace[] }).codespaces ?? [];

    if (spaces.length === 0) {
      const session = loadSession();
      if (session?.name) {
        const gist_id = session.gist_id || await findGistId(session.name);
        if (gist_id) { await refreshCodespace(session.name, gist_id); return; }
      }
      setState({ tag: "no-server" });
      return;
    }

    const space = spaces[0];
    const session = loadSession();
    let gist_id = (session?.name === space.name) ? session.gist_id : "";
    if (!gist_id) gist_id = await findGistId(space.name);
    await applyCodespace(space, gist_id);
  }, [applyCodespace, refreshCodespace, findGistId]);

  useEffect(() => {
    loadCodespaces();
  }, [loadCodespaces]);

  // ── Polling for provisioning state ────────────────────────────────────────

  useEffect(() => {
    if (state.tag !== "provisioning") {
      if (pollRef.current) clearTimeout(pollRef.current);
      return;
    }
    const { name } = state.codespace;
    const { gist_id } = state;
    pollRef.current = setTimeout(() => refreshCodespace(name, gist_id), 10_000);
    return () => { if (pollRef.current) clearTimeout(pollRef.current); };
  }, [state, refreshCodespace]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCreate = async (payload: CreatePayload) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/minehost/codespace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string; codespace?: Codespace; gist_id?: string };
      if (!res.ok) { setState({ tag: "error", message: data.error ?? "Falha ao criar servidor." }); return; }
      const gist_id = data.gist_id ?? "";
      setState({ tag: "provisioning", codespace: data.codespace!, gist_id });
      saveSession(data.codespace!.name, gist_id);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCodespace = async () => {
    if (state.tag !== "console") return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/minehost/codespace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.codespace.name, action: "start" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errMsg = (data as { error?: string }).error ?? "";
        // "already running" = GitHub says codespace is running but our state is wrong → refresh
        if (/already running/i.test(errMsg)) {
          await refreshCodespace(state.codespace.name, state.gist_id);
          return;
        }
        setState({ tag: "error", message: errMsg || "Falha ao iniciar codespace." });
        return;
      }
      // Tolerate "Shutdown" polls during slow GitHub queuing (Shutdown → Queued can take >10s)
      startRetriesRef.current = START_SHUTDOWN_TOLERANCE;
      const started = (data as { codespace?: Codespace }).codespace ?? { ...state.codespace, state: "Starting" };
      setState({ tag: "provisioning", codespace: started, gist_id: state.gist_id });
      // Immediate refresh so the console appears right away
      setTimeout(() => refreshCodespace(state.codespace.name, state.gist_id), 2000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopCodespace = async () => {
    if (state.tag !== "console") return;
    setActionLoading(true);
    try {
      await fetch("/api/minehost/codespace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.codespace.name, action: "stop" }),
      });
      setState((prev) =>
        prev.tag === "console"
          ? { ...prev, codespace: { ...prev.codespace, state: "ShuttingDown" } }
          : prev
      );
      // Merge with empty to reset, but preserve nothing (clear all)
      setServerInfo(EMPTY_SERVER_INFO);
      setTimeout(loadCodespaces, 6000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestartMC = () => {
    if (state.tag !== "console") return;
    const gist_id = state.gist_id;
    setConfirmState({
      title: "Reiniciar servidor",
      body: "O servidor Minecraft será reiniciado. Jogadores conectados serão desconectados.",
      confirmLabel: "reiniciar",
      onConfirm: async () => {
        setConfirmState(null);
        setActionLoading(true);
        try {
          await fetch(`/api/minehost/server?gist_id=${gist_id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ command: "__minehost_restart__" }),
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleDelete = () => {
    if (state.tag !== "console") return;
    const name = state.codespace.name;
    setConfirmState({
      title: "Deletar servidor",
      body: `O codespace "${name}" será permanentemente deletado. Esta ação é irreversível.`,
      confirmLabel: "deletar",
      onConfirm: async () => {
        setConfirmState(null);
        setActionLoading(true);
        try {
          const gist_id = state.tag === "console" ? state.gist_id : "";
          const qs = gist_id ? `name=${name}&gist_id=${gist_id}` : `name=${name}`;
          await fetch(`/api/minehost/codespace?${qs}`, { method: "DELETE" });
          clearSession();
          setServerInfo(EMPTY_SERVER_INFO);
          setState({ tag: "no-server" });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const authError = searchParams.get("error") === "auth_failed";
  const isConsole = state.tag === "console";

  return (
    <div className="relative min-h-[calc(100vh-theme(spacing.14)-theme(spacing.32))]">
      {/* Tiled dirt background — absolute dentro do main, não afeta Nav/Footer */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage: "url('/git-craft_dirt_bg.jpg')",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      <div className="absolute inset-0 -z-10 pointer-events-none" style={{ backgroundColor: "rgb(12 11 10 / 0.92)" }} />

      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          body={confirmState.body}
          confirmLabel={confirmState.confirmLabel}
          onConfirm={confirmState.onConfirm}
          onCancel={() => setConfirmState(null)}
        />
      )}

      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col min-h-[calc(100vh-8rem)]">
        <div className="flex justify-center mb-8 shrink-0">
          <Image
            src="/git-craft_logo.png"
            alt="Git-Craft"
            width={320}
            height={100}
            className="opacity-90"
            priority
          />
        </div>

        <Link
          href="/tools/minehost"
          className="inline-flex items-center gap-2 text-xs font-mono text-paper/30 hover:text-gold transition-colors duration-200 mb-12 shrink-0"
        >
          ← MineHost
        </Link>

        <div className="flex items-center justify-between mb-10 shrink-0">
          <span className="gold-rule flex-1 block" />
          {state.tag !== "unauthenticated" && (
            <a
              href="/api/auth/github/login?action=logout"
              className="ml-6 text-xs font-mono text-paper/20 hover:text-paper/50 transition-colors shrink-0"
            >
              sair
            </a>
          )}
        </div>

        {/* Loading */}
        {state.tag === "loading" && (
          <div className="flex items-center gap-3 text-paper/40 font-mono text-sm">
            <span className="w-4 h-4 border border-paper/20 border-t-gold rounded-full animate-spin" />
            verificando autenticação...
          </div>
        )}

        {/* Error */}
        {state.tag === "error" && (
          <div className="space-y-4">
            <p className="text-sm font-mono text-red-400">{state.message}</p>
            <button
              onClick={() => { setState({ tag: "loading" }); loadCodespaces(); }}
              className="text-xs font-mono text-paper/40 hover:text-gold transition-colors"
            >
              tentar novamente →
            </button>
          </div>
        )}

        {/* Unauthenticated */}
        {state.tag === "unauthenticated" && (
          <div className="space-y-6 max-w-sm">
            <div className="space-y-2">
              <h2 className="text-2xl text-paper" style={{ fontFamily: "Cormorant, serif" }}>
                Autenticação necessária
              </h2>
              <p className="text-sm text-paper/50">
                MineHost usa sua conta GitHub para criar e gerenciar Codespaces.
              </p>
            </div>

            {authError && (
              <p className="text-xs font-mono text-red-400">Falha na autenticação. Tente novamente.</p>
            )}

            <a
              href="/api/auth/github/login"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-mono rounded-sm bg-gold text-ink-DEFAULT hover:bg-gold/90 transition-colors duration-150"
            >
              entrar com GitHub →
            </a>

            <p className="text-xs font-mono text-paper/30">
              Permissão solicitada: <span className="text-paper/50">codespace, gist</span>
            </p>
          </div>
        )}

        {/* No server */}
        {state.tag === "no-server" && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h2 className="text-2xl text-paper" style={{ fontFamily: "Cormorant, serif" }}>
                Criar servidor
              </h2>
              <p className="text-sm text-paper/50">Nenhum servidor encontrado. Configure e crie um novo.</p>
            </div>
            <CreateForm onSubmit={handleCreate} loading={actionLoading} />
          </div>
        )}

        {/* Provisioning */}
        {state.tag === "provisioning" && (() => {
          const csState = state.codespace.state;
          const steps = [
            { label: "servidor configurado", states: [] as string[], done: true },
            { label: "criando codespace", states: ["Queued", "Provisioning", "Created"] },
            { label: "inicializando ambiente", states: ["Awaiting", "Starting", "Rebuilding", "Updating"] },
            { label: "pronto para usar", states: ["Available"] },
          ];
          const activeIdx = steps.findIndex(s => s.states.includes(csState));
          const resolvedIdx = activeIdx === -1 ? 1 : activeIdx;

          return (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl text-paper" style={{ fontFamily: "Cormorant, serif" }}>
                  Iniciando servidor...
                </h2>
                <p className="text-sm text-paper/50">Isso pode levar alguns minutos.</p>
              </div>

              <div className="bg-ink-surface border border-ink-border rounded-sm p-6 space-y-4">
                <div className="space-y-2.5">
                  {steps.map((step, i) => {
                    const isDone = i < resolvedIdx || step.done;
                    const isActive = i === resolvedIdx && !step.done;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className={cn(
                          "text-xs font-mono shrink-0 w-3",
                          isDone ? "text-emerald-400" : isActive ? "text-gold" : "text-paper/20"
                        )}>
                          {isDone ? "✓" : isActive ? "●" : "○"}
                        </span>
                        <span className={cn(
                          "text-xs font-mono",
                          isDone ? "text-paper/30" : isActive ? "text-paper/70" : "text-paper/20"
                        )}>
                          {step.label}
                          {isActive && (
                            <span className="text-paper/30 ml-2">({csState.toLowerCase()})</span>
                          )}
                        </span>
                        {isActive && (
                          <span className="w-3 h-3 border border-paper/20 border-t-gold rounded-full animate-spin shrink-0 ml-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs font-mono text-paper/20 border-t border-ink-border pt-4">
                  {state.codespace.name}
                </p>
              </div>

              <p className="text-xs font-mono text-paper/30">
                Verificando automaticamente a cada 10 segundos.
              </p>
            </div>
          );
        })()}

        {/* Console */}
        {state.tag === "console" && (
          <div className="flex flex-col gap-4">
            <p className="text-xs font-mono text-paper/30">{state.codespace.name}</p>

            {/*
              lg:grid-rows-1 makes the single row track use 1fr (definite size),
              which is required for h-full on grid children to resolve correctly.
              lg:h-[calc(100vh-22rem)] gives explicit height independent of flex chain.
              Mobile: auto height, each panel 500px, page scrolls normally.
            */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] lg:grid-rows-1 lg:h-[calc(100vh-22rem)] gap-6">
              {/* Console panel */}
              <div className="h-[500px] lg:h-full">
                {state.codespace.state === "Available" || state.codespace.state === "Shutdown" ? (
                  <ConsolePanel
                    codespace={state.codespace.name}
                    gist_id={state.gist_id}
                    onStatusUpdate={(info) => setServerInfo((prevInfo) => ({ ...prevInfo, ...info }))}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-ink-surface border border-ink-border rounded-sm text-paper/30 font-mono text-sm">
                    Console indisponível — codespace {state.codespace.state.toLowerCase()}
                  </div>
                )}
              </div>

              {/* Dashboard */}
              <div className="h-[500px] lg:h-full">
                <ServerStatus
                  codespaceState={state.codespace.state}
                  serverInfo={serverInfo}
                  webUrl={state.codespace.web_url}
                  onStart={handleStartCodespace}
                  onStop={handleStopCodespace}
                  onDelete={handleDelete}
                  onRestart={handleRestartMC}
                  loading={actionLoading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
