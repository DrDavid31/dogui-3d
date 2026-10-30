import * as THREE from "three";
import { gsap } from "gsap";
import { createLogo } from "./assets.js";
import { D } from "./camera.js";

const BLACK = new THREE.Color("#0A0A0A");

/**
 * Loader: fondo negro, el logo 3D (extruido del SVG oficial) se ensambla pieza por pieza
 * desde distintas profundidades, destella en naranja y funde a la escena del hero.
 * Dura como máximo ~2.4 s y se puede saltar.
 */
export class Loader {
  constructor(stage, { onReveal } = {}) {
    this.stage = stage;
    this.onReveal = onReveal;
    this.active = true;
    this.mix = 1; // 1 = todo negro salvo el logo
    this.flash = 0;
    this.el = document.querySelector("[data-loader]");
    this.skipBtn = document.querySelector("[data-loader-skip]");
  }

  async start() {
    const logo = await createLogo({ part: "all", height: 170, depth: 46, bevel: 5 });
    this.logo = logo;
    const { pieces, materials } = logo.userData;
    for (const m of materials) {
      m.fog = false;
      m.transparent = true;
      m.needsUpdate = true;
    }
    logo.position.set(0, 0, -D * 1.05);
    // Oculto hasta que sus shaders estén listos: dibujarlo antes congela el cuadro.
    logo.visible = false;
    this.stage.camera.add(logo);
    await this.stage.precompile(logo);
    logo.visible = true;

    // Cada pieza llega desde otra profundidad y rotación.
    const rnd = (a, b) => a + Math.random() * (b - a);
    pieces.forEach((p, i) => {
      p.userData.from = {
        // Unidades locales del SVG (el grupo está escalado ~0.17).
        x: p.userData.home.x + rnd(-2600, 2600),
        y: p.userData.home.y + rnd(-2000, 2000),
        z: rnd(-9000, 5200),
        rx: rnd(-2.4, 2.4),
        ry: rnd(-2.4, 2.4),
        rz: rnd(-1.2, 1.2),
      };
      p.position.set(p.userData.from.x, p.userData.from.y, p.userData.from.z);
      p.rotation.set(p.userData.from.rx, p.userData.from.ry, p.userData.from.rz);
      p.userData.i = i;
    });

    this.el?.classList.add("is-transparent");
    this.skipBtn?.setAttribute("tabindex", "0");

    const tl = gsap.timeline({ onComplete: () => this.finish() });
    this.tl = tl;
    const order = [...pieces].sort(() => Math.random() - 0.5);
    order.forEach((p, k) => {
      tl.to(p.position, { x: p.userData.home.x, y: p.userData.home.y, z: p.userData.home.z, duration: 1.05, ease: "expo.out" }, 0.05 + k * 0.022);
      tl.to(p.rotation, { x: 0, y: 0, z: 0, duration: 1.05, ease: "expo.out" }, 0.05 + k * 0.022);
    });
    const accent = materials.find((m) => m.userData.isAccent);
    tl.addLabel("flash", 1.3);
    tl.to(this, { flash: 1, duration: 0.16, ease: "power2.out" }, "flash");
    if (accent) tl.to(accent, { emissiveIntensity: 5, duration: 0.16, ease: "power2.out" }, "flash");
    tl.to(logo.rotation, { y: 0.12, x: -0.04, duration: 1.1, ease: "sine.inOut" }, 0.4);
    tl.to(this, { flash: 0, duration: 0.5, ease: "power2.in" }, "flash+=0.2");
    if (accent) tl.to(accent, { emissiveIntensity: 0.9, duration: 0.5 }, "flash+=0.2");
    tl.addLabel("out", 1.75);
    tl.to(logo.position, { z: -D * 0.35, duration: 0.6, ease: "power2.in" }, "out");
    tl.to(materials, { opacity: 0, duration: 0.45, ease: "power1.in" }, "out+=0.12");
    tl.to(this, { mix: 0, duration: 0.65, ease: "power2.inOut" }, "out");
    tl.call(
      () => {
        document.documentElement.classList.add("is-revealing");
        this.onReveal?.();
      },
      null,
      "out+=0.25",
    );

    // Solo desarrollo: ?freeze=1.4 congela el loader en ese segundo (capturas).
    const freeze = import.meta.env.DEV && new URLSearchParams(location.search).get("freeze");
    if (freeze) tl.pause().seek(Number(freeze));

    const skip = () => this.skip();
    this.skipBtn?.addEventListener("click", skip);
    this._keys = (e) => {
      if (["Escape", "Enter", " "].includes(e.key)) skip();
    };
    window.addEventListener("keydown", this._keys);
    return new Promise((res) => (this._done = res));
  }

  skip() {
    if (!this.tl || !this.active) return;
    const out = this.tl.labels.out;
    if (this.tl.time() < out) this.tl.seek(out);
    this.tl.timeScale(2.2);
  }

  /** Mezcla el ambiente real con negro mientras el loader está activo. */
  apply() {
    if (!this.active) return;
    const { scene } = this.stage;
    scene.background.lerp(BLACK, this.mix);
    scene.fog.color.lerp(BLACK, this.mix);
    scene.fog.near *= 1 - this.mix;
    scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, 2, this.mix);
  }

  finish() {
    this.active = false;
    this.stage.camera.remove(this.logo);
    this.logo.traverse((o) => o.geometry?.dispose());
    document.documentElement.classList.remove("is-loading", "is-revealing");
    this.skipBtn?.setAttribute("tabindex", "-1");
    window.removeEventListener("keydown", this._keys);
    this._done?.();
  }
}
