import * as THREE from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { BLOOM_LAYER } from "./post.js";

const BASE = import.meta.env.BASE_URL;
const cache = new Map();

function once(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

export const loadText = (path) => once(path, () => fetch(`${BASE}${path}`).then((r) => r.text()));

export const loadFont = () =>
  once("font", async () => {
    const res = await fetch(`${BASE}fonts/jakarta-800.typeface.json`);
    return new FontLoader().parse(await res.json());
  });

/**
 * Muestrea el contorno del SVG, voltea Y (SVG → Three) y quita puntos casi duplicados:
 * sin esto el bisel de ExtrudeGeometry genera picos en las curvas de las letras.
 * La forma no cambia; ExtrudeGeometry normaliza el sentido de contorno y huecos.
 */
function cleanShape(shape, divisions = 12, eps = 0.9) {
  const clean = (pts) => {
    const out = [];
    for (const p of pts) {
      const q = new THREE.Vector2(p.x, -p.y);
      if (!out.length || out[out.length - 1].distanceTo(q) > eps) out.push(q);
    }
    while (out.length > 2 && out[0].distanceTo(out[out.length - 1]) <= eps) out.pop();
    return out;
  };
  const { shape: outer, holes } = shape.extractPoints(divisions);
  const s = new THREE.Shape(clean(outer));
  s.holes = holes.map((h) => new THREE.Path(clean(h)));
  return s;
}

/**
 * Logo 3D generado desde el SVG oficial (assets/logo-lockup-dark.svg): cada trazo del
 * archivo se extruye con su color original. Solo se agrega profundidad, bisel e iluminación.
 * part: "all" (símbolo + wordmark) o "mark" (solo el símbolo Centinela).
 */
export async function createLogo({ part = "all", height = 400, depth = 60, bevel = 6, glow = true } = {}) {
  const svg = await loadText("assets/logo-lockup-dark.svg");
  const data = new SVGLoader().parse(svg);
  const group = new THREE.Group();
  const pieces = [];
  const mats = new Map();

  const material = (hex) => {
    if (mats.has(hex)) return mats.get(hex);
    const color = new THREE.Color(hex);
    const isOrange = color.getHexString() !== "ffffff" && color.r > 0.5;
    const m = isOrange
      ? new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.9, roughness: 0.4, metalness: 0 })
      : new THREE.MeshPhysicalMaterial({ color, roughness: 0.32, metalness: 0, clearcoat: 0.5, clearcoatRoughness: 0.35 });
    m.userData.isAccent = isOrange;
    mats.set(hex, m);
    return m;
  };

  for (const path of data.paths) {
    const hex = `#${path.color.getHexString()}`;
    const shapes = path.toShapes();
    for (const shape of shapes) {
      const pts = shape.getPoints(8);
      const box = new THREE.Box2().setFromPoints(pts);
      // En el lockup (3082 × 1000) el símbolo ocupa x < 900; el wordmark va después.
      if (part === "mark" && box.min.x > 900) continue;
      const geo = new THREE.ExtrudeGeometry(cleanShape(shape), {
        depth,
        bevelEnabled: bevel > 0,
        bevelThickness: bevel,
        bevelSize: bevel * 0.6,
        bevelSegments: 3,
        curveSegments: 10,
      });
      geo.computeBoundingBox();
      const center = new THREE.Vector3();
      geo.boundingBox.getCenter(center);
      geo.translate(-center.x, -center.y, -center.z);
      const mat = material(hex);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(center);
      mesh.castShadow = true;
      mesh.userData.home = center.clone();
      if (mat.userData.isAccent && glow) mesh.layers.enable(BLOOM_LAYER);
      group.add(mesh);
      pieces.push(mesh);
    }
  }

  // Centra y escala al alto pedido.
  const bb = new THREE.Box3().setFromObject(group);
  const size = new THREE.Vector3();
  const c = new THREE.Vector3();
  bb.getSize(size);
  bb.getCenter(c);
  const s = height / size.y;
  for (const p of pieces) {
    p.position.sub(c);
    p.userData.home.sub(c);
  }
  const wrap = new THREE.Group();
  group.scale.setScalar(s);
  wrap.add(group);
  wrap.userData = { pieces, inner: group, scale: s, size: size.clone().multiplyScalar(s), materials: [...mats.values()] };
  return wrap;
}

/** Sombra de contacto suave (textura difuminada en canvas), barata y estática. */
export function contactShadow({ w, h, blur = 40, opacity = 0.35, radius = 30, spread = 1 }) {
  const pad = blur * 3;
  const cw = 256;
  const ch = Math.round((cw * (h + pad * 2)) / (w + pad * 2));
  const cv = document.createElement("canvas");
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext("2d");
  const k = cw / (w + pad * 2);
  ctx.filter = `blur(${blur * k}px)`;
  ctx.fillStyle = `rgba(10,10,10,${opacity})`;
  const x = pad * k;
  const y = pad * k;
  ctx.beginPath();
  ctx.roundRect(x - spread, y - spread, w * k + spread * 2, h * k + spread * 2, radius * k);
  ctx.fill();
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w + pad * 2, h + pad * 2), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.renderOrder = 1;
  return mesh;
}

/** Material naranja emisivo que alimenta el bloom. */
export function neon(opacity = 1, extra = {}) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color("#FF6B00"),
    transparent: opacity < 1 || extra.transparent,
    opacity,
    toneMapped: false,
    fog: false,
    ...extra,
  });
}

export function markBloom(obj) {
  obj.traverse((o) => o.layers.enable(BLOOM_LAYER));
  return obj;
}
