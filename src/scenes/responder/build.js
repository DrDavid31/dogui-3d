import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { placeInView } from "../../core/camera.js";
import { ramp } from "../../core/timeline.js";
import { M, glow, fatLines } from "../shared/materials.js";
import { rackRow, socWall, gridFloor, edgeCubes, dust, letters3d, text3d, mexicoMap } from "../shared/ops.js";

const at = (frame, pose) => new THREE.Vector3().setFromMatrixPosition(placeInView(frame, pose));
const quatOf = (frame, rx = 0, ry = 0, rz = 0) => new THREE.Quaternion().setFromRotationMatrix(frame).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)));

export async function buildResponder(ctx, scene) {
  const { stage, dir } = ctx;
  const F = (id) => dir.frame(id);
  const S = (id) => dir.get(id);
  const m = M();
  const group = new THREE.Group();
  group.name = "responder";
  stage.scene.add(group);
  const { O, X2, FLOOR, CORRIDOR } = scene;

  // Luces: relleno tenue + llave y contraluz para que el cromo tenga brillos.
  const hemi = new THREE.HemisphereLight(0x9a9a9a, 0x0a0a0a, 0.55);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4);
  group.add(hemi, key, key.target, rim, rim.target);

  const parts = [];
  const add = (obj, on, update) => {
    group.add(obj);
    parts.push({ obj, on, update });
    return obj;
  };
  const intro = S("c2-intro");
  const last = S("c2-spei-2");

  // ── Piso en cuadrícula, polvo y cubos con borde naranja ────────────────
  const floor = gridFloor({ size: 70000, cell: 320 });
  floor.position.set((O.x + X2) / 2, FLOOR, (O.z + last.pos.z) / 2);
  add(floor, [intro.t - 140, last.end + 100]);
  const dustA = dust({ count: 1400, box: [16000, 3200, 40000], size: 6 });
  dustA.position.set((O.x + X2) / 2, FLOOR, O.z + 1500);
  add(dustA, [intro.t - 140, last.end + 100]);
  const cubes = edgeCubes({
    count: 150,
    box: [14000, 2600, 38000],
    // Lejos de la trayectoria (el pasillo y el inicio del capítulo).
    avoid: (x) => Math.abs(x + (O.x + X2) / 2 - X2) < 1300 || Math.abs(x + (O.x + X2) / 2 - O.x) < 900,
  });
  cubes.mesh.position.set((O.x + X2) / 2, FLOOR + 300, O.z + 1000);
  add(cubes.mesh, [intro.t - 140, last.end + 100], (t, clock) => cubes.update(clock));

  // ── Letras cromadas RESPONDER ──────────────────────────────────────────
  const word = await letters3d("RESPONDER", { size: 1050, depth: 260, gap: 90 });
  word.group.position.set(scene.LETTERS.x, FLOOR, scene.LETTERS.z);
  const lt = S("c2-letters");
  add(word.group, [intro.t - 140, lt.end + 60], (t) => {
    // Cada letra se eleva desde el piso al llegar.
    word.items.forEach((it, i) => {
      const k = ramp(t, intro.t - 120 + i * 6, intro.t - 40 + i * 6);
      it.position.y = (1 - k) * -900;
    });
  });

  // ── Pasillo de racks del centro de operaciones ─────────────────────────
  const zMid = CORRIDOR.z0 - 3300;
  const left = rackRow({ count: 10, spacing: 660, seed: 4 });
  left.group.rotation.y = Math.PI / 2;
  left.group.position.set(X2 - 1450, FLOOR, zMid);
  const right = rackRow({ count: 10, spacing: 660, seed: 8 });
  right.group.rotation.y = -Math.PI / 2;
  right.group.position.set(X2 + 1450, FLOOR, zMid);
  const svcOn = [S("c2-svc-head").t - 160, S("c2-soc").end + 120];
  add(left.group, svcOn, (t, clock) => left.update(clock));
  add(right.group, svcOn, (t, clock) => right.update(clock));
  // Tira de luz en el techo del pasillo.
  const ceil = fatLines([X2 - 600, FLOOR + 2300, CORRIDOR.z0, X2 - 600, FLOOR + 2300, CORRIDOR.z0 - 7000, X2 + 600, FLOOR + 2300, CORRIDOR.z0, X2 + 600, FLOOR + 2300, CORRIDOR.z0 - 7000], { color: 0xff6b00, width: 2 });
  glow(ceil);
  add(ceil, svcOn);

  // Muro de monitores al fondo del pasillo.
  const wall = socWall({ cols: 4, rows: 2, w: 580, h: 326, radius: 2600 });
  wall.group.position.set(X2, FLOOR + 1150, CORRIDOR.z0 - 7400);
  add(wall.group, [S("c2-svc-head").t - 100, S("c2-soc").end + 90]);

  // Líneas de luz de la consola SOC a sus satélites.
  const fSoc = F("c2-soc");
  const center = at(fSoc, { x: 0, y: 30, z: 40 });
  const satLines = [];
  for (const p of scene.satPoses) {
    const b = at(fSoc, { ...p, z: p.z + 20 });
    satLines.push(center.x, center.y, center.z, b.x, b.y, b.z);
  }
  const links = fatLines(satLines, { color: 0xff6b00, width: 2, opacity: 0.9 });
  glow(links);
  const soc = S("c2-soc");
  add(links, [soc.t - 30, soc.end + 30], (t) => {
    links.material.opacity = ramp(t, soc.t - 20, soc.t + 10) * 0.9;
  });

  // ── Números cromados 24/7 · 360 · 90 ───────────────────────────────────
  for (const n of scene.numbers) {
    const st = S(n.id);
    const mesh = await text3d(n.value, { size: 560, depth: 150, bevel: 14 });
    const f = F(n.id);
    mesh.position.copy(at(f, { x: n.x, y: 110, z: 760 }));
    mesh.quaternion.copy(quatOf(f, 0, THREE.MathUtils.degToRad(n.x > 0 ? -10 : 10)));
    add(mesh, [st.t - 58, st.end + 34], (t) => {
      const k = ramp(t, st.t - 56, st.t - 6);
      mesh.scale.setScalar(0.7 + 0.3 * k);
    });
  }

  // ── Método: línea de luz bajo las tarjetas y pulso que avanza ──────────
  const meth = S("c2-method");
  const fM = F("c2-method");
  const mp = scene.methodPoses.map((p) => at(fM, { x: p.x, y: p.y, z: p.z + 30 }));
  const mPos = [];
  for (let i = 0; i < 3; i++) mPos.push(mp[i].x, mp[i].y, mp[i].z, mp[i + 1].x, mp[i + 1].y, mp[i + 1].z);
  const mLine = fatLines(mPos, { color: 0xff6b00, width: 2.4 });
  glow(mLine);
  const mDots = mp.map((p) => {
    const d = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 12), m.led);
    d.position.copy(p);
    glow(d);
    return d;
  });
  const mGroup = new THREE.Group();
  mGroup.add(mLine, ...mDots);
  add(mGroup, [meth.t - 60, meth.end + 50], (t) => {
    mDots.forEach((d, i) => d.scale.setScalar(t > meth.t - 10 + i * 12 ? 1.4 : 0.6));
  });

  // ── vCISO: roadmap 30 · 60 · 90 sobre el piso ──────────────────────────
  const RZ = scene.ROAD_Z;
  const roadPts = [
    [X2 + 1100, RZ + 900],
    [X2 + 700, RZ - 900],
    [X2 + 1200, RZ - 2800],
    [X2 + 600, RZ - 4800],
    [X2 + 1000, RZ - 7000],
  ].map(([x, z]) => new THREE.Vector3(x, FLOOR + 3, z));
  const roadCurve = new THREE.CatmullRomCurve3(roadPts);
  const road = new THREE.Mesh(ribbon(roadCurve, 160, 160), new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.7, envMapIntensity: 0.5, side: THREE.DoubleSide }));
  const dashPts = [];
  for (let i = 0; i < 80; i += 2) {
    const a = roadCurve.getPointAt(i / 80);
    const b = roadCurve.getPointAt((i + 1) / 80);
    dashPts.push(a.x, a.y + 2, a.z, b.x, b.y + 2, b.z);
  }
  const dashes = fatLines(dashPts, { color: 0xff6b00, width: 2.2 });
  glow(dashes);
  const roadGroup = new THREE.Group();
  roadGroup.add(road, dashes);
  for (const [u, label] of [
    [0.22, "30"],
    [0.52, "60"],
    [0.82, "90"],
  ]) {
    const p = roadCurve.getPointAt(u);
    const pylon = new THREE.Mesh(new RoundedBoxGeometry(60, 420, 60, 2, 10), m.black);
    pylon.position.set(p.x + 320, FLOOR + 210, p.z);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(62, 14, 62), m.led);
    cap.position.set(p.x + 320, FLOOR + 412, p.z);
    glow(cap);
    const num = await text3d(label, { size: 220, depth: 60, bevel: 6 });
    num.position.set(p.x + 320, FLOOR + 560, p.z);
    num.rotation.y = -0.35;
    roadGroup.add(pylon, cap, num);
  }
  add(roadGroup, [S("c2-vciso").t - 60, S("c2-vciso-eco").end + 60]);

  // ── SPEI/SPID: mapa de México en puntos ────────────────────────────────
  const sp = S("c2-spei");
  const fS = F("c2-spei");
  const map = mexicoMap({ scale: 40, step: 0.3 });
  map.group.position.copy(at(fS, { x: 330, y: 10, z: 900 }));
  map.group.quaternion.copy(quatOf(fS, -0.12, -0.32));
  add(map.group, [sp.t - 56, S("c2-spei-2").t + 20], (t, clock) => map.update(clock));

  const methodLit = scene.methodLit;
  return {
    group,
    update: (t, clock, dt) => {
      for (const p of parts) {
        const on = t > p.on[0] && t < p.on[1];
        p.obj.visible = on;
        if (on && p.update) p.update(t, clock, dt);
      }
      for (const l of methodLit) {
        const lit = t >= l.t;
        if (lit !== l.lit) {
          l.lit = lit;
          l.el?.classList.toggle("is-lit", lit);
        }
      }
      const cam = stage.camera.position;
      key.position.set(cam.x - 1800, cam.y + 2600, cam.z + 1200);
      key.target.position.set(cam.x, cam.y, cam.z - 2400);
      rim.position.set(cam.x + 2400, cam.y + 800, cam.z - 5200);
      rim.target.position.set(cam.x, cam.y, cam.z - 1600);
    },
  };
}

/** Cinta plana a lo largo de una curva (sobre el plano XZ). */
function ribbon(curve, width, segments) {
  const pos = [];
  const idx = [];
  const up = new THREE.Vector3(0, 1, 0);
  const side = new THREE.Vector3();
  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const p = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    side.crossVectors(up, tan).normalize().multiplyScalar(width / 2);
    pos.push(p.x - side.x, p.y, p.z - side.z, p.x + side.x, p.y, p.z + side.z);
    if (i < segments) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}
