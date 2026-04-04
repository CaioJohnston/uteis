"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  externalUrl: string;
}

export function IframeView({ slug, externalUrl }: Props) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pillExpanded, setPillExpanded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.animate(
      [
        { clipPath: "circle(18px at 34px 34px)" },
        { clipPath: "circle(150vmax at 34px 34px)" },
      ],
      { duration: 800, easing: "ease-in", fill: "forwards" }
    );
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleBack = async () => {
    const el = containerRef.current;
    if (el) {
      await el.animate(
        [
          { clipPath: "circle(150vmax at 34px 34px)" },
          { clipPath: "circle(18px at 34px 34px)" },
        ],
        { duration: 600, easing: "ease-in", fill: "forwards" }
      ).finished;
    }
    router.push(`/tools/${slug}`);
  };

  return (
    <div
      ref={containerRef}
      style={{ clipPath: "circle(18px at 34px 34px)" }}
      className="fixed inset-0 z-[60]"
    >
      <iframe
        src={externalUrl}
        className="w-full h-full border-0"
        allow="camera; microphone"
        allowFullScreen
      />

      {/* Pill — círculo por padrão (metade escondida), expande horizontalmente no hover */}
      <div
        className="absolute top-4 left-0 h-9 overflow-hidden rounded-full
                   bg-ink/85 backdrop-blur-sm border border-gold/20
                   flex items-stretch z-10"
        style={{
          transform: pillExpanded ? "translateX(0px)" : "translateX(-18px)",
          maxWidth: pillExpanded ? "110px" : "36px",
          transition: "transform 300ms ease-out, max-width 300ms ease-out",
        }}
        onMouseEnter={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setPillExpanded(true);
        }}
      >
        {/* Logo */}
        <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center font-display text-base text-paper select-none">
          ú<span className="text-gold">.</span>
        </span>

        <span className="w-px bg-gold/15 flex-shrink-0" />

        {/* Voltar */}
        <button
          onClick={handleBack}
          aria-label="Voltar"
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-xs font-mono text-paper/40 hover:text-paper transition-colors cursor-pointer"
        >
          ←
        </button>

        <span className="w-px bg-gold/15 flex-shrink-0" />

        {/* Abrir em nova aba */}
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir em nova aba"
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-xs font-mono text-paper/40 hover:text-gold transition-colors"
        >
          ↗
        </a>
      </div>

      {/* Área invisível ao redor da pill para capturar mouseLeave */}
      <div
        className="absolute top-2 left-0 w-32 h-12"
        style={{
          transform: pillExpanded ? "translateX(0px)" : "translateX(-18px)",
        }}
        onMouseEnter={() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          setPillExpanded(false);
        }}
      />
    </div>
  );
}
