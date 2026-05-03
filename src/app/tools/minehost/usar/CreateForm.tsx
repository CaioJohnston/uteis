"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface CreatePayload {
  machine: string;
  serverType: string;
  version: string;
  jvmArgs: string;
  cfUrl?: string;
}

interface Props {
  onSubmit: (payload: CreatePayload) => void;
  loading: boolean;
}

const SERVER_TYPES = [
  { value: "vanilla",    label: "Vanilla",    desc: "Oficial Mojang" },
  { value: "paper",      label: "Paper",      desc: "Performance otimizada" },
  { value: "fabric",     label: "Fabric",     desc: "Mods leves" },
  { value: "forge",      label: "Forge",      desc: "Mods clássicos" },
  { value: "curseforge", label: "CurseForge", desc: "Modpack do CurseForge" },
];

const MACHINES = [
  { value: "basicLinux32gb",    label: "2 núcleos / 8 GB",  desc: "Ideal para até 5 jogadores" },
  { value: "standardLinux32gb", label: "4 núcleos / 16 GB", desc: "Ideal para até 15 jogadores" },
];

const JVM_DEFAULTS: Record<string, string> = {
  basicLinux32gb:    "-Xmx4g -Xms2g",
  standardLinux32gb: "-Xmx12g -Xms4g",
};

export function CreateForm({ onSubmit, loading }: Props) {
  const [machine, setMachine]         = useState("basicLinux32gb");
  const [serverType, setServerType]   = useState("paper");
  const [version, setVersion]         = useState("latest");
  const [jvmArgs, setJvmArgs]         = useState(JVM_DEFAULTS.basicLinux32gb);
  const [cfUrl, setCfUrl]             = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isCurseForge = serverType === "curseforge";

  const handleMachineChange = (value: string) => {
    setMachine(value);
    setJvmArgs(JVM_DEFAULTS[value] ?? JVM_DEFAULTS.basicLinux32gb);
  };

  const handleSubmit = () => {
    onSubmit({ machine, serverType, version, jvmArgs, cfUrl: isCurseForge ? cfUrl : undefined });
  };

  const canSubmit = !loading && (!isCurseForge || cfUrl.trim().startsWith("http"));

  return (
    <div className="space-y-8 max-w-xl">
      {/* Machine type */}
      <div className="space-y-3">
        <p className="text-xs font-mono text-paper/40 uppercase tracking-widest">Máquina</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MACHINES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => handleMachineChange(m.value)}
              className={cn(
                "text-left px-4 py-3 rounded-sm border transition-colors duration-150",
                machine === m.value
                  ? "border-gold/50 bg-ink-surface text-paper"
                  : "border-ink-border bg-ink-surface text-paper/50 hover:border-paper/20 hover:text-paper/70"
              )}
            >
              <p className="text-sm font-mono">{m.label}</p>
              <p className="text-xs text-paper/40 mt-0.5">{m.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Server type */}
      <div className="space-y-3">
        <p className="text-xs font-mono text-paper/40 uppercase tracking-widest">Tipo de servidor</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SERVER_TYPES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setServerType(s.value)}
              className={cn(
                "text-left px-4 py-3 rounded-sm border transition-colors duration-150",
                serverType === s.value
                  ? "border-gold/50 bg-ink-surface text-paper"
                  : "border-ink-border bg-ink-surface text-paper/50 hover:border-paper/20 hover:text-paper/70"
              )}
            >
              <p className="text-sm font-mono">{s.label}</p>
              <p className="text-xs text-paper/40 mt-0.5">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* CurseForge URL */}
      {isCurseForge ? (
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-paper/40 uppercase tracking-widest">
            URL do Server Pack
          </label>
          <input
            type="url"
            value={cfUrl}
            onChange={(e) => setCfUrl(e.target.value)}
            placeholder="https://media.forgecdn.net/files/…/serverpack.zip"
            className="w-full bg-ink-surface border border-ink-border rounded-sm px-4 py-2.5 text-sm text-paper/80 placeholder:text-paper/20 focus:outline-none focus:border-gold/50 transition-colors duration-150 font-mono"
          />
          <p className="text-xs text-paper/30 font-mono">
            Baixe o &quot;Server Pack&quot; no CurseForge e cole a URL direta do .zip
          </p>
        </div>
      ) : (
        /* Version — hidden for curseforge */
        <div className="space-y-1.5">
          <label className="block text-xs font-mono text-paper/40 uppercase tracking-widest">Versão</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="ex: 1.21.4 ou latest"
            className="w-full bg-ink-surface border border-ink-border rounded-sm px-4 py-2.5 text-sm text-paper/80 placeholder:text-paper/20 focus:outline-none focus:border-gold/50 transition-colors duration-150 font-mono"
          />
        </div>
      )}

      {/* Advanced */}
      <div className="border border-ink-border rounded-sm overflow-hidden bg-ink-surface">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-mono text-paper/40 hover:text-paper/60 hover:bg-ink-surface/50 transition-colors duration-150"
        >
          <span>Configurações avançadas</span>
          <span className="text-paper/20">{showAdvanced ? "−" : "+"}</span>
        </button>

        {showAdvanced && (
          <div className="px-4 pb-4 pt-2 border-t border-ink-border space-y-1.5">
            <label className="block text-xs font-mono text-paper/40 uppercase tracking-widest">JVM Args</label>
            <input
              type="text"
              value={jvmArgs}
              onChange={(e) => setJvmArgs(e.target.value)}
              className="w-full bg-ink-surface border border-ink-border rounded-sm px-4 py-2.5 text-sm text-paper/80 focus:outline-none focus:border-gold/50 transition-colors duration-150 font-mono"
            />
            <p className="text-xs text-paper/30 font-mono">
              Auto-ajustado pela máquina. 8 GB: {JVM_DEFAULTS.basicLinux32gb} · 16 GB: {JVM_DEFAULTS.standardLinux32gb}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          "px-6 py-2.5 text-sm font-mono rounded-sm border transition-colors duration-150",
          !canSubmit
            ? "bg-gold/20 text-ink-DEFAULT/40 border-gold/20 cursor-not-allowed"
            : "bg-gold text-ink-DEFAULT border-gold hover:bg-gold/90"
        )}
      >
        {loading ? "criando servidor..." : "criar servidor →"}
      </button>
    </div>
  );
}
