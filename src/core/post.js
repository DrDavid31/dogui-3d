import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// Capa de bloom: solo los objetos emisivos naranjas (neones, pulsos, luz de flujos)
// se renderizan en la pasada de bloom. El resto de la escena nunca brilla.
export const BLOOM_LAYER = 1;

const BLACK = new THREE.Color(0x000000);

class BloomSourcePass extends RenderPass {
  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    const { scene, camera } = this;
    const bg = scene.background;
    const fog = scene.fog;
    const mask = camera.layers.mask;
    scene.background = BLACK;
    scene.fog = null;
    camera.layers.set(BLOOM_LAYER);
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
    camera.layers.mask = mask;
    scene.background = bg;
    scene.fog = fog;
  }
}

const FinalShader = {
  uniforms: {
    tDiffuse: { value: null },
    tBloom: { value: null },
    uBloom: { value: 1.2 },
    uVignette: { value: 0.12 },
    uGrain: { value: 0.035 },
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tBloom;
    uniform float uBloom;
    uniform float uVignette;
    uniform float uGrain;
    uniform float uTime;
    uniform vec2 uRes;
    varying vec2 vUv;

    vec3 linearToSRGB(vec3 c) {
      vec3 lo = c * 12.92;
      vec3 hi = pow(c, vec3(1.0 / 2.4)) * 1.055 - 0.055;
      return mix(hi, lo, vec3(lessThanEqual(c, vec3(0.0031308))));
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    // FXAA (Lottes, versión compacta). Reemplaza al MSAA: en ANGLE/D3D11 el MSAA sobre
    // un render target half-float cuesta ~20 ms por cuadro.
    float luma(vec3 c) { return dot(sqrt(max(c, 0.0)), vec3(0.299, 0.587, 0.114)); }
    vec3 fxaa(vec2 uv) {
      vec2 px = 1.0 / uRes;
      vec3 nw = texture2D(tDiffuse, uv + vec2(-1.0, -1.0) * px).rgb;
      vec3 ne = texture2D(tDiffuse, uv + vec2(1.0, -1.0) * px).rgb;
      vec3 sw = texture2D(tDiffuse, uv + vec2(-1.0, 1.0) * px).rgb;
      vec3 se = texture2D(tDiffuse, uv + vec2(1.0, 1.0) * px).rgb;
      vec3 m = texture2D(tDiffuse, uv).rgb;
      float lNW = luma(nw), lNE = luma(ne), lSW = luma(sw), lSE = luma(se), lM = luma(m);
      float lMin = min(lM, min(min(lNW, lNE), min(lSW, lSE)));
      float lMax = max(lM, max(max(lNW, lNE), max(lSW, lSE)));
      vec2 dir = vec2(-((lNW + lNE) - (lSW + lSE)), (lNW + lSW) - (lNE + lSE));
      float reduce = max((lNW + lNE + lSW + lSE) * (0.25 / 8.0), 1.0 / 128.0);
      float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + reduce);
      dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * px;
      vec3 a = 0.5 * (texture2D(tDiffuse, uv + dir * (1.0 / 3.0 - 0.5)).rgb + texture2D(tDiffuse, uv + dir * (2.0 / 3.0 - 0.5)).rgb);
      vec3 b = a * 0.5 + 0.25 * (texture2D(tDiffuse, uv - dir * 0.5).rgb + texture2D(tDiffuse, uv + dir * 0.5).rgb);
      float lB = luma(b);
      return (lB < lMin || lB > lMax) ? a : b;
    }

    void main() {
      vec3 base = fxaa(vUv);
      vec3 bloom = max(texture2D(tBloom, vUv).rgb - 0.012, 0.0) * uBloom;
      // El halo se suma donde no hay color saturado: el núcleo del neón conserva el naranja exacto.
      float core = max(base.r, max(base.g, base.b));
      vec3 col = base + bloom * (1.0 - clamp(core, 0.0, 1.0));
      col = linearToSRGB(clamp(col, 0.0, 1.0));

      vec2 d = (vUv - 0.5) * vec2(uRes.x / uRes.y, 1.0);
      float vig = smoothstep(1.15, 0.25, length(d));
      col *= mix(1.0 - uVignette, 1.0, vig);

      float n = hash(vUv * uRes + fract(uTime) * 97.0) - 0.5;
      col += n * uGrain;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

export class Post {
  constructor(renderer, scene, camera, { bloom = true } = {}) {
    this.renderer = renderer;
    this.enabled = true;
    this.bloomEnabled = bloom;

    const rt = new THREE.WebGLRenderTarget(2, 2, {
      type: THREE.HalfFloatType,
      depthBuffer: true,
      stencilBuffer: true,
    });
    this.composer = new EffectComposer(renderer, rt);
    this.composer.addPass(new RenderPass(scene, camera));

    if (bloom) {
      const brt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, depthBuffer: true, stencilBuffer: true });
      this.bloomComposer = new EffectComposer(renderer, brt);
      this.bloomComposer.renderToScreen = false;
      this.bloomComposer.addPass(new BloomSourcePass(scene, camera));
      this.bloomPass = new UnrealBloomPass(new THREE.Vector2(256, 256), 1.1, 0.55, 0.0);
      this.bloomComposer.addPass(this.bloomPass);
    }

    this.final = new ShaderPass(FinalShader);
    this.final.uniforms.tBloom.value = this.bloomComposer ? this.bloomComposer.readBuffer.texture : null;
    if (!bloom) this.final.uniforms.uBloom.value = 0;
    this.composer.addPass(this.final);
  }

  get uniforms() {
    return this.final.uniforms;
  }

  setSize(w, h, pr) {
    this.composer.setPixelRatio(pr);
    this.composer.setSize(w, h);
    if (this.bloomComposer) {
      this.bloomComposer.setPixelRatio(pr * 0.5);
      this.bloomComposer.setSize(w, h);
      this.final.uniforms.tBloom.value = this.bloomComposer.readBuffer.texture;
    }
    this.final.uniforms.uRes.value.set(w * pr, h * pr);
  }

  render(dt, time, bloomStrength = 1) {
    this.final.uniforms.uTime.value = time;
    if (this.bloomComposer && bloomStrength > 0.001) {
      this.bloomComposer.render(dt);
      this.final.uniforms.uBloom.value = bloomStrength;
    } else {
      this.final.uniforms.uBloom.value = 0;
    }
    this.composer.render(dt);
  }
}
