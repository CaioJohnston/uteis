"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import {
  recolorOre,
  recolorFull,
  recolorBlend,
  type RGB,
  type RecolorMode,
} from "./recolor";

export interface TextureCanvasHandle {
  getDataURL: () => string | null;
}

interface Props {
  sourceUrl: string | null;
  color: RGB;
  threshold: number;
  brightness: number; // 0-1
  strength: number;   // 0-1, blend mode only
  mode: RecolorMode;
  onRendered?: () => void;
}

export const TextureCanvas = forwardRef<TextureCanvasHandle, Props>(
  function TextureCanvas(
    { sourceUrl, color, threshold, brightness, strength, mode, onRendered },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sourceDataRef = useRef<{ data: ImageData; w: number; h: number } | null>(null);

    useEffect(() => {
      if (!sourceUrl) {
        sourceDataRef.current = null;
        const c = canvasRef.current;
        if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
        return;
      }
      let cancelled = false;
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        const off = document.createElement("canvas");
        off.width = img.naturalWidth;
        off.height = img.naturalHeight;
        const ctx = off.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        sourceDataRef.current = {
          data: ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight),
          w: img.naturalWidth,
          h: img.naturalHeight,
        };
        render();
      };
      img.src = sourceUrl;
      return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceUrl]);

    useEffect(() => {
      render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [color, threshold, brightness, strength, mode]);

    function render() {
      const src = sourceDataRef.current;
      const canvas = canvasRef.current;
      if (!src || !canvas) return;
      canvas.width = src.w;
      canvas.height = src.h;
      const ctx = canvas.getContext("2d")!;
      let processed: ImageData;
      switch (mode) {
        case "ore":   processed = recolorOre(src.data, color, threshold, brightness); break;
        case "full":  processed = recolorFull(src.data, color, brightness); break;
        case "blend": processed = recolorBlend(src.data, color, brightness, strength); break;
      }
      ctx.putImageData(processed, 0, 0);
      onRendered?.();
    }

    useImperativeHandle(ref, () => ({
      getDataURL: () => canvasRef.current?.toDataURL("image/png") ?? null,
    }));

    return (
      <div className="relative border border-ink-border bg-ink-surface overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "repeating-conic-gradient(#444 0% 25%, #333 0% 50%)",
            backgroundSize: "12px 12px",
          }}
        />
        <div
          className="relative flex items-center justify-center"
          style={{ minHeight: 256, minWidth: 256 }}
        >
          {!sourceUrl ? (
            <span className="text-xs font-mono text-paper/20 select-none">
              ← escolha um template
            </span>
          ) : (
            <canvas
              ref={canvasRef}
              style={{ imageRendering: "pixelated", width: 256, height: 256 }}
            />
          )}
        </div>
      </div>
    );
  }
);
