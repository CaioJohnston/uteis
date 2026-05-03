"use client";

import { useState } from "react";
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
  config: { type?: string; version?: string; jvmArgs?: string } | null;
  ram: { usedMB: number; totalMB: number; percent: number } | null;
}

interface Props {
  codespaceState: CodespaceState;
  serverInfo: ServerInfo;
  onStop: () => void;
  onStart: () => void;
  onDelete: () => void;
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
  onStop,
  onStart,
  onDelete,
  onRestart,
  loading,
}: Props) {
  const { running, server_ip, config, ram } = serverInfo;
  const isAvailable = codespaceState === "Available";
  const isStopped = codespaceState === "Shutdown" || codespaceState === "ShuttingDown";
  const isTransitioning = !isAvailable && !isStopped && codespaceState !== "Failed";

  return (
    <div className="space-y-3 h-full flex flex-col">

      {/* ── Status ── */}
      <div className="bg-ink-surface border border-ink-border rounded-sm p-4 space-y-2.5">
        <p className="text-xs font-mono text-paper/30 uppercase tracking-widest">Status</p>
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isAvailable && running
              ? "bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]"
              : isAvailable && !running
              ? "bg-amber-400 animate-pulse"
              : isStopped
              ? "bg-paper/20"
              : isTransitioning
              ? "bg-blue-400 animate-pulse"
              : "bg-red-400"
          )} />
          <span className="text-sm text-paper/70 font-mono">
            {isAvailable && running
              ? "online"
              : isAvailable && !running
              ? "iniciando..."
              : isStopped
              ? "parado"
              : isTransitioning
              ? codespaceState.toLowerCase()
              : "erro"}
          </span>
        </div>
      </div>

      {/* ── IP para conectar ── */}
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
        ) : (
          <p className="text-xs font-mono text-paper/30">
            {isAvailable ? "aguardando túnel..." : "indisponível"}
          </p>
        )}
      </div>

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
          {config.jvmArgs && (
            <p className="text-xs font-mono text-paper/20 break-all border-t border-ink-border pt-2">
              {config.jvmArgs}
            </p>
          )}
        </div>
      )}

      {/* ── RAM ── */}
      {ram && (
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

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Ações ── */}
      <div className="space-y-2">
        {isStopped && (
          <button
            onClick={onStart}
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-sm bg-gold text-ink-DEFAULT hover:bg-gold/90 disabled:opacity-40 transition-colors duration-150"
          >
            {loading ? "iniciando..." : "iniciar codespace →"}
          </button>
        )}

        {isAvailable && running && (
          <button
            onClick={onRestart}
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-sm border border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70 disabled:opacity-40 transition-colors duration-150"
          >
            {loading ? "reiniciando..." : "reiniciar servidor"}
          </button>
        )}

        {isAvailable && (
          <button
            onClick={onStop}
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-mono rounded-sm border border-ink-border text-paper/50 hover:border-paper/30 hover:text-paper/70 disabled:opacity-40 transition-colors duration-150"
          >
            {loading ? "parando..." : "parar codespace"}
          </button>
        )}

        <button
          onClick={onDelete}
          disabled={loading}
          className="w-full px-4 py-2.5 text-sm font-mono rounded-sm border border-red-900/40 text-red-400/60 hover:border-red-400/40 hover:text-red-400 disabled:opacity-40 transition-colors duration-150"
        >
          deletar servidor
        </button>
      </div>
    </div>
  );
}
