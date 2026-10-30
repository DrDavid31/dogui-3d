import * as THREE from "three";
import { placeInView } from "../../core/camera.js";
import { ramp } from "../../core/timeline.js";
import { rng } from "../shared/materials.js";
import { ARTIFACTS } from "../shared/cyber.js";
import { logoTile } from "../shared/ops.js";
import { studioLight } from "../shared/lights.js";

const at = (frame, pose) => new THREE.Vector3().setFromMatrixPosition(placeInView(frame, pose));
const D0 = 1236;
const screenAt = (frame, X, Y, z) => at(frame, { x: (X * (D0 + z)) / D0, y: (Y * (D0 + z)) / D0, z });

export async function buildContacto(ctx, scene) {
  const { stage, dir } = ctx;
  const F = (id) => dir.frame(id);
  const S = (id) => dir.get(id);
  const group = new THREE.Group();
  group.name = "contacto";
  // Oculto hasta que world.js compile sus shaders (si se dibuja antes, congela el cuadro).
  group.visible = false;
  stage.scene.add(group);

  const parts = [];
  const add = (obj, on, update) => {
    group.add(obj);
    parts.push({ obj, on, update });
    return obj;
  };

  // ── Cierre: logo 3D grande con fragmentos (artefactos) orbitando ───────
  const fin = S("c4-final");
  const fF = F("c4-final");
  const tile = await logoTile({ size: 520, depth: 74 });
  const center = at(fF, { x: 0, y: 330, z: 1500 });
  tile.group.position.copy(center);
  tile.group.quaternion.setFromRotationMatrix(fF);
  const tileBase = tile.group.quaternion.clone();
  const orbit = new THREE.Group();
  orbit.position.copy(center);
  const rand = rng(31);
  const frags = ARTIFACTS.map((make, i) => {
    const o = make();
    o.scale.setScalar(1.1 + rand() * 0.5);
    o.userData = { a: (i / ARTIFACTS.length) * Math.PI * 2, r: 820 + rand() * 180, y: (rand() - 0.5) * 360, spin: (rand() - 0.5) * 0.6 };
    orbit.add(o);
    return o;
  });
  const spinQ = new THREE.Quaternion();
  const Y = new THREE.Vector3(0, 1, 0);
  add(tile.group, [fin.t - 46, fin.end + 50], (t, clock) => {
    spinQ.setFromAxisAngle(Y, Math.sin(clock * 0.5) * 0.45);
    tile.group.quaternion.copy(tileBase).multiply(spinQ);
    tile.group.position.y = center.y + Math.sin(clock * 0.9) * 12;
    const k = ramp(t, fin.t - 44, fin.t - 4);
    tile.group.scale.setScalar(0.7 + 0.3 * k);
  });
  add(orbit, [fin.t - 46, fin.end + 50], (t, clock) => {
    frags.forEach((o) => {
      const a = o.userData.a + clock * 0.12;
      // Órbita por detrás del logo: nunca lo tapa.
      o.position.set(Math.cos(a) * o.userData.r, o.userData.y + Math.sin(clock * 0.7 + a) * 30, Math.sin(a) * o.userData.r * 0.3 - 320);
      o.rotation.y += o.userData.spin * 0.016;
    });
  });

  // ── Contacto: artefactos tenues al fondo, lejos del formulario ─────────
  const ct = S("c4-contact");
  const fC = F("c4-contact");
  const bg = new THREE.Group();
  [
    [-820, 360, 2600],
    [860, -330, 2900],
    [900, 380, 3400],
    [-860, -360, 3100],
  ].forEach(([X, Yy, z], i) => {
    const o = ARTIFACTS[(i + 2) % ARTIFACTS.length]();
    o.position.copy(screenAt(fC, X, Yy, z));
    o.scale.setScalar(1.8);
    o.rotation.set(0.3, i, 0.1);
    bg.add(o);
  });
  add(bg, [ct.t - 100, ct.end + 400], (t, clock) => {
    bg.children.forEach((o, i) => (o.rotation.y += (i % 2 ? 0.003 : -0.003)));
  });

  return {
    group,
    light: studioLight(stage),
    update: (t, clock, dt) => {
      for (const p of parts) {
        const on = t > p.on[0] && t < p.on[1];
        p.obj.visible = on;
        if (on && p.update) p.update(t, clock, dt);
      }
    },
  };
}
