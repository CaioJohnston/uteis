"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeInOut(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

// ─── Octahedron surface projection ───────────────────────────────────────────
// L1-norm projection: scales the unit-sphere direction so that
// |x|+|y|+|z| = scale. This places the point on the octahedron surface.
// 8 faces, 6 vertices — distributes UV grid vertices much more evenly than
// a tetrahedron (4 faces) and produces clean diamond/crystal morphing.

function projOcta(x: number, y: number, z: number, scale = 1.0): [number, number, number] {
  const l1 = Math.abs(x) + Math.abs(y) + Math.abs(z);
  if (l1 < 1e-10) return [scale, 0, 0];
  const s = scale / l1;
  return [x * s, y * s, z * s];
}

// ─── UV grid geometry ─────────────────────────────────────────────────────────
// All three shapes share the same (W+1)×(H+1) vertex grid and triangle indices.
// The same UV parameter (u, v) maps to a point on each shape's surface.
//
// Sphere:     standard UV sphere  — θ = 2π·u/W,  φ = π·v/H
// Torus:      standard UV torus   — θ = 2π·u/W,  tube angle = 2π·v/H
// Octahedron: L1 projection of sphere UV direction — |x|+|y|+|z| = 1
//
// W and H are kept low so the wireframe reads as "open mesh" rather than
// a solid-looking dense grid.

const W  = 12;   // azimuthal divisions  (was 22 — fewer → more open)
const H  = 10;   // polar / tube divisions (was 18)
const MR = 0.70; // torus major radius
const mr = 0.30; // torus minor radius

type ShapeKey = "sphere" | "torus" | "octa";

function buildPositions(): Record<ShapeKey, Float32Array> {
  const count = (W + 1) * (H + 1);
  const sphere = new Float32Array(count * 3);
  const torus  = new Float32Array(count * 3);
  const octa   = new Float32Array(count * 3);

  let i = 0;
  for (let u = 0; u <= W; u++) {
    const theta = (2 * Math.PI * u) / W;
    const ct = Math.cos(theta), st = Math.sin(theta);

    for (let v = 0; v <= H; v++) {
      const phiS = (Math.PI * v) / H;      // 0 → π  (sphere polar angle)
      const phiT = (2 * Math.PI * v) / H;  // 0 → 2π (torus tube angle)

      // Sphere
      const sinS = Math.sin(phiS);
      sphere[i]     = sinS * ct;
      sphere[i + 1] = Math.cos(phiS);
      sphere[i + 2] = sinS * st;

      // Torus
      const tube = MR + mr * Math.cos(phiT);
      torus[i]     = tube * ct;
      torus[i + 1] = mr * Math.sin(phiT);
      torus[i + 2] = tube * st;

      // Octahedron — L1 projection of the sphere UV direction
      const [ox, oy, oz] = projOcta(sphere[i], sphere[i + 1], sphere[i + 2]);
      octa[i]     = ox;
      octa[i + 1] = oy;
      octa[i + 2] = oz;

      i += 3;
    }
  }
  return { sphere, torus, octa };
}

function buildIndices(): Uint16Array {
  const arr = new Uint16Array(W * H * 6);
  let i = 0;
  for (let u = 0; u < W; u++) {
    for (let v = 0; v < H; v++) {
      const a = u * (H + 1) + v;
      const b = (u + 1) * (H + 1) + v;
      const c = (u + 1) * (H + 1) + (v + 1);
      const d = u * (H + 1) + (v + 1);
      arr[i++] = a; arr[i++] = b; arr[i++] = d;
      arr[i++] = b; arr[i++] = c; arr[i++] = d;
    }
  }
  return arr;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const HOLD  = 2.5;  // seconds each shape is held
const MORPH = 2.2;  // seconds for vertex morph
const GOLD_DARK  = "#c2652a";
const GOLD_LIGHT = "#c2652a";
const SHAPES: ShapeKey[] = ["sphere", "torus", "octa"];

// ─── Component ───────────────────────────────────────────────────────────────

export function MeshAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Live theme colour update — no scene rebuild needed
  useEffect(() => {
    if (!resolvedTheme || !materialRef.current) return;
    materialRef.current.color.set(resolvedTheme === "dark" ? GOLD_DARK : GOLD_LIGHT);
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Three.js setup ───────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    // Elevated position gives a natural downward angle — reveals torus hole
    // and octa diamond faces without needing mesh.rotation.x
    camera.position.set(0, 1.5, 3.6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(320, 320);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // ── Build shared geometry ────────────────────────────────────────────────
    const posArrays = buildPositions();
    const indices   = buildIndices();

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(
      new Float32Array(posArrays.sphere), // start as sphere
      3
    );
    posAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("position", posAttr);
    geo.setIndex(new THREE.BufferAttribute(indices, 1));

    // Read the active theme directly from the <html> class — next-themes sets
    // this synchronously before hydration, so it's always accurate here even
    // when resolvedTheme is still undefined on first render.
    const isDark = document.documentElement.classList.contains("dark");
    const material = new THREE.MeshBasicMaterial({
      color: isDark ? GOLD_DARK : GOLD_LIGHT,
      wireframe: true,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geo, material);
    mesh.rotation.x = -0.4;
    mesh.rotation.z = 0.4;
    scene.add(mesh);

    // ── OrbitControls ────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom      = false;
    controls.enablePan       = false;
    controls.enableDamping   = true;
    controls.dampingFactor   = 0.06;
    controls.autoRotate      = true;
    controls.autoRotateSpeed = 2.2;

    // Cursor — managed in JS so inline styles from OrbitControls don't conflict
    canvas.style.cursor = "grab";
    controls.addEventListener("start", () => { canvas.style.cursor = "grabbing"; });
    controls.addEventListener("end",   () => { canvas.style.cursor = "grab"; });

    // ── Animation state ──────────────────────────────────────────────────────
    let shapeIdx = 0;
    let phase: "holding" | "morphing" = "holding";
    let timer = 0;

    const clock = new THREE.Clock();
    let rafId: number;

    function lerpBuf(a: Float32Array, b: Float32Array, t: number, out: Float32Array) {
      for (let k = 0; k < out.length; k++) out[k] = a[k] + (b[k] - a[k]) * t;
    }

    function animate() {
      rafId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      timer += delta;
      controls.update(); // applies damping and auto-rotate each frame

      const buf  = posAttr.array as Float32Array;
      const from = SHAPES[shapeIdx];
      const to   = SHAPES[(shapeIdx + 1) % SHAPES.length];

      if (phase === "holding") {
        if (timer >= HOLD) { phase = "morphing"; timer = 0; }
      } else {
        // Every vertex slides from its `from` position to its `to` position
        const t = easeInOut(Math.min(timer / MORPH, 1));
        lerpBuf(posArrays[from], posArrays[to], t, buf);
        posAttr.needsUpdate = true;

        if (timer >= MORPH) {
          buf.set(posArrays[to]);
          posAttr.needsUpdate = true;
          shapeIdx = (shapeIdx + 1) % SHAPES.length;
          phase = "holding";
          timer = 0;
        }
      }

      renderer.render(scene, camera);
    }

    animate();

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      controls.dispose();
      renderer.dispose();
      geo.dispose();
      material.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      style={{ width: 320, height: 320 }}
      className="hidden md:block flex-shrink-0"
      aria-hidden="true"
    />
  );
}
