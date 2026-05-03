"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ServerInfo {
  running: boolean;
  server_ip: string | null;
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

export function ConsolePanel({ codespace, gist_id, onStatusUpdate }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef(0);
  const autoScroll = useRef(true);
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

  // ── Polling — gist-based (Codespace ports not accessible headless)

  useEffect(() => {
    if (!gist_id) return;

    cursorRef.current = 0;
    setLines([]);
    setConnected(false);

    const poll = async () => {
      try {
        const res = await fetch(`/api/minehost/server?gist_id=${gist_id}`);
        if (!res.ok) { setConnected(false); return; }
        const data = await res.json() as {
          reachable?: boolean;
          running?: boolean;
          log?: string[];
          cursor?: number;
          server_ip?: string | null;
          config?: { type?: string; version?: string; jvmArgs?: string } | null;
          ram?: { usedMB: number; totalMB: number; percent: number } | null;
        };
        setConnected(data.reachable ?? false);

        // Propagate server info to parent
        onStatusUpdateRef.current?.({
          running: data.running ?? false,
          server_ip: data.server_ip ?? null,
          config: data.config ?? null,
          ram: data.ram ?? null,
        });

        const log = data.log ?? [];
        if (log.length > cursorRef.current) {
          const newLines = log.slice(cursorRef.current);
          setLines((prev) => [...prev.slice(-2000), ...newLines]);
          cursorRef.current = log.length;
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
          <p className="text-paper/20 font-mono text-xs">
            {gist_id ? "Aguardando logs do servidor..." : "Sem conexão com o servidor."}
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
