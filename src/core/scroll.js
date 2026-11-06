import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Tiempo mínimo en una parada antes de poder pasar a la siguiente (ms). Quien lee a su
// ritmo no lo nota; un gesto fuerte de touchpad ya no se lleva varias paradas de corrido.
const STOP_DWELL = 800;
// Sin nuevo movimiento durante este tiempo (ms), si quedó entre dos paradas, se acomoda.
const SETTLE_DELAY = 300;

const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const canScroll = (el, dy) => (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0);

/**
 * Scroll suave (Lenis) + ScrollTrigger con scrub: el scroll mueve un único "tiempo"
 * maestro con inercia; toda la coreografía se deriva de él. Pace decide cuánto scroll
 * cuesta cada tramo de ese tiempo; stops son los puntos de lectura, que un gesto de
 * rueda no puede saltarse.
 */
export class Scroll {
  constructor({ track, total, pace, stops, scrub = 0.6 }) {
    this.track = track;
    this.total = total;
    this.pace = pace;
    this.stops = stops;
    this.held = null;
    window.addEventListener("resize", () => (this.stopYs = null));
    this.state = { time: 0 };
    track.style.height = `${pace.length + 100}vh`;

    this.lenis = new Lenis({
      lerp: 0.12,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      smoothWheel: true,
      virtualScroll: (data) => this.onInput(data),
    });
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

  /** Primera parada a partir de t: ahí el contenido ya terminó de entrar. */
  stopAt(t) {
    return t > 0 ? (this.stops.find((s) => s >= t) ?? t) : t;
  }

  /** Rueda y touchpad: la decisión de Lenis se toma aquí (false = Lenis no interviene). */
  onInput(data) {
    const { event, deltaY } = data;
    if (event.type !== "wheel" || !deltaY || event.ctrlKey || this.lenis.isStopped) return true;
    const el = event.target instanceof Element ? event.target : null;
    if (el?.closest("[data-lenis-prevent]")) return true;
    // Un panel con scroll propio lo usa mientras pueda; en su borde sigue la página, con
    // el mismo Lenis (si siguiera el scroll nativo, los dos se pelean y la página brinca).
    const inner = el?.closest("[data-inner-scroll]");
    if (inner && canScroll(inner, deltaY)) return false;

    const dir = Math.sign(deltaY);
    this.lastDir = dir;
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => this.settle(), SETTLE_DELAY);

    const now = performance.now();
    if (this.held?.dir === dir && now - this.held.at < STOP_DWELL) {
      event.preventDefault();
      return false;
    }
    this.held = null;
    const from = this.lenis.targetScroll;
    const next = this.nextStopY(from, dir);
    if (next != null && (dir > 0 ? from + deltaY >= next : from + deltaY <= next)) {
      data.deltaY = next - from;
      this.held = { dir, at: now };
    }
    return true;
  }

  nextStopY(from, dir) {
    this.stopYs ||= this.stops.map((t) => this.yForTime(t));
    if (dir > 0) return this.stopYs.find((y) => y > from + 1) ?? null;
    for (let i = this.stopYs.length - 1; i >= 0; i--) if (this.stopYs[i] < from - 1) return this.stopYs[i];
    return null;
  }

  /** Si el movimiento terminó en un viaje de cámara, sigue hasta la parada más próxima. */
  settle() {
    const { lenis, pace } = this;
    const y = lenis.targetScroll;
    const top = this.track.offsetTop;
    const range = this.track.offsetHeight - window.innerHeight;
    const t = pace.toTime(((y - top) / range) * pace.length);
    if (y < top || y >= top + range || pace.isReading(t) || lenis.isStopped) return;
    if (document.querySelector("[data-menu]:not([hidden])")) return;
    const next = this.nextStopY(y, this.lastDir);
    if (next == null) return;
    this.held = { dir: this.lastDir, at: performance.now() };
    lenis.scrollTo(next, { duration: 0.7, easing: easeInOut });
  }

  scrollToTime(t, { immediate = false, duration } = {}) {
    this.held = null;
    clearTimeout(this.settleTimer);
    const y = this.yForTime(t);
    const dist = Math.abs(y - window.scrollY) / window.innerHeight;
    this.lenis.scrollTo(y, {
      immediate,
      duration: duration ?? Math.min(2.2, 0.8 + dist * 0.06),
      easing: easeInOut,
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
