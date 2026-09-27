import * as THREE from "three";
import { D } from "./camera.js";
import { clamp, invLerp, smooth, easeOut } from "./timeline.js";

const F = new THREE.Matrix4().makeScale(1, -1, 1);
const tmpM = new THREE.Matrix4();
const tmpV = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpS = new THREE.Vector3();
const OFF = "translate(-400vw, 0)";
const deg = THREE.MathUtils.degToRad;
const f = (n) => (Math.abs(n) < 1e-6 ? 0 : +n.toFixed(6));

/**
 * Proyecta elementos HTML en el mundo 3D usando la misma cámara que WebGL
 * (la matemática de CSS3DRenderer aplicada por elemento). El texto sigue siendo
 * HTML real: nítido, seleccionable, indexable y accesible.
 *
 * Cada objeto tiene:
 *  - anchor: matriz de mundo de una cámara de diseño (el encuadre donde se lee).
 *  - x, y, z, rx, ry, rz, s: pose dentro de ese encuadre (px de referencia / grados).
 *  - show: [inA, inB, outA, outB] en tiempo de scroll.
 *  - from / to: desplazamientos de entrada y salida (se ensamblan / se van).
 *  - live(time, pose): hook opcional para animaciones continuas (órbitas, abanicos).
 */
export class DomWorld {
  constructor(stage) {
    this.stage = stage;
    this.items = [];
    this.byEl = new Map();
    this.time = 0;
  }

  add(el, opts) {
    if (!el) return null;
    const item = {
      el,
      anchor: opts.anchor,
      pose: { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, ...opts.pose },
      show: opts.show,
      from: opts.from || { z: 260, ry: -8, o: 0 },
      to: opts.to || { z: -220, o: 0 },
      live: opts.live || null,
      world: opts.world || null, // matriz de mundo fija (ignora anchor/pose)
      billboard: opts.billboard || false,
      on: false,
      lastT: "",
      lastO: -1,
      lastZ: -1,
      v: 0,
    };
    this.items.push(item);
    this.byEl.set(el, item);
    return item;
  }

  visibility(item, t) {
    const [a, b, c, d] = item.show;
    const enter = invLerp(a, b, t);
    const exit = c == null ? 0 : invLerp(c, d, t);
    return { enter, exit };
  }

  update(t) {
    this.time = t;
    const cam = this.stage.camera;
    const P = this.stage.perspective;
    const view = cam.matrixWorldInverse;
    const W = this.stage.width;
    const H = this.stage.height;

    for (const it of this.items) {
      const { enter, exit } = this.visibility(it, t);
      const e = easeOut(enter);
      const x = smooth(exit);
      let o = e * (1 - x);
      const fromO = it.from.o ?? 0;
      const toO = it.to.o ?? 0;
      o = (fromO + (1 - fromO) * e) * (1 - x + toO * x);
      if (enter <= 0 || exit >= 1 || o <= 0.003) {
        this.off(it);
        continue;
      }

      // Pose actual = pose base + desplazamiento de entrada (1-e) + de salida (x).
      const p = it.pose;
      const a = 1 - e;
      const pose = {
        x: p.x + (it.from.x || 0) * a + (it.to.x || 0) * x,
        y: p.y + (it.from.y || 0) * a + (it.to.y || 0) * x,
        z: p.z + (it.from.z || 0) * a + (it.to.z || 0) * x,
        rx: p.rx + (it.from.rx || 0) * a + (it.to.rx || 0) * x,
        ry: p.ry + (it.from.ry || 0) * a + (it.to.ry || 0) * x,
        rz: p.rz + (it.from.rz || 0) * a + (it.to.rz || 0) * x,
        s: p.s * (1 + ((it.from.s ?? 1) - 1) * a) * (1 + ((it.to.s ?? 1) - 1) * x),
      };
      if (it.live) it.live(t, pose, it);

      let world;
      if (it.world) {
        world = tmpM.copy(typeof it.world === "function" ? it.world(t, pose) : it.world);
      } else {
        tmpV.set(pose.x, pose.y, -(D + pose.z));
        tmpE.set(deg(pose.rx), deg(pose.ry), deg(pose.rz));
        tmpQ.setFromEuler(tmpE);
        tmpS.setScalar(pose.s);
        world = tmpM.compose(tmpV, tmpQ, tmpS).premultiply(it.anchor);
      }

      if (it.billboard) {
        // Conserva la posición pero orienta el plano hacia la cámara actual.
        tmpV.setFromMatrixPosition(world);
        tmpS.setFromMatrixScale(world);
        world.compose(tmpV, cam.quaternion, tmpS);
      }

      // Vista: M = F · V · W · F  (ejes Y de CSS hacia abajo).
      const m = world.premultiply(view);
      const depth = -m.elements[14];
      if (depth < 40) {
        this.off(it);
        continue;
      }
      // Descarta lo que quedó muy fuera de cuadro.
      const sx = (m.elements[12] / depth) * P;
      const sy = (m.elements[13] / depth) * P;
      if (Math.abs(sx) > W * 1.6 || Math.abs(sy) > H * 1.6) {
        this.off(it);
        continue;
      }
      m.premultiply(F).multiply(F);
      const e2 = m.elements;
      const tr = `perspective(${f(P)}px) translateZ(${f(P)}px) matrix3d(${f(e2[0])},${f(e2[1])},${f(e2[2])},${f(e2[3])},${f(e2[4])},${f(e2[5])},${f(e2[6])},${f(e2[7])},${f(e2[8])},${f(e2[9])},${f(e2[10])},${f(e2[11])},${f(e2[12])},${f(e2[13])},${f(e2[14])},${f(e2[15])}) translate(-50%,-50%)`;

      const s = it.el.style;
      if (!it.on) {
        it.on = true;
        it.el.classList.add("is-on");
      }
      if (tr !== it.lastT) {
        s.transform = tr;
        it.lastT = tr;
      }
      const oq = Math.round(clamp(o) * 1000) / 1000;
      if (oq !== it.lastO) {
        s.opacity = oq;
        it.lastO = oq;
      }
      // Orden de pintado por profundidad (los elementos no comparten contexto 3D).
      const zi = Math.max(1, Math.round(100000 - depth) >> 3);
      if (zi !== it.lastZ) {
        s.zIndex = zi;
        it.lastZ = zi;
      }
      it.v = o;
    }
  }

  off(it) {
    if (!it.on && it.lastT === OFF) return;
    it.on = false;
    it.v = 0;
    it.el.classList.remove("is-on");
    const s = it.el.style;
    s.opacity = 0;
    s.transform = OFF;
    it.lastT = OFF;
    it.lastO = 0;
  }

  /** Tiempo en el que un elemento está completamente visible (para foco con teclado). */
  timeFor(el) {
    for (const [node, it] of this.byEl) {
      if (node === el || node.contains(el)) {
        const [, b, c] = it.show;
        return c == null ? b : (b + c) / 2;
      }
    }
    return null;
  }
}
