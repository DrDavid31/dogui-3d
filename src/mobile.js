import * as THREE from "three";
import { Stage } from "./core/renderer.js";
import { radar, threatGlobe } from "./scenes/shared/cyber.js";
import { rackRow, beacon, gear, shieldCheck, logoTile } from "./scenes/shared/ops.js";

// Móvil: el contenido sigue en flujo vertical (legible), y cada capítulo abre una
// "ventana" donde se ve su modelo 3D de ciberseguridad, que gira con el scroll.
// Un solo canvas fijo; la cámara se desplaza para seguir a la ventana en pantalla.
const WINDOWS = [
  { after: ".sec--hero .hud--hero", model: "globe", tone: "light" },
  { after: '[data-hud="c1-title"]', model: "radar", tone: "light" },
  { after: '[data-hud="c2-title"]', model: "racks", tone: "dark" },
  { after: '[data-hud="c3-title"]', model: "soar", tone: "dark" },
  { before: '[data-hud="final"]', model: "logo", tone: "light" },
];

const BG = { light: new THREE.Color("#F7F7F5"), dark: new THREE.Color("#0A0A0A") };

async function makeModel(kind) {
  const g = new THREE.Group();
  let update = () => {};
  let dist = 1900;
  let size = 1100; // ancho aproximado del modelo (para que quepa en pantallas angostas)
  if (kind === "globe") {
    const gl = threatGlobe({ r: 520, arcs: 8 });
    g.add(gl.group);
    update = (clock, p) => {
      gl.update(clock);
      gl.group.rotation.y = clock * 0.12 + p * 1.5;
    };
  } else if (kind === "radar") {
    const rd = radar({ r: 560, blips: [0.5, 1.6, 2.5, 3.6, 4.4, 5.4].map((a, i) => ({ a, r: 0.55 + (i % 3) * 0.15 })) });
    rd.group.rotation.x = 0.75;
    size = 1250;
    g.add(rd.group);
    update = (clock, p) => {
      rd.update(clock);
      g.rotation.z = (p - 0.5) * 0.3;
    };
  } else if (kind === "racks") {
    const racks = rackRow({ count: 5, spacing: 660 });
    racks.group.position.y = -1000;
    racks.group.scale.setScalar(0.7);
    size = 2000;
    g.add(racks.group);
    dist = 2300;
    update = (clock, p) => {
      racks.update(clock);
      g.rotation.y = -0.6 + p * 1.1;
    };
  } else if (kind === "soar") {
    const nodes = [beacon(), gear({ r: 130 }), shieldCheck({ size: 260 })];
    nodes.forEach((n, i) => {
      n.group.position.set((i - 1) * 380, i === 0 ? -60 : 0, 0);
      g.add(n.group);
    });
    nodes[0].group.rotation.x = 0.4;
    dist = 1700;
    size = 1150;
    update = (clock, p) => {
      nodes[1].group.rotation.z = clock * 0.8 + p * 3;
      nodes[2].group.rotation.y = Math.sin(clock * 0.8) * 0.3;
      nodes[0].dome.material.emissiveIntensity = 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(clock * 6));
      g.rotation.y = (p - 0.5) * 0.6;
    };
  } else if (kind === "logo") {
    const tile = await logoTile({ size: 560, depth: 74 });
    g.add(tile.group);
    dist = 1600;
    size = 700;
    update = (clock, p) => {
      tile.group.rotation.y = Math.sin(clock * 0.6) * 0.4 + (p - 0.5) * 0.8;
    };
  }
  return { group: g, update, dist, size };
}

export async function startMobile() {
  const html = document.documentElement;
  const canvas = document.querySelector("[data-stage]");
  const stage = new Stage(canvas, { mobile: true });
  stage.scene.fog.near = 1e5;
  stage.scene.fog.far = 2e5;
  const light = new THREE.HemisphereLight(0xffffff, 0x777777, 1.2);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(-800, 1600, 1600);
  stage.scene.add(light, sun);

  // Inserta las ventanas (decorativas) en el DOM.
  const wins = [];
  for (const w of WINDOWS) {
    const ref = document.querySelector(w.after || w.before);
    if (!ref) continue;
    const el = document.createElement("div");
    el.className = "m3d";
    el.setAttribute("aria-hidden", "true");
    if (w.after) ref.after(el);
    else ref.before(el);
    wins.push({ ...w, el, model: null, kind: w.model });
  }
  html.classList.add("has-stage", "has-m3d");

  const load = (w) => {
    if (!w.loading) {
      w.loading = makeModel(w.kind).then((m) => {
        w.model = m;
        m.group.visible = false;
        stage.scene.add(m.group);
      });
    }
    return w.loading;
  };
  // Precarga la primera; el resto bajo demanda.
  load(wins[0]);

  let clock = 0;
  let last = performance.now();
  let visible = true;
  document.addEventListener("visibilitychange", () => (visible = document.visibilityState === "visible"));
  window.addEventListener("resize", () => stage.resize());

  const frame = (now) => {
    requestAnimationFrame(frame);
    if (!visible) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock += dt;
    const H = stage.height;
    // Ventana más visible.
    let best = null;
    let bestArea = 0;
    for (const w of wins) {
      const r = w.el.getBoundingClientRect();
      const area = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0));
      if (r.top < H * 2 && r.bottom > -H) load(w);
      if (area > bestArea) {
        bestArea = area;
        best = { w, r };
      }
    }
    for (const w of wins) if (w.model) w.model.group.visible = false;
    if (!best || !best.w.model) {
      stage.camera.clearViewOffset();
      stage.renderer.setClearColor(best ? BG[best.w.tone] : BG.light);
      stage.scene.background = null;
      stage.renderer.render(stage.scene, stage.camera);
      return;
    }
    const { w, r } = best;
    stage.scene.background = BG[w.tone];
    const m = w.model;
    m.group.visible = true;
    // Progreso de la ventana a través de la pantalla (0 → 1).
    const p = Math.min(1, Math.max(0, (H - r.top) / (H + r.height)));
    m.update(clock, p);
    // La cámara sigue a la ventana: el modelo aparece centrado en ella.
    const cy = r.top + r.height / 2;
    // Distancia mínima para que el modelo ocupe ~86% del ancho visible.
    const aspect = stage.width / H;
    const fit = m.size / 0.86 / (2 * Math.tan(THREE.MathUtils.degToRad(20)) * aspect);
    stage.camera.position.set(0, 0, Math.max(m.dist, fit));
    stage.camera.lookAt(0, 0, 0);
    stage.camera.setViewOffset(stage.width, H, 0, H / 2 - cy, stage.width, H);
    stage.renderer.render(stage.scene, stage.camera);
  };
  requestAnimationFrame(frame);
}
