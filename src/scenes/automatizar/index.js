import * as THREE from "three";
import { productos, sgsi, saas } from "../../content/content.js";

// Capítulo 03 · Automatizar (fondo negro): hiperespacio, SOAR, catálogo, CIDSI,
// software propio, contadores y transición al logo (negro → gris → blanco).
const deg = THREE.MathUtils.degToRad;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const look = (pos, yaw = 0, pitch = 0, dist = 2400) => {
  const d = V(-Math.sin(deg(yaw)) * Math.cos(deg(pitch)), Math.sin(deg(pitch)), -Math.cos(deg(yaw)) * Math.cos(deg(pitch)));
  return { pos: pos.toArray(), target: pos.clone().addScaledVector(d, dist).toArray() };
};

export const automatizar = {
  id: "automatizar",
  selector: "#automatizar",
  chapter: "automatizar",

  stations(dir) {
    const last = dir.list[dir.list.length - 1];
    const start = last.pos.clone().add(last.drift);
    const O = V(start.x, 160, start.z - 3000);
    this.O = O;
    const S = (id, a, o = {}) => dir.station(id, { ...a, hold: 52, travel: 54, ...o });
    // Hiperespacio: viaje largo hacia el punto de fuga mientras emergen las letras.
    S("c3-intro", look(O, 0, 0), { travel: 70, hold: 80, drift: [0, 0, -5200] });
    const z = O.z - 7600;
    this.LETTERS_Z = O.z - 9200;
    S("c3-soar", look(V(O.x, 160, z), 0, -2), { drift: [0, 0, -140], hold: 60, travel: 60 });
    S("c3-prod", look(V(O.x, 160, z - 1600), 0, -2), { drift: [0, 0, -120], hold: 60 });
    S("c3-sgsi", look(V(O.x, 160, z - 3200), 0, -2), { drift: [0, 0, -120], hold: 60 });
    S("c3-sgsi-cap", look(V(O.x, 160, z - 4600), 0, -2), { drift: [0, 0, -120] });
    S("c3-saas", look(V(O.x, 160, z - 6000), 0, -2), { drift: [0, 0, -160] });
    for (let i = 0; i < 4; i++) S(`c3-saas-${i}`, look(V(O.x, 160, z - 7600 - i * 1700), 0, -2), { drift: [0, 0, -200], hold: 50, travel: 50 });
    S("c3-counters", look(V(O.x, 160, z - 15000), 0, -2), { drift: [0, 0, -140], hold: 60, travel: 60 });
    // Transición al logo: el fondo pasa de negro a gris y a blanco.
    this.LOGO = V(O.x, 200, z - 18600);
    S("c3-logo", { pos: [O.x, 260, z - 16300], target: [O.x, 200, z - 18600] }, { drift: [0, -20, -500], driftTarget: [0, 0, 0], hold: 76, travel: 60 });
  },

  layout(ctx) {
    const { dir, dom, hud, anchors, env } = ctx;
    const q = (s) => document.querySelector(s);
    const F = (id) => dir.frame(id);
    const W = (id, o) => dir.win(id, o);
    const intro = dir.get("c3-intro");
    this.chapterFrom = intro.t - 50;
    anchors.set("automatizar", intro.t);
    anchors.set("automatizacion", dir.get("c3-soar").t);
    anchors.set("productos", dir.get("c3-prod").t);
    anchors.set("sgsi", dir.get("c3-sgsi").t);
    anchors.set("saas", dir.get("c3-saas").t);

    const card = (key, id, pose, delay = 0, from, to) =>
      dom.add(q(`[data-o="${key}"]`), {
        anchor: F(id),
        pose,
        show: shift(W(id), delay),
        from: from || { z: 420, y: -60, rx: -16, o: 0 },
        to,
      });

    hud.add(q('[data-hud="c3-title"]'), { show: [intro.t - 30, intro.t + 4, intro.end - 30, intro.end] });

    // SOAR: Entrada → Playbook → Salida (las tarjetas van bajo cada nodo 3D).
    hud.add(q('[data-hud="soar-head"]'), { show: W("c3-soar") });
    this.soarX = [40, 340, 640];
    this.soarX.forEach((x, i) => card(`soar-${i}`, "c3-soar", { x, y: -210, z: 40, s: 0.86 }, 8 + i * 8));

    // Catálogo: seis productos en órbita alrededor del chip central.
    hud.add(q('[data-hud="prod-head"]'), { show: W("c3-prod") });
    const wp = W("c3-prod");
    const prodT = dir.get("c3-prod");
    this.prodCenter = { x: 330, y: 0, z: 650 };
    productos.items.forEach((_, i) => {
      const phase = (i / productos.items.length) * Math.PI * 2;
      dom.add(q(`[data-o="prod-${i}"]`), {
        anchor: F("c3-prod"),
        pose: { s: 0.78 },
        show: shift(wp, i * 4),
        from: { o: 0, s: 0.6 },
        live: (t, pose) => {
          const a = phase + (t - prodT.t) * 0.012 + ctx.clock() * 0.06;
          pose.x = this.prodCenter.x + Math.cos(a) * 470;
          pose.y = this.prodCenter.y + Math.sin(a) * 300;
          pose.z = this.prodCenter.z - 300 + Math.sin(a + 1.2) * 260;
        },
      });
    });

    // CIDSI: consola + anillo PDCA; después las cuatro capacidades.
    hud.add(q('[data-hud="sgsi-head"]'), { show: W("c3-sgsi") });
    dom.add(q('[data-o="sgsi-console"]'), { anchor: F("c3-sgsi"), pose: { x: 380, y: -30, z: 0, ry: -10 }, show: shift(W("c3-sgsi"), 8), from: { x: 200, z: 420, ry: -30, o: 0 } });
    sgsi.capabilities.forEach((_, i) => card(`sgsi-cap-${i}`, "c3-sgsi-cap", { x: -495 + i * 330, y: i % 2 ? -20 : 20, z: i % 2 ? 60 : 0, ry: (1.5 - i) * 4, s: 0.96 }, i * 6));

    // Software DOGUI: cuatro grupos pasan volando junto a la cámara.
    hud.add(q('[data-hud="saas-head"]'), { show: W("c3-saas") });
    saas.clusters.forEach((cl, ci) => {
      const id = `c3-saas-${ci}`;
      dom.add(q(`[data-o="saas-cl-${ci}"]`), { anchor: F(id), pose: { x: -480, y: 330, z: 0 }, show: W(id), from: { y: 60, o: 0 }, to: { z: -700, o: 0 } });
      const n = cl.items.length;
      cl.items.forEach((_, i) => {
        const x = (i - (n - 1) / 2) * 320;
        card(`saas-${ci}-${i}`, id, { x, y: -10, z: Math.abs(i - (n - 1) / 2) * 60, ry: ((n - 1) / 2 - i) * 6, s: 0.94 }, i * 4, { z: 1600, o: 0 }, { z: -1100, x: x * 1.6, o: 0 });
      });
    });

    // Contadores 13 y 30+ (el número lo dibuja el cromo 3D) y frase de cierre.
    const wc = W("c3-counters");
    this.counterX = [-400, 400];
    this.counterX.forEach((x, i) => dom.add(q(`[data-o="counter-${i}"]`), { anchor: F("c3-counters"), pose: { x, y: -120, z: 60 }, show: shift(wc, 10 + i * 6), from: { y: -60, o: 0 } }));
    hud.add(q('[data-hud="close-auto"]'), { show: shift(wc, 16) });

    // Anillo de productos alrededor del logo 3D.
    const lg = dir.get("c3-logo");
    const wl = W("c3-logo");
    const N = 13;
    for (let i = 0; i < N; i++) {
      const phase = (i / N) * Math.PI * 2;
      dom.add(q(`[data-o="ring-${i}"]`), {
        world: (t) => {
          const a = phase + ctx.clock() * 0.12 + (t - lg.t) * 0.01;
          return tmpM.makeTranslation(this.LOGO.x + Math.cos(a) * 900, this.LOGO.y + Math.sin(a * 2) * 70 - 40, this.LOGO.z + Math.sin(a) * 520);
        },
        billboard: true,
        show: shift(wl, 6 + (i % 4) * 4),
        from: { o: 0 },
      });
    }

    env.push(
      { t: intro.t - 30, color: "#0A0A0A", near: 2600, far: 13000, bloom: 1.25, vignette: 0.32, grain: 0.04 },
      { t: dir.get("c3-counters").end, color: "#0A0A0A", near: 2600, far: 12000, bloom: 1.05, vignette: 0.3, grain: 0.04 },
      { t: lg.t + 10, color: "#5A5A58", near: 2600, far: 12000, bloom: 0.7, vignette: 0.2, grain: 0.035 },
      { t: lg.end - 6, color: "#F7F7F5", near: 2600, far: 13000, bloom: 0.3, vignette: 0.08, grain: 0.025 },
    );
    this.range = [intro.t - 140, lg.end + 120];
  },

  async build(ctx) {
    const { buildAutomatizar } = await import("./build.js");
    return buildAutomatizar(ctx, this);
  },
};

const tmpM = new THREE.Matrix4();
function shift(w, d) {
  return [w[0] + d, w[1] + d, w[2], w[3]];
}
