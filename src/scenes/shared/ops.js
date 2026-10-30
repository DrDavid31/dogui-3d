import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { loadFont, createLogo } from "../../core/assets.js";
import { M, ORANGE, glow, fatLines, canvasTexture, fbm, rng, roundedSlab, roundRectShape } from "./materials.js";

// Modelos de operación (capítulos 02–04): centro de datos, SOC, automatización.
const TAU = Math.PI * 2;

// ── Racks de servidores ──────────────────────────────────────────────────
function faceplateTexture() {
  return canvasTexture(256, 1024, (g, w, h) => {
    g.fillStyle = "#0d0d0d";
    g.fillRect(0, 0, w, h);
    const units = 18;
    const uh = h / units;
    for (let u = 0; u < units; u++) {
      const y = u * uh;
      g.fillStyle = u % 5 === 2 ? "#161616" : "#131313";
      g.fillRect(6, y + 3, w - 12, uh - 6);
      // Rejilla de ventilación.
      g.fillStyle = "#050505";
      for (let x = 20; x < w * 0.55; x += 9) for (let yy = y + 12; yy < y + uh - 10; yy += 8) g.fillRect(x, yy, 4, 3);
      // Bahías de disco.
      g.strokeStyle = "#2a2a2a";
      g.lineWidth = 2;
      for (let k = 0; k < 3; k++) g.strokeRect(w * 0.6 + k * 26, y + 10, 20, uh - 20);
    }
  });
}

/** Fila de racks (instanciada). Frente hacia +Z. Devuelve LEDs que parpadean. */
export function rackRow({ count = 6, spacing = 660, seed = 4 } = {}) {
  const m = M();
  const g = new THREE.Group();
  const W = 560;
  const H = 2000;
  const Dp = 900;
  const cab = new THREE.InstancedMesh(new RoundedBoxGeometry(W, H, Dp, 2, 14), m.black, count);
  const face = new THREE.InstancedMesh(new THREE.PlaneGeometry(W - 70, H - 120), new THREE.MeshStandardMaterial({ map: faceplateTexture(), roughness: 0.6, metalness: 0.3, envMapIntensity: 0.5 }), count);
  const ledsPer = 18 * 3;
  const leds = new THREE.InstancedMesh(new THREE.BoxGeometry(12, 6, 3), new THREE.MeshBasicMaterial({ toneMapped: false }), count * ledsPer);
  const mtx = new THREE.Matrix4();
  const rand = rng(seed);
  const states = [];
  for (let i = 0; i < count; i++) {
    const x = (i - (count - 1) / 2) * spacing;
    mtx.makeTranslation(x, H / 2, 0);
    cab.setMatrixAt(i, mtx);
    mtx.makeTranslation(x, H / 2, Dp / 2 + 1);
    face.setMatrixAt(i, mtx);
    for (let u = 0; u < 18; u++) {
      for (let k = 0; k < 3; k++) {
        const n = i * ledsPer + u * 3 + k;
        const uy = H - 60 - (u + 0.5) * ((H - 120) / 18);
        mtx.makeTranslation(x + W / 2 - 70 - k * 18, uy, Dp / 2 + 3);
        leds.setMatrixAt(n, mtx);
        states.push({ n, orange: k === 0 && rand() < 0.35, rate: 0.6 + rand() * 3, phase: rand() * 10 });
      }
    }
  }
  glow(leds);
  g.add(cab, face, leds);
  const c = new THREE.Color();
  const white = new THREE.Color(0xd8d8d8);
  const dim = new THREE.Color(0x222222);
  // Color por instancia desde el inicio: si se crea en el primer update cambia la
  // variante del shader y se recompila al entrar al pasillo.
  for (const s of states) leds.setColorAt(s.n, dim);
  let last = -1;
  return {
    group: g,
    update(clock) {
      const tick = Math.floor(clock * 12);
      if (tick === last) return;
      last = tick;
      for (const s of states) {
        const on = Math.sin(clock * s.rate + s.phase) > -0.2;
        c.copy(on ? (s.orange ? ORANGE : white) : dim);
        leds.setColorAt(s.n, c);
      }
      leds.instanceColor.needsUpdate = true;
    },
  };
}

// ── Muro de monitores del SOC ────────────────────────────────────────────
const DASH = ["line", "map", "alerts", "bars", "radar", "heat", "line2", "gauge"];
function dashTexture(kind, seed) {
  const rand = rng(seed);
  return canvasTexture(768, 432, (g, w, h) => {
    g.fillStyle = "#0b0b0b";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(255,255,255,0.06)";
    g.lineWidth = 1;
    for (let x = 0; x < w; x += 48) {
      g.beginPath();
      g.moveTo(x, 0);
      g.lineTo(x, h);
      g.stroke();
    }
    for (let y = 0; y < h; y += 48) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    // Barra de título.
    g.fillStyle = "#141414";
    g.fillRect(0, 0, w, 40);
    g.fillStyle = "#ff6b00";
    g.fillRect(16, 16, 10, 10);
    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillRect(36, 17, 120, 8);
    g.fillRect(w - 90, 17, 70, 8);
    const pad = 28;
    if (kind === "line" || kind === "line2") {
      for (let s = 0; s < (kind === "line" ? 2 : 3); s++) {
        g.strokeStyle = s === 0 ? "#ff6b00" : `rgba(255,255,255,${0.5 - s * 0.15})`;
        g.lineWidth = s === 0 ? 4 : 2.5;
        g.beginPath();
        let y = h * (0.45 + s * 0.12);
        for (let x = pad; x < w - pad; x += 18) {
          y = Math.min(h - 40, Math.max(70, y + (rand() - 0.5) * 60));
          if (x === pad) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
      }
    } else if (kind === "bars") {
      const n = 14;
      for (let i = 0; i < n; i++) {
        const bh = 40 + rand() * (h - 140);
        g.fillStyle = i % 4 === 1 ? "#ff6b00" : "rgba(255,255,255,0.28)";
        g.fillRect(pad + i * ((w - pad * 2) / n), h - 30 - bh, (w - pad * 2) / n - 12, bh);
      }
    } else if (kind === "map") {
      for (let y = 60; y < h - 20; y += 11) {
        for (let x = pad; x < w - pad; x += 11) {
          const v = fbm(x * 0.012 + seed, y * 0.018, 3.1);
          if (v > 0.52) {
            g.fillStyle = "rgba(255,255,255,0.4)";
            g.fillRect(x, y, 4, 4);
          }
        }
      }
      for (let i = 0; i < 6; i++) {
        const x = pad + rand() * (w - pad * 2);
        const y = 80 + rand() * (h - 120);
        g.strokeStyle = "rgba(255,107,0,0.9)";
        g.lineWidth = 3;
        g.beginPath();
        g.arc(x, y, 10 + rand() * 10, 0, TAU);
        g.stroke();
        g.fillStyle = "#ff6b00";
        g.fillRect(x - 3, y - 3, 6, 6);
      }
    } else if (kind === "alerts") {
      for (let i = 0; i < 6; i++) {
        const y = 62 + i * 58;
        g.fillStyle = "rgba(255,255,255,0.05)";
        g.fillRect(pad, y, w - pad * 2, 46);
        g.fillStyle = i === 0 ? "#ff6b00" : i < 3 ? "rgba(255,107,0,0.45)" : "rgba(255,255,255,0.25)";
        g.fillRect(pad + 12, y + 14, 60, 18);
        g.fillStyle = "rgba(255,255,255,0.55)";
        g.fillRect(pad + 92, y + 14, 180 + rand() * 200, 8);
        g.fillStyle = "rgba(255,255,255,0.25)";
        g.fillRect(pad + 92, y + 28, 120 + rand() * 120, 6);
      }
    } else if (kind === "radar") {
      const cx = w / 2;
      const cy = h / 2 + 18;
      g.strokeStyle = "rgba(255,255,255,0.18)";
      g.lineWidth = 2;
      for (const r of [50, 100, 150]) {
        g.beginPath();
        g.arc(cx, cy, r, 0, TAU);
        g.stroke();
      }
      const grad = g.createConicGradient(-0.4, cx, cy);
      grad.addColorStop(0, "rgba(255,107,0,0.7)");
      grad.addColorStop(0.12, "rgba(255,107,0,0)");
      grad.addColorStop(1, "rgba(255,107,0,0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, 150, 0, TAU);
      g.fill();
      g.fillStyle = "#ff6b00";
      for (let i = 0; i < 4; i++) g.fillRect(cx - 120 + rand() * 240, cy - 120 + rand() * 240, 7, 7);
    } else if (kind === "heat") {
      const cols = 18;
      const rows = 8;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = rand();
          g.fillStyle = v > 0.85 ? "#ff6b00" : `rgba(255,255,255,${0.04 + v * 0.2})`;
          g.fillRect(pad + c * 40, 64 + r * 42, 34, 36);
        }
      }
    } else if (kind === "gauge") {
      const cx = w / 2;
      const cy = h * 0.72;
      g.lineWidth = 26;
      g.strokeStyle = "rgba(255,255,255,0.1)";
      g.beginPath();
      g.arc(cx, cy, 150, Math.PI, TAU);
      g.stroke();
      g.strokeStyle = "#ff6b00";
      g.beginPath();
      g.arc(cx, cy, 150, Math.PI, Math.PI * 1.68);
      g.stroke();
    }
  });
}

/** Muro curvo de monitores con dashboards. Mira hacia +Z (centro de la curva). */
export function socWall({ cols = 4, rows = 2, w = 560, h = 315, radius = 2400 } = {}) {
  const m = M();
  const g = new THREE.Group();
  const span = (cols * (w + 40)) / radius;
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const a = -span / 2 + (c + 0.5) * (span / cols);
      const mon = new THREE.Group();
      const bezel = new THREE.Mesh(new RoundedBoxGeometry(w + 26, h + 26, 22, 2, 6), m.black);
      const screen = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: dashTexture(DASH[k % DASH.length], k + 3), toneMapped: false }));
      screen.position.z = 11.5;
      mon.add(bezel, screen);
      mon.position.set(Math.sin(a) * radius, (r - (rows - 1) / 2) * (h + 40), radius - Math.cos(a) * radius);
      mon.rotation.y = -a;
      g.add(mon);
      k++;
    }
  }
  // Soporte inferior.
  const rail = new THREE.Mesh(new THREE.BoxGeometry(cols * (w + 40), 26, 40), m.graphite);
  rail.position.y = -(rows / 2) * (h + 40) - 10;
  g.add(rail);
  return { group: g };
}

// ── Piso con cuadrícula que se desvanece en la niebla ────────────────────
export function gridFloor({ size = 40000, cell = 300 } = {}) {
  const mat = new THREE.ShaderMaterial({
    fog: true,
    transparent: true,
    depthWrite: false,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uCell: { value: cell },
        uLine: { value: new THREE.Color(0x3a3a3a) },
        uAccent: { value: ORANGE.clone() },
        uOpacity: { value: 1 },
      },
    ]),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform float uCell;
      uniform vec3 uLine;
      uniform vec3 uAccent;
      uniform float uOpacity;
      varying vec3 vWorld;
      float grid(vec2 p) {
        vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
        return 1.0 - min(min(g.x, g.y), 1.0);
      }
      void main() {
        float minor = grid(vWorld.xz / uCell);
        float major = grid(vWorld.xz / (uCell * 5.0));
        vec3 col = uLine * minor * 0.55 + uAccent * major * 0.35;
        float a = max(minor * 0.55, major * 0.7) * uOpacity;
        gl_FragColor = vec4(col, a);
        #include <fog_fragment>
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// ── Cubos flotantes con borde naranja ────────────────────────────────────
export function edgeCubes({ count = 60, box = [6000, 2200, 9000], seed = 9, avoid } = {}) {
  const tex = canvasTexture(128, 128, (g, w) => {
    g.fillStyle = "#0b0b0b";
    g.fillRect(0, 0, w, w);
    g.strokeStyle = "#ff6b00";
    g.lineWidth = 7;
    g.strokeRect(4, 4, w - 8, w - 8);
  });
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), count);
  glow(mesh);
  const rand = rng(seed);
  const data = [];
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    const s = 24 + rand() * 70;
    let x = (rand() - 0.5) * box[0];
    for (let k = 0; k < 12 && avoid && avoid(x); k++) x = (rand() - 0.5) * box[0];
    data.push({
      p: new THREE.Vector3(x, (rand() - 0.2) * box[1], -rand() * box[2]),
      s,
      r: new THREE.Euler(rand() * 6, rand() * 6, rand() * 6),
      spin: (rand() - 0.5) * 0.8,
      bob: rand() * 6,
    });
  }
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  return {
    mesh,
    update(clock) {
      data.forEach((d, i) => {
        d.r.y += d.spin * 0.016;
        d.r.x += d.spin * 0.01;
        q.setFromEuler(d.r);
        v.copy(d.p);
        v.y += Math.sin(clock * 0.6 + d.bob) * 30;
        mtx.compose(v, q, new THREE.Vector3(d.s, d.s, d.s));
        mesh.setMatrixAt(i, mtx);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

/** Polvo flotante (puntos suaves). */
export function dust({ count = 900, box = [7000, 2600, 9000], color = 0xffffff, size = 5, seed = 2 } = {}) {
  const rand = rng(seed);
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * box[0];
    pos[i * 3 + 1] = (rand() - 0.3) * box[1];
    pos[i * 3 + 2] = -rand() * box[2];
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const tex = canvasTexture(64, 64, (g, w) => {
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, "rgba(255,255,255,1)");
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, w, w);
  });
  const mat = new THREE.PointsMaterial({ color, size, map: tex, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false });
  return new THREE.Points(geo, mat);
}

// ── Texto y números 3D cromados ──────────────────────────────────────────
export async function text3d(str, { size = 600, depth = 160, material, bevel = 12, align = "center" } = {}) {
  const font = await loadFont();
  const geo = new TextGeometry(str, { font, size, depth, curveSegments: 10, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.7, bevelSegments: 4 });
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  const dx = align === "center" ? -(bb.max.x + bb.min.x) / 2 : align === "left" ? -bb.min.x : -bb.max.x;
  geo.translate(dx, -(bb.max.y + bb.min.y) / 2, -depth / 2);
  const mesh = new THREE.Mesh(geo, material || M().chrome);
  mesh.userData.width = bb.max.x - bb.min.x;
  return mesh;
}

/** Letras sueltas (para poder espaciarlas y animarlas una por una). */
export async function letters3d(word, { size = 900, depth = 220, gap = 60, material } = {}) {
  const font = await loadFont();
  const g = new THREE.Group();
  const items = [];
  let x = 0;
  for (const ch of word) {
    const geo = new TextGeometry(ch, { font, size, depth, curveSegments: 10, bevelEnabled: true, bevelThickness: 12, bevelSize: 9, bevelSegments: 4 });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-bb.min.x, 0, -depth / 2);
    const mesh = new THREE.Mesh(geo, material || M().chrome);
    mesh.position.x = x;
    x += bb.max.x - bb.min.x + gap;
    g.add(mesh);
    items.push(mesh);
  }
  const width = x - gap;
  items.forEach((m) => (m.position.x -= width / 2));
  return { group: g, items, width };
}

// ── Hiperespacio ─────────────────────────────────────────────────────────
/** Líneas de velocidad en espacio de cámara: salen del punto de fuga hacia el espectador. */
export function speedLines({ count = 520, seed = 5 } = {}) {
  const rand = rng(seed);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0, -0.5);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), count);
  glow(mesh);
  mesh.frustumCulled = false;
  const data = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * TAU;
    const r = 260 + Math.pow(rand(), 0.7) * 2600;
    data.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: -rand() * 9000, len: 200 + rand() * 900, w: 2 + rand() * 4, orange: rand() < 0.28 });
    mesh.setColorAt(i, data[i].orange ? ORANGE : new THREE.Color(0xffffff));
  }
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  return {
    mesh,
    /** speed: unidades/s; stretch: alarga las líneas (sensación de velocidad). */
    update(dt, speed, stretch = 1, intensity = 1) {
      mesh.material.opacity = intensity;
      for (let i = 0; i < count; i++) {
        const d = data[i];
        d.z += speed * dt;
        if (d.z > 200) d.z -= 9200;
        p.set(d.x, d.y, d.z);
        s.set(d.w, d.w, d.len * stretch);
        mtx.compose(p, q, s);
        mesh.setMatrixAt(i, mtx);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

// ── Mapa de México en puntos (contorno simplificado, solo ilustrativo) ───
const MX = [
  [-117.1, 32.53], [-114.72, 32.72], [-114.81, 32.5], [-111.07, 31.33], [-108.21, 31.33], [-108.21, 31.78], [-106.51, 31.75],
  [-105.0, 30.68], [-104.45, 29.57], [-103.3, 28.98], [-102.48, 29.77], [-101.41, 29.77], [-100.46, 28.62], [-99.51, 27.5],
  [-99.1, 26.4], [-97.41, 25.86], [-97.53, 24.5], [-97.75, 22.4], [-97.2, 20.8], [-96.35, 19.4], [-95.0, 18.65], [-94.4, 18.15],
  [-92.6, 18.6], [-91.4, 18.65], [-90.75, 19.7], [-90.4, 21.0], [-88.4, 21.55], [-86.8, 21.4], [-87.45, 20.2], [-87.6, 18.6],
  [-88.3, 18.5], [-89.15, 17.85], [-90.98, 17.82], [-91.0, 17.25], [-90.45, 16.1], [-91.7, 16.05], [-92.2, 14.55],
  [-93.9, 15.9], [-95.2, 16.15], [-96.5, 15.65], [-98.5, 16.3], [-99.9, 16.8], [-101.5, 17.6], [-103.5, 18.3], [-104.6, 19.1],
  [-105.5, 20.5], [-105.3, 21.5], [-105.8, 22.75], [-106.4, 23.2], [-108.0, 25.0], [-109.0, 25.8], [-109.4, 26.6],
  [-110.6, 27.9], [-111.5, 28.9], [-112.2, 29.9], [-113.0, 31.15], [-114.6, 31.75], [-114.5, 30.6], [-113.6, 29.2],
  [-112.6, 27.6], [-111.7, 26.0], [-110.3, 24.2], [-109.4, 23.0], [-110.2, 23.5], [-111.4, 24.4], [-112.1, 25.8],
  [-113.2, 26.7], [-114.2, 27.7], [-114.1, 28.6], [-115.6, 29.8], [-116.6, 31.4],
];
const inside = (x, y, poly) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};

/** Mapa de puntos de México sobre el plano XY (frente +Z), con pulsos naranjas. */
export function mexicoMap({ scale = 95, step = 0.34 } = {}) {
  const m = M();
  const g = new THREE.Group();
  const cx = -102;
  const cy = 23.6;
  const proj = (lon, lat) => new THREE.Vector3((lon - cx) * scale * 0.93, (lat - cy) * scale, 0);
  const pts = [];
  for (let lat = 14.4; lat <= 32.8; lat += step) for (let lon = -117.2; lon <= -86.6; lon += step) if (inside(lon, lat, MX)) pts.push(proj(lon, lat));
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(scale * 0.085, 8), new THREE.MeshBasicMaterial({ color: 0x9a9a95, toneMapped: false }), pts.length);
  const mtx = new THREE.Matrix4();
  pts.forEach((p, i) => {
    mtx.makeTranslation(p.x, p.y, 0);
    dots.setMatrixAt(i, mtx);
  });
  g.add(dots);
  // Nodos ilustrativos (sin datos): pulsos que convergen en el centro del país.
  const hubs = [
    [-99.13, 19.43],
    [-100.31, 25.67],
    [-103.35, 20.67],
    [-89.62, 20.97],
    [-117.0, 32.5],
    [-106.42, 23.24],
  ].map(([lo, la]) => proj(lo, la));
  const center = hubs[0];
  const pulses = hubs.map((p, i) => {
    const core = new THREE.Mesh(new THREE.CircleGeometry(scale * 0.16, 20), m.led);
    core.position.copy(p).setZ(2);
    glow(core);
    const ringMat = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, depthWrite: false, toneMapped: false });
    const ring = new THREE.Mesh(new THREE.RingGeometry(scale * 0.2, scale * 0.26, 40), ringMat);
    ring.position.copy(p).setZ(2);
    glow(ring);
    g.add(core, ring);
    return { ring, ringMat, phase: i * 0.37 };
  });
  const linkPos = [];
  hubs.slice(1).forEach((p) => {
    const mid = p.clone().lerp(center, 0.5).setZ(scale * 1.6);
    const curve = new THREE.QuadraticBezierCurve3(p.clone().setZ(2), mid, center.clone().setZ(2));
    const pts2 = curve.getPoints(40);
    for (let i = 0; i < pts2.length - 1; i++) linkPos.push(pts2[i].x, pts2[i].y, pts2[i].z, pts2[i + 1].x, pts2[i + 1].y, pts2[i + 1].z);
  });
  const links = fatLines(linkPos, { color: 0xff6b00, width: 1.5, opacity: 0.85 });
  glow(links);
  g.add(links);
  return {
    group: g,
    update(clock) {
      for (const p of pulses) {
        const u = (clock * 0.45 + p.phase) % 1;
        p.ring.scale.setScalar(1 + u * 3);
        p.ringMat.opacity = (1 - u) * 0.9;
      }
    },
  };
}

// ── Ciclo PDCA ───────────────────────────────────────────────────────────
export function pdcaRing({ r = 360, tube = 34 } = {}) {
  const m = M();
  const g = new THREE.Group();
  const gap = 0.12;
  const segs = [];
  for (let i = 0; i < 4; i++) {
    const geo = new THREE.TorusGeometry(r, tube, 24, 96, Math.PI / 2 - gap);
    const mat = m.black.clone();
    const seg = new THREE.Mesh(geo, mat);
    seg.rotation.z = i * (Math.PI / 2) + gap / 2;
    g.add(seg);
    const led = new THREE.Mesh(new THREE.TorusGeometry(r, tube * 0.18, 8, 96, Math.PI / 2 - gap), new THREE.MeshBasicMaterial({ color: 0x333333, toneMapped: false }));
    led.rotation.z = seg.rotation.z;
    led.position.z = tube * 0.95;
    glow(led);
    g.add(led);
    segs.push({ led });
  }
  // Flechas del ciclo: pequeños conos al final de cada segmento.
  for (let i = 0; i < 4; i++) {
    const a = (i + 1) * (Math.PI / 2) - gap / 2;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(tube * 0.9, tube * 1.8, 24), m.white);
    cone.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
    cone.rotation.z = a;
    g.add(cone);
  }
  return {
    group: g,
    segs,
    update(clock) {
      const active = Math.floor(clock * 0.8) % 4;
      segs.forEach((s, i) => s.led.material.color.copy(i === active ? ORANGE : new THREE.Color(0x2c2c2c)));
      g.rotation.z = -clock * 0.15;
    },
  };
}

// ── Nodos del flujo SOAR ─────────────────────────────────────────────────
/** Entrada: baliza de alerta (sirena) con domo naranja. */
export function beacon() {
  const m = M();
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(120, 140, 70, 48), m.black);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(122, 5, 8, 64), m.steel);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 35;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(105, 40, 24, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: ORANGE, emissive: ORANGE, emissiveIntensity: 0.9, roughness: 0.15, transmission: 0, clearcoat: 1 }));
  dome.position.y = 35;
  glow(dome);
  g.add(base, ring, dome);
  return { group: g, dome };
}

/** Playbook: engrane. */
export function gear({ r = 150, teeth = 12, depth = 60 } = {}) {
  const m = M();
  const s = new THREE.Shape();
  const inner = r * 0.82;
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * TAU;
    const a1 = a0 + (TAU / teeth) * 0.22;
    const a2 = a0 + (TAU / teeth) * 0.5;
    const a3 = a0 + (TAU / teeth) * 0.72;
    const pt = (a, rr) => [Math.cos(a) * rr, Math.sin(a) * rr];
    if (i === 0) s.moveTo(...pt(a0, inner));
    s.lineTo(...pt(a1, r));
    s.lineTo(...pt(a2, r));
    s.lineTo(...pt(a3, inner));
    s.lineTo(...pt(a0 + TAU / teeth, inner));
  }
  const hole = new THREE.Path();
  hole.absarc(0, 0, r * 0.32, 0, TAU, true);
  s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 6, bevelSize: 5, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 0, -depth / 2);
  const mesh = new THREE.Mesh(geo, m.chrome);
  const hub = new THREE.Mesh(new THREE.TorusGeometry(r * 0.32, 8, 10, 48), m.led);
  hub.position.z = depth / 2 + 6;
  glow(hub);
  const g = new THREE.Group();
  g.add(mesh, hub);
  return { group: g };
}

/** Salida: escudo con marca de verificación (contención). */
export function shieldCheck({ size = 300, depth = 70 } = {}) {
  const m = M();
  const w = size * 0.8;
  const h = size;
  const s = new THREE.Shape();
  s.moveTo(0, h / 2);
  s.bezierCurveTo(w * 0.22, h * 0.42, w * 0.38, h * 0.4, w / 2, h * 0.38);
  s.lineTo(w / 2, -h * 0.02);
  s.bezierCurveTo(w / 2, -h * 0.28, w * 0.2, -h * 0.42, 0, -h / 2);
  s.bezierCurveTo(-w * 0.2, -h * 0.42, -w / 2, -h * 0.28, -w / 2, -h * 0.02);
  s.lineTo(-w / 2, h * 0.38);
  s.bezierCurveTo(-w * 0.38, h * 0.4, -w * 0.22, h * 0.42, 0, h / 2);
  const geo = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 4, curveSegments: 24 });
  geo.translate(0, 0, -depth / 2);
  const body = new THREE.Mesh(geo, m.black);
  const check = new THREE.Shape();
  check.moveTo(-w * 0.22, 0);
  check.lineTo(-w * 0.07, -h * 0.15);
  check.lineTo(w * 0.24, h * 0.16);
  check.lineTo(w * 0.17, h * 0.22);
  check.lineTo(-w * 0.07, -h * 0.02);
  check.lineTo(-w * 0.15, h * 0.07);
  check.closePath();
  const ck = new THREE.Mesh(new THREE.ExtrudeGeometry(check, { depth: 16, bevelEnabled: true, bevelThickness: 3, bevelSize: 3, bevelSegments: 2 }), m.orange);
  ck.position.z = depth / 2 + 6;
  glow(ck);
  const g = new THREE.Group();
  g.add(body, ck);
  return { group: g };
}

// ── Núcleo de procesamiento (catálogo de productos) ──────────────────────
export function cpuCore({ size = 420 } = {}) {
  const m = M();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(size, size, 40, 3, 12), m.black));
  const lid = new THREE.Mesh(new RoundedBoxGeometry(size * 0.62, size * 0.62, 18, 3, 8), m.steel);
  lid.position.z = 28;
  g.add(lid);
  const die = new THREE.Mesh(new RoundedBoxGeometry(size * 0.22, size * 0.22, 6, 2, 3), m.orange);
  die.position.z = 40;
  glow(die);
  g.add(die);
  // Pistas que salen del chip hacia afuera, con pulsos.
  const rand = rng(17);
  const traces = [];
  for (let side = 0; side < 4; side++) {
    for (let k = 0; k < 6; k++) {
      const off = -size * 0.4 + (k / 5) * size * 0.8;
      const len = size * (0.6 + rand() * 0.9);
      const bend = (rand() - 0.5) * size * 0.4;
      const a = new THREE.Vector3(off, size / 2, 0);
      const b = new THREE.Vector3(off, size / 2 + len * 0.45, 0);
      const c = new THREE.Vector3(off + bend, size / 2 + len, 0);
      const rot = new THREE.Matrix4().makeRotationZ((side * Math.PI) / 2);
      traces.push([a, b, c].map((v) => v.applyMatrix4(rot)));
    }
  }
  const pos = [];
  for (const [a, b, c] of traces) pos.push(a.x, a.y, a.z, b.x, b.y, b.z, b.x, b.y, b.z, c.x, c.y, c.z);
  g.add(fatLines(pos, { color: 0x3c3c3c, width: 2 }));
  const pulses = new THREE.InstancedMesh(new THREE.SphereGeometry(7, 10, 8), m.led, traces.length);
  glow(pulses);
  g.add(pulses);
  const mtx = new THREE.Matrix4();
  const p = new THREE.Vector3();
  return {
    group: g,
    update(clock) {
      traces.forEach(([a, b, c], i) => {
        const u = (clock * 0.5 + i * 0.137) % 1;
        if (u < 0.5) p.lerpVectors(a, b, u * 2);
        else p.lerpVectors(b, c, (u - 0.5) * 2);
        mtx.makeTranslation(p.x, p.y, p.z + 4);
        pulses.setMatrixAt(i, mtx);
      });
      pulses.instanceMatrix.needsUpdate = true;
    },
  };
}

// ── Logo 3D sobre placa negra (como la familia de íconos DOGUI) ──────────
export async function logoTile({ size = 640, depth = 70 } = {}) {
  const m = M();
  const g = new THREE.Group();
  const tile = new THREE.Mesh(roundedSlab(size, size, depth, size * 0.22, 10), new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.25, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.2 }));
  g.add(tile);
  const logo = await createLogo({ part: "mark", height: size * 0.62, depth: 34, bevel: 4 });
  logo.position.set(-size * 0.02, -size * 0.02, depth / 2 + 18);
  g.add(logo);
  return { group: g, logo };
}

export { roundRectShape };
