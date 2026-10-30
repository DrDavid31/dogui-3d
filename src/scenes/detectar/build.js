import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { loadFont } from "../../core/assets.js";
import { placeInView } from "../../core/camera.js";
import { ramp } from "../../core/timeline.js";
import { M, glow, fatLines, rng } from "../shared/materials.js";
import { radar, threatGlobe, hexShield, ARTIFACTS, envelope, leakedDoc, credentialCard, accessKey, crowd, pipeline, phone as phoneModel } from "../shared/cyber.js";
import { LETTERS } from "./index.js";
import { studioLight } from "../shared/lights.js";

const at = (frame, pose) => new THREE.Vector3().setFromMatrixPosition(placeInView(frame, pose));
const quatOf = (frame, rx = 0, ry = 0, rz = 0) => new THREE.Quaternion().setFromRotationMatrix(frame).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)));
const deg = THREE.MathUtils.degToRad;

export async function buildDetectar(ctx, scene) {
  const { stage, dir } = ctx;
  const F = (id) => dir.frame(id);
  const S = (id) => dir.get(id);
  const group = new THREE.Group();
  group.name = "detectar";
  // Oculto hasta que world.js compile sus shaders (si se dibuja antes, congela el cuadro).
  group.visible = false;
  stage.scene.add(group);
  const { RADAR, radarQuat, GLOBE, PHONE, phoneQuat } = scene.points;
  const m = M();


  const parts = []; // { obj, on: [a, b], update?(t, clock, dt) }
  const add = (obj, on, update) => {
    group.add(obj);
    parts.push({ obj, on, update });
    return obj;
  };

  // ── Radar de detección + hallazgos conectados a sus blips ──────────────
  const rd = radar({ r: scene.radarR, blips: scene.blips });
  rd.group.position.copy(RADAR);
  rd.group.quaternion.copy(radarQuat);
  const intro = S("c1-intro");
  const tem = S("c1-tem");
  add(rd.group, [intro.t - 40, tem.end + 80], (t, clock) => {
    rd.update(clock);
    const k = ramp(t, intro.t - 38, intro.t - 6);
    rd.group.scale.setScalar(0.82 + 0.18 * k);
  });
  // Línea fina de cada hallazgo a su blip (detectado → tarjeta).
  rd.group.updateMatrixWorld(true);
  const fInt = F("c1-intro");
  const linkPairs = [
    [0, 1],
    [1, 3],
    [2, 4],
  ];
  const linkPos = [];
  for (const [fi, bi] of linkPairs) {
    const a = rd.blips[bi].p.clone().applyMatrix4(rd.group.matrixWorld);
    const b = at(fInt, scene.findPoses[fi]);
    linkPos.push(a.x, a.y, a.z, b.x, b.y, b.z);
  }
  const links = fatLines(linkPos, { color: 0xff6b00, width: 1.4, opacity: 0.9 });
  add(links, [intro.t - 20, tem.t - 20], (t) => {
    links.material.opacity = ramp(t, intro.t - 18, intro.t + 8) * (1 - ramp(t, intro.end, tem.t - 24)) * 0.9;
  });

  // ── Globo de amenazas: lo que vigilamos en todo internet ───────────────
  const gl = threatGlobe({ r: 520, arcs: 11 });
  gl.group.position.copy(GLOBE);
  const mon = S("c1-monitor");
  const orbitRing = fatLines(ringPoints(scene.orbit.R, scene.orbit.tilt), { color: 0x9a9893, width: 1.2, opacity: 0.7 });
  orbitRing.position.copy(GLOBE);
  add(orbitRing, [mon.t - 70, mon.end + 60]);
  add(gl.group, [tem.t - 80, S("c1-deliver").end + 40], (t, clock) => {
    gl.update(clock);
    gl.group.rotation.y = clock * 0.05 + t * 0.002;
  });

  // ── Evidencia: artefactos sobre una plataforma de escaneo ─────────────
  const del = S("c1-deliver");
  const fDel = F("c1-deliver");
  const scanner = new THREE.Group();
  scanner.position.copy(at(fDel, { x: 40, y: -200, z: 700 }));
  scanner.scale.setScalar(1.15);
  scanner.quaternion.copy(quatOf(fDel, deg(18), deg(-8)));
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(330, 350, 28, 96), m.black);
  scanner.add(plate);
  const plateRim = new THREE.Mesh(new THREE.TorusGeometry(331, 2.6, 8, 128), m.led);
  plateRim.rotation.x = Math.PI / 2;
  plateRim.position.y = 15;
  glow(plateRim);
  scanner.add(plateRim);
  const evid = [envelope(), leakedDoc(), credentialCard(), accessKey()];
  const evidPos = [
    [-170, 120, 40, -0.4],
    [-30, 150, -110, 0.15],
    [130, 120, 30, -0.1],
    [40, 110, 140, 0.5],
  ];
  evid.forEach((o, i) => {
    const [x, y, z, ry] = evidPos[i];
    o.position.set(x, y, z);
    o.rotation.set(-0.35, ry, 0.08 * (i - 1.5));
    o.userData.base = y;
    scanner.add(o);
  });
  const beam = new THREE.Mesh(new THREE.PlaneGeometry(720, 300), new THREE.MeshBasicMaterial({ map: beamTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide, toneMapped: false, blending: THREE.NormalBlending }));
  beam.position.y = 150;
  beam.rotation.y = Math.PI / 2;
  glow(beam);
  scanner.add(beam);
  // Se retira antes de que la cámara viaje a través de su posición.
  add(scanner, [del.t - 120, del.end + 22], (t, clock) => {
    beam.position.x = Math.sin(clock * 1.1) * 260;
    evid.forEach((o, i) => {
      o.position.y = o.userData.base + Math.sin(clock * 1.2 + i) * 10;
    });
  });

  // ── Proceso 01–05: pipeline que corre bajo las tarjetas ────────────────
  const flow = S("c1-flow");
  const fFlow = F("c1-flow");
  // Bajo la fila de tarjetas, a su misma profundidad (x,y en px de pantalla a esa distancia).
  const D0 = 1236;
  const pts = [
    { X: -900, Y: -250, z: 100 },
    { X: -520, Y: -255, z: 60 },
    { X: -230, Y: -262, z: 210 },
    { X: 60, Y: -268, z: 360 },
    { X: 350, Y: -272, z: 510 },
    { X: 640, Y: -276, z: 660 },
    { X: 1000, Y: -280, z: 860 },
  ].map((p) => at(fFlow, { x: (p.X * (D0 + p.z)) / D0, y: (p.Y * (D0 + p.z)) / D0, z: p.z }));
  const pipe = pipeline(pts, { radius: 11, packets: 12, nodes: [0.16, 0.33, 0.5, 0.66, 0.82] });
  add(pipe.group, [flow.t - 110, flow.end + 30], (t, clock) => pipe.update(clock));

  // ── Planes: capas de defensa (1, 2 y 3 anillos) detrás de cada tarjeta ──
  const plans = S("c1-plans");
  const fPlans = F("c1-plans");
  const layers = new THREE.Group();
  const D2 = 1236;
  [-370, 0, 370].forEach((X, i) => {
    const z = 520;
    const c = at(fPlans, { x: (X * (D2 + z)) / D2, y: (-20 * (D2 + z)) / D2, z });
    for (let k = 0; k <= i; k++) {
      const R = 300 + k * 70;
      const ring = fatLines(arcPoints(R, -0.5, Math.PI * 1.25), { color: k === i ? 0xff6b00 : 0x9a9893, width: k === i ? 2.2 : 1.4, opacity: 0.95 });
      ring.position.copy(c);
      ring.quaternion.copy(quatOf(fPlans, Math.PI / 2));
      layers.add(ring);
    }
  });
  add(layers, [plans.t - 40, plans.end + 30]);

  // ── PyME: teléfono protegido por un escudo hexagonal ───────────────────
  const pyme = S("c1-pyme");
  const ph = phoneModel();
  ph.position.copy(PHONE);
  ph.quaternion.copy(phoneQuat);
  const shield = hexShield({ r: 700, cap: 0.82, cell: 58 });
  shield.mesh.material.opacity = 0.45;
  // El casquete envuelve al teléfono por detrás: su ápice queda tras el teléfono.
  shield.group.position.copy(PHONE).add(new THREE.Vector3(0, 0, -660).applyQuaternion(phoneQuat));
  shield.group.quaternion.copy(phoneQuat);
  const flyers = [envelope(), leakedDoc(), envelope()];
  flyers.forEach((f) => {
    f.scale.setScalar(0.8);
    group.add(f);
  });
  const screenOffset = new THREE.Matrix4().makeTranslation(0, 0, 21);
  const phoneOn = [pyme.t - 160, S("c1-cl2").end + 60];
  const right = new THREE.Vector3(1, 0, 0).applyQuaternion(phoneQuat);
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(phoneQuat);
  add(ph, phoneOn, (t, clock) => {
    ph.position.y = PHONE.y + Math.sin(clock * 0.9) * 8;
    ph.updateMatrixWorld();
    scene.chatItem?.world.copy(ph.matrixWorld).multiply(screenOffset);
  });
  add(shield.group, phoneOn, (t, clock) => shield.update(clock));
  // Mensajes que orbitan el escudo: lo que llega al canal y se analiza.
  parts.push({
    obj: { visible: true },
    on: phoneOn,
    update: (t, clock) => {
      flyers.forEach((f, i) => {
        const a = clock * 0.35 + i * 2.1;
        f.position.copy(PHONE).addScaledVector(right, 260 + Math.cos(a) * 420).addScaledVector(fwd, Math.sin(a) * 220 - 380);
        f.position.y = PHONE.y + Math.sin(a * 1.3) * 260;
        f.rotation.set(Math.sin(a) * 0.3, a, 0.1);
        f.visible = t > phoneOn[0] && t < phoneOn[1];
      });
    },
  });

  // ── Awareness: el factor humano pasa de "en riesgo" a "capacitado" ─────
  const aw = S("c1-aw");
  const awPlans = S("c1-aw-plans");
  const people = crowd({ cols: 4, rows: 3, gap: 150 });
  const fSum = F("c1-aw-sum");
  people.group.position.copy(at(fSum, { x: 0, y: -360, z: 1100 }));
  people.group.quaternion.copy(quatOf(fSum, deg(10)));
  // Se retira antes de que la cámara pase por encima.
  add(people.group, [aw.t - 50, S("c1-aw-sum").end + 24], (t, clock) => {
    people.update(clock, ramp(t, aw.t, S("c1-aw-sum").end));
  });

  // ── Artefactos flotando en los bordes del encuadre (lejos del texto) ───
  const rand = rng(21);
  const drifting = [];
  const D1 = 1236;
  const along = dir.list.filter((s) => s.id.startsWith("c1-") && !["c1-letters", "c1-through", "c1-intro", "c1-courses"].includes(s.id));
  along.forEach((s, i) => {
    const make = ARTIFACTS[i % ARTIFACTS.length];
    const o = make();
    // Pantalla: esquina superior/inferior derecha o borde superior izquierdo.
    const spots = [
      [760, 330],
      [740, -360],
      [-520, 390],
      [790, 40],
    ];
    const [X, Y] = spots[i % spots.length];
    const z = 1500 + rand() * 1100;
    o.position.copy(at(s.frame, { x: (X * (D1 + z)) / D1, y: (Y * (D1 + z)) / D1, z }));
    o.scale.setScalar(1.6 + rand() * 0.6);
    o.rotation.set(rand() * 0.8 - 0.4, rand() * 6, rand() * 0.6 - 0.3);
    o.userData.spin = (rand() - 0.5) * 0.35;
    o.userData.on = [s.t - 150, s.end + 110];
    group.add(o);
    drifting.push(o);
  });

  // ── Letras gigantes DETECTAR ───────────────────────────────────────────
  const font = await loadFont();
  // Siempre transparente: alternar transparent cambia la variante del shader y la
  // recompila justo cuando aparecen las letras.
  const letterMat = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0c, roughness: 0.42, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.4, envMapIntensity: 0.9, transparent: true });
  const letters = new THREE.Group();
  const glyphs = [...LETTERS.word].map((ch) => {
    const geo = new TextGeometry(ch, { font, size: LETTERS.height, depth: LETTERS.depth, curveSegments: 10, bevelEnabled: true, bevelThickness: 14, bevelSize: 10, bevelSegments: 4 });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-bb.min.x, 0, -LETTERS.depth / 2);
    const mesh = new THREE.Mesh(geo, letterMat);
    mesh.castShadow = true;
    return { mesh, w: bb.max.x - bb.min.x };
  });
  let x = 0;
  const xs = glyphs.map((g) => {
    const p = x;
    x += g.w + LETTERS.gap;
    return p;
  });
  const passGapCenter = xs[LETTERS.passIndex] + glyphs[LETTERS.passIndex].w + LETTERS.gap / 2;
  glyphs.forEach((g, i) => {
    g.mesh.position.set(LETTERS.x + xs[i] - passGapCenter, LETTERS.y, LETTERS.z);
    letters.add(g.mesh);
  });
  group.add(letters);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(26000, 16000), new THREE.ShadowMaterial({ color: 0x0a0a0a, opacity: 0.16 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(LETTERS.x, LETTERS.y - 2, LETTERS.z);
  ground.receiveShadow = true;
  group.add(ground);

  // Luz de sombras compartida (renderer.js): se apunta a las letras.
  const shadowLight = stage.lights.shadow;
  shadowLight.position.set(LETTERS.x - 3200, LETTERS.y + 5200, LETTERS.z + 3800);
  shadowLight.target.position.set(LETTERS.x, LETTERS.y, LETTERS.z - 400);
  Object.assign(shadowLight.shadow.camera, { left: -7000, right: 7000, top: 3000, bottom: -4200, near: 100, far: 14000 });
  shadowLight.shadow.camera.updateProjectionMatrix();

  const lt = S("c1-letters");
  const lettersOn = [lt.t - 62, S("c1-through").end + 40];
  const bubbles = scene.bubbles;
  return {
    group,
    update: (t, clock, dt) => {
      for (const p of parts) {
        const on = t > p.on[0] && t < p.on[1];
        p.obj.visible = on;
        if (on && p.update) p.update(t, clock, dt);
      }
      for (const o of drifting) {
        const on = t > o.userData.on[0] && t < o.userData.on[1];
        o.visible = on;
        if (on) o.rotation.y += o.userData.spin * dt;
      }
      for (const b of bubbles) {
        const on = t >= b.t;
        if (on !== b.on) {
          b.on = on;
          b.el.classList.toggle("is-in", on);
        }
      }

      // Letras: emergen de la niebla; sombras solo cuando están en escena.
      const lOn = t > lettersOn[0] && t < lettersOn[1];
      letters.visible = ground.visible = lOn;
      const appear = ramp(t, lt.t - 60, lt.t - 22);
      letterMat.opacity = appear;
      letters.position.y = (1 - appear) * -260;
      if (lOn) stage.renderer.shadowMap.needsUpdate = true;
      const dark = ramp(t, lt.t + lt.hold * 0.35, lt.end + 20);
      letterMat.envMapIntensity = 0.9 * (1 - dark) + 0.25;
      ground.material.opacity = 0.16 * (1 - dark);
    },
    light: studioLight(stage),
  };
}

/** Arco en el plano XZ (para fatLines): de a0 a a1 radianes. */
function arcPoints(R, a0, a1, n = 96) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    const b = a0 + ((a1 - a0) * (i + 1)) / n;
    out.push(Math.cos(a) * R, 0, Math.sin(a) * R, Math.cos(b) * R, 0, Math.sin(b) * R);
  }
  return out;
}

function ringPoints(R, tilt) {
  const out = [];
  const n = 160;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const b = ((i + 1) / n) * Math.PI * 2;
    const p = (u) => [Math.cos(u) * R, Math.sin(u) * Math.sin(tilt) * R * 0.5, Math.sin(u) * R * 0.36];
    out.push(...p(a), ...p(b));
  }
  return out;
}

function beamTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 64, 0);
  grd.addColorStop(0, "rgba(255,107,0,0)");
  grd.addColorStop(0.5, "rgba(255,107,0,0.55)");
  grd.addColorStop(1, "rgba(255,107,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 256);
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, "rgba(0,0,0,1)");
  v.addColorStop(1, "rgba(0,0,0,0)");
  g.globalCompositeOperation = "destination-out";
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 90);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
