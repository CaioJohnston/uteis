"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ConsolePanel } from "./ConsolePanel";
import { CreateForm } from "./CreateForm";
import { ServerStatus } from "./ServerStatus";

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
  | { tag: "provisioning"; codespace: Codespace }
  | { tag: "console"; codespace: Codespace; serverRunning: boolean };

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
  const [actionLoading, setActionLoading] = useState(false);
  const searchParams = useSearchParams();
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Apply codespace state to page state ──────────────────────────────────

  const applyCodespace = useCallback(async (space: Codespace) => {
    try { localStorage.setItem("minehost_codespace", space.name); } catch {}

    if (PROVISIONING_STATES.has(space.state)) {
      setState({ tag: "provisioning", codespace: space });
      return;
    }

    if (space.state === "Available") {
      const statusRes = await fetch(`/api/minehost/server?name=${space.name}`).catch(() => null);
      const statusData = statusRes?.ok ? await statusRes.json().catch(() => ({})) : {};
      setState({
        tag: "console",
        codespace: space,
        serverRunning: statusData.running ?? false,
      });
      return;
    }

    setState({ tag: "console", codespace: space, serverRunning: false });
  }, []);

  // ── Fetch specific codespace by name (polling after creation) ─────────────

  const refreshCodespace = useCallback(async (name: string) => {
    const res = await fetch(`/api/minehost/codespace?name=${name}`);

    if (res.status === 401) { setState({ tag: "unauthenticated" }); return; }
    if (!res.ok) {
      try { localStorage.removeItem("minehost_codespace"); } catch {}
      setState({ tag: "no-server" });
      return;
    }

    const data = await res.json();
    await applyCodespace(data.codespace);
  }, [applyCodespace]);

  // ── Initial load — scan all codespaces for template repo ─────────────────

  const loadCodespaces = useCallback(async () => {
    const res = await fetch("/api/minehost/codespace");

    if (res.status === 401) { setState({ tag: "unauthenticated" }); return; }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setState({ tag: "error", message: data.error ?? "Erro ao conectar com GitHub." });
      return;
    }

    const data = await res.json();
    const spaces: Codespace[] = data.codespaces ?? [];

    if (spaces.length === 0) {
      try {
        const storedName = localStorage.getItem("minehost_codespace");
        if (storedName) { await refreshCodespace(storedName); return; }
      } catch {}
      setState({ tag: "no-server" });
      return;
    }

    await applyCodespace(spaces[0]);
  }, [applyCodespace, refreshCodespace]);

  // ── Initial load ──────────────────────────────────────────────────────────

  useEffect(() => {
    loadCodespaces();
  }, [loadCodespaces]);

  // ── Polling for provisioning state (by name — avoids filter issues) ───────

  useEffect(() => {
    if (state.tag !== "provisioning") {
      if (pollRef.current) clearTimeout(pollRef.current);
      return;
    }

    const name = state.codespace.name;
    pollRef.current = setTimeout(() => {
      refreshCodespace(name);
    }, 10_000);

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [state, refreshCodespace]);

  // ── Polling for server starting (Available but control server not ready) ──

  useEffect(() => {
    if (state.tag !== "console" || state.serverRunning) return;
    if (state.codespace.state !== "Available") return;

    pollRef.current = setTimeout(async () => {
      const res = await fetch(`/api/minehost/server?name=${state.codespace.name}`).catch(() => null);
      const data = res?.ok ? await res.json().catch(() => ({})) : {};
      if (data.running) {
        setState((prev) =>
          prev.tag === "console" ? { ...prev, serverRunning: true } : prev
        );
      } else {
        // re-trigger effect
        setState((prev) => (prev.tag === "console" ? { ...prev } : prev));
      }
    }, 5_000);

    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [state]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCreate = async (payload: {
    machine: string;
    serverType: string;
    version: string;
    jvmArgs: string;
  }) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/minehost/codespace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ tag: "error", message: data.error ?? "Falha ao criar servidor." });
        return;
      }
      setState({ tag: "provisioning", codespace: data.codespace });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCodespace = async () => {
    if (state.tag !== "console") return;
    setActionLoading(true);
    try {
      await fetch("/api/minehost/codespace", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: state.codespace.name, action: "start" }),
      });
      setState({ tag: "provisioning", codespace: { ...state.codespace, state: "Starting" } });
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
      setTimeout(loadCodespaces, 6000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (state.tag !== "console") return;
    const ok = window.confirm(
      `Deletar o servidor "${state.codespace.name}"? Esta ação é irreversível.`
    );
    if (!ok) return;
    setActionLoading(true);
    try {
      await fetch(`/api/minehost/codespace?name=${state.codespace.name}`, {
        method: "DELETE",
      });
      try { localStorage.removeItem("minehost_codespace"); } catch {}
      setState({ tag: "no-server" });
    } finally {
      setActionLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const authError = searchParams.get("error") === "auth_failed";

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col min-h-[calc(100vh-8rem)]">
      <Link
        href="/tools/minehost"
        className="inline-flex items-center gap-2 text-xs font-mono text-paper/30 hover:text-gold transition-colors duration-200 mb-12"
      >
        ← MineHost
      </Link>

      <span className="gold-rule mb-10 block" />

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
            <h2
              className="text-2xl text-paper"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              Autenticação necessária
            </h2>
            <p className="text-sm text-paper/50">
              MineHost usa sua conta GitHub para criar e gerenciar Codespaces.
            </p>
          </div>

          {authError && (
            <p className="text-xs font-mono text-red-400">
              Falha na autenticação. Tente novamente.
            </p>
          )}

          <a
            href="/api/auth/github/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-mono rounded-sm bg-gold text-ink-DEFAULT hover:bg-gold/90 transition-colors duration-150"
          >
            entrar com GitHub →
          </a>

          <p className="text-xs font-mono text-paper/30">
            Permissão solicitada:{" "}
            <span className="text-paper/50">codespace</span>
          </p>
        </div>
      )}

      {/* No server */}
      {state.tag === "no-server" && (
        <div className="space-y-10">
          <div className="space-y-2">
            <h2
              className="text-2xl text-paper"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              Criar servidor
            </h2>
            <p className="text-sm text-paper/50">
              Nenhum servidor encontrado. Configure e crie um novo.
            </p>
          </div>

          <CreateForm onSubmit={handleCreate} loading={actionLoading} />
        </div>
      )}

      {/* Provisioning */}
      {state.tag === "provisioning" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2
              className="text-2xl text-paper"
              style={{ fontFamily: "Cormorant, serif" }}
            >
              Criando servidor...
            </h2>
            <p className="text-sm text-paper/50">
              O Codespace está sendo inicializado. Isso pode levar alguns minutos.
            </p>
          </div>

          <div className="bg-ink-surface border border-ink-border rounded-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 border border-paper/20 border-t-gold rounded-full animate-spin shrink-0" />
              <span className="text-sm font-mono text-paper/60">
                {state.codespace.state.toLowerCase()}...
              </span>
            </div>
            <p className="text-xs font-mono text-paper/30 border-t border-ink-border pt-4">
              {state.codespace.name}
            </p>
          </div>

          <p className="text-xs font-mono text-paper/30">
            Esta página verifica o status automaticamente a cada 10 segundos.
          </p>
        </div>
      )}

      {/* Console */}
      {state.tag === "console" && (
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-paper/30">{state.codespace.name}</p>
            </div>
            <a
              href="/api/auth/github/login?action=logout"
              className="text-xs font-mono text-paper/20 hover:text-paper/50 transition-colors"
            >
              sair
            </a>
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6 min-h-0">
            {/* Console panel */}
            <div className="min-h-[480px] lg:min-h-0">
              {state.codespace.state === "Available" ? (
                <ConsolePanel codespace={state.codespace.name} />
              ) : (
                <div className="flex items-center justify-center h-full bg-ink-surface border border-ink-border rounded-sm text-paper/30 font-mono text-sm">
                  Console indisponível — codespace {state.codespace.state.toLowerCase()}
                </div>
              )}
            </div>

            {/* Server status + controls */}
            <div>
              <ServerStatus
                codespaceState={state.codespace.state}
                serverRunning={state.serverRunning}
                onStart={handleStartCodespace}
                onStop={handleStopCodespace}
                onDelete={handleDelete}
                loading={actionLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
