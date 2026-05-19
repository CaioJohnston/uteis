export type RGB = [number, number, number];
export type RecolorMode = "ore" | "full" | "blend";

function lum(r: number, g: number, b: number): number {
  return r * 0.299 + g * 0.587 + b * 0.114;
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const diff = max - min;
  let h = 0;
  if (diff > 0) {
    if (max === rn) h = ((gn - bn) / diff + 6) % 6;
    else if (max === gn) h = (bn - rn) / diff + 2;
    else h = (rn - gn) / diff + 4;
    h /= 6;
  }
  return [h, max === 0 ? 0 : diff / max, max];
}

function hsvToRgb(h: number, s: number, v: number): RGB {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r = 0, g = 0, b = 0;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// brightness: 0 = original lum, 1 = strong lift — gamma curve preserves shade gradient
function recolorPx(r: number, g: number, b: number, target: RGB, brightness: number): RGB {
  const [th, ts] = rgbToHsv(target[0], target[1], target[2]);
  const rawV = lum(r, g, b) / 255;
  // Gamma correction: brightness=0 → gamma=1 (identity), brightness=1 → gamma=0.15
  // Relative pixel ratios preserved → shading intact at any brightness level
  const gamma = brightness === 0 ? 1 : Math.pow(0.15, brightness);
  const v = Math.pow(rawV, gamma);
  const sat = ts * (1.0 - Math.max(0.0, (v - 0.75) * 2.0));
  return hsvToRgb(th, sat, v);
}

export function recolorOre(
  data: ImageData,
  target: RGB,
  threshold: number,
  brightness: number
): ImageData {
  const out = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
  for (let i = 0; i < out.data.length; i += 4) {
    if (out.data[i + 3] === 0) continue;
    const r = out.data[i], g = out.data[i + 1], b = out.data[i + 2];
    if (lum(r, g, b) < threshold) {
      const [nr, ng, nb] = recolorPx(r, g, b, target, brightness);
      out.data[i] = nr; out.data[i + 1] = ng; out.data[i + 2] = nb;
    }
  }
  return out;
}

export function recolorFull(data: ImageData, target: RGB, brightness: number): ImageData {
  const out = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
  for (let i = 0; i < out.data.length; i += 4) {
    if (out.data[i + 3] === 0) continue;
    const r = out.data[i], g = out.data[i + 1], b = out.data[i + 2];
    const [nr, ng, nb] = recolorPx(r, g, b, target, brightness);
    out.data[i] = nr; out.data[i + 1] = ng; out.data[i + 2] = nb;
  }
  return out;
}

// Blend: lerp entre original e totalmente recolorido
export function recolorBlend(
  data: ImageData,
  target: RGB,
  brightness: number,
  strength: number
): ImageData {
  const out = new ImageData(new Uint8ClampedArray(data.data), data.width, data.height);
  for (let i = 0; i < out.data.length; i += 4) {
    if (out.data[i + 3] === 0) continue;
    const r = out.data[i], g = out.data[i + 1], b = out.data[i + 2];
    const [nr, ng, nb] = recolorPx(r, g, b, target, brightness);
    out.data[i]     = Math.round(r * (1 - strength) + nr * strength);
    out.data[i + 1] = Math.round(g * (1 - strength) + ng * strength);
    out.data[i + 2] = Math.round(b * (1 - strength) + nb * strength);
  }
  return out;
}
