import * as THREE from "three";
import { placeInView, lookMatrix } from "../../core/camera.js";
import { exposicion, pyme, awareness } from "../../content/content.js";

// ── Utilidades de encuadre ────────────────────────────────────────────────
const deg = THREE.MathUtils.degToRad;
/** Estación a partir de posición + rumbo (yaw > 0 mira a la izquierda). */
function aim(pos, yaw = 0, pitch = 0, dist = 2400) {
  const d = new THREE.Vector3(-Math.sin(deg(yaw)) * Math.cos(deg(pitch)), Math.sin(deg(pitch)), -Math.cos(deg(yaw)) * Math.cos(deg(pitch)));
  const p = new THREE.Vector3(...pos);
  return { pos, target: p.addScaledVector(d, dist).toArray() };
}
const worldPos = (frame, pose) => new THREE.Vector3().setFromMatrixPosition(placeInView(frame, pose));

// Letras de la transición: dónde están y por qué hueco pasa la cámara.
// Tamaño pensado para que la palabra completa quepa en pantalla (≈ 3/4 del ancho a 16:10)
// y la frase de riesgo quede debajo; la cámara después pasa por el hueco entre E y C.
export const LETTERS = { word: "DETECTAR", z: 0, y: -150, height: 520, depth: 140, gap: 80, passIndex: 3, x: 0 };

export const detectar = {
  id: "detectar",
  selector: "#detectar",
  chapter: "detectar",

  stations(dir) {
    const S = (id, a, o = {}) => dir.station(id, { ...a, hold: 52, travel: 54, ...o });
    const mid = (v, d) => v.clone().addScaledVector(d, 0.5);
    const frameOf = (s) => lookMatrix(mid(s.pos, s.drift), mid(s.target, s.driftTarget));
    const intro = S("c1-intro", aim([0, 40, -5300], -6, -1), { travel: 46, hold: 62, drift: [-50, -10, -170] });
    // Radar de detección: fijo en el encuadre de la estación de entrada.
    this.RADAR = worldPos(frameOf(intro), { x: 300, y: -40, z: 1450 });
    const tem = S("c1-tem", aim([-160, 70, -6150], 7, -1), { drift: [-30, 0, -110] });
    // Globo de amenazas: se asoma detrás de la tarjeta de TEM y luego la cámara llega a él.
    const GL = worldPos(frameOf(tem), { x: 760, y: -40, z: 2900 });
    this.GLOBE = GL;
    S("c1-monitor", { pos: GL.clone().add(new THREE.Vector3(-380, 300, 2150)).toArray(), target: GL.clone().add(new THREE.Vector3(40, -70, 0)).toArray() }, { drift: [240, -20, -60], driftTarget: [40, 0, 0], hold: 72 });
    S("c1-deliver", aim([GL.x + 300, 70, GL.z - 1400], -6), { drift: [0, 0, -120] });
    S("c1-flow", aim([GL.x + 700, 30, GL.z - 2850], 20), { drift: [-140, 0, -160], hold: 60 });
    S("c1-plans", aim([GL.x + 350, 40, GL.z - 4300], 2), { drift: [0, 0, -110], hold: 60 });
    const py = S("c1-pyme", aim([GL.x + 250, 90, GL.z - 5850], 8, -1), { drift: [-30, 0, -110], hold: 66 });
    // Teléfono: fijo en el encuadre de PyME; los tres clusters giran a su alrededor.
    const P = worldPos(frameOf(py), { x: 120, y: -10, z: 420 });
    this.PHONE = P;
    const around = (off, look) => ({ pos: P.clone().add(new THREE.Vector3(...off)).toArray(), target: P.clone().add(new THREE.Vector3(...look)).toArray() });
    S("c1-cl0", around([-1250, 160, 1650], [-620, 20, -150]), { drift: [60, 0, -60] });
    S("c1-cl1", around([420, 820, 2050], [640, 60, -120]), { drift: [40, -20, -70] });
    S("c1-cl2", around([1750, 180, 900], [620, 10, -420]), { drift: [40, 0, -70] });
    const X = P.x;
    const Z = P.z;
    S("c1-pkg", aim([X + 1350, 40, Z - 3000], -6), { drift: [0, 0, -110], hold: 60 });
    S("c1-aw", aim([X + 1150, 60, Z - 4550], 6), { drift: [-20, 0, -110], hold: 60 });
    S("c1-aw-sum", aim([X + 950, 70, Z - 5950], 0), { drift: [0, 0, -110], hold: 56 });
    S("c1-aw-plans", aim([X + 750, 40, Z - 7350], -3), { drift: [0, 0, -110], hold: 60 });
    S("c1-aw-wa", aim([X + 650, 60, Z - 8750], 5), { drift: [-20, 0, -110] });
    S("c1-courses", aim([X + 550, 40, Z - 10150], 0), { drift: [0, 0, -120], hold: 66 });
    // Transición: letras gigantes DETECTAR; la cámara pasa por el hueco entre dos letras.
    LETTERS.x = X + 500;
    LETTERS.z = Z - 14050;
    const passX = LETTERS.x;
    // La mira queda bajo las letras: la palabra se ve en la mitad superior.
    S("c1-letters", { pos: [passX + 20, 130, LETTERS.z + 3900], target: [passX, -230, LETTERS.z - 200] }, { drift: [-10, 0, -500], hold: 80, travel: 60 });
    dir.station("c1-through", { pos: [passX, 60, LETTERS.z - 1400], target: [passX, 60, LETTERS.z - 4200], drift: [0, 0, -600], hold: 30, travel: 64 });
  },

  layout(ctx) {
    const { dir, dom, hud, anchors, env } = ctx;
    const q = (s) => document.querySelector(s);
    const F = (id) => dir.frame(id);
    const W = (id, o) => dir.win(id, o);
    const intro = dir.get("c1-intro");
    this.chapterFrom = intro.t - 40;
    anchors.set("detectar", intro.t);
    anchors.set("exposicion", dir.get("c1-tem").t);
    anchors.set("pyme", dir.get("c1-pyme").t);
    anchors.set("awareness", dir.get("c1-aw").t);

    // Puntos de referencia en el mundo (compartidos con build.js).
    const PHONE = this.PHONE;
    const phoneQuat = new THREE.Quaternion().setFromRotationMatrix(F("c1-pyme")).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(-2), deg(-14), deg(2))));
    // El radar mira a la cámara de entrada, inclinado ~42° para ver su pantalla.
    const radarQuat = new THREE.Quaternion().setFromRotationMatrix(F("c1-intro")).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(deg(42), deg(0), deg(-6))));
    this.points = { RADAR: this.RADAR, radarQuat, GLOBE: this.GLOBE, PHONE, phoneQuat };

    // ── Título de capítulo ─────────────────────────────────────────────
    hud.add(q('[data-hud="c1-title"]'), { show: W("c1-intro", { pre: 0.5 }) });

    // Fuentes de riesgo = blips del radar (ángulo, radio relativo). Cada etiqueta va sobre su blip.
    this.blips = [
      { a: deg(140), r: 0.62 },
      { a: deg(95), r: 0.82 },
      { a: deg(40), r: 0.7 },
      { a: deg(-10), r: 0.84 },
      { a: deg(-70), r: 0.58 },
      { a: deg(-140), r: 0.78 },
    ];
    this.radarR = 560;
    const tem = dir.get("c1-tem");
    const nodeWin = [intro.t - 46, intro.t + 4, tem.end, tem.end + 40];
    this.nodeLabels = this.blips.map((b, i) => {
      const local = new THREE.Vector3(Math.cos(b.a) * b.r * this.radarR, 70, -Math.sin(b.a) * b.r * this.radarR);
      const w = local.applyQuaternion(radarQuat).add(this.RADAR);
      return dom.add(q(`[data-o="node-${i}"]`), {
        world: new THREE.Matrix4().makeTranslation(w.x, w.y, w.z),
        billboard: true,
        show: [nodeWin[0] + i * 4, nodeWin[1] + i * 4, nodeWin[2], nodeWin[3]],
        from: { o: 0 },
        to: { o: 0 },
      });
    });

    // Tarjetas de hallazgo que se ensamblan al entrar.
    const fInt = F("c1-intro");
    const findPoses = [
      { x: -60, y: 240, z: 200, ry: 8, rz: 2 },
      { x: 560, y: 290, z: 160, ry: -16, rz: -2 },
      { x: 560, y: -290, z: 120, ry: -12 },
    ];
    this.findPoses = findPoses;
    const wi = W("c1-intro", { pre: 0.3 });
    findPoses.forEach((p, i) =>
      dom.add(q(`[data-o="finding-${i}"]`), {
        anchor: fInt,
        pose: p,
        show: [wi[0] + 14 + i * 6, wi[1] + 6 + i * 6, wi[2] + 20, wi[3] + 30],
        from: { z: 700, x: 120, rx: 40, ry: -60, rz: 12, o: 0 },
        to: { z: -500, o: 0 },
      }),
    );

    // ── Exposición digital (TEM) ───────────────────────────────────────
    hud.add(q('[data-hud="tem-head"]'), { show: W("c1-tem") });
    dom.add(q('[data-o="tem-aside"]'), {
      anchor: F("c1-tem"),
      pose: { x: 400, y: 70, z: 0, ry: -12 },
      show: W("c1-tem"),
      from: { x: 160, z: 400, ry: -30, o: 0 },
    });

    // Qué monitoreamos: chips en órbita alrededor del grafo.
    const wm = W("c1-monitor");
    dom.add(q('[data-o="tem-monitor-title"]'), {
      world: new THREE.Matrix4().makeTranslation(this.GLOBE.clone().add(new THREE.Vector3(0, 720, 0))),
      billboard: true,
      show: wm,
      from: { o: 0 },
    });
    const monitorN = exposicion.monitor.items.length;
    this.orbit = { R: 760, tilt: deg(14), n: monitorN };
    for (let i = 0; i < monitorN; i++) {
      const phase = (i / monitorN) * Math.PI * 2;
      const lift = ((i % 3) - 1) * 70;
      dom.add(q(`[data-o="tem-mon-${i}"]`), {
        world: (t) => orbitMatrix(this.GLOBE, this.orbit, phase, lift, t, ctx.clock()),
        billboard: true,
        show: [wm[0] + i * 3, wm[1] + i * 2, wm[2], wm[3]],
        from: { o: 0 },
      });
    }

    const fd = F("c1-deliver");
    const wd = W("c1-deliver");
    dom.add(q('[data-o="tem-product"]'), { anchor: fd, pose: { x: -290, y: 0, z: 40, ry: 10 }, show: wd, from: { x: -200, z: 400, ry: 35, o: 0 } });
    dom.add(q('[data-o="tem-deliver"]'), { anchor: fd, pose: { x: 330, y: 10, z: 60, ry: -10 }, show: [wd[0] + 8, wd[1] + 8, wd[2], wd[3]], from: { x: 200, z: 400, ry: -35, o: 0 } });

    // Proceso 01–05 en fila, con perspectiva.
    const ff = F("c1-flow");
    const wf = W("c1-flow");
    hud.add(q('[data-hud="tem-flow"]'), { show: wf });
    for (let i = 0; i < 5; i++) {
      dom.add(q(`[data-o="tem-step-${i}"]`), {
        anchor: ff,
        pose: { x: -500 + i * 292, y: 30 - i * 10, z: -160 + i * 150, ry: -22 },
        show: [wf[0] + i * 7, wf[1] + i * 7, wf[2] + i * 3, wf[3] + i * 3],
        from: { y: -260, z: 300, rx: -30, o: 0 },
      });
    }

    // Planes Leak Monitor / Plus / Dark Web Pro con profundidad escalonada.
    const fp = F("c1-plans");
    const wp = W("c1-plans");
    [
      { x: -370, y: 10, z: 170, ry: 12 },
      { x: 0, y: 20, z: -60, ry: 0 },
      { x: 370, y: 10, z: 170, ry: -12 },
    ].forEach((pose, i) =>
      dom.add(q(`[data-o="tem-plan-${i}"]`), { anchor: fp, pose, show: [wp[0] + i * 8, wp[1] + i * 8, wp[2], wp[3]], from: { y: -200, z: 500, rx: -20, o: 0 } }),
    );

    // ── PyME + WhatsApp Security Assistant ─────────────────────────────
    const fy = F("c1-pyme");
    const wy = W("c1-pyme");
    hud.add(q('[data-hud="pyme-head"]'), { show: wy });
    dom.add(q('[data-o="pyme-hero"]'), { anchor: fy, pose: { x: 505, y: 40, z: 40, ry: -16, s: 0.9 }, show: [wy[0] + 10, wy[1] + 10, wy[2], wy[3]], from: { x: 200, z: 400, ry: -40, o: 0 } });

    // Chat en la pantalla del teléfono: visible desde PyME hasta el último cluster.
    const phoneScreen = new THREE.Matrix4().compose(PHONE.clone().add(new THREE.Vector3(0, 0, 21).applyQuaternion(phoneQuat)), phoneQuat, new THREE.Vector3(1, 1, 1));
    const chatWin = [wy[0], wy[1] - 10, dir.get("c1-cl2").end, W("c1-cl2")[3]];
    this.chatItem = dom.add(q('[data-o="phone-chat"]'), { world: phoneScreen, show: chatWin, from: { o: 0 }, to: { o: 0 } });
    const bubbles = [...document.querySelectorAll("[data-bubble]")];
    this.bubbles = bubbles.map((el, i) => ({ el, t: dir.get("c1-pyme").t - 20 + i * 16 }));

    // Tres clusters de productos (2 × 2) alrededor del teléfono.
    const clusterLayout = [
      { id: "c1-cl0", cx: -190, cy: -20 },
      { id: "c1-cl1", cx: 230, cy: -20 },
      { id: "c1-cl2", cx: 220, cy: -20 },
    ];
    clusterLayout.forEach(({ id, cx, cy }, ci) => {
      const f = F(id);
      const w = W(id);
      dom.add(q(`[data-o="pyme-cl-${ci}"]`), { anchor: f, pose: { x: cx - 150, y: cy + 372, z: 0 }, show: w, from: { y: 60, o: 0 } });
      pyme.clusters[ci].items.forEach((_, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        dom.add(q(`[data-o="pyme-${ci}-${i}"]`), {
          anchor: f,
          pose: { x: cx + (col ? 156 : -156), y: cy + (row ? -165 : 158), z: col * 40 + row * 30, ry: col ? -6 : 6 },
          show: [w[0] + i * 6, w[1] + i * 6, w[2], w[3]],
          from: { x: col ? 220 : -220, z: 460, ry: col ? -40 : 40, o: 0 },
        });
      });
    });

    // Paquete fuerte + 5 paquetes PyME.
    const fk = F("c1-pkg");
    const wk = W("c1-pkg");
    dom.add(q('[data-o="pyme-focus"]'), { anchor: fk, pose: { x: -440, y: 0, z: 0, ry: 12 }, show: wk, from: { x: -200, z: 400, o: 0 } });
    const pkgPoses = [
      { x: -60, y: 160 },
      { x: 205, y: 160 },
      { x: 470, y: 160 },
      { x: 70, y: -175 },
      { x: 335, y: -175 },
    ];
    pkgPoses.forEach((p, i) =>
      dom.add(q(`[data-o="pyme-pkg-${i}"]`), {
        anchor: fk,
        pose: { ...p, z: i * 20, ry: -8 },
        show: [wk[0] + i * 6, wk[1] + i * 6, wk[2], wk[3]],
        from: { y: p.y - 200, z: 500, rx: -25, o: 0 },
      }),
    );

    // ── Awareness ──────────────────────────────────────────────────────
    const fa = F("c1-aw");
    const wa = W("c1-aw");
    hud.add(q('[data-hud="aw-head"]'), { show: wa });
    dom.add(q('[data-o="aw-sum-0"]'), { anchor: fa, pose: { x: 360, y: 0, z: 0, ry: -12 }, show: [wa[0] + 10, wa[1] + 10, wa[2], wa[3]], from: { x: 220, z: 400, ry: -40, o: 0 } });
    const fs = F("c1-aw-sum");
    const ws = W("c1-aw-sum");
    dom.add(q('[data-o="aw-sum-1"]'), { anchor: fs, pose: { x: -240, y: 20, z: -120, ry: 10, s: 1.08 }, show: ws, from: { x: -200, z: 400, ry: 35, o: 0 } });
    dom.add(q('[data-o="aw-sum-2"]'), { anchor: fs, pose: { x: 240, y: 0, z: -120, ry: -10, s: 1.08 }, show: [ws[0] + 8, ws[1] + 8, ws[2], ws[3]], from: { x: 200, z: 400, ry: -35, o: 0 } });

    const fap = F("c1-aw-plans");
    const wap = W("c1-aw-plans");
    [
      { x: -370, y: 0, z: 160, ry: 12 },
      { x: 0, y: 10, z: -60, ry: 0 },
      { x: 370, y: 0, z: 160, ry: -12 },
    ].forEach((pose, i) =>
      dom.add(q(`[data-o="aw-plan-${i}"]`), { anchor: fap, pose, show: [wap[0] + i * 8, wap[1] + i * 8, wap[2], wap[3]], from: { y: -200, z: 500, rx: -20, o: 0 } }),
    );

    const fw = F("c1-aw-wa");
    const ww = W("c1-aw-wa");
    hud.add(q('[data-hud="aw-wa"]'), { show: ww });
    awareness.map.forEach((_, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      dom.add(q(`[data-o="aw-map-${i}"]`), {
        anchor: fw,
        pose: { x: 150 + col * 290, y: 150 - row * 120, z: col * 50, ry: -10 },
        show: [ww[0] + i * 5, ww[1] + i * 5, ww[2], ww[3]],
        from: { x: 160, z: 300, o: 0 },
      });
    });

    // Cursos: se despliegan en abanico con el scroll.
    const fc = F("c1-courses");
    const wc = W("c1-courses");
    hud.add(q('[data-hud="aw-courses"]'), { show: wc });
    const cs = dir.get("c1-courses");
    for (let i = 0; i < 10; i++) {
      const col = i % 5;
      const row = Math.floor(i / 5);
      const final = { x: -500 + col * 250, y: row ? -150 : 140, z: Math.abs(col - 2) * 40, rz: 0, ry: (2 - col) * 5 };
      dom.add(q(`[data-o="aw-course-${i}"]`), {
        anchor: fc,
        pose: { ...final },
        show: [wc[0], wc[1], wc[2], wc[3]],
        from: { o: 0 },
        live: (t, pose) => {
          // Del mazo cerrado (centro) al abanico final entre la llegada y la mitad del hold.
          const k = THREE.MathUtils.smoothstep(t, cs.t - 40, cs.t + cs.hold * 0.45);
          const spread = (i - 4.5) * 7;
          pose.x = THREE.MathUtils.lerp(0 + (i - 4.5) * 8, final.x, k);
          pose.y = THREE.MathUtils.lerp(-40 - Math.abs(i - 4.5) * 6, final.y, k);
          pose.z = THREE.MathUtils.lerp(120 - i * 6, final.z, k);
          pose.rz = THREE.MathUtils.lerp(-spread, 0, k);
          pose.ry = THREE.MathUtils.lerp(0, final.ry, k);
        },
      });
    }

    // Frase de transición sobre las letras gigantes.
    const lt = dir.get("c1-letters");
    hud.add(q('[data-hud="risk"]'), { show: [lt.t - 30, lt.t + 5, lt.end - 25, lt.end + 10] });

    // ── Ambiente ───────────────────────────────────────────────────────
    const h3 = dir.get("h3");
    env.push(
      { t: h3.end - 4, color: "#0A0A0A", near: 3000, far: 9000, bloom: 1.4, vignette: 0.3, grain: 0.04 },
      { t: h3.end + 14, color: "#FFFFFF", near: 600, far: 3600, bloom: 0.6, vignette: 0.02, grain: 0.02 },
      { t: intro.t - 22, color: "#F7F7F5", near: 2600, far: 12000, bloom: 0.3, vignette: 0.08, grain: 0.025 },
      // Niebla más lejana en las letras: a 3.9k de distancia se ven nítidas, no grises.
      { t: lt.t - 10, color: "#F7F7F5", near: 3800, far: 16000, bloom: 0.3, vignette: 0.09, grain: 0.026 },
      // El fondo se oscurece cuando la frase ya salió, mientras la cámara cruza las letras.
      { t: lt.end + 5, color: "#F7F7F5", near: 3800, far: 16000, bloom: 0.3, vignette: 0.09, grain: 0.026 },
      { t: lt.end + 40, color: "#0A0A0A", near: 2400, far: 11000, bloom: 1.2, vignette: 0.3, grain: 0.04 },
    );

    this.range = [h3.t, dir.get("c1-through").end + 40];
  },

  async build(ctx) {
    const { buildDetectar } = await import("./build.js");
    return buildDetectar(ctx, this);
  },
};

const tmpM = new THREE.Matrix4();
function orbitMatrix(G, orbit, phase, lift, t, clock) {
  const a = phase + clock * 0.07 + t * 0.006;
  const x = Math.cos(a) * orbit.R;
  const z = Math.sin(a) * orbit.R * 0.36;
  const y = lift + Math.sin(a) * Math.sin(orbit.tilt) * orbit.R * 0.5;
  return tmpM.makeTranslation(G.x + x, G.y + y, G.z + z);
}
