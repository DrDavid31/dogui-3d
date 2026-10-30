import * as THREE from "three";
import { placeInView } from "../../core/camera.js";
import { ramp } from "../../core/timeline.js";
import { M, ORANGE, glow, fatLines } from "../shared/materials.js";
import { speedLines, letters3d, text3d, beacon, gear, shieldCheck, cpuCore, pdcaRing, logoTile, dust, gridFloor } from "../shared/ops.js";

const at = (frame, pose) => new THREE.Vector3().setFromMatrixPosition(placeInView(frame, pose));
const quatOf = (frame, rx = 0, ry = 0, rz = 0) => new THREE.Quaternion().setFromRotationMatrix(frame).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)));
const D0 = 1236;
// Posición en pantalla (px de referencia) a una profundidad dada.
const screenAt = (frame, X, Y, z) => at(frame, { x: (X * (D0 + z)) / D0, y: (Y * (D0 + z)) / D0, z });

export async function buildAutomatizar(ctx, scene) {
  const { stage, dir } = ctx;
  const F = (id) => dir.frame(id);
  const S = (id) => dir.get(id);
  const m = M();
  const group = new THREE.Group();
  group.name = "automatizar";
  stage.scene.add(group);

  const hemi = new THREE.HemisphereLight(0xa0a0a0, 0x0a0a0a, 0.6);
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  const rim = new THREE.DirectionalLight(0xffffff, 1.4);
  group.add(hemi, key, key.target, rim, rim.target);

  const parts = [];
  const add = (obj, on, update) => {
    group.add(obj);
    parts.push({ obj, on, update });
    return obj;
  };
  const intro = S("c3-intro");
  const logoSt = S("c3-logo");

  // ── Hiperespacio (en espacio de cámara) ────────────────────────────────
  const lines = speedLines({ count: 560 });
  stage.camera.add(lines.mesh);
  const saas0 = S("c3-saas");
  const saas3 = S("c3-saas-3");
  let lastCam = null;
  let speed = 0;

  // Piso y polvo tenues para mantener la escala del espacio.
  const floor = gridFloor({ size: 60000, cell: 360 });
  floor.position.set(scene.O.x, -560, scene.O.z - 14000);
  floor.material.uniforms.uOpacity.value = 0.6;
  add(floor, [S("c3-soar").t - 100, S("c3-counters").end + 60]);
  const motes = dust({ count: 1200, box: [12000, 3000, 30000], size: 6, seed: 7 });
  motes.position.set(scene.O.x, -400, scene.O.z - 6000);
  add(motes, [intro.t - 140, S("c3-counters").end + 60]);

  // ── AUTOMATIZAR: letras blancas con bordes naranjas desde el punto de fuga ─
  const white = new THREE.MeshStandardMaterial({ color: 0xf4f4f2, roughness: 0.35, metalness: 0.1, emissive: 0xffffff, emissiveIntensity: 0.08, envMapIntensity: 1 });
  const word = await letters3d("AUTOMATIZAR", { size: 760, depth: 200, gap: 70, material: white });
  const edgeMat = new THREE.LineBasicMaterial({ color: ORANGE, toneMapped: false });
  word.items.forEach((mesh) => {
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), edgeMat);
    mesh.add(edges);
    glow(edges);
  });
  word.group.position.set(scene.O.x, -240, scene.LETTERS_Z);
  add(word.group, [intro.t - 80, S("c3-soar").t + 10], (t) => {
    const k = ramp(t, intro.t - 60, intro.end - 30);
    word.items.forEach((it, i) => {
      const d = Math.abs(i - 5) / 5;
      it.position.z = (1 - ramp(t, intro.t - 60 + d * 30, intro.end - 40)) * -3000;
      it.rotation.y = (1 - k) * (i - 5) * 0.08;
    });
  });

  // ── SOAR: baliza → engrane → escudo, unidos por un haz de luz ──────────
  const soar = S("c3-soar");
  const fS = F("c3-soar");
  const nodes = [beacon(), gear({ r: 130 }), shieldCheck({ size: 260 })];
  const nodePos = scene.soarX.map((x) => screenAt(fS, x, 90, 700));
  nodes.forEach((n, i) => {
    n.group.position.copy(nodePos[i]);
    n.group.quaternion.copy(quatOf(fS, i === 0 ? 0.35 : 0));
    n.group.scale.setScalar(i === 0 ? 0.95 : 1);
  });
  const soarGroup = new THREE.Group();
  nodes.forEach((n) => soarGroup.add(n.group));
  const beamPos = [];
  for (let i = 0; i < 2; i++) beamPos.push(nodePos[i].x, nodePos[i].y, nodePos[i].z, nodePos[i + 1].x, nodePos[i + 1].y, nodePos[i + 1].z);
  const beam = fatLines(beamPos, { color: 0xff6b00, width: 2.4, opacity: 0.5 });
  glow(beam);
  const packet = new THREE.Mesh(new THREE.SphereGeometry(16, 20, 14), m.led);
  glow(packet);
  soarGroup.add(beam, packet);
  add(soarGroup, [soar.t - 80, soar.end + 40], (t, clock) => {
    const u = (clock * 0.35) % 1;
    const seg = u < 0.5 ? 0 : 1;
    packet.position.lerpVectors(nodePos[seg], nodePos[seg + 1], (u % 0.5) * 2);
    nodes[1].group.rotation.z = clock * 0.8;
    nodes[0].dome.material.emissiveIntensity = 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(clock * 6));
    nodes[2].group.rotation.y = Math.sin(clock * 0.8) * 0.25;
  });

  // ── Catálogo: chip central con pistas de datos ─────────────────────────
  const prod = S("c3-prod");
  const fP = F("c3-prod");
  const core = cpuCore({ size: 380 });
  core.group.position.copy(at(fP, { x: scene.prodCenter.x, y: scene.prodCenter.y, z: scene.prodCenter.z }));
  core.group.quaternion.copy(quatOf(fP, -0.25, -0.35));
  add(core.group, [prod.t - 80, prod.end + 40], (t, clock) => {
    core.update(clock);
    core.group.rotation.z = Math.sin(clock * 0.3) * 0.08;
  });

  // ── CIDSI: ciclo PDCA girando detrás de la consola ─────────────────────
  const sg = S("c3-sgsi");
  const fG = F("c3-sgsi");
  const pdca = pdcaRing({ r: 330, tube: 30 });
  pdca.group.position.copy(at(fG, { x: 460, y: -10, z: 900 }));
  pdca.group.quaternion.copy(quatOf(fG, 0, -0.25));
  add(pdca.group, [sg.t - 80, S("c3-sgsi-cap").t - 10], (t, clock) => pdca.update(clock));

  // ── Contadores cromados 13 · 30+ ───────────────────────────────────────
  const cn = S("c3-counters");
  const fC = F("c3-counters");
  const c13 = await text3d("13", { size: 420, depth: 130, bevel: 12 });
  const c30 = await text3d("30+", { size: 420, depth: 130, bevel: 12 });
  [c13, c30].forEach((mesh, i) => {
    mesh.position.copy(screenAt(fC, scene.counterX[i], 110, 700));
    mesh.quaternion.copy(quatOf(fC, 0, i ? -0.12 : 0.12));
    add(mesh, [cn.t - 70, cn.end + 40], (t) => {
      const k = ramp(t, cn.t - 60 + i * 8, cn.t + i * 8);
      mesh.scale.setScalar(0.6 + 0.4 * k);
    });
  });

  // ── Logo 3D (placa negra + Centinela) para la transición a claro ───────
  const tile = await logoTile({ size: 620, depth: 80 });
  tile.group.position.copy(scene.LOGO);
  add(tile.group, [logoSt.t - 48, logoSt.end + 60], (t, clock) => {
    tile.group.rotation.y = Math.sin(clock * 0.45) * 0.55 + (t - logoSt.t) * 0.004;
    tile.group.position.y = scene.LOGO.y + Math.sin(clock * 0.9) * 14;
  });

  const tmp = new THREE.Vector3();
  return {
    group,
    update: (t, clock, dt) => {
      for (const p of parts) {
        const on = t > p.on[0] && t < p.on[1];
        p.obj.visible = on;
        if (on && p.update) p.update(t, clock, dt);
      }
      // Velocidad de cámara → velocidad y estiramiento de las líneas.
      const cam = stage.camera.position;
      if (lastCam && dt > 0) speed = THREE.MathUtils.lerp(speed, cam.distanceTo(lastCam) / dt, 0.15);
      lastCam = (lastCam || new THREE.Vector3()).copy(cam);
      const hyper = ramp(t, intro.t - 60, intro.t) * (1 - ramp(t, intro.end - 10, S("c3-soar").t)) + 0.55 * ramp(t, saas0.end - 20, S("c3-saas-0").t) * (1 - ramp(t, saas3.end, S("c3-counters").t));
      lines.mesh.visible = hyper > 0.01;
      if (lines.mesh.visible) lines.update(dt, 1800 + speed * 0.9, 0.6 + Math.min(4, speed / 1500), hyper);

      key.position.set(cam.x - 1800, cam.y + 2600, cam.z + 1200);
      key.target.position.copy(cam).add(tmp.set(0, 0, -2400));
      rim.position.set(cam.x + 2400, cam.y + 800, cam.z - 5200);
      rim.target.position.copy(cam).add(tmp.set(0, 0, -1600));
    },
  };
}
