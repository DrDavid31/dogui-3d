import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { invLerp, smooth } from "./timeline.js";

gsap.registerPlugin(SplitText);

const SPLIT = ".h-hero, .h-chapter, .h-section, .h-sub, .statement, .lede, .sub, .hud--caption";

/**
 * Textos en pantalla (títulos, kickers, frases). Se revelan por líneas con máscara
 * + translateY, sincronizados con el scroll; al salir se desvanecen hacia arriba.
 */
export class Hud {
  constructor() {
    this.items = [];
  }

  add(el, { show, instant = false }) {
    if (!el) return null;
    const item = { el, show, tl: null, on: false, lastO: -1, lastY: null, lastP: -1 };
    const targets = el.matches(SPLIT) ? [el] : [...el.querySelectorAll(SPLIT)];
    const others = [...el.querySelectorAll(".label, .actions, .contact__details")];
    if (!instant && targets.length) {
      item.split = SplitText.create(targets, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
        autoSplit: true,
        onSplit: (self) => {
          const tl = gsap.timeline({ paused: true });
          tl.from(self.lines, { yPercent: 105, duration: 0.7, stagger: 0.06, ease: "power3.out" }, 0);
          if (others.length) tl.from(others, { autoAlpha: 0, y: 14, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 0);
          if (item.tl) tl.progress(item.tl.progress());
          item.tl = tl;
          return tl;
        },
      });
    }
    this.items.push(item);
    return item;
  }

  update(t) {
    for (const it of this.items) {
      const [a, b, c, d] = it.show;
      // gate: permite retener un bloque (p. ej. el hero mientras corre el loader).
      const enter = Math.min(invLerp(a, b, t), it.gate ?? 1);
      const exit = c == null ? 0 : invLerp(c, d, t);
      const visible = enter > 0 && exit < 1;
      const o = visible ? Math.min(1, enter * 3) * (1 - smooth(exit)) : 0;
      const oq = Math.round(o * 1000) / 1000;
      if (oq !== it.lastO) {
        it.el.style.opacity = oq;
        it.lastO = oq;
      }
      const y = visible ? -smooth(exit) * 40 : 0;
      const yq = Math.round(y * 10) / 10;
      if (yq !== it.lastY) {
        it.el.style.transform = yq ? `translate3d(0, ${yq}px, 0)` : "";
        it.lastY = yq;
      }
      if (visible !== it.on) {
        it.on = visible;
        it.el.classList.toggle("is-on", visible);
      }
      if (it.tl) {
        const p = Math.round(smooth(enter) * 1000) / 1000;
        if (p !== it.lastP) {
          it.tl.progress(p);
          it.lastP = p;
        }
      }
    }
  }

  timeFor(el) {
    for (const it of this.items) {
      if (it.el === el || it.el.contains(el)) {
        const [, b, c] = it.show;
        return c == null ? b : b + (c - b) * 0.25;
      }
    }
    return null;
  }
}
