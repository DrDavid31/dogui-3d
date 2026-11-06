import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll suave (Lenis) + ScrollTrigger con scrub: el scroll mueve un único "tiempo"
 * maestro con inercia; toda la coreografía se deriva de él. Pace decide cuánto scroll
 * cuesta cada tramo de ese tiempo.
 */
export class Scroll {
  constructor({ track, total, pace, scrub = 0.6 }) {
    this.track = track;
    this.total = total;
    this.pace = pace;
    this.state = { time: 0 };
    track.style.height = `${pace.length + 100}vh`;

    this.lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, touchMultiplier: 1.2, smoothWheel: true });
    this.lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => this.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    this.tween = gsap.to(this.state, {
      time: total,
      // El avance del tween es lineal con el scroll; aquí se convierte en tiempo.
      ease: (p) => pace.toTime(p * pace.length) / total,
      scrollTrigger: {
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub,
        invalidateOnRefresh: true,
      },
    });
  }

  get time() {
    return this.state.time;
  }

  /** Tiempo "crudo" del scroll actual, sin la inercia del scrub. */
  get rawTime() {
    const st = this.tween.scrollTrigger;
    return st ? this.pace.toTime(st.progress * this.pace.length) : 0;
  }

  yForTime(t) {
    const top = this.track.offsetTop;
    const range = this.track.offsetHeight - window.innerHeight;
    return top + (this.pace.toScroll(t) / this.pace.length) * range;
  }

  scrollToTime(t, { immediate = false, duration } = {}) {
    const y = this.yForTime(t);
    const dist = Math.abs(y - window.scrollY) / window.innerHeight;
    this.lenis.scrollTo(y, {
      immediate,
      duration: duration ?? Math.min(2.2, 0.8 + dist * 0.06),
      easing: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
      force: true,
    });
    if (immediate) {
      ScrollTrigger.update();
      this.tween.scrollTrigger?.scroll(y);
    }
  }

  /** Salta sin inercia (teclado, carga con #hash). */
  jumpToTime(t) {
    this.scrollToTime(t, { immediate: true });
    this.tween.progress(this.pace.toScroll(t) / this.pace.length);
  }

  stop() {
    this.lenis.stop();
  }

  start() {
    this.lenis.start();
  }
}
