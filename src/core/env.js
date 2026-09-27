import * as THREE from "three";
import { invLerp, smooth, lerp } from "./timeline.js";

export const PAPER = new THREE.Color("#F7F7F5");
export const INK = new THREE.Color("#0A0A0A");

/**
 * Ambiente por tiempo: color de fondo + niebla + intensidades de post.
 * Las claves se interpolan (color en espacio lineal) y el tono de la UI
 * cambia a "dark" cuando el fondo es oscuro.
 */
export class Env {
  constructor(stage) {
    this.stage = stage;
    this.keys = [];
    this.color = new THREE.Color();
    this.fx = { bloom: 1, vignette: 0.1, grain: 0.03 };
    this.tone = "light";
    this.fog = { near: 3000, far: 16000 };
  }

  /** keys: [{ t, color, near, far, bloom, vignette, grain }] */
  set(keys) {
    this.keys = keys
      .map((k) => ({ ...k, c: new THREE.Color(k.color) }))
      .sort((a, b) => a.t - b.t);
  }

  update(t) {
    const K = this.keys;
    if (!K.length) return;
    let i = 0;
    while (i < K.length - 1 && K[i + 1].t <= t) i++;
    const a = K[i];
    const b = K[Math.min(i + 1, K.length - 1)];
    const k = a === b ? 0 : smooth(invLerp(a.t, b.t, t));
    this.color.copy(a.c).lerp(b.c, k);
    const near = lerp(a.near, b.near, k);
    const far = lerp(a.far, b.far, k);
    this.fx.bloom = lerp(a.bloom ?? 1, b.bloom ?? 1, k);
    this.fx.vignette = lerp(a.vignette ?? 0.1, b.vignette ?? 0.1, k);
    this.fx.grain = lerp(a.grain ?? 0.03, b.grain ?? 0.03, k);

    const { scene } = this.stage;
    scene.background.copy(this.color);
    scene.fog.color.copy(this.color);
    scene.fog.near = near;
    scene.fog.far = far;

    // Luminancia en sRGB para decidir el tono de la interfaz.
    const srgb = this.color.clone().convertLinearToSRGB();
    const lum = 0.2126 * srgb.r + 0.7152 * srgb.g + 0.0722 * srgb.b;
    const tone = lum < 0.45 ? "dark" : "light";
    if (tone !== this.tone) {
      this.tone = tone;
      document.documentElement.dataset.tone = tone;
    }
  }
}
