import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { loadFont, markBloom } from "../../core/assets.js";
import { dotTexture } from "../hero/index.js";
import { ramp, smooth, invLerp } from "../../core/timeline.js";
import { LETTERS } from "./index.js";

const ORANGE = new THREE.Color("#FF6B00");
const INK = new THREE.Color("#0A0A0A");

// Generador pseudoaleatorio con semilla (composición estable entre recargas).
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function buildDetectar(ctx, scene) {
  const { stage, dir } = ctx;
  const group = new THREE.Group();
  group.name = "detectar";
  stage.scene.add(group);
  const { G, PHONE, phoneQuat } = scene.points;

  const lineMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 });
  const lineSoft = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.22 });
  const dotMat = new THREE.MeshBasicMaterial({ color: ORANGE, toneMapped: false });

  // Luz para lo sólido del capítulo (teléfono y letras).
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd9d6cf, 1.1);
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  group.add(hemi, sun, sun.target);

  // ── Grafo de exposición ────────────────────────────────────────────────
  const graph = new THREE.Group();
  graph.position.copy(G);
  group.add(graph);
  const core = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(120, 1)), lineMat);
  graph.add(core);
  const coreDot = new THREE.Mesh(new THREE.IcosahedronGeometry(34, 2), dotMat);
  markBloom(coreDot);
  graph.add(coreDot);
  const ring = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.TorusGeometry(200, 1, 3, 64)), lineSoft);
  ring.rotation.x = Math.PI / 2.3;
  graph.add(ring);

  const nodes = scene.nodeDirs.map((d, i) => {
    const n = new THREE.Group();
    n.position.copy(d).multiplyScalar(scene.nodeR);
    const shape = i % 2 ? new THREE.OctahedronGeometry(48, 0) : new THREE.BoxGeometry(62, 62, 62);
    n.add(new THREE.LineSegments(new THREE.EdgesGeometry(shape), lineMat));
    const dot = new THREE.Mesh(new THREE.SphereGeometry(9, 12, 12), dotMat);
    markBloom(dot);
    n.add(dot);
    graph.add(n);
    return n;
  });

  // Aristas: centro → nodo y algunas entre nodos.
  const edges = nodes.map((n) => [new THREE.Vector3(), n.position]);
  for (const [a, b] of [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [5, 0],
  ])
    edges.push([nodes[a].position, nodes[b].position]);
  const epos = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], i) => {
    epos.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
  });
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute("position", new THREE.BufferAttribute(epos, 3));
  graph.add(new THREE.LineSegments(edgeGeo, lineSoft));

  // Partículas que viajan por las aristas.
  const perEdge = 3;
  const pCount = edges.length * perEdge;
  const ppos = new Float32Array(pCount * 3);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(ppos, 3));
  const pMat = new THREE.PointsMaterial({ color: ORANGE, size: 12, map: dotTexture(), transparent: true, depthWrite: false, toneMapped: false });
  const particles = new THREE.Points(pGeo, pMat);
  markBloom(particles);
  graph.add(particles);

  // ── Fragmentos wireframe flotando a lo largo del capítulo ──────────────
  const rand = rng(7);
  const shapes = [new THREE.BoxGeometry(1, 1, 1), new THREE.OctahedronGeometry(0.7), new THREE.TetrahedronGeometry(0.75), new THREE.IcosahedronGeometry(0.6)].map((g) => new THREE.EdgesGeometry(g));
  const frags = [];
  const fragGroup = new THREE.Group();
  group.add(fragGroup);
  const along = dir.list.filter((s) => s.id.startsWith("c1-") && s.id !== "c1-through");
  for (const s of along) {
    for (let k = 0; k < 5; k++) {
      const side = rand() < 0.5 ? -1 : 1;
      const f = new THREE.Group();
      const size = 40 + rand() * 120;
      const ls = new THREE.LineSegments(shapes[Math.floor(rand() * shapes.length)], rand() < 0.3 ? lineMat : lineSoft);
      ls.scale.setScalar(size);
      f.add(ls);
      if (rand() < 0.55) {
        const d = new THREE.Mesh(new THREE.SphereGeometry(Math.max(3, size * 0.05), 8, 8), dotMat);
        d.position.set(size * 0.5, size * 0.5, size * 0.5);
        markBloom(d);
        f.add(d);
      }
      // Fuera del centro de lectura: a los lados y por encima/debajo del encuadre.
      const local = new THREE.Vector3(side * (900 + rand() * 1400), (rand() - 0.5) * 1400, -(800 + rand() * 2600));
      f.position.copy(local.applyMatrix4(s.frame));
      f.userData.spin = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.5);
      f.rotation.set(rand() * 6, rand() * 6, rand() * 6);
      fragGroup.add(f);
      frags.push(f);
    }
  }

  // ── Teléfono 3D neutro (sin marcas) ────────────────────────────────────
  const phone = new THREE.Group();
  phone.position.copy(PHONE);
  phone.quaternion.copy(phoneQuat);
  const pw = 372;
  const ph = 762;
  const shape = new THREE.Shape();
  roundRect(shape, pw, ph, 58);
  const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: 26, bevelEnabled: true, bevelThickness: 6, bevelSize: 6, bevelSegments: 4, curveSegments: 18 });
  bodyGeo.translate(0, 0, -13);
  const phoneMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0b, roughness: 0.3, metalness: 0.2, clearcoat: 0.8, clearcoatRoughness: 0.2, envMapIntensity: 0.8 });
  const phoneBody = new THREE.Mesh(bodyGeo, phoneMat);
  phone.add(phoneBody);
  // Botones laterales discretos.
  const btnGeo = new THREE.BoxGeometry(6, 70, 10);
  for (const [x, y] of [
    [pw / 2 + 5, 170],
    [-pw / 2 - 5, 200],
    [-pw / 2 - 5, 110],
  ]) {
    const b = new THREE.Mesh(btnGeo, phoneMat);
    b.position.set(x, y, 0);
    phone.add(b);
  }
  const phoneShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(pw * 1.6, ph * 1.3),
    new THREE.MeshBasicMaterial({ map: softShadowTexture(), transparent: true, depthWrite: false, opacity: 0.35 }),
  );
  phoneShadow.position.set(40, -40, -60);
  phone.add(phoneShadow);
  group.add(phone);
  const screenOffset = new THREE.Matrix4().makeTranslation(0, 0, 21);

  // ── Letras gigantes DETECTAR ───────────────────────────────────────────
  const font = await loadFont();
  const letterMat = new THREE.MeshPhysicalMaterial({ color: 0x0c0c0c, roughness: 0.42, metalness: 0.05, clearcoat: 0.35, clearcoatRoughness: 0.4, envMapIntensity: 0.9 });
  const letters = new THREE.Group();
  const glyphs = [...LETTERS.word].map((ch) => {
    const geo = new TextGeometry(ch, {
      font,
      size: LETTERS.height,
      depth: LETTERS.depth,
      curveSegments: 10,
      bevelEnabled: true,
      bevelThickness: 14,
      bevelSize: 10,
      bevelSegments: 4,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-bb.min.x, 0, -LETTERS.depth / 2);
    const mesh = new THREE.Mesh(geo, letterMat);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    return { mesh, w: bb.max.x - bb.min.x };
  });
  // Espaciado amplio y centrado en el hueco por el que pasa la cámara.
  let x = 0;
  const xs = glyphs.map((g) => {
    const at = x;
    x += g.w + LETTERS.gap;
    return at;
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

  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.001);
  shadowLight.castShadow = true;
  shadowLight.position.set(LETTERS.x - 3200, LETTERS.y + 5200, LETTERS.z + 3800);
  shadowLight.target.position.set(LETTERS.x, LETTERS.y, LETTERS.z - 400);
  const sc = shadowLight.shadow.camera;
  sc.left = -7000;
  sc.right = 7000;
  sc.top = 3000;
  sc.bottom = -4200;
  sc.near = 100;
  sc.far = 14000;
  shadowLight.shadow.mapSize.set(2048, 2048);
  shadowLight.shadow.radius = 8;
  shadowLight.shadow.bias = -0.0008;
  shadowLight.shadow.normalBias = 6;
  group.add(shadowLight, shadowLight.target);

  // ── Actualización por cuadro ───────────────────────────────────────────
  const a = new THREE.Vector3();
  const lt = dir.get("c1-letters");
  const pymeT = dir.get("c1-pyme").t;
  const bubbles = scene.bubbles;
  const lettersOn = [lt.t - 110, dir.get("c1-through").end + 40];
  const graphOn = [dir.get("c1-intro").t - 160, dir.get("c1-deliver").end + 60];
  const phoneOn = [pymeT - 200, dir.get("c1-pkg").end];

  return {
    group,
    update: (t, clock, dt) => {
      // Grafo
      const gOn = t > graphOn[0] && t < graphOn[1];
      graph.visible = gOn;
      if (gOn) {
        const build = ramp(t, graphOn[0], graphOn[0] + 150);
        graph.scale.setScalar(0.6 + 0.4 * build);
        graph.rotation.y = clock * 0.08 + t * 0.002;
        core.rotation.x = clock * 0.2;
        nodes.forEach((n, i) => {
          n.rotation.set(clock * (0.3 + i * 0.05), clock * 0.4, 0);
          n.scale.setScalar(smooth(invLerp(graphOn[0] + i * 12, graphOn[0] + 80 + i * 12, t)));
        });
        let k = 0;
        edges.forEach(([p0, p1], ei) => {
          for (let j = 0; j < perEdge; j++) {
            const u = (clock * 0.35 + j / perEdge + ei * 0.13) % 1;
            a.lerpVectors(p0, p1, ei < nodes.length ? u : 1 - u);
            ppos[k++] = a.x;
            ppos[k++] = a.y;
            ppos[k++] = a.z;
          }
        });
        pGeo.attributes.position.needsUpdate = true;
        pMat.opacity = build;
        // Las etiquetas siguen a los nodos (el grafo rota).
        scene.nodeLabels.forEach((it, i) => {
          if (!it) return;
          nodes[i].getWorldPosition(a);
          it.world.makeTranslation(a.x, a.y + 70, a.z);
        });
      }

      for (const f of frags) {
        f.rotation.x += f.userData.spin.x * dt;
        f.rotation.y += f.userData.spin.y * dt;
      }

      // Teléfono: flota suave; burbujas del chat aparecen una a una.
      const pOn = t > phoneOn[0] && t < phoneOn[1];
      phone.visible = pOn;
      if (pOn) {
        phone.position.y = PHONE.y + Math.sin(clock * 0.9) * 8;
        phone.updateMatrixWorld();
        scene.chatItem?.world.copy(phone.matrixWorld).multiply(screenOffset);
      }
      for (const b of bubbles) {
        const on = t >= b.t;
        if (on !== b.on) {
          b.on = on;
          b.el.classList.toggle("is-in", on);
        }
      }

      // Letras: sombras solo cuando están en escena.
      const lOn = t > lettersOn[0] && t < lettersOn[1];
      letters.visible = ground.visible = lOn;
      // Emergen desde la niebla mientras la cámara se acerca.
      const appear = ramp(t, lt.t - 110, lt.t - 35);
      const fading = appear < 0.999;
      if (fading !== letterMat.transparent) {
        letterMat.transparent = fading;
        letterMat.needsUpdate = true;
      }
      letterMat.opacity = appear;
      letters.position.y = (1 - appear) * -260;
      shadowLight.castShadow = lOn;
      sun.position.set(stage.camera.position.x - 1600, stage.camera.position.y + 2400, stage.camera.position.z + 1800);
      sun.target.position.copy(stage.camera.position).add(new THREE.Vector3(0, 0, -2000));
      const dark = ramp(t, lt.t + lt.hold * 0.35, lt.end + 20);
      letterMat.envMapIntensity = 0.9 * (1 - dark) + 0.25;
      ground.material.opacity = 0.16 * (1 - dark);
    },
  };
}

function roundRect(s, w, h, r) {
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
}

function softShadowTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const g = c.getContext("2d");
  g.filter = "blur(18px)";
  g.fillStyle = "rgba(10,10,10,0.9)";
  g.beginPath();
  g.roundRect(34, 40, 60, 176, 20);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
