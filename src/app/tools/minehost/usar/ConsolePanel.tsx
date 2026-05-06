"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ServerInfo {
  running: boolean;
  server_ip: string | null;
  playit_claim: string | null;
  config: { type?: string; version?: string; jvmArgs?: string } | null;
  ram: { usedMB: number; totalMB: number; percent: number } | null;
  last_heartbeat_at?: number | null;
}

type LogDelta = { from: number; to: number; lines: string[] };

interface Props {
  codespace: string;
  gist_id: string;
  controlUrl?: string;
  onStatusUpdate?: (info: ServerInfo) => void;
  // Forwards the cmd_secret (read from /status) up to the page so MC lifecycle
  // buttons in ServerStatus can hit the proxy directly. Falls back to Gist
  // pending_cmd when the secret hasn't been seen yet.
  onCmdSecret?: (secret: string | null) => void;
}

function colorLine(line: string): string {
  if (/ERROR|error:|Exception|FATAL/i.test(line)) return "text-red-400";
  if (/WARN/i.test(line)) return "text-amber-400";
  if (/\[MINEHOST\]/i.test(line)) return "text-gold";
  if (/Done \(|For help, type/i.test(line)) return "text-emerald-400";
  return "text-paper/60";
}

const STAGE_LABELS: Record<string, string> = {
  deps:     "instalando dependências",
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

export function ConsolePanel({ codespace, gist_id, controlUrl, onStatusUpdate, onCmdSecret }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sseActive, setSseActive] = useState(false);
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
  const onCmdSecretRef = useRef(onCmdSecret);
  onCmdSecretRef.current = onCmdSecret;
  // Mutable refs for use inside async callbacks — avoids stale closures
  const sseActiveRef = useRef(false);
  const cmdSecretRef = useRef<string | null>(null);
  // Tracks the active MC session_id so we can detect server restarts and clear
  // the local view instead of mixing pre/post-restart logs (issue #2).
  const currentSessionIdRef = useRef<string | null>(null);
  // Exponential-backoff attempt counter for SSE reconnects.
  const sseAttemptRef = useRef(0);
  // Sticky once either transport has succeeded — distinguishes "never connected
  // yet" (badge: aguardando…) from "was connected, now broken" (badge: offline).
  const everConnectedRef = useRef(false);
  // Timestamp of the last "limpar" click. Gist polls older than this are
  // discarded — protects against the 0-5 s window where the Gist still holds
  // the pre-clear snapshot and would otherwise refill the panel.
  const clearedAtRef = useRef(0);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScroll.current = scrollHeight - scrollTop - clientHeight < 40;
  }, []);

  // Reconciles the active session_id. When the server mints a new one (fresh
  // start, restart, or external truncation of server.log), we discard the
  // local view so old session lines can't leak into the new session — and so
  // the snapshot from the Gist replays fresh instead of "reverting" mid-stream.
  const handleSessionId = useCallback((id: string | null | undefined) => {
    if (!id) return;
    if (currentSessionIdRef.current && currentSessionIdRef.current !== id) {
      setLines([]);
      cursorRef.current = 0;
      prevTailRef.current = "";
    }
    currentSessionIdRef.current = id;
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

  // ── SSE — direct connection to control-server.js (primary path).
  // Reconnects with capped exponential backoff + jitter (3s → 60s ceiling).
  // Counter resets to 0 on every successful SSE open, so a stable server
  // recovers full responsiveness after a single dropout.
  useEffect(() => {
    if (!controlUrl) return;

    let cancelled = false;
    let es: EventSource | null = null;
    let statusIntervalId: ReturnType<typeof setInterval> | null = null;
    let retryTimeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleRetry = () => {
      if (cancelled) return;
      const attempt = sseAttemptRef.current;
      const exp = Math.min(3000 * 2 ** attempt, 60_000);
      const jitter = exp * (Math.random() * 0.4 - 0.2); // ±20%
      const delay = Math.max(500, Math.round(exp + jitter));
      sseAttemptRef.current = attempt + 1;
      retryTimeoutId = setTimeout(connectSSE, delay);
    };

    const pollDirectStatus = async () => {
      if (cancelled) return;
      try {
        const r = await fetch(`${controlUrl}/status`, { cache: "no-store" });
        if (!r.ok || cancelled) return;
        const d = await r.json() as {
          running?: boolean;
          server_ip?: string | null;
          playit_claim?: string | null;
          config?: { type?: string; version?: string; jvmArgs?: string } | null;
          ram?: { usedMB: number; totalMB: number; percent: number } | null;
          stage?: string | null;
          session_id?: string | null;
          last_heartbeat_at?: number;
        };
        handleSessionId(d.session_id);
        setStage(d.stage ?? null);
        onStatusUpdateRef.current?.({
          running: d.running ?? false,
          server_ip: d.server_ip ?? null,
          playit_claim: d.playit_claim ?? null,
          config: d.config ?? null,
          ram: d.ram ?? null,
          last_heartbeat_at: d.last_heartbeat_at ?? null,
        });
      } catch {}
    };

    const connectSSE = async () => {
      const controller = new AbortController();
      const probeTimeout = setTimeout(() => controller.abort(), 5000);

      try {
        const res = await fetch(`${controlUrl}/status`, {
          signal: controller.signal,
          cache: "no-store",
        });
        clearTimeout(probeTimeout);
        if (!res.ok || cancelled) {
          if (!cancelled) scheduleRetry();
          return;
        }

        const statusData = await res.json() as {
          running?: boolean;
          server_ip?: string | null;
          playit_claim?: string | null;
          config?: { type?: string; version?: string; jvmArgs?: string } | null;
          ram?: { usedMB: number; totalMB: number; percent: number } | null;
          cmd_secret?: string | null;
          stage?: string | null;
          session_id?: string | null;
          last_heartbeat_at?: number;
        };
        if (cancelled) return;

        cmdSecretRef.current = statusData.cmd_secret ?? null;
        onCmdSecretRef.current?.(statusData.cmd_secret ?? null);
        handleSessionId(statusData.session_id);
        setStage(statusData.stage ?? null);
        onStatusUpdateRef.current?.({
          running: statusData.running ?? false,
          server_ip: statusData.server_ip ?? null,
          playit_claim: statusData.playit_claim ?? null,
          config: statusData.config ?? null,
          ram: statusData.ram ?? null,
          last_heartbeat_at: statusData.last_heartbeat_at ?? null,
        });

        es = new EventSource(`${controlUrl}/sse`);
        let historyReceived = false;

        es.onopen = () => {
          if (cancelled) { es?.close(); return; }
          sseActiveRef.current = true;
          sseAttemptRef.current = 0; // success — reset backoff
          everConnectedRef.current = true;
          setSseActive(true);
          setConnected(true);
          if (connectedAtRef.current === null) connectedAtRef.current = Date.now();
        };

        es.onmessage = (event) => {
          if (cancelled) return;
          try {
            const text = JSON.parse(event.data as string) as string;
            const newLines = text.split("\n").filter((l) => l.length > 0);
            if (newLines.length === 0) return;
            if (!historyReceived) {
              historyReceived = true;
              setLines(newLines.slice(-500));
            } else {
              setLines((prev) => [...prev, ...newLines].slice(-500));
            }
          } catch {}
        };

        es.onerror = () => {
          if (cancelled) return;
          sseActiveRef.current = false;
          setSseActive(false);
          setConnected(false);
          es?.close();
          es = null;
          if (statusIntervalId) { clearInterval(statusIntervalId); statusIntervalId = null; }
          scheduleRetry();
        };

        pollDirectStatus();
        statusIntervalId = setInterval(pollDirectStatus, 5000);

      } catch {
        clearTimeout(probeTimeout);
        if (!cancelled) scheduleRetry();
      }
    };

    connectSSE();

    return () => {
      cancelled = true;
      es?.close();
      if (statusIntervalId) clearInterval(statusIntervalId);
      if (retryTimeoutId) clearTimeout(retryTimeoutId);
      sseActiveRef.current = false;
      setSseActive(false);
    };
  }, [controlUrl, handleSessionId]);

  // ── Polling — gist-based (fallback when SSE unavailable).
  // Prefers `log_delta` (new back-end, cursor-precise) over the snapshot
  // `log` (older back-end, content-matched). Either way the session_id check
  // runs first so a server restart doesn't get merged into the previous view.
  useEffect(() => {
    if (!gist_id) return;

    // Reset all state when gist_id changes (codespace swap, new server, etc.)
    cursorRef.current = 0;
    prevTailRef.current = "";
    currentSessionIdRef.current = null;
    setLines([]);
    setStage(null);
    setConnected(false);
    setElapsedSec(0);
    connectedAtRef.current = null;

    const poll = async () => {
      if (sseActiveRef.current) return; // SSE is primary — skip Gist when connected
      try {
        const res = await fetch(`/api/minehost/server?gist_id=${gist_id}`, { cache: "no-store" });
        if (!res.ok) { setConnected(false); return; }
        const data = await res.json() as {
          reachable?: boolean;
          running?: boolean;
          stage?: string | null;
          log?: string[];
          cursor?: number;
          log_delta?: LogDelta | null;
          session_id?: string | null;
          last_heartbeat_at?: number | null;
          updated?: number;
          server_ip?: string | null;
          playit_claim?: string | null;
          config?: { type?: string; version?: string; jvmArgs?: string } | null;
          ram?: { usedMB: number; totalMB: number; percent: number } | null;
        };
        const reachable = data.reachable ?? false;
        setConnected(reachable);
        if (reachable) everConnectedRef.current = true;
        setStage(data.stage ?? null);

        // Bug guard: between the click on "limpar" and the server's next
        // syncGist tick (up to 5 s), the Gist still holds the pre-clear
        // snapshot — accepting it here would refill the panel.
        if (clearedAtRef.current > 0 && (data.updated ?? 0) < clearedAtRef.current) {
          return;
        }

        // Session boundary first: if the server has minted a new id, drop our
        // local view before we try to merge anything from the snapshot.
        handleSessionId(data.session_id);

        onStatusUpdateRef.current?.({
          running: data.running ?? false,
          server_ip: data.server_ip ?? null,
          playit_claim: data.playit_claim ?? null,
          config: data.config ?? null,
          ram: data.ram ?? null,
          last_heartbeat_at: data.last_heartbeat_at ?? null,
        });

        const log = data.log ?? [];
        const logDelta = data.log_delta ?? null;
        const serverCursor = data.cursor ?? 0;

        // Path A — cursor-precise delta. Avoids the visual "revert to gist"
        // because we never replace lines we already showed; we only append
        // exactly the lines past our cursor.
        if (
          logDelta &&
          logDelta.lines.length > 0 &&
          logDelta.from <= cursorRef.current &&
          logDelta.to > cursorRef.current
        ) {
          const skipFront = cursorRef.current - logDelta.from;
          const newLines = logDelta.lines.slice(skipFront);
          if (newLines.length > 0) {
            setLines((prev) => [...prev, ...newLines].slice(-500));
            prevTailRef.current = newLines[newLines.length - 1];
          }
          cursorRef.current = logDelta.to;
        } else if (log.length > 0) {
          // Path B — snapshot fallback. Used on the very first poll, after
          // session reset, and against older back-ends that don't emit a delta.
          const prevTail = prevTailRef.current;
          let newLines: string[];

          if (!prevTail) {
            newLines = log;
          } else if (serverCursor > cursorRef.current) {
            const windowStart = serverCursor - log.length;
            newLines = log.slice(Math.max(0, cursorRef.current - windowStart));
          } else {
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
  }, [gist_id, handleSessionId]);

  const handleClear = async () => {
    if (clearing) return;
    setClearing(true);
    // Optimistic local clear so the panel feels instant; the truncate of
    // server.log on disk happens via direct call (or Gist fallback).
    setLines([]);
    cursorRef.current = 0;
    prevTailRef.current = "";
    clearedAtRef.current = Date.now();
    try {
      const canDirect = sseActiveRef.current && !!controlUrl;
      if (canDirect) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (cmdSecretRef.current) headers["X-Minehost-Secret"] = cmdSecretRef.current;
        const r = await fetch(`${controlUrl}/logs/clear`, { method: "POST", headers });
        if (r.ok) return;
      }
      if (gist_id) {
        await fetch(`/api/minehost/server?gist_id=${gist_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: "__minehost_clear_logs__" }),
        });
      }
    } finally {
      setClearing(false);
    }
  };

  const sendCommand = async () => {
    const canSendDirect = sseActiveRef.current && !!controlUrl;
    const canSend = canSendDirect || !!gist_id;
    if (!input.trim() || sending || !canSend) return;
    const cmd = input.trim();
    setInput("");
    setSending(true);
    try {
      if (canSendDirect) {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (cmdSecretRef.current) headers["X-Minehost-Secret"] = cmdSecretRef.current;
        await fetch(`${controlUrl}/cmd`, {
          method: "POST",
          headers,
          body: JSON.stringify({ command: cmd }),
        });
      } else {
        await fetch(`/api/minehost/server?gist_id=${gist_id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: cmd }),
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendCommand();
  };

  const canInput = sseActive ? !!controlUrl : !!gist_id;

  // Tri-state connection badge (issue #2).
  //   live      — SSE channel up, sub-second log streaming.
  //   syncing   — SSE down, Gist polling working with ~5 s lag.
  //   offline   — both transports failing AND we'd previously seen one work.
  //   idle      — first load, neither has reported success yet.
  const connectionState: "live" | "syncing" | "offline" | "idle" =
    sseActive ? "live"
    : connected ? "syncing"
    : everConnectedRef.current ? "offline"
    : "idle";

  const badgeTextClass =
    connectionState === "live" ? "text-emerald-400"
    : connectionState === "syncing" ? "text-amber-400"
    : connectionState === "offline" ? "text-red-400"
    : "text-paper/30";

  const badgeDotClass =
    connectionState === "live" ? "bg-emerald-400"
    : connectionState === "syncing" ? "bg-amber-400 animate-pulse"
    : connectionState === "offline" ? "bg-red-400"
    : "bg-paper/20";

  const badgeLabel =
    connectionState === "live" ? "ao vivo"
    : connectionState === "syncing" ? "sincronizando…"
    : connectionState === "offline" ? "offline"
    : (gist_id || controlUrl) ? "aguardando servidor…" : "sem conexão";

  return (
    <div className="flex flex-col h-full bg-ink-surface border border-ink-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-border shrink-0">
        <span className="text-xs font-mono text-paper/40 uppercase tracking-widest">Console</span>
        <div className="flex items-center gap-3">
          {(connected || gist_id) && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="text-xs font-mono text-paper/30 hover:text-gold disabled:opacity-30 transition-colors duration-150"
              title="limpa o console e trunca server.log"
            >
              {clearing ? "limpando..." : "limpar"}
            </button>
          )}
          <span className={cn("flex items-center gap-1.5 text-xs font-mono", badgeTextClass)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", badgeDotClass)} />
            {badgeLabel}
          </span>
        </div>
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
                {(gist_id || controlUrl) ? "Aguardando conexão com o servidor..." : "Sem conexão com o servidor."}
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
          disabled={sending || !canInput}
        />
        <button
          onClick={sendCommand}
          disabled={!input.trim() || sending || !canInput}
          className="text-xs font-mono text-paper/30 hover:text-gold disabled:opacity-30 transition-colors duration-150 shrink-0"
        >
          enviar
        </button>
      </div>
    </div>
  );
}
