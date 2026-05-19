"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type CodespaceState =
  | "Available"
  | "Shutdown"
  | "ShuttingDown"
  | "Provisioning"
  | "Queued"
  | "Created"
  | "Awaiting"
  | "Starting"
  | "Failed"
  | string;

export interface ServerInfo {
  running: boolean;
  server_ip: string | null;
  playit_claim: string | null;
  config: { type?: string; version?: string; jvmArgs?: string } | null;
  ram: { usedMB: number; totalMB: number; percent: number } | null;
  // Epoch ms of the last log line emitted by the MC server, surfaced from
  // /status and the Gist state. Used to detect "running but hung" servers.
  last_heartbeat_at?: number | null;
  // Startup stage from the back-end (deps/download/install/starting/null).
  // Lets us tell "iniciando..." from "parado" — both have running=false but
  // only the former has a non-null stage.
  stage?: string | null;
}

// If the server claims running=true but has emitted nothing in this many ms,
// we surface an "instável" badge instead of the green "online" — gives a
// visual cue while the back-end's auto-restart watchdog (10 min threshold)
// makes up its mind.
const HEARTBEAT_UNSTABLE_MS = 60_000;

interface Props {
  codespaceState: CodespaceState;
  serverInfo: ServerInfo;
  webUrl?: string;
  onStop: () => void;
  onStart: () => void;
  onDelete: () => void;
  // MC server controls — independent of the Codespace lifecycle (issue #1)
  onStartMC: () => void;
  onStopMC: () => void;
  onRestart: () => void;
  loading: boolean;
}

function fmtMB(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={copy}
      className="text-xs font-mono text-paper/30 hover:text-gold transition-colors duration-150 shrink-0"
    >
      {copied ? "✓" : "copiar"}
    </button>
  );
}

export function ServerStatus({
  codespaceState,
  serverInfo,
  webUrl,
  onStop,
  onStart,
  onDelete,
  onStartMC,
  onStopMC,
  onRestart,
  loading,
}: Props) {
  const { running, server_ip, playit_claim, config, ram, last_heartbeat_at, stage } = serverInfo;
  const isAvailable = codespaceState === "Available";
  const isStopped = codespaceState === "Shutdown";
  const isShuttingDown = codespaceState === "ShuttingDown";
  const isTransitioning = !isAvailable && !isStopped && !isShuttingDown && codespaceState !== "Failed";
  // "iniciando..." só quando a back-end reportou um estágio explícito de
  // startup. Sem isso, o servidor não está em transição — está parado.
  const mcStarting = isAvailable && !running && !!stage;
  const mcStopped  = isAvailable && !running && !stage;

  // Derive a "stale" flag from last_heartbeat_at relative to now. We re-render
  // every 5 s while the heartbeat is fresh so the badge flips automatically
  // when the server goes silent.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isAvailable || !running) return;
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, [isAvailable, running]);
  const heartbeatStale =
    isAvailable && running &&
    typeof last_heartbeat_at === "number" &&
    last_heartbeat_at > 0 &&
    now - last_heartbeat_at > HEARTBEAT_UNSTABLE_MS;

  return (
    <div className="h-full flex flex-col gap-3">

      {/* Cards (Status / IP / Config / RAM) ficam visíveis no topo, sem
          scroll. shrink-0 garante que não encolhem; o spacer abaixo absorve
          o espaço extra empurrando os botões para o fim. */}
      <div className="space-y-3 shrink-0">

      {/* ── Status ── */}
      <div className="bg-ink-surface border border-ink-border rounded-sm p-4 space-y-2.5">
        <p className="text-xs font-mono text-paper/30 uppercase tracking-widest">Status</p>
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isAvailable && running && !heartbeatStale
              ? "bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]"
              : isAvailable && running && heartbeatStale
              ? "bg-amber-400 animate-pulse"
              : mcStarting
              ? "bg-amber-400 animate-pulse"
              : mcStopped
              ? "bg-paper/20"
              : isStopped
              ? "bg-paper/20"
              : isShuttingDown || isTransitioning
              ? "bg-blue-400 animate-pulse"
              : "bg-red-400"
          )} />
          <span className="text-sm text-paper/70 font-mono">
            {isAvailable && running && !heartbeatStale
              ? "online"
              : isAvailable && running && heartbeatStale
              ? "instável"
              : mcStarting
              ? "iniciando..."
              : mcStopped
              ? "parado"
              : isStopped
              ? "codespace parado"
              : isShuttingDown
              ? "desligando..."
              : isTransitioning
              ? codespaceState.toLowerCase()
              : "erro"}
          </span>
        </div>
        {heartbeatStale && (
          <p className="text-xs font-mono text-amber-400/60 leading-relaxed">
            sem novas linhas no log há {Math.round((now - (last_heartbeat_at ?? 0)) / 1000)}s — auto-restart aguardando
          </p>
        )}
      </div>

      {/* ── IP para conectar — só faz sentido enquanto o Codespace está vivo ── */}
      {isAvailable && (
      <div className="bg-ink-surface border border-ink-border rounded-sm p-4 space-y-2.5">
        <p className="text-xs font-mono text-paper/30 uppercase tracking-widest">IP do servidor</p>
        {server_ip ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <code className="text-xs font-mono text-gold flex-1 break-all">{server_ip}</code>
              <CopyButton text={server_ip} />
            </div>
            <p className="text-xs font-mono text-paper/20">porta 25565 (padrão)</p>
          </div>
        ) : playit_claim ? (
          <div className="space-y-2">
            <p className="text-xs font-mono text-amber-400/80">autenticação playit.gg pendente</p>
            <a
              href={playit_claim}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-gold hover:text-gold/80 transition-colors duration-150"
            >
              ativar túnel →
            </a>
            <p className="text-xs font-mono text-paper/20 leading-relaxed">
              Clique para autenticar. O endereço aparecerá aqui após a ativação.
            </p>
          </div>
        ) : (
          <p className="text-xs font-mono text-paper/30">
            {isAvailable ? "aguardando túnel..." : "indisponível"}
          </p>
        )}
      </div>
      )}

      {/* ── Config do servidor ── */}
      {config && (
        <div className="bg-ink-surface border border-ink-border rounded-sm p-4 space-y-2.5">
          <p className="text-xs font-mono text-paper/30 uppercase tracking-widest">Servidor</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-paper/40">tipo</span>
              <span className="text-xs font-mono text-paper/70 capitalize">{config.type ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-paper/40">versão</span>
              <span className="text-xs font-mono text-paper/70">{config.version ?? "—"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── RAM — número vem do Codespace; só faz sentido se ele tá vivo ── */}
      {isAvailable && ram && (
        <div className="bg-ink-surface border border-ink-border rounded-sm p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono text-paper/30 uppercase tracking-widest">RAM</p>
            <span className="text-xs font-mono text-paper/40">{ram.percent}%</span>
          </div>
          <div className="space-y-1.5">
            <div className="h-1 bg-ink-border rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  ram.percent > 85 ? "bg-red-400" : ram.percent > 65 ? "bg-amber-400" : "bg-emerald-400"
                )}
                style={{ width: `${ram.percent}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-paper/40">{fmtMB(ram.usedMB)} usados</span>
              <span className="text-xs font-mono text-paper/25">{fmtMB(ram.totalMB)} total</span>
            </div>
          </div>
        </div>
      )}

      </div>{/* /cards */}

      {/* Spacer para empurrar os botões para o fim do painel. */}
      <div className="flex-1" />

      {/* Botões — sempre visíveis, fixos no fim. */}
      <div className="space-y-4 shrink-0">
        {/* MC server controls — only meaningful when the Codespace is alive */}
        {isAvailable && (
          <div className="space-y-2">
            <p className="text-xs font-mono text-paper/30 uppercase tracking-widest">Servidor MC</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onStartMC}
                disabled={loading || running}
                className="px-2 py-2 text-xs font-mono rounded-sm bg-ink-surface border border-ink-border text-paper/50 hover:border-gold/40 hover:text-gold disabled:opacity-30 disabled:hover:border-ink-border disabled:hover:text-paper/50 transition-colors duration-150"
              >
                iniciar
              </button>
              <button
                onClick={onStopMC}
                disabled={loading || !running}
                className="px-2 py-2 text-xs font-mono rounded-sm bg-ink-surface border border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70 disabled:opacity-30 disabled:hover:border-ink-border disabled:hover:text-paper/50 transition-colors duration-150"
              >
                parar
              </button>
              <button
                onClick={onRestart}
                disabled={loading || !running}
                className="px-2 py-2 text-xs font-mono rounded-sm bg-ink-surface border border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70 disabled:opacity-30 disabled:hover:border-ink-border disabled:hover:text-paper/50 transition-colors duration-150"
              >
                reiniciar
              </button>
            </div>
          </div>
        )}

        {/* Codespace controls */}
        <div className="space-y-2">
          <p className="text-xs font-mono text-paper/30 uppercase tracking-widest">Codespace</p>
          {isStopped && (
            <button
              onClick={onStart}
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm font-mono rounded-sm bg-gold text-ink-DEFAULT hover:bg-gold/90 disabled:opacity-40 transition-colors duration-150"
            >
              {loading ? "iniciando..." : "iniciar codespace →"}
            </button>
          )}

          {isAvailable && (
            <button
              onClick={onStop}
              disabled={loading}
              className="w-full px-4 py-2.5 text-sm font-mono rounded-sm bg-ink-surface border border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70 disabled:opacity-40 transition-colors duration-150"
            >
              {loading ? "parando..." : "parar codespace"}
            </button>
          )}

          {webUrl && isAvailable && (
            <a
              href={`${webUrl.replace(/\/$/, "")}?folder=/workspaces/minecraft-server-template/server`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-4 py-2.5 text-sm font-mono rounded-sm bg-ink-surface border border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70 transition-colors duration-150 text-center block"
            >
              abrir arquivos no VS Code →
            </a>
          )}

          <button
            onClick={onDelete}
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-sm bg-ink-surface border border-red-900/40 text-red-400/60 hover:border-red-400/40 hover:text-red-400 disabled:opacity-40 transition-colors duration-150"
          >
            deletar servidor
          </button>
        </div>
      </div>
    </div>
  );
}
