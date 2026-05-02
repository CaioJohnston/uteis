"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Props {
  codespace: string;
}

function colorLine(line: string): string {
  if (/ERROR|error:|Exception|FATAL/i.test(line)) return "text-red-400";
  if (/WARN/i.test(line)) return "text-amber-400";
  if (/\[MINEHOST\]/i.test(line)) return "text-gold";
  if (/Done \(|For help, type/i.test(line)) return "text-emerald-400";
  return "text-paper/60";
}

export function ConsolePanel({ codespace }: Props) {
  const [lines, setLines] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const autoScroll = useRef(true);

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

  useEffect(() => {
    const es = new EventSource(`/api/minehost/sse?name=${codespace}`);

    es.onopen = () => setConnected(true);

    es.onmessage = (e) => {
      try {
        const text: string = JSON.parse(e.data);
        const newLines = text.split("\n").filter((l) => l.trim().length > 0);
        setLines((prev) => [...prev.slice(-2000), ...newLines]);
      } catch {}
    };

    es.onerror = () => {
      setConnected(false);
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [codespace]);

  const sendCommand = async () => {
    if (!input.trim() || sending) return;
    const cmd = input.trim();
    setInput("");
    setSending(true);
    try {
      await fetch(`/api/minehost/server?name=${codespace}`, {
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-ink-border">
        <span className="text-xs font-mono text-paper/40 uppercase tracking-widest">
          Console
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-mono",
            connected ? "text-emerald-400" : "text-paper/30"
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              connected ? "bg-emerald-400" : "bg-paper/20"
            )}
          />
          {connected ? "conectado" : "reconectando..."}
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
            Aguardando logs do servidor...
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
      <div className="border-t border-ink-border flex items-center gap-2 px-4 py-2">
        <span className="text-paper/30 font-mono text-xs shrink-0">{">"}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="say Olá, mundo!"
          className="flex-1 bg-transparent text-sm font-mono text-paper/80 placeholder:text-paper/20 focus:outline-none"
          disabled={sending}
        />
        <button
          onClick={sendCommand}
          disabled={!input.trim() || sending}
          className="text-xs font-mono text-paper/30 hover:text-gold disabled:opacity-30 transition-colors duration-150 shrink-0"
        >
          enviar
        </button>
      </div>
    </div>
  );
}
