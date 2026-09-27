import * as THREE from "three";
import { CameraRig } from "./camera.js";

const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);

/**
 * Guion de la cámara. Cada escena declara "estaciones" en orden: una pose de cámara
 * donde se lee (hold) y el viaje previo para llegar (travel). El director calcula los
 * tiempos, arma la CatmullRomCurve3 y expone ventanas de tiempo y encuadres para
 * colocar contenido.
 */
export class Director {
  constructor(camera) {
    this.rig = new CameraRig(camera);
    this.list = [];
    this.byId = new Map();
    this.cursor = 0;
    this.marks = new Map();
  }

  /**
   * id, pos, target, drift (desplazamiento durante el hold), hold, travel,
   * via: [{ f, pos, target }] puntos intermedios del viaje (f ∈ 0..1).
   */
  station(id, { pos, target, drift = [0, 0, 0], driftTarget, hold = 60, travel = 60, via = [] }) {
    const t = this.cursor + travel;
    const s = { id, pos: V(pos), target: V(target), drift: V(drift), driftTarget: V(driftTarget || drift), hold, travel, via, t, end: t + hold, prevEnd: this.cursor };
    this.list.push(s);
    this.byId.set(id, s);
    this.cursor = s.end;
    return s;
  }

  /** Marca de tiempo libre (p. ej. inicio de capítulo) relativa al cursor actual. */
  mark(id, offset = 0) {
    this.marks.set(id, this.cursor + offset);
    return this.cursor + offset;
  }

  get(id) {
    const s = this.byId.get(id);
    if (!s) throw new Error(`Estación desconocida: ${id}`);
    return s;
  }

  get total() {
    return this.cursor;
  }

  finalize() {
    const keys = [];
    for (const s of this.list) {
      for (const v of s.via) {
        keys.push({ t: s.prevEnd + s.travel * v.f, pos: v.pos, target: v.target });
      }
      keys.push({ t: s.t, pos: s.pos, target: s.target });
      if (s.hold > 0) {
        keys.push({ t: s.end, pos: s.pos.clone().add(s.drift), target: s.target.clone().add(s.driftTarget) });
      }
    }
    this.rig.build(keys);
    for (const s of this.list) s.frame = this.rig.frame((s.t + s.end) / 2);
  }

  /** Encuadre (matriz de mundo de cámara) a mitad del hold de la estación. */
  frame(id) {
    return this.get(id).frame;
  }

  /**
   * Ventana de visibilidad [inA, inB, outA, outB] alrededor del hold.
   * pre / post: fracción del viaje de entrada / salida usada para aparecer / desaparecer.
   */
  win(id, { pre = 0.55, post = 0.45, lead = 0, lag = 0, until } = {}) {
    const s = this.get(id);
    const idx = this.list.indexOf(s);
    const next = this.list[idx + 1];
    const outTravel = next ? next.travel : 60;
    const endS = until ? this.get(until) : s;
    const endNext = this.list[this.list.indexOf(endS) + 1];
    const endTravel = endNext ? endNext.travel : 60;
    const inB = s.t - lead;
    const inA = inB - s.travel * pre;
    const outA = endS.end + lag;
    const outB = outA + (until ? endTravel : outTravel) * post;
    return [inA, inB, outA, outB];
  }
}
