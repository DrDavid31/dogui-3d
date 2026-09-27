import * as THREE from "three";
import { FOV } from "./renderer.js";
import { monotoneMap } from "./timeline.js";

// Distancia de lectura de referencia: con FOV 40° y una ventana de 900 px de alto,
// un objeto a esta distancia se ve a escala 1:1 (1 unidad de mundo = 1 px CSS).
export const REF_H = 900;
export const D = REF_H / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const REF_ASPECT = 1.6;
const UP = new THREE.Vector3(0, 1, 0);

const v3 = (a) => (a.isVector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));

/**
 * La cámara recorre una CatmullRomCurve3 cuyos puntos de control son keyframes
 * con tiempo propio (vh de scroll). El tiempo se mapea al índice de keyframe con una
 * interpolación monótona, así la velocidad es continua y la cámara nunca retrocede.
 */
export class CameraRig {
  constructor(camera) {
    this.camera = camera;
    this.pos = new THREE.Vector3();
    this.target = new THREE.Vector3();
    this.dir = new THREE.Vector3();
    this.parallax = new THREE.Vector2();
    this.parallaxAmount = 1;
    this.roll = 0;
    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
  }

  build(keys) {
    keys = [...keys].sort((a, b) => a.t - b.t);
    this.keys = keys;
    this.posCurve = new THREE.CatmullRomCurve3(keys.map((k) => v3(k.pos)), false, "centripetal");
    this.tgtCurve = new THREE.CatmullRomCurve3(keys.map((k) => v3(k.target)), false, "centripetal");
    this.map = monotoneMap(
      keys.map((k) => k.t),
      keys.map((_, i) => i),
    );
    this.n = keys.length;
    this.end = keys[keys.length - 1].t;
  }

  sample(t, outPos, outTgt) {
    const u = this.map(t) / (this.n - 1);
    this.posCurve.getPoint(u, outPos);
    this.tgtCurve.getPoint(u, outTgt);
  }

  /** Matriz de mundo de la cámara "de diseño" en el tiempo t (sin parallax ni ajuste de encuadre). */
  frame(t, out = new THREE.Matrix4()) {
    const p = new THREE.Vector3();
    const g = new THREE.Vector3();
    this.sample(t, p, g);
    return lookMatrix(p, g, out);
  }

  update(t, pointer, aspect) {
    const cam = this.camera;
    this.sample(t, this.pos, this.target);
    this.dir.subVectors(this.target, this.pos).normalize();

    // En pantallas más angostas que 16:10 la cámara se aleja un poco para conservar el encuadre.
    const back = aspect < REF_ASPECT ? D * (REF_ASPECT / aspect - 1) : 0;
    cam.position.copy(this.pos).addScaledVector(this.dir, -back);
    cam.up.copy(UP);
    cam.lookAt(this.target);

    // Parallax sutil con el mouse (±2°).
    this.parallax.lerp(pointer, 0.06);
    const k = this.parallaxAmount;
    cam.rotateY(-this.parallax.x * THREE.MathUtils.degToRad(2) * k);
    cam.rotateX(this.parallax.y * THREE.MathUtils.degToRad(1.3) * k);
    if (this.roll) cam.rotateZ(this.roll);
    cam.updateMatrixWorld(true);
  }
}

export function lookMatrix(pos, target, out = new THREE.Matrix4()) {
  out.lookAt(pos, target, UP);
  out.setPosition(pos);
  return out;
}

/**
 * Coloca algo "en el encuadre" de una cámara: (x, y) en px de pantalla de referencia
 * y z como profundidad extra (positivo = más lejos). Devuelve la matriz de mundo.
 */
export function placeInView(camMatrix, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1 } = {}, out = new THREE.Matrix4()) {
  const local = new THREE.Matrix4().compose(
    new THREE.Vector3(x, y, -(D + z)),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(THREE.MathUtils.degToRad(rx), THREE.MathUtils.degToRad(ry), THREE.MathUtils.degToRad(rz))),
    new THREE.Vector3(s, s, s),
  );
  return out.multiplyMatrices(camMatrix, local);
}
