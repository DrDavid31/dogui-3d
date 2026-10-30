import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { BLOOM_LAYER } from "../../core/post.js";

// Lenguaje material común de todos los modelos: cerámica negra satinada, blanco
// satinado, grafito, cromo y el naranja DOGUI como único acento (LEDs, neones).
export const ORANGE = new THREE.Color("#FF6B00");
export const INK = new THREE.Color("#0A0A0A");

let cache;
export function M() {
  if (cache) return cache;
  cache = {
    black: new THREE.MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.34, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 0.75 }),
    blackMatte: new THREE.MeshStandardMaterial({ color: 0x0d0d0d, roughness: 0.7, metalness: 0.05, envMapIntensity: 0.5 }),
    graphite: new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.5, metalness: 0.25, envMapIntensity: 0.7 }),
    steel: new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.32, metalness: 0.8, envMapIntensity: 1.6 }),
    white: new THREE.MeshPhysicalMaterial({ color: 0xf2f2ef, roughness: 0.48, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.4, envMapIntensity: 1.15 }),
    paper: new THREE.MeshStandardMaterial({ color: 0xfafaf8, roughness: 0.85, envMapIntensity: 1.25 }),
    gray: new THREE.MeshStandardMaterial({ color: 0xa9a9a4, roughness: 0.7, envMapIntensity: 1 }),
    orange: new THREE.MeshStandardMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.6, roughness: 0.4, envMapIntensity: 0.6 }),
    led: new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false }),
    ledWhite: new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }),
    chrome: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.13, envMapIntensity: 2.9, clearcoat: 0.4 }),
  };
  return cache;
}

/** Activa el bloom (capa naranja) en un objeto y sus hijos. */
export function glow(obj) {
  obj.traverse((o) => o.layers.enable(BLOOM_LAYER));
  return obj;
}

// Líneas con grosor real (en px), mucho más limpias que GL_LINES de 1 px.
const lineMats = new Set();
export function setLineResolution(w, h) {
  for (const m of lineMats) m.resolution.set(w, h);
}

export function fatLines(positions, { color = INK, width = 1.6, opacity = 1, fog = true } = {}) {
  const geo = new LineSegmentsGeometry();
  geo.setPositions(positions);
  const mat = new LineMaterial({
    color: new THREE.Color(color),
    linewidth: width,
    transparent: opacity < 1,
    opacity,
    worldUnits: false,
    fog,
  });
  mat.resolution.set(window.innerWidth, window.innerHeight);
  lineMats.add(mat);
  const line = new LineSegments2(geo, mat);
  line.computeLineDistances();
  return line;
}

/** Segmentos de un círculo en el plano XZ (para fatLines). */
export function circlePoints(r, n = 96, y = 0) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 1) / n) * Math.PI * 2;
    out.push(Math.cos(a) * r, y, Math.sin(a) * r, Math.cos(b) * r, y, Math.sin(b) * r);
  }
  return out;
}

export function canvasTexture(w, h, draw) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Generador con semilla: composiciones estables entre recargas.
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Ruido de valor 3D (para "continentes" estilizados del globo).
function hash3(x, y, z) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 1440662683);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
const fade = (t) => t * t * (3 - 2 * t);
export function vnoise(x, y, z) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const zf = fade(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), xf), l(c(0, 1, 0), c(1, 1, 0), xf), yf),
    l(l(c(0, 0, 1), c(1, 0, 1), xf), l(c(0, 1, 1), c(1, 1, 1), xf), yf),
    zf,
  );
}
export const fbm = (x, y, z) => 0.58 * vnoise(x, y, z) + 0.29 * vnoise(x * 2.03, y * 2.03, z * 2.03) + 0.13 * vnoise(x * 4.1, y * 4.1, z * 4.1);

export function roundRectShape(w, h, r, shape = new THREE.Shape()) {
  const x = -w / 2;
  const y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** Placa redondeada extruida (tarjetas, teléfonos, baldosas). Frente hacia +Z, centrada. */
export function roundedSlab(w, h, depth, r, bevel = Math.min(4, depth * 0.3)) {
  const geo = new THREE.ExtrudeGeometry(roundRectShape(w - bevel * 2, h - bevel * 2, Math.max(1, r - bevel)), {
    depth: Math.max(0.5, depth - bevel * 2),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 10,
  });
  geo.translate(0, 0, -(depth - bevel * 2) / 2);
  return geo;
}
