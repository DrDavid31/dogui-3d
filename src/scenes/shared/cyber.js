import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { M, ORANGE, glow, fatLines, circlePoints, canvasTexture, fbm, rng, roundedSlab } from "./materials.js";

// Modelos de ciberseguridad del capítulo 01 (Detectar). Todos se construyen en su
// espacio local con Y hacia arriba y el frente hacia +Z.

const TAU = Math.PI * 2;

// ── Radar de detección ───────────────────────────────────────────────────
function radarFace(size = 1024) {
  return canvasTexture(size, size, (g, w) => {
    const c = w / 2;
    const bg = g.createRadialGradient(c, c, 0, c, c, c);
    bg.addColorStop(0, "#1b1b1b");
    bg.addColorStop(0.7, "#101010");
    bg.addColorStop(1, "#0a0a0a");
    g.fillStyle = bg;
    g.fillRect(0, 0, w, w);
    g.strokeStyle = "rgba(255,255,255,0.16)";
    g.lineWidth = 2;
    for (const k of [0.24, 0.48, 0.72, 0.94]) {
      g.beginPath();
      g.arc(c, c, c * k, 0, TAU);
      g.stroke();
    }
    g.strokeStyle = "rgba(255,255,255,0.1)";
    g.beginPath();
    g.moveTo(c, c * 0.06);
    g.lineTo(c, w - c * 0.06);
    g.moveTo(c * 0.06, c);
    g.lineTo(w - c * 0.06, c);
    g.stroke();
    // Marcas de grado; cada 30° en naranja.
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * TAU;
      const major = i % 10 === 0;
      const r0 = c * (major ? 0.88 : 0.91);
      g.strokeStyle = major ? "rgba(255,107,0,0.9)" : "rgba(255,255,255,0.22)";
      g.lineWidth = major ? 3 : 1.5;
      g.beginPath();
      g.moveTo(c + Math.cos(a) * r0, c + Math.sin(a) * r0);
      g.lineTo(c + Math.cos(a) * c * 0.94, c + Math.sin(a) * c * 0.94);
      g.stroke();
    }
  });
}

function sweepTexture(size = 512) {
  return canvasTexture(size, size, (g, w) => {
    const c = w / 2;
    // Barrido: naranja intenso en el borde de ataque (ángulo 0) que se desvanece hacia atrás.
    const grad = g.createConicGradient(0, c, c);
    grad.addColorStop(0, "rgba(255,107,0,0.42)");
    grad.addColorStop(0.05, "rgba(255,107,0,0.16)");
    grad.addColorStop(0.16, "rgba(255,107,0,0.0)");
    grad.addColorStop(1, "rgba(255,107,0,0.0)");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(c, c, c, 0, TAU);
    g.fill();
    // Atenúa el centro.
    g.globalCompositeOperation = "destination-out";
    const hole = g.createRadialGradient(c, c, 0, c, c, c * 0.25);
    hole.addColorStop(0, "rgba(0,0,0,1)");
    hole.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = hole;
    g.fillRect(0, 0, w, w);
  });
}

/**
 * Radar: disco de cerámica negra con pantalla, aro blanco, barrido naranja giratorio
 * y "blips" que se encienden cuando el barrido pasa por ellos.
 * blips: [{ a: ángulo (rad), r: 0..1 }]
 */
export function radar({ r = 560, blips = [] } = {}) {
  const m = M();
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.03, 56, 128), m.black);
  base.position.y = -28;
  g.add(base);
  const foot = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.62, 40, 96), m.graphite);
  foot.position.y = -76;
  g.add(foot);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r + 2, 10, 20, 180), m.white);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1;
  g.add(rim);
  const face = new THREE.Mesh(new THREE.CircleGeometry(r - 8, 128), new THREE.MeshBasicMaterial({ map: radarFace(), toneMapped: false }));
  face.rotation.x = -Math.PI / 2;
  face.position.y = 0.6;
  g.add(face);

  const sweepMat = new THREE.MeshBasicMaterial({ map: sweepTexture(), transparent: true, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending });
  const sweep = new THREE.Mesh(new THREE.CircleGeometry(r - 12, 96), sweepMat);
  sweep.rotation.x = -Math.PI / 2;
  sweep.position.y = 1.4;
  const sweepPivot = new THREE.Group();
  sweepPivot.add(sweep);
  const edge = new THREE.Mesh(new THREE.PlaneGeometry(r - 14, 3.2), m.led);
  edge.rotation.x = -Math.PI / 2;
  edge.position.set((r - 14) / 2, 1.8, 0);
  glow(edge);
  sweepPivot.add(edge);
  g.add(sweepPivot);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(22, 26, 18, 32), m.white);
  hub.position.y = 9;
  g.add(hub);

  const blipObjs = blips.map((b) => {
    const p = new THREE.Vector3(Math.cos(b.a) * b.r * r, 3, -Math.sin(b.a) * b.r * r);
    const core = new THREE.Mesh(new THREE.SphereGeometry(9, 16, 12), m.led);
    core.position.copy(p);
    glow(core);
    const ringMat = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(new THREE.RingGeometry(14, 18, 48), ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(p);
    glow(ring);
    g.add(core, ring);
    return { ...b, p, core, ring, ringMat };
  });

  let angle = 0;
  return {
    group: g,
    blips: blipObjs,
    update(clock) {
      angle = (clock * 0.9) % TAU;
      sweepPivot.rotation.y = angle;
      for (const b of blipObjs) {
        // Tiempo (en radianes de barrido) desde que el barrido pasó por el blip.
        const since = (((angle - b.a) % TAU) + TAU) % TAU;
        const k = Math.exp(-since / 1.1);
        b.core.scale.setScalar(0.7 + k * 0.9);
        const s = 1 + (1 - k) * 3.2;
        b.ring.scale.setScalar(s);
        b.ringMat.opacity = k * 0.9;
      }
    },
  };
}

// ── Globo de amenazas ────────────────────────────────────────────────────
/**
 * Globo de puntos con "continentes" estilizados (ruido, no geografía real), cuerpo
 * blanco satinado y arcos naranjas que viajan entre fuentes de riesgo.
 */
export function threatGlobe({ r = 520, seed = 11, arcs = 10, dark = false } = {}) {
  const m = M();
  const g = new THREE.Group();
  const rand = rng(seed);
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(r * 0.985, 72, 48),
    dark
      ? new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.6, envMapIntensity: 0.6 })
      : new THREE.MeshStandardMaterial({ color: 0xf4f3ef, roughness: 0.75, envMapIntensity: 1.1 }),
  );
  g.add(body);

  const pts = [];
  const N = 5200;
  const off = rand() * 10;
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = i * 2.399963229728653;
    const v = new THREE.Vector3(Math.cos(th) * rad, y, Math.sin(th) * rad);
    const n = fbm(v.x * 1.6 + off, v.y * 1.6 + off, v.z * 1.6 + off);
    if (n > 0.5) pts.push(v);
  }
  const dotGeo = new THREE.CircleGeometry(4.3, 8);
  const dots = new THREE.InstancedMesh(dotGeo, new THREE.MeshBasicMaterial({ color: dark ? 0x8a8a86 : 0x1a1a1a }), pts.length);
  const q = new THREE.Quaternion();
  const Z = new THREE.Vector3(0, 0, 1);
  const mtx = new THREE.Matrix4();
  pts.forEach((v, i) => {
    q.setFromUnitVectors(Z, v);
    mtx.compose(v.clone().multiplyScalar(r), q, new THREE.Vector3(1, 1, 1));
    dots.setMatrixAt(i, mtx);
  });
  g.add(dots);

  // Meridianos y paralelos muy tenues: lectura de "globo" aunque no haya continentes reales.
  const grid = [];
  for (let k = 1; k < 6; k++) {
    const lat = -Math.PI / 2 + (k / 6) * Math.PI;
    const rr = Math.cos(lat) * r * 1.002;
    const yy = Math.sin(lat) * r * 1.002;
    grid.push(...circlePoints(rr, 96, yy));
  }
  const gridLine = fatLines(grid, { color: dark ? 0x3a3a3a : 0xc8c6c0, width: 1, opacity: 0.8 });
  g.add(gridLine);

  // Arcos de amenaza.
  const arcList = [];
  for (let i = 0; i < arcs; i++) {
    const a = pts[Math.floor(rand() * pts.length)];
    let b = pts[Math.floor(rand() * pts.length)];
    for (let tries = 0; tries < 20 && a.angleTo(b) < 0.7; tries++) b = pts[Math.floor(rand() * pts.length)];
    const mid = a.clone().add(b).normalize().multiplyScalar(r * (1.18 + a.angleTo(b) * 0.22));
    const curve = new THREE.QuadraticBezierCurve3(a.clone().multiplyScalar(r * 1.004), mid, b.clone().multiplyScalar(r * 1.004));
    const segs = 64;
    const radial = 6;
    const geo = new THREE.TubeGeometry(curve, segs, 2.6, radial, false);
    const mat = new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false });
    const tube = new THREE.Mesh(geo, mat);
    glow(tube);
    const head = new THREE.Mesh(new THREE.SphereGeometry(7, 12, 10), m.led);
    glow(head);
    const endMat = new THREE.MeshBasicMaterial({ color: ORANGE, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
    const end = new THREE.Mesh(new THREE.RingGeometry(9, 13, 32), endMat);
    end.position.copy(b).multiplyScalar(r * 1.006);
    end.quaternion.setFromUnitVectors(Z, b);
    glow(end);
    g.add(tube, head, end);
    arcList.push({ curve, geo, segs, radial, head, end, endMat, phase: rand(), speed: 0.16 + rand() * 0.1 });
  }

  return {
    group: g,
    update(clock) {
      for (const a of arcList) {
        // Ciclo: crece (0..0.55), viaja y se recoge (0.55..1).
        const u = (clock * a.speed + a.phase) % 1;
        const grow = Math.min(1, u / 0.55);
        const shrink = u > 0.55 ? (u - 0.55) / 0.45 : 0;
        const start = Math.floor(shrink * a.segs);
        const end = Math.max(start, Math.floor(grow * a.segs));
        a.geo.setDrawRange(start * a.radial * 6, (end - start) * a.radial * 6);
        a.curve.getPoint(Math.min(1, grow), a.head.position);
        a.head.visible = grow < 1;
        const hit = grow >= 1 ? 1 - shrink : 0;
        a.end.scale.setScalar(1 + (1 - hit) * 1.5);
        a.endMat.opacity = hit * 0.9;
      }
    },
  };
}

// ── Escudo hexagonal (perímetro) ─────────────────────────────────────────
/** Casquete de hexágonos sobre una esfera, con una onda que lo recorre. */
export function hexShield({ r = 640, cap = 1.15, cell = 74, dark = false } = {}) {
  const g = new THREE.Group();
  const centers = [];
  const dx = cell * Math.sqrt(3);
  const maxRho = cap * r;
  for (let row = -40; row <= 40; row++) {
    for (let col = -40; col <= 40; col++) {
      const x = col * dx + (row & 1 ? dx / 2 : 0);
      const y = row * cell * 1.5;
      const rho = Math.hypot(x, y);
      if (rho > maxRho) continue;
      centers.push({ x, y, rho });
    }
  }
  const geo = new THREE.RingGeometry(cell * 0.82, cell * 0.98, 6, 1, Math.PI / 6);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: dark ? 0.9 : 0.75, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const mesh = new THREE.InstancedMesh(geo, mat, centers.length);
  const Z = new THREE.Vector3(0, 0, 1);
  const q = new THREE.Quaternion();
  const mtx = new THREE.Matrix4();
  centers.forEach((c, i) => {
    const phi = c.rho / r;
    const al = Math.atan2(c.y, c.x);
    const dir = new THREE.Vector3(Math.sin(phi) * Math.cos(al), Math.sin(phi) * Math.sin(al), Math.cos(phi));
    q.setFromUnitVectors(Z, dir);
    mtx.compose(dir.clone().multiplyScalar(r), q, new THREE.Vector3(1, 1, 1));
    mesh.setMatrixAt(i, mtx);
    mesh.setColorAt(i, new THREE.Color(dark ? 0x2a2a2a : 0xd5d2cb));
  });
  if (dark) glow(mesh);
  g.add(mesh);
  const base = new THREE.Color(dark ? 0x2a2a2a : 0xd5d2cb);
  const tmp = new THREE.Color();
  return {
    group: g,
    mesh,
    update(clock, strength = 1) {
      // Onda que se expande desde el centro del casquete.
      const front = ((clock * 0.35) % 1.4) * maxRho;
      centers.forEach((c, i) => {
        const d = Math.abs(c.rho - front);
        const k = Math.max(0, 1 - d / (cell * 2.2)) * strength;
        tmp.copy(base).lerp(ORANGE, k);
        mesh.setColorAt(i, tmp);
      });
      mesh.instanceColor.needsUpdate = true;
    },
  };
}

// ── Objetos de evidencia (lo que se filtra) ──────────────────────────────
export function envelope() {
  const m = M();
  const g = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(170, 112, 8, 2, 3), m.paper);
  g.add(body);
  const flap = new THREE.Shape();
  flap.moveTo(-82, 54);
  flap.lineTo(82, 54);
  flap.lineTo(0, -6);
  flap.closePath();
  const flapMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(flap, { depth: 2, bevelEnabled: false }), m.white);
  flapMesh.position.z = 4.2;
  g.add(flapMesh);
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 4, 24), m.orange);
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, -2, 7);
  g.add(seal);
  return g;
}

export function leakedDoc() {
  const m = M();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(124, 164, 3, 1, 1), m.paper));
  const lineGeo = new THREE.BoxGeometry(1, 5, 1);
  const widths = [84, 92, 70, 92, 60, 88, 76];
  widths.forEach((w, i) => {
    const l = new THREE.Mesh(lineGeo, i === 3 ? m.orange : m.gray);
    l.scale.set(w, 1, 1);
    l.position.set(-46 + w / 2 - 4, 52 - i * 17, 2);
    g.add(l);
  });
  const corner = new THREE.Shape();
  corner.moveTo(62, 82);
  corner.lineTo(38, 82);
  corner.lineTo(62, 58);
  corner.closePath();
  const c = new THREE.Mesh(new THREE.ExtrudeGeometry(corner, { depth: 1, bevelEnabled: false }), m.gray);
  c.position.z = 1.6;
  g.add(c);
  return g;
}

export function credentialCard() {
  const m = M();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(roundedSlab(176, 112, 6, 12, 1.5), m.black));
  const chip = new THREE.Mesh(new RoundedBoxGeometry(30, 24, 2, 1, 1), m.steel);
  chip.position.set(-52, 10, 3.4);
  g.add(chip);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(176 - 24, 6, 1), m.orange);
  stripe.position.set(0, -34, 3.4);
  g.add(stripe);
  for (let i = 0; i < 3; i++) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(i === 0 ? 70 : 54, 5, 1), m.gray);
    l.position.set(26 + (i === 0 ? 0 : -8), 18 - i * 14, 3.4);
    g.add(l);
  }
  return g;
}

export function accessKey() {
  const m = M();
  const g = new THREE.Group();
  const bow = new THREE.Mesh(new THREE.TorusGeometry(30, 10, 16, 40), m.chrome);
  g.add(bow);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(120, 14, 9), m.chrome);
  shaft.position.x = 88;
  g.add(shaft);
  for (const [x, h] of [
    [112, 22],
    [128, 16],
    [140, 26],
  ]) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(10, h, 9), m.chrome);
    t.position.set(x, -h / 2 - 5, 0);
    g.add(t);
  }
  const tag = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 12, 20), m.orange);
  tag.rotation.x = Math.PI / 2;
  g.add(tag);
  g.position.x = -60;
  const wrap = new THREE.Group();
  wrap.add(g);
  return wrap;
}

export function database() {
  const m = M();
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(70, 70, 40, 48), m.black);
    disk.position.y = i * 48 - 48;
    g.add(disk);
    const seam = new THREE.Mesh(new THREE.TorusGeometry(70.5, 1.6, 8, 64), m.white);
    seam.rotation.x = Math.PI / 2;
    seam.position.y = i * 48 - 48 + 22;
    g.add(seam);
    const led = new THREE.Mesh(new THREE.SphereGeometry(4, 10, 8), i === 1 ? m.led : m.ledWhite);
    led.position.set(0, i * 48 - 48, 70);
    glow(led);
    g.add(led);
  }
  return g;
}

export function chip() {
  const m = M();
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new RoundedBoxGeometry(130, 130, 18, 2, 4), m.black));
  const core = new THREE.Mesh(new RoundedBoxGeometry(56, 56, 4, 2, 2), m.orange);
  core.position.z = 10;
  g.add(core);
  const pinGeo = new THREE.BoxGeometry(8, 22, 4);
  const pins = new THREE.InstancedMesh(pinGeo, m.steel, 40);
  const mtx = new THREE.Matrix4();
  let n = 0;
  for (let side = 0; side < 4; side++) {
    for (let k = 0; k < 10; k++) {
      const off = -54 + k * 12;
      const rot = new THREE.Matrix4().makeRotationZ((side * Math.PI) / 2);
      mtx.makeTranslation(off, 76, 0).premultiply(rot);
      pins.setMatrixAt(n++, mtx);
    }
  }
  g.add(pins);
  return g;
}

/** Artefactos flotantes con significado (correo, documento, credencial, llave, base de datos, chip). */
export const ARTIFACTS = [envelope, leakedDoc, credentialCard, accessKey, database, chip];

// ── Factor humano ────────────────────────────────────────────────────────
/** Grupo de personas minimalistas sobre una plataforma; cada una con anillo de estado. */
export function crowd({ cols = 4, rows = 3, gap = 150 } = {}) {
  const m = M();
  const g = new THREE.Group();
  const w = (cols - 1) * gap;
  const d = (rows - 1) * gap;
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(Math.hypot(w, d) / 2 + 150, Math.hypot(w, d) / 2 + 170, 28, 96), m.black);
  plat.position.y = -14;
  g.add(plat);
  const platRim = new THREE.Mesh(new THREE.TorusGeometry(Math.hypot(w, d) / 2 + 151, 3, 8, 128), m.led);
  platRim.rotation.x = Math.PI / 2;
  platRim.position.y = 0.5;
  glow(platRim);
  g.add(platRim);
  const bodyGeo = new THREE.CapsuleGeometry(30, 86, 6, 20);
  const headGeo = new THREE.SphereGeometry(26, 24, 18);
  const ringGeo = new THREE.TorusGeometry(46, 3.2, 8, 48);
  const people = [];
  const rand = rng(3);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = new THREE.Group();
      p.position.set(-w / 2 + c * gap + (r % 2 ? 30 : 0), 0, -d / 2 + r * gap);
      const body = new THREE.Mesh(bodyGeo, m.white);
      body.position.y = 73;
      const head = new THREE.Mesh(headGeo, m.white);
      head.position.y = 170;
      const ringMat = new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 8;
      glow(ring);
      p.add(body, head, ring);
      p.rotation.y = (rand() - 0.5) * 0.6;
      g.add(p);
      people.push({ p, ringMat, ring, order: rand() });
    }
  }
  const safe = new THREE.Color(0x2b2b2b);
  return {
    group: g,
    /** k: 0 = todos en riesgo (naranja), 1 = todos capacitados (grafito). */
    update(clock, k) {
      for (const pp of people) {
        const trained = k > pp.order;
        pp.ringMat.color.copy(trained ? safe : ORANGE);
        const pulse = trained ? 1 : 1 + 0.12 * Math.sin(clock * 4 + pp.order * 10);
        pp.ring.scale.setScalar(pulse);
      }
    },
  };
}

// ── Pipeline de datos (proceso 01–05) ────────────────────────────────────
export function pipeline(points, { radius = 9, packets = 14, nodes = [] } = {}) {
  const m = M();
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, radius, 16, false), m.white);
  g.add(tube);
  const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, radius * 0.35, 8, false), m.graphite);
  g.add(core);
  const pk = new THREE.InstancedMesh(new THREE.CapsuleGeometry(radius * 0.7, radius * 2.4, 4, 12), m.led, packets);
  glow(pk);
  g.add(pk);
  const nodeObjs = nodes.map((u) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 3.2, radius * 0.5, 12, 48), m.black);
    const p = curve.getPointAt(u);
    const tan = curve.getTangentAt(u);
    ring.position.copy(p);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tan);
    const led = new THREE.Mesh(new THREE.TorusGeometry(radius * 3.2, radius * 0.18, 8, 48), m.led);
    led.position.copy(p);
    led.quaternion.copy(ring.quaternion);
    led.translateZ(radius * 0.4);
    glow(led);
    g.add(ring, led);
    return { u, led };
  });
  const mtx = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const Y = new THREE.Vector3(0, 1, 0);
  const pos = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  return {
    group: g,
    curve,
    update(clock) {
      for (let i = 0; i < packets; i++) {
        const u = (clock * 0.06 + i / packets) % 1;
        curve.getPointAt(u, pos);
        curve.getTangentAt(u, tan);
        q.setFromUnitVectors(Y, tan);
        mtx.compose(pos, q, one);
        pk.setMatrixAt(i, mtx);
      }
      pk.instanceMatrix.needsUpdate = true;
      for (const n of nodeObjs) n.led.scale.setScalar(1 + 0.08 * Math.sin(clock * 3 + n.u * 20));
    },
  };
}

// ── Niveles (planes) ─────────────────────────────────────────────────────
export function tierPillars({ heights = [260, 460, 680], gap = 360, w = 150 } = {}) {
  const m = M();
  const g = new THREE.Group();
  heights.forEach((h, i) => {
    const p = new THREE.Mesh(new RoundedBoxGeometry(w, h, w, 3, 10), m.black);
    p.position.set((i - (heights.length - 1) / 2) * gap, h / 2, 0);
    g.add(p);
    for (let k = 0; k <= i; k++) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(w + 2, 8, w + 2), m.led);
      band.position.set(p.position.x, h - 24 - k * 26, 0);
      glow(band);
      g.add(band);
    }
  });
  return { group: g };
}

// ── Módulos apilados (paquetes) ──────────────────────────────────────────
export function moduleStack() {
  const m = M();
  const g = new THREE.Group();
  const geo = new RoundedBoxGeometry(150, 150, 150, 3, 18);
  const spots = [
    [0, 0, 0],
    [160, 0, 0],
    [80, 0, -150],
    [80, 158, -70],
    [-80, 0, -130],
  ];
  spots.forEach(([x, y, z], i) => {
    const c = new THREE.Mesh(geo, i === 3 ? m.white : m.black);
    c.position.set(x, y, z);
    g.add(c);
    const led = new THREE.Mesh(new THREE.BoxGeometry(60, 6, 2), m.led);
    led.position.set(x, y - 40, z + 76);
    glow(led);
    g.add(led);
  });
  return { group: g };
}

/** Teléfono neutro (sin marcas). Frente hacia +Z; la pantalla la pone el DOM. */
export function phone({ w = 372, h = 762 } = {}) {
  const m = M();
  const g = new THREE.Group();
  const body = new THREE.Mesh(roundedSlab(w, h, 38, 60, 7), new THREE.MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.28, metalness: 0.3, clearcoat: 0.9, clearcoatRoughness: 0.18, envMapIntensity: 1 }));
  g.add(body);
  const frame = new THREE.Mesh(roundedSlab(w + 6, h + 6, 26, 63, 3), m.steel);
  g.add(frame);
  const btn = new THREE.BoxGeometry(6, 70, 10);
  for (const [x, y] of [
    [w / 2 + 3, 170],
    [-w / 2 - 3, 210],
    [-w / 2 - 3, 120],
  ]) {
    const b = new THREE.Mesh(btn, m.steel);
    b.position.set(x, y, 0);
    g.add(b);
  }
  // Isla de cámara frontal.
  const cam = new THREE.Mesh(new RoundedBoxGeometry(90, 26, 4, 2, 12), m.blackMatte);
  cam.position.set(0, h / 2 - 34, 20);
  g.add(cam);
  return g;
}
