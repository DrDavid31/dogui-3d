import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { contactShadow, markBloom } from "../../core/assets.js";
import { BLOOM_LAYER } from "../../core/post.js";
import { ramp, clamp, invLerp, smooth } from "../../core/timeline.js";

// ── Geometría base del hero (unidades ≈ px a distancia de lectura) ─────────
const LAPTOP = { w: 760, d: 520, h: 22 };
const LID = { h: 500, t: 12, tilt: THREE.MathUtils.degToRad(-11) };
const SCREEN = { w: 704, h: 440, y: 262 };
const HINGE = new THREE.Vector3(0, LAPTOP.h, -LAPTOP.d / 2 + 6);
const TUNNEL = { depth: 3600, rings: 26 };

// Pose del plano de pantalla en el mundo (se calcula una vez).
const lidQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), LID.tilt);
const N = new THREE.Vector3(0, 0, 1).applyQuaternion(lidQuat); // normal de la pantalla
export const SCREEN_CENTER = new THREE.Vector3(0, SCREEN.y, LID.t / 2 + 0.6).applyQuaternion(lidQuat).add(HINGE);
const S = SCREEN_CENTER;
const along = (d) => S.clone().addScaledVector(N, d).toArray();

export const hero = {
  id: "hero",
  selector: "#inicio",

  stations(dir) {
    dir.station("h0", {
      pos: [-760, 760, 2500],
      target: [-700, 90, 0],
      drift: [40, -30, -90],
      hold: 40,
      travel: 0,
    });
    dir.station("h1", {
      pos: [-250, 540, 1680],
      target: [-250, 210, -120],
      drift: [-30, -10, -80],
      hold: 70,
      travel: 90,
    });
    dir.station("h2", {
      // Pantalla con "Entra al perímetro." (dolly-in).
      pos: along(1050),
      target: S.toArray(),
      drift: N.clone().multiplyScalar(-380).toArray(),
      driftTarget: [0, 0, 0],
      hold: 60,
      travel: 90,
    });
    dir.station("h3", {
      // Atraviesa la pantalla y entra al túnel.
      pos: along(-1500),
      target: along(-4000),
      drift: N.clone().multiplyScalar(-1300).toArray(),
      hold: 50,
      travel: 70,
      via: [{ f: 0.55, pos: along(40), target: along(-900) }],
    });
  },

  layout(ctx) {
    const { dir, dom, hud, root } = ctx;
    const q = (s) => root.querySelector(s);
    const h0 = dir.get("h0");
    const h1 = dir.get("h1");
    const h2 = dir.get("h2");
    const h3 = dir.get("h3");

    // Hero: visible desde el inicio; se va al empezar el viaje hacia h1.
    const heroItem = hud.add(q('[data-hud="hero"]'), { show: [-2, -1, h0.end - 10, h0.end + 45] });
    heroItem.gate = 0; // lo abre el loader
    ctx.heroHud = heroItem;

    const w1 = dir.win("h1", { pre: 0.5, post: 0.4 });
    hud.add(q('[data-hud="hero-caption"]'), { show: w1 });

    // Consola SOC sobre la pantalla de la laptop (HTML real proyectado en el plano).
    const screenWorld = new THREE.Matrix4().compose(S.clone().addScaledVector(N, 0.8), lidQuat, new THREE.Vector3(1, 1, 1).multiplyScalar(SCREEN.w / 560));
    dom.add(q('[data-o="hero-console"]'), {
      world: screenWorld,
      show: [-2, -1, h2.t - 50, h2.t - 10],
      from: { o: 1 },
      to: { o: 0 },
    });

    // Chips de capacidades flotando alrededor de la laptop.
    const f1 = dir.frame("h1");
    const chipPoses = [
      { x: -40, y: 250, z: 160 },
      { x: 560, y: 210, z: 240 },
      { x: 650, y: 20, z: -40 },
      { x: 250, y: 290, z: 380 },
      { x: 520, y: -210, z: 60 },
      { x: -60, y: -260, z: 20 },
      { x: 700, y: -110, z: 420 },
      { x: 180, y: -300, z: 300 },
    ];
    chipPoses.forEach((p, i) => {
      dom.add(q(`[data-o="cap-${i}"]`), {
        anchor: f1,
        pose: { ...p, ry: p.x > 0 ? -8 : 8 },
        show: [w1[0] + i * 4, w1[1] + i * 3, w1[2] - 6 + i * 2, w1[3]],
        from: { z: 420, y: -40, o: 0 },
        to: { z: -500, o: 0 },
      });
    });

    // Vista ejecutiva (panel) a la izquierda, un poco más cerca de la cámara.
    dom.add(q('[data-o="hero-panel"]'), {
      anchor: f1,
      pose: { x: -430, y: -20, z: -60, ry: 12, s: 0.74 },
      show: [w1[0] + 8, w1[1] + 6, w1[2], w1[3]],
      from: { x: -140, z: 200, ry: 30, o: 0 },
      to: { x: -260, z: -300, o: 0 },
    });

    // "Entra al perímetro." centrado sobre la pantalla que se acerca.
    hud.add(q('[data-hud="perimeter"]'), { show: [h2.t - 30, h2.t - 5, h2.end - 10, h2.end + 30] });

    // Ambiente: claro en el hero, negro dentro de la pantalla.
    const cross = findCrossing(dir, h2.end, h3.t);
    ctx.env.push(
      { t: 0, color: "#F7F7F5", near: 4200, far: 14000, bloom: 1, vignette: 0.1, grain: 0.028 },
      { t: cross - 6, color: "#F7F7F5", near: 4200, far: 14000, bloom: 1.1, vignette: 0.1, grain: 0.028 },
      { t: cross, color: "#0A0A0A", near: 3000, far: 9000, bloom: 1.3, vignette: 0.32, grain: 0.04 },
    );
    this.cross = cross;
    this.range = [0, h3.end + 90];
    this.h2 = h2;
    this.h3 = h3;
  },

  async build(ctx) {
    const { stage } = ctx;
    const group = new THREE.Group();
    group.name = "hero";
    // Oculto hasta que world.js compile sus shaders (si se dibuja antes, congela el cuadro).
    group.visible = false;
    stage.scene.add(group);

    // Mesa blanca.
    const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0, envMapIntensity: 1.2 });
    const tableGroup = new THREE.Group();
    const top = new THREE.Mesh(new RoundedBoxGeometry(3400, 44, 1560, 3, 14), white);
    top.position.y = -22;
    tableGroup.add(top);
    const legGeo = new THREE.BoxGeometry(46, 1100, 46);
    for (const [x, z] of [
      [-1600, -700],
      [1600, -700],
      [-1600, 700],
      [1600, 700],
    ]) {
      const leg = new THREE.Mesh(legGeo, white);
      leg.position.set(x, -44 - 550, z);
      tableGroup.add(leg);
    }
    const shadow = contactShadow({ w: LAPTOP.w, h: LAPTOP.d, blur: 26, opacity: 0.5, radius: 26 });
    shadow.position.set(0, 0.6, 0);
    tableGroup.add(shadow);
    const lidShadow = contactShadow({ w: LAPTOP.w, h: 90, blur: 60, opacity: 0.22, radius: 20 });
    lidShadow.position.set(0, 0.8, -LAPTOP.d / 2 - 70);
    tableGroup.add(lidShadow);
    group.add(tableGroup);

    // Laptop negra.
    const body = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.36, metalness: 0.1, clearcoat: 0.5, clearcoatRoughness: 0.22, envMapIntensity: 0.5 });
    const deck = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.85, metalness: 0, envMapIntensity: 0.3 });
    const laptop = new THREE.Group();
    const base = new THREE.Mesh(new RoundedBoxGeometry(LAPTOP.w, LAPTOP.h, LAPTOP.d, 3, 9), body);
    base.position.set(0, LAPTOP.h / 2, 0);
    laptop.add(base);

    const well = new THREE.Mesh(new THREE.PlaneGeometry(660, 250), deck);
    well.rotation.x = -Math.PI / 2;
    well.position.set(0, LAPTOP.h + 0.4, -70);
    laptop.add(well);
    const keyGeo = new RoundedBoxGeometry(38, 7, 36, 2, 2.5);
    const keyMat = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, roughness: 0.6, metalness: 0, envMapIntensity: 0.45 });
    const cols = 14;
    const rows = 5;
    const keys = new THREE.InstancedMesh(keyGeo, keyMat, cols * rows);
    const m = new THREE.Matrix4();
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        m.makeTranslation(-(cols - 1) * 22 + c * 44, LAPTOP.h + 3.5, -70 - 2 * 44 + r * 44);
        keys.setMatrixAt(n++, m);
      }
    }
    laptop.add(keys);
    const pad = new THREE.Mesh(new THREE.PlaneGeometry(270, 150), new THREE.MeshPhysicalMaterial({ color: 0x101010, roughness: 0.3, metalness: 0, clearcoat: 0.6, envMapIntensity: 0.5 }));
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(0, LAPTOP.h + 0.3, 160);
    laptop.add(pad);

    const lid = new THREE.Group();
    lid.position.copy(HINGE);
    lid.quaternion.copy(lidQuat);
    const lidMesh = new THREE.Mesh(new RoundedBoxGeometry(LAPTOP.w, LID.h, LID.t, 3, 9), body);
    lidMesh.position.set(0, LID.h / 2, 0);
    lid.add(lidMesh);
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, LAPTOP.w - 120, 16), body);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 4, 0);
    lid.add(hinge);

    // Pantalla = portal: escribe el stencil donde es visible.
    const screenMat = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
      toneMapped: false,
      fog: false,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.AlwaysStencilFunc,
      stencilZPass: THREE.ReplaceStencilOp,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(SCREEN.w, SCREEN.h), screenMat);
    screen.position.set(0, SCREEN.y, LID.t / 2 + 0.6);
    screen.layers.enable(BLOOM_LAYER);
    lid.add(screen);
    laptop.add(lid);
    group.add(laptop);

    // ── Túnel de rectángulos redondeados neón (dentro de la pantalla) ──────
    const tunnel = new THREE.Group();
    tunnel.position.copy(S);
    tunnel.quaternion.copy(lidQuat);
    const ringGeo = roundedFrame(SCREEN.w - 36, SCREEN.h - 36, 26, 3.2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
      fog: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.EqualStencilFunc,
      stencilFail: THREE.KeepStencilOp,
      stencilZFail: THREE.KeepStencilOp,
      stencilZPass: THREE.KeepStencilOp,
    });
    const rings = new THREE.InstancedMesh(ringGeo, ringMat, TUNNEL.rings);
    rings.renderOrder = 20;
    rings.frustumCulled = false;
    rings.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(TUNNEL.rings * 3), 3);
    markBloom(rings);
    tunnel.add(rings);

    // Polvo de luz.
    const dustCount = 520;
    const dpos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dpos[i * 3] = (Math.random() - 0.5) * (SCREEN.w - 80);
      dpos[i * 3 + 1] = (Math.random() - 0.5) * (SCREEN.h - 80);
      dpos[i * 3 + 2] = -Math.random() * TUNNEL.depth;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 3.2,
      map: dotTexture(),
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.EqualStencilFunc,
      stencilZPass: THREE.KeepStencilOp,
    });
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.renderOrder = 21;
    dust.frustumCulled = false;
    tunnel.add(dust);

    // Luz al fondo del túnel: blanca con halo naranja (destello de salida).
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTexture(),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      stencilWrite: true,
      stencilRef: 1,
      stencilFunc: THREE.EqualStencilFunc,
      stencilZPass: THREE.KeepStencilOp,
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), glowMat);
    glow.position.z = -TUNNEL.depth - 200;
    glow.renderOrder = 19;
    tunnel.add(glow);
    group.add(tunnel);

    const stencilMats = [ringMat, dustMat, glowMat];
    const color = new THREE.Color();
    const orange = new THREE.Color("#FF6B00");
    const camLocal = new THREE.Vector3();
    const inv = new THREE.Matrix4().copy(tunnel.matrixWorld);
    tunnel.updateMatrixWorld(true);
    inv.copy(tunnel.matrixWorld).invert();
    let inside = null;
    const spacing = TUNNEL.depth / TUNNEL.rings;
    const { h2, h3 } = this;

    return {
      group,
      // Luces de estudio (el entorno RoomEnvironment aporta el relleno); dentro del
      // túnel solo brillan los neones.
      light: (t, L) => {
        L.sky.set(0xffffff);
        L.ground.set(0xdedbd4);
        L.hemi = inside ? 0 : 0.9;
        L.key = inside ? 0 : 1.4;
        L.keyPos.set(-900, 1600, 1200);
        L.keyAt.set(0, 0, 0);
        L.rim = inside ? 0 : 0.7;
        L.rimPos.set(1200, 800, -900);
        L.rimAt.set(0, 0, 0);
      },
      update: (t, clock) => {
        // ¿La cámara ya cruzó el plano de la pantalla?
        camLocal.copy(stage.camera.position).applyMatrix4(inv);
        const through = camLocal.z < 0;
        if (through !== inside) {
          inside = through;
          for (const m2 of stencilMats) m2.stencilFunc = through ? THREE.AlwaysStencilFunc : THREE.EqualStencilFunc;
          laptop.visible = !through;
          tableGroup.visible = !through;
        }

        // Encendido del túnel mientras la consola se apaga.
        const ignite = ramp(t, h2.t - 55, h2.t + 10);
        const exit = ramp(t, h3.t + 10, h3.end + 40);
        const flow = clock * 0.55;
        for (let i = 0; i < TUNNEL.rings; i++) {
          // Los anillos avanzan hacia el fondo en bucle ("pulsan hacia adentro").
          const z = -(((i * spacing + flow * spacing * 2) % TUNNEL.depth) + 40);
          m.makeTranslation(0, 0, z);
          rings.setMatrixAt(i, m);
          const depthFade = 1 - clamp(-z / TUNNEL.depth);
          const pulse = 0.55 + 0.45 * Math.pow(0.5 + 0.5 * Math.sin(clock * 3.2 - i * 0.55), 3);
          const k = ignite * (0.12 + 0.68 * depthFade * depthFade) * pulse * (1 - exit * 0.6);
          color.copy(orange).multiplyScalar(k);
          rings.setColorAt(i, color);
        }
        rings.instanceMatrix.needsUpdate = true;
        rings.instanceColor.needsUpdate = true;
        dustMat.opacity = ignite * 0.9;
        dust.position.z = (clock * 60) % 200;
        glowMat.opacity = ignite * 0.35 + ramp(t, h3.t - 20, h3.end + 30) * 0.65;
        glow.scale.setScalar(0.6 + ramp(t, h3.t, h3.end + 40) * 2.2);
      },
      visible: (t) => t < this.range[1],
    };
  },
};

/** Busca el tiempo en que la cámara cruza el plano de la pantalla. */
function findCrossing(dir, a, b) {
  const p = new THREE.Vector3();
  const g = new THREE.Vector3();
  const side = (t) => {
    dir.rig.sample(t, p, g);
    return p.clone().sub(S).dot(N);
  };
  let lo = a;
  let hi = b;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (side(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function roundedRectPath(path, w, h, r) {
  const x = -w / 2;
  const y = -h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.quadraticCurveTo(x + w, y, x + w, y + r);
  path.lineTo(x + w, y + h - r);
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  path.lineTo(x + r, y + h);
  path.quadraticCurveTo(x, y + h, x, y + h - r);
  path.lineTo(x, y + r);
  path.quadraticCurveTo(x, y, x + r, y);
  return path;
}

export function roundedFrame(w, h, r, t) {
  const shape = roundedRectPath(new THREE.Shape(), w, h, r);
  shape.holes.push(roundedRectPath(new THREE.Path(), w - t * 2, h - t * 2, Math.max(1, r - t)));
  return new THREE.ShapeGeometry(shape, 8);
}

export function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.4, "rgba(255,255,255,0.6)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.18, "rgba(255,244,232,0.9)");
  grd.addColorStop(0.42, "rgba(255,107,0,0.35)");
  grd.addColorStop(1, "rgba(255,107,0,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
