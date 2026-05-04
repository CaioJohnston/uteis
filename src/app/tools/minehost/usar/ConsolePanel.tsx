"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ServerInfo {
  running: boolean;
  server_ip: string | null;
  playit_claim: string | null;
  config: { type?: string; version?: string; jvmArgs?: string } | null;
  ram: { usedMB: number; totalMB: number; percent: number } | null;
}

interface Props {
  codespace: string;
  gist_id: string;
  onStatusUpdate?: (info: ServerInfo) => void;
}

function colorLine(line: string): string {
  if (/ERROR|error:|Exception|FATAL/i.test(line)) return "text-red-400";
  if (/WARN/i.test(line)) return "text-amber-400";
  if (/\[MINEHOST\]/i.test(line)) return "text-gold";
  if (/Done \(|For help, type/i.test(line)) return "text-emerald-400";
  return "text-paper/60";
}

const STAGE_LABELS: Record<string, string> = {
  deps:     "instalando dependências e Java",
  download: "baixando servidor Minecraft",
  install:  "instalando servidor",
  starting: "iniciando servidor",
};

// Time-based thresholds used as fallback when stage is null (old template or pre-first-stage)
const TIME_STEPS = ["deps", "download", "starting"] as const;
const TIME_THRESHOLDS = [0, 60, 150];

function StartupStages({ stage, elapsed }: { stage: string | null; elapsed: number }) {
  const steps: string[] = stage === "install" || stage === "starting"
    ? ["deps", "download", "install", "starting"]
    : ["deps", "download", "starting"];

  let activeIdx: number;
  if (stage !== null) {
    activeIdx = steps.indexOf(stage);
    if (activeIdx === -1) activeIdx = 0;
  } else {
    activeIdx = TIME_STEPS.reduce((acc, _, i) => elapsed >= TIME_THRESHOLDS[i] ? i : acc, 0);
  }

  return (
    <div className="py-4 space-y-3">
      <p className="text-paper/30 font-mono text-xs">inicializando servidor...</p>
      <div className="space-y-2 pl-1">
        {steps.map((key, i) => (
          <div key={key} className="flex items-center gap-2.5">
            <span className={cn(
              "text-xs font-mono shrink-0 w-3",
              i < activeIdx ? "text-emerald-400" : i === activeIdx ? "text-gold" : "text-paper/20"
            )}>
              {i < activeIdx ? "✓" : i === activeIdx ? "●" : "○"}
            </span>
            <span className={cn(
              "text-xs font-mono",
              i < activeIdx ? "text-paper/30 line-through" : i === activeIdx ? "text-paper/70" : "text-paper/20"
            )}>
              {STAGE_LABELS[key]}
              {i === activeIdx && stage === null && elapsed > 0 && (
                <span className="text-paper/30 ml-2">{elapsed}s</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConsolePanel({ codespace, gist_id, onStatusUpdate }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [stage, setStage] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(0);
  const prevTailRef = useRef<string>("");
  const autoScroll = useRef(true);
  const connectedAtRef = useRef<number | null>(null);
  const onStatusUpdateRef = useRef(onStatusUpdate);
  onStatusUpdateRef.current = onStatusUpdate;

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScroll.current = scrollHeight - scrollTop - clientHeight < 40;
  }, []);

  useEffect(() => {
    if (autoScroll.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [lines]);

  // Track elapsed time since first connection (for startup stage hints)
  useEffect(() => {
    if (connected) {
      if (connectedAtRef.current === null) connectedAtRef.current = Date.now();
    } else {
      connectedAtRef.current = null;
      setElapsedSec(0);
    }
  }, [connected]);

  useEffect(() => {
    if (!connected || lines.length > 0) return;
    const id = setInterval(() => {
      if (connectedAtRef.current !== null)
        setElapsedSec(Math.floor((Date.now() - connectedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [connected, lines.length]);

  // ── Polling — gist-based (Codespace ports not accessible headless)

  useEffect(() => {
    if (!gist_id) return;

    // Reset all state when gist_id changes (codespace restart, new server, etc.)
    cursorRef.current = 0;
    prevTailRef.current = "";
    setLines([]);
    setStage(null);
    setConnected(false);
    setElapsedSec(0);
    connectedAtRef.current = null;

    const poll = async () => {
      try {
        const res = await fetch(`/api/minehost/server?gist_id=${gist_id}`, { cache: "no-store" });
        if (!res.ok) { setConnected(false); return; }
        const data = await res.json() as {
          reachable?: boolean;
          running?: boolean;
          stage?: string | null;
          log?: string[];
          cursor?: number;
          server_ip?: string | null;
          playit_claim?: string | null;
          config?: { type?: string; version?: string; jvmArgs?: string } | null;
          ram?: { usedMB: number; totalMB: number; percent: number } | null;
        };
        setConnected(data.reachable ?? false);
        setStage(data.stage ?? null);

        // Propagate server info to parent
        // Always propagate full server info, even when no log changes
        onStatusUpdateRef.current?.({
          running: data.running ?? false,
          server_ip: data.server_ip ?? null,
          playit_claim: data.playit_claim ?? null,
          config: data.config ?? null,
          ram: data.ram ?? null,
        });

        const log = data.log ?? [];
        const serverCursor = data.cursor ?? 0;

        if (log.length > 0) {
          const prevTail = prevTailRef.current;
          let newLines: string[];

          if (!prevTail) {
            newLines = log;
          } else if (serverCursor > cursorRef.current) {
            // New backend: cursor is absolute total — slice precisely
            const windowStart = serverCursor - log.length;
            newLines = log.slice(Math.max(0, cursorRef.current - windowStart));
          } else {
            // Old backend or stalled cursor: detect via tail content
            const prevIdx = log.lastIndexOf(prevTail);
            newLines = prevIdx === -1 ? log : log.slice(prevIdx + 1);
          }

          if (newLines.length > 0) {
            setLines((prev) => [...prev, ...newLines].slice(-500));
            prevTailRef.current = log[log.length - 1];
          }
          cursorRef.current = serverCursor;
        }
      } catch {
        setConnected(false);
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [gist_id]);

  const sendCommand = async () => {
    if (!input.trim() || sending || !gist_id) return;
    const cmd = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch(`/api/minehost/server?gist_id=${gist_id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendCommand();
  };

  return (
    <div className="flex flex-col h-full bg-ink-surface border border-ink-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-border shrink-0">
        <span className="text-xs font-mono text-paper/40 uppercase tracking-widest">Console</span>
        <span className={cn("flex items-center gap-1.5 text-xs font-mono", connected ? "text-emerald-400" : "text-paper/30")}>
          <span className={cn("w-1.5 h-1.5 rounded-full", connected ? "bg-emerald-400" : "bg-paper/20")} />
          {connected ? "conectado" : gist_id ? "aguardando servidor..." : "sem conexão"}
        </span>
      </div>

      {/* Log output */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5 min-h-0"
        style={{ fontFamily: "var(--font-jetbrains)", fontSize: "0.72rem", lineHeight: "1.6" }}
      >
        {lines.length === 0 ? (
          connected
            ? <StartupStages stage={stage} elapsed={elapsedSec} />
            : <p className="text-paper/20 font-mono text-xs">
                {gist_id ? "Aguardando conexão com o servidor..." : "Sem conexão com o servidor."}
              </p>
        ) : (
          lines.map((line, i) => (
            <p key={i} className={cn("whitespace-pre-wrap break-all", colorLine(line))}>
              {line}
            </p>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Command input */}
      <div className="border-t border-ink-border flex items-center gap-2 px-4 py-2 shrink-0">
        <span className="text-paper/30 font-mono text-xs shrink-0">{">"}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="say Olá, mundo!"
          className="flex-1 bg-transparent text-sm font-mono text-paper/80 placeholder:text-paper/20 focus:outline-none"
          disabled={sending || !gist_id}
        />
        <button
          onClick={sendCommand}
          disabled={!input.trim() || sending || !gist_id}
          className="text-xs font-mono text-paper/30 hover:text-gold disabled:opacity-30 transition-colors duration-150 shrink-0"
        >
          enviar
        </button>
      </div>
    </div>
  );
}
