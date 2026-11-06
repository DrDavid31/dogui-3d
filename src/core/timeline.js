// Utilidades de tiempo. La coreografía se escribe en unidades de "tiempo"; cuánto scroll
// cuesta cada unidad lo decide Pace (al final de este archivo).

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (a === b ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a)));
export const smooth = (t) => t * t * (3 - 2 * t);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Cede el hilo principal entre pasos pesados: varias tareas cortas en vez de una larga,
 * para que el scroll y la animación sigan fluidos mientras se construye un capítulo.
 */
export const yieldTask = () => (globalThis.scheduler?.yield ? globalThis.scheduler.yield() : new Promise((r) => setTimeout(r, 0)));

/** 0 → 1 mientras t recorre [a, b]; suavizado. */
export const ramp = (t, a, b) => smooth(invLerp(a, b, t));

/**
 * Ventana de visibilidad: sube en [inA, inB], se mantiene y baja en [outA, outB].
 * Devuelve { v: opacidad 0..1, enter: 0..1, exit: 0..1 }.
 */
export function windowed(t, inA, inB, outA, outB) {
  const enter = invLerp(inA, inB, t);
  const exit = outA == null ? 0 : invLerp(outA, outB, t);
  return { v: smooth(enter) * (1 - smooth(exit)), enter, exit };
}

/**
 * Interpolación cúbica monótona (Fritsch–Carlson) para mapear tiempo → índice de keyframe
 * sin sobrepasos: la cámara nunca retrocede y su velocidad es continua.
 */
export function monotoneMap(xs, ys) {
  const n = xs.length;
  const dx = [];
  const m = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i];
    m[i] = (ys[i + 1] - ys[i]) / dx[i];
  }
  const c1 = [m[0]];
  for (let i = 1; i < n - 1; i++) {
    const m0 = m[i - 1];
    const m1 = m[i];
    if (m0 * m1 <= 0) c1.push(0);
    else {
      const common = dx[i - 1] + dx[i];
      c1.push((3 * common) / ((common + dx[i]) / m0 + (common + dx[i - 1]) / m1));
    }
  }
  c1.push(m[n - 2]);
  const c2 = [];
  const c3 = [];
  for (let i = 0; i < n - 1; i++) {
    const inv = 1 / dx[i];
    const common = c1[i] + c1[i + 1] - 2 * m[i];
    c2.push((m[i] - c1[i] - common) * inv);
    c3.push(common * inv * inv);
  }
  return (x) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    let lo = 0;
    let hi = n - 2;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (xs[mid] <= x) lo = mid;
      else hi = mid - 1;
    }
    const d = x - xs[lo];
    return ys[lo] + c1[lo] * d + c2[lo] * d * d + c3[lo] * d * d * d;
  };
}

/**
 * Ritmo del recorrido: la coreografía está escrita en "tiempo" y aquí se decide cuánto
 * scroll cuesta cada tramo. Los viajes de cámara (nada que leer) cuestan poco y las
 * paradas de lectura conservan más; nada se desacomoda porque el guion no cambia.
 * hold y travel: vh de scroll por cada unidad de tiempo en cada tipo de tramo.
 */
export class Pace {
  /** zones: tramos [desde, hasta] donde se lee, ordenados y sin traslaparse. */
  constructor(zones, total, { hold = 1, travel = 0.28 } = {}) {
    this.zones = zones;
    const ts = [0];
    const ss = [0];
    const add = (to, rate) => {
      const from = ts[ts.length - 1];
      if (to <= from) return;
      ts.push(to);
      ss.push(ss[ss.length - 1] + (to - from) * rate);
    };
    for (const [from, to] of zones) {
      add(from, travel);
      add(to, hold);
    }
    add(total, hold);
    this.ts = ts;
    this.ss = ss;
    this.length = ss[ss.length - 1];
  }

  static map(from, to, v) {
    if (v <= from[0]) return to[0];
    let hi = from.length - 1;
    if (v >= from[hi]) return to[hi];
    let lo = 0;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (from[mid] <= v) lo = mid;
      else hi = mid;
    }
    return to[lo] + ((v - from[lo]) / (from[hi] - from[lo])) * (to[hi] - to[lo]);
  }

  /** ¿Este instante está en una zona de lectura (y no en un viaje de cámara)? */
  isReading(t) {
    return this.zones.some(([from, to]) => t >= from && t <= to);
  }

  /** vh de scroll → tiempo. */
  toTime(s) {
    return Pace.map(this.ss, this.ts, s);
  }

  /** Tiempo → vh de scroll. */
  toScroll(t) {
    return Pace.map(this.ts, this.ss, t);
  }
}
