import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BLOOM_LAYER, Post } from "./post.js";

export const FOV = 40;

/**
 * Iluminación de un capítulo. Todos usan la misma estructura (cielo/suelo + llave +
 * contraluz) para poder mezclarla entre capítulos sin cambiar el número de luces.
 */
export class LightSpec {
  constructor() {
    this.sky = new THREE.Color(0xffffff);
    this.ground = new THREE.Color(0xffffff);
    this.hemi = 0;
    this.key = 0;
    this.keyPos = new THREE.Vector3();
    this.keyAt = new THREE.Vector3();
    this.rim = 0;
    this.rimPos = new THREE.Vector3();
    this.rimAt = new THREE.Vector3();
  }

  lerp(b, k) {
    this.sky.lerp(b.sky, k);
    this.ground.lerp(b.ground, k);
    this.hemi += (b.hemi - this.hemi) * k;
    this.key += (b.key - this.key) * k;
    this.keyPos.lerp(b.keyPos, k);
    this.keyAt.lerp(b.keyAt, k);
    this.rim += (b.rim - this.rim) * k;
    this.rimPos.lerp(b.rimPos, k);
    this.rimAt.lerp(b.rimAt, k);
    return this;
  }
}

/** Renderer, escena y cámara compartidos por toda la experiencia (un solo canvas). */
export class Stage {
  constructor(canvas, { mobile = false } = {}) {
    this.mobile = mobile;
    this.maxPR = mobile ? 1 : 1.5;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: mobile,
      alpha: false,
      stencil: true,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    // El mapa de sombras solo se redibuja cuando una escena lo pide (needsUpdate).
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7f7f5);
    this.scene.fog = new THREE.Fog(0xf7f7f5, 4000, 16000);

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 10, 60000);
    this.camera.layers.enableAll();
    this.scene.add(this.camera);

    // Sin tone mapping, RoomEnvironment es muy brillante: se usa con intensidad baja
    // y cada material ajusta su envMapIntensity.
    this.scene.environmentIntensity = 0.35;
    // Los shaders dependen del entorno: hay que esperar a `ready` antes de precompilar.
    this.ready = this.createEnvironment();

    // Un solo juego de luces para toda la experiencia: cada capítulo cambia color,
    // intensidad y posición, nunca la cantidad. Si cambia el número de luces (o de
    // sombras), three.js recompila los shaders de todo lo visible: tirones de
    // 100–400 ms justo en los cambios de capítulo.
    const hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0);
    const key = new THREE.DirectionalLight(0xffffff, 0);
    const rim = new THREE.DirectionalLight(0xffffff, 0);
    // Luz solo de sombras (las letras de DETECTAR sobre su piso ShadowMaterial).
    const shadow = new THREE.DirectionalLight(0xffffff, 0.001);
    shadow.castShadow = !mobile;
    shadow.shadow.mapSize.set(2048, 2048);
    shadow.shadow.radius = 8;
    shadow.shadow.bias = -0.0008;
    shadow.shadow.normalBias = 6;
    this.scene.add(hemi, key, key.target, rim, rim.target, shadow, shadow.target);
    this.lights = { hemi, key, rim, shadow };

    this.post = mobile ? null : new Post(this.renderer, this.scene, this.camera, { bloom: true });

    this.width = 1;
    this.height = 1;
    this.pixelRatio = 1;
    this.resize();
  }

  /** Distancia (en unidades de mundo) a la que 1 unidad = 1 px CSS. */
  get perspective() {
    return this.camera.projectionMatrix.elements[5] * this.height * 0.5;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.width = w;
    this.height = h;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, this.maxPR);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.post?.setSize(w, h, this.pixelRatio);
  }

  /**
   * Iluminación de estudio basada en entorno (reflejos suaves en superficies negras y
   * cromadas). Los shaders de filtrado de PMREM tardan ~450 ms en compilar en
   * ANGLE/D3D11: se compilan en paralelo y el entorno se genera cuando están listos.
   */
  async createEnvironment() {
    const r = this.renderer;
    const pmrem = new THREE.PMREMGenerator(r);
    const room = new RoomEnvironment();
    // API interna de PMREMGenerator (three r186): reserva los destinos del tamaño que
    // usa fromScene (256) y crea sus materiales de filtrado, para compilarlos antes.
    pmrem._setSize(256);
    const probe = pmrem._allocateTargets();
    // La variante del shader depende de los atributos de la geometría: solo posición,
    // como las mallas internas de PMREM.
    const geo = new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(9), 3));
    const quad = new THREE.Scene();
    for (const m of [pmrem._blurMaterial, pmrem._ggxMaterial]) if (m) quad.add(new THREE.Mesh(geo, m));
    // Caja de fondo que PMREM dibuja detrás de la habitación.
    const bg = new THREE.Scene();
    bg.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false })));
    const cam = new THREE.PerspectiveCamera(90, 1, 0.1, 100);
    const prev = r.getRenderTarget();
    r.setRenderTarget(probe);
    const waits = [r.compileAsync(quad, cam), r.compileAsync(room, cam), r.compileAsync(bg, cam)];
    r.setRenderTarget(prev);
    await Promise.all(waits);
    probe.dispose();
    this.envMap = pmrem.fromScene(room, 0.04).texture;
    this.scene.environment = this.envMap;
    pmrem.dispose();
    room.dispose?.();
  }

  applyLights(L) {
    const { hemi, key, rim } = this.lights;
    hemi.color.copy(L.sky);
    hemi.groundColor.copy(L.ground);
    hemi.intensity = L.hemi;
    key.intensity = L.key;
    key.position.copy(L.keyPos);
    key.target.position.copy(L.keyAt);
    rim.intensity = L.rim;
    rim.position.copy(L.rimPos);
    rim.target.position.copy(L.rimAt);
  }

  /**
   * Compila los shaders de `object` antes de que aparezca, sin bloquear el hilo
   * principal (KHR_parallel_shader_compile). Incluye la variante sin niebla que usa
   * la pasada de bloom para los objetos de esa capa.
   */
  precompile(object) {
    const { renderer, scene, camera, post } = this;
    const prev = renderer.getRenderTarget();
    // Con posproceso la escena se dibuja en un render target (espacio lineal), no en
    // pantalla: es otra variante del shader.
    renderer.setRenderTarget(post ? post.sceneTarget : null);
    const waits = [renderer.compileAsync(object, camera, scene)];
    if (post) {
      // Igual que BloomSourcePass: sin niebla y con la cámara solo en la capa de bloom
      // (las luces quedan fuera de esa capa: es otra variante sin luces).
      const glow = [];
      object.traverse((o) => o.layers.isEnabled(BLOOM_LAYER) && glow.push(o));
      const fog = scene.fog;
      const mask = camera.layers.mask;
      scene.fog = null;
      camera.layers.set(BLOOM_LAYER);
      for (const o of glow) waits.push(renderer.compileAsync(o, camera, scene));
      camera.layers.mask = mask;
      scene.fog = fog;
    }
    renderer.setRenderTarget(prev);
    return Promise.all(waits);
  }

  render(dt, time, fx) {
    if (this.post) {
      this.post.uniforms.uVignette.value = fx.vignette;
      this.post.uniforms.uGrain.value = fx.grain;
      this.post.render(dt, time, fx.bloom);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
