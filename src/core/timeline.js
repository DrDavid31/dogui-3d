// Utilidades de tiempo. La unidad de "tiempo" de la experiencia es el vh de scroll:
// t = 100 significa que el usuario bajó una pantalla completa.

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (a === b ? (v >= b ? 1 : 0) : clamp((v - a) / (b - a)));
export const smooth = (t) => t * t * (3 - 2 * t);
export const easeOut = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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
