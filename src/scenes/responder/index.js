import * as THREE from "three";
import { servicios, metodo, vciso, impacto, spei } from "../../content/content.js";

// Capítulo 02 · Responder (fondo negro): letras cromadas, pasillo de racks, SOC,
// números 24/7 · 360 · 90, método, vCISO e impacto + SPEI/SPID.
const deg = THREE.MathUtils.degToRad;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const look = (pos, yaw = 0, pitch = 0, dist = 2400) => {
  const d = V(-Math.sin(deg(yaw)) * Math.cos(deg(pitch)), Math.sin(deg(pitch)), -Math.cos(deg(yaw)) * Math.cos(deg(pitch)));
  return { pos: pos.toArray(), target: pos.clone().addScaledVector(d, dist).toArray() };
};

export const responder = {
  id: "responder",
  selector: "#responder",
  chapter: "responder",

  stations(dir) {
    const last = dir.list[dir.list.length - 1];
    const start = last.pos.clone().add(last.drift);
    // Origen del capítulo y del pasillo de racks.
    const O = V(start.x, 0, start.z - 2600);
    const X2 = O.x + 6200;
    this.O = O;
    this.X2 = X2;
    this.FLOOR = -520;
    const S = (id, a, o = {}) => dir.station(id, { ...a, hold: 52, travel: 54, ...o });

    S("c2-intro", look(V(O.x, 170, O.z), -8, -2), { travel: 60, hold: 56, drift: [120, 0, -160] });
    // Letras cromadas: la cámara las recorre de lado.
    this.LETTERS = { x: O.x + 900, z: O.z - 2500 };
    S("c2-letters", { pos: [O.x - 1300, 60, O.z - 1100], target: [O.x - 100, -60, O.z - 2600] }, { drift: [3800, 30, 0], driftTarget: [3800, 0, 0], hold: 72, travel: 50 });
    // Pasillo del centro de operaciones.
    const cz = O.z - 3900;
    this.CORRIDOR = { x: X2, z0: cz, z1: cz - 7600 };
    S("c2-svc-head", look(V(X2, 170, cz - 300), 0, -2), { drift: [0, 0, -140], travel: 70 });
    S("c2-svc-a", look(V(X2, 160, cz - 1800), 0, -2), { drift: [0, 0, -120] });
    S("c2-svc-b", look(V(X2, 160, cz - 3200), 0, -2), { drift: [0, 0, -120] });
    S("c2-soc", look(V(X2, 220, cz - 4700), 0, -1), { drift: [0, 0, -120], hold: 60 });
    // Números cromados al salir del pasillo.
    const nz = cz - 8600;
    this.NUM_Z = nz;
    S("c2-n1", look(V(X2 - 200, 120, nz), 8, -2), { drift: [80, 0, -150], hold: 40, travel: 64 });
    S("c2-n2", look(V(X2 + 300, 120, nz - 1700), -10, -2), { drift: [-60, 0, -150], hold: 40, travel: 46 });
    S("c2-n3", look(V(X2 - 100, 120, nz - 3400), 6, -2), { drift: [60, 0, -150], hold: 40, travel: 46 });
    S("c2-method", look(V(X2, 160, nz - 5000), 0, -2), { drift: [0, 0, -120], hold: 60 });
    // vCISO sobre un roadmap 30 · 60 · 90.
    const vz = nz - 6600;
    this.ROAD_Z = vz;
    S("c2-vciso", look(V(X2 - 100, 220, vz), 4, -6), { drift: [-30, 0, -120], hold: 56 });
    S("c2-vciso-prob", look(V(X2 + 200, 200, vz - 1400), -4, -6), { drift: [0, 0, -120] });
    S("c2-vciso-d1", look(V(X2, 180, vz - 2800), 0, -4), { drift: [0, 0, -120], hold: 56 });
    S("c2-vciso-d2", look(V(X2, 180, vz - 4200), 0, -4), { drift: [0, 0, -120], hold: 56 });
    S("c2-vciso-plans", look(V(X2, 180, vz - 5600), 0, -3), { drift: [0, 0, -120], hold: 60 });
    S("c2-vciso-eco", look(V(X2, 170, vz - 7000), 0, -2), { drift: [0, 0, -120], hold: 60 });
    const iz = vz - 8500;
    S("c2-impact", look(V(X2, 160, iz), 0, -2), { drift: [0, 0, -120], hold: 56 });
    S("c2-spei", look(V(X2, 160, iz - 1500), 0, -2), { drift: [0, 0, -120], hold: 56 });
    S("c2-spei-2", look(V(X2, 160, iz - 2900), 0, -2), { drift: [0, 0, -120], hold: 60 });
  },

  layout(ctx) {
    const { dir, dom, hud, anchors, env } = ctx;
    const q = (s) => document.querySelector(s);
    const F = (id) => dir.frame(id);
    const W = (id, o) => dir.win(id, o);
    const intro = dir.get("c2-intro");
    this.chapterFrom = intro.t - 50;
    anchors.set("responder", intro.t);
    anchors.set("servicios", dir.get("c2-svc-head").t);
    anchors.set("metodo", dir.get("c2-method").t);
    anchors.set("vciso", dir.get("c2-vciso").t);
    anchors.set("impacto", dir.get("c2-impact").t);
    anchors.set("spei-spid", dir.get("c2-spei").t);

    const card = (key, id, pose, delay = 0, from) =>
      dom.add(q(`[data-o="${key}"]`), {
        anchor: F(id),
        pose,
        show: shift(W(id), delay),
        from: from || { z: 420, y: -60, rx: -16, o: 0 },
      });

    hud.add(q('[data-hud="c2-title"]'), { show: W("c2-intro", { pre: 0.4 }) });

    // Servicios: encabezado y dos filas de cuatro tarjetas (pasillo).
    hud.add(q('[data-hud="svc-head"]'), { show: W("c2-svc-head") });
    const row4 = [-560, -187, 187, 560];
    servicios.items.forEach((_, i) => {
      const id = i < 4 ? "c2-svc-a" : "c2-svc-b";
      const k = i % 4;
      card(`svc-${i}`, id, { x: row4[k], y: k % 2 ? -14 : 14, z: k % 2 ? 90 : 0, ry: (1.5 - k) * 4, s: 0.94 }, k * 6, { x: (k - 1.5) * 120, z: 520, ry: (k - 1.5) * -18, o: 0 });
    });

    // SOC: consola grande + satélites conectados por luz.
    const ws = W("c2-soc");
    dom.add(q('[data-o="svc-console"]'), { anchor: F("c2-soc"), pose: { x: 0, y: 30, z: 0, s: 1 }, show: ws, from: { z: 500, o: 0 } });
    this.satPoses = [
      { x: -560, y: 250, z: 120 },
      { x: 560, y: 250, z: 120 },
      { x: 0, y: -300, z: 60 },
    ];
    this.satPoses.forEach((p, i) => dom.add(q(`[data-o="soc-sat-${i}"]`), { anchor: F("c2-soc"), pose: p, show: shift(ws, 10 + i * 6), from: { z: 300, o: 0 } }));

    // Números cromados: etiqueta (texto real) bajo cada número 3D.
    this.numbers = [
      { id: "c2-n1", trust: 0, value: "24/7", x: 120 },
      { id: "c2-n2", trust: 1, value: "360", x: -120 },
      { id: "c2-n3", trust: 3, value: "90", x: 80 },
    ];
    for (const n of this.numbers) {
      dom.add(q(`[data-o="trust-${n.trust}"]`), { anchor: F(n.id), pose: { x: n.x, y: -250, z: 120 }, show: W(n.id, { pre: 0.3, post: 0.3 }), from: { y: -80, o: 0 } });
    }

    // Método: se encienden en secuencia.
    hud.add(q('[data-hud="method-head"]'), { show: W("c2-method"), instant: false });
    const wmeth = W("c2-method");
    const methodT = dir.get("c2-method");
    this.methodLit = [];
    // 2 × 2 a la derecha del encabezado; la línea de luz las une en orden.
    this.methodPoses = [
      { x: 140, y: 160, z: 0 },
      { x: 470, y: 160, z: 40 },
      { x: 140, y: -165, z: 20 },
      { x: 470, y: -165, z: 60 },
    ];
    metodo.steps.forEach((_, i) => {
      card(`method-${i}`, "c2-method", { ...this.methodPoses[i], ry: -8, s: 0.92 }, i * 5);
      this.methodLit.push({ el: q(`[data-o="method-${i}"]`), t: methodT.t - 14 + i * 11 });
    });
    void wmeth;

    // vCISO.
    hud.add(q('[data-hud="vciso-head"]'), { show: W("c2-vciso") });
    card("vciso-aside", "c2-vciso", { x: 420, y: 60, z: 0, ry: -12 }, 8, { x: 200, z: 420, ry: -40, o: 0 });
    card("vciso-problem", "c2-vciso-prob", { x: -300, y: 10, z: 0, ry: 8 }, 0, { x: -200, z: 420, ry: 30, o: 0 });
    vciso.deliverables.forEach((_, i) => {
      const id = i < 4 ? "c2-vciso-d1" : "c2-vciso-d2";
      const k = i % 4;
      card(`vciso-d-${i}`, id, { x: row4[k] * 0.98, y: k % 2 ? -12 : 12, z: k % 2 ? 80 : 0, ry: (1.5 - k) * 4, s: 0.92 }, k * 6);
    });
    [
      { x: -380, y: 0, z: 150, ry: 12, s: 0.9 },
      { x: 0, y: 10, z: -60, ry: 0, s: 0.9 },
      { x: 380, y: 0, z: 150, ry: -12, s: 0.9 },
    ].forEach((pose, i) => card(`vciso-plan-${i}`, "c2-vciso-plans", pose, i * 8, { y: -200, z: 500, rx: -20, o: 0 }));
    card("vciso-eco", "c2-vciso-eco", { x: 0, y: 0, z: 0, s: 1 }, 0, { z: 500, o: 0 });

    // Impacto + SPEI/SPID.
    hud.add(q('[data-hud="impact-head"]'), { show: W("c2-impact") });
    impacto.items.forEach((_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      card(`impact-${i}`, "c2-impact", { x: 170 + col * 320, y: row ? -140 : 140, z: col * 40, ry: -8, s: 0.94 }, i * 5, { x: 160, z: 400, o: 0 });
    });
    hud.add(q('[data-hud="spei-head"]'), { show: W("c2-spei") });
    dom.add(q('[data-o="trust-2"]'), { anchor: F("c2-spei"), pose: { x: 470, y: -330, z: 80 }, show: shift(W("c2-spei"), 12), from: { y: -60, o: 0 } });
    spei.items.forEach((_, i) => card(`spei-${i}`, "c2-spei-2", { x: (i - 1) * 330, y: 50, z: i === 1 ? -40 : 60, ry: (1 - i) * 8, s: 0.96 }, i * 6));
    dom.add(q('[data-o="audience"]'), { anchor: F("c2-spei-2"), pose: { x: 0, y: -300, z: 0 }, show: shift(W("c2-spei-2"), 14), from: { y: -60, o: 0 } });

    // Ambiente oscuro durante todo el capítulo.
    const end = dir.get("c2-spei-2");
    env.push(
      { t: intro.t - 30, color: "#0A0A0A", near: 2600, far: 12000, bloom: 1.05, vignette: 0.3, grain: 0.04 },
      { t: end.end, color: "#0A0A0A", near: 2600, far: 12000, bloom: 1.05, vignette: 0.3, grain: 0.04 },
    );
    this.range = [intro.t - 140, end.end + 110];
  },

  async build(ctx) {
    const { buildResponder } = await import("./build.js");
    return buildResponder(ctx, this);
  },
};

function shift(w, d) {
  return [w[0] + d, w[1] + d, w[2], w[3]];
}
