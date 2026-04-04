"use client";

import { useEffect, useRef, useState } from "react";

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;
const DRAG_SENSITIVITY = 350; // px para percorrer o range completo

function VolumeKnob({
  volume,
  muted,
  onChange,
  onToggleMute,
}: {
  volume: number;
  muted: boolean;
  onChange: (v: number) => void;
  onToggleMute: () => void;
}) {
  const dragRef = useRef<{ startY: number; startVol: number } | null>(null);
  const didDragRef = useRef(false);
  const displayVol = muted ? 0 : volume;
  const angle = MIN_ANGLE + displayVol * (MAX_ANGLE - MIN_ANGLE);
  const angleRad = (angle * Math.PI) / 180;

  // Indicador: linha do centro para a borda
  const indicatorX = Math.sin(angleRad) * 18;
  const indicatorY = -Math.cos(angleRad) * 18;

  const ticks = Array.from({ length: 11 }, (_, i) => {
    const a = MIN_ANGLE + (i / 10) * (MAX_ANGLE - MIN_ANGLE);
    const r = (a * Math.PI) / 180;
    const inner = 28;
    const outer = i % 5 === 0 ? 34 : 31;
    return {
      x1: Math.sin(r) * inner,
      y1: -Math.cos(r) * inner,
      x2: Math.sin(r) * outer,
      y2: -Math.cos(r) * outer,
      label: i === 10 ? "10" : String(i),
      labelX: Math.sin(r) * 42,
      labelY: -Math.cos(r) * 42,
      major: i % 5 === 0,
    };
  });

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    didDragRef.current = false;
    dragRef.current = { startY: e.clientY, startVol: displayVol };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.clientY;
    if (Math.abs(dy) > 3) didDragRef.current = true;
    const delta = dy / DRAG_SENSITIVITY;
    const next = Math.min(1, Math.max(0, dragRef.current.startVol + delta));
    onChange(next);
  };

  const onMouseUp = () => {
    if (!didDragRef.current) onToggleMute();
    dragRef.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    dragRef.current = { startY: e.touches[0].clientY, startVol: displayVol };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current) return;
    const dy = dragRef.current.startY - e.touches[0].clientY;
    const delta = dy / DRAG_SENSITIVITY;
    const next = Math.min(1, Math.max(0, dragRef.current.startVol + delta));
    onChange(next);
  };

  return (
    <div className="flex flex-col items-center select-none">
      <svg
        width="96"
        height="96"
        viewBox="-50 -50 100 100"
        className="cursor-default"
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {/* Ticks e labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={t.x1} y1={t.y1}
              x2={t.x2} y2={t.y2}
              stroke={t.major ? "rgba(201,147,58,0.5)" : "rgba(201,147,58,0.2)"}
              strokeWidth={t.major ? 1.2 : 0.8}
            />
            {t.major && (
              <text
                x={t.labelX}
                y={t.labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6"
                fill="rgba(201,147,58,0.4)"
                fontFamily="JetBrains Mono, monospace"
              >
                {t.label}
              </text>
            )}
          </g>
        ))}

        {/* Anel externo do knob */}
        <circle cx="0" cy="0" r="23" fill="none" stroke="rgba(201,147,58,0.25)" strokeWidth="1" />

        {/* Corpo do knob */}
        <circle
          cx="0" cy="0" r="22"
          fill="#141312"
          stroke="rgba(201,147,58,0.15)"
          strokeWidth="0.5"
        />

        {/* Textura sutil: anel interno */}
        <circle cx="0" cy="0" r="18" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />

        {/* Indicador dourado */}
        <line
          x1="0" y1="0"
          x2={indicatorX} y2={indicatorY}
          stroke="#c9933a"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={indicatorX} cy={indicatorY} r="2" fill="#c9933a" />

        {/* Ponto central */}
        <circle cx="0" cy="0" r="2" fill="rgba(201,147,58,0.3)" />
      </svg>

      <span className="text-xs font-mono text-ink/25 dark:text-paper/25 -mt-1">volume</span>
    </div>
  );
}

export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.25);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.play().catch(() => {});

    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (muted) {
      const restored = volume === 0 ? 0.5 : volume;
      audio.volume = restored;
      setVolume(restored);
      setMuted(false);
    } else {
      audio.volume = 0;
      setMuted(true);
    }
  };

  return (
    <div className="flex items-center gap-6">
      <audio ref={audioRef} src={src} preload="auto" />

      <div>
        <VolumeKnob
          volume={volume}
          muted={muted}
          onChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
      </div>

      {/* Barra de progresso */}
      <div className="flex-1 space-y-1.5">
        <div className="w-full h-px bg-paper-border dark:bg-ink-border relative">
          <div
            className="absolute top-0 left-0 h-full bg-gold/50 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="text-xs font-mono text-ink/20 dark:text-paper/20">
          {muted ? "muted" : "playing"}
        </p>
      </div>
    </div>
  );
}
