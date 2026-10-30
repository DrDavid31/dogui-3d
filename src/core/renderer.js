import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { Post } from "./post.js";

export const FOV = 40;

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
    this.renderer.shadowMap.autoUpdate = true;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf7f7f5);
    this.scene.fog = new THREE.Fog(0xf7f7f5, 4000, 16000);

    this.camera = new THREE.PerspectiveCamera(FOV, 1, 10, 60000);
    this.camera.layers.enableAll();
    this.scene.add(this.camera);

    // Iluminación de estudio basada en entorno (reflejos suaves en superficies negras y cromadas).
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.envMap;
    // Sin tone mapping, RoomEnvironment es muy brillante: se usa con intensidad baja
    // y cada material ajusta su envMapIntensity.
    this.scene.environmentIntensity = 0.35;
    pmrem.dispose();

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
