"use client";

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

interface Props {
  codespaceState: CodespaceState;
  serverRunning: boolean;
  onStop: () => void;
  onStart: () => void;
  onDelete: () => void;
  loading: boolean;
}

export function ServerStatus({
  codespaceState,
  serverRunning,
  onStop,
  onStart,
  onDelete,
  loading,
}: Props) {
  const isAvailable = codespaceState === "Available";
  const isStopped = codespaceState === "Shutdown" || codespaceState === "ShuttingDown";
  const isTransitioning =
    !isAvailable &&
    !isStopped &&
    codespaceState !== "Failed";

  return (
    <div className="space-y-6">
      {/* Status indicator */}
      <div className="bg-ink-surface border border-ink-border rounded-sm p-4 space-y-3">
        <p className="text-xs font-mono text-paper/40 uppercase tracking-widest">
          Status
        </p>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full shrink-0",
              isAvailable && serverRunning
                ? "bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]"
                : isAvailable && !serverRunning
                ? "bg-amber-400"
                : isStopped
                ? "bg-paper/20"
                : isTransitioning
                ? "bg-blue-400 animate-pulse"
                : "bg-red-400"
            )}
          />
          <span className="text-sm text-paper/70 font-mono">
            {isAvailable && serverRunning
              ? "online"
              : isAvailable && !serverRunning
              ? "iniciando servidor..."
              : isStopped
              ? "codespace parado"
              : isTransitioning
              ? codespaceState.toLowerCase()
              : "erro"}
          </span>
        </div>

        {isAvailable && (
          <p className="text-xs font-mono text-paper/30">
            Minecraft:{" "}
            <span className={serverRunning ? "text-emerald-400" : "text-amber-400"}>
              {serverRunning ? "running" : "starting"}
            </span>
          </p>
        )}
      </div>

      {/* Actions */}
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
