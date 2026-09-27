import { gsap } from "gsap";

const INTERACTIVE = "a, button, input, select, textarea, label, [data-tilt]";

/**
 * Puntero: posición normalizada para el parallax de cámara, halo naranja sobre
 * elementos interactivos, botones magnéticos y tilt en tarjetas de paquete.
 */
export function initPointer({ motion = true } = {}) {
  const pointer = { x: 0, y: 0, nx: 0, ny: 0 };
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const cursor = document.querySelector("[data-cursor]");
  const moveX = cursor ? gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" }) : null;
  const moveY = cursor ? gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" }) : null;

  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
      if (fine && cursor) {
        moveX(e.clientX);
        moveY(e.clientY);
        const over = e.target instanceof Element && e.target.closest(INTERACTIVE);
        cursor.classList.toggle("is-active", Boolean(over));
        cursor.style.scale = over ? "1" : "0.4";
      }
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => cursor?.classList.remove("is-active"));

  if (fine && motion) {
    // Botones con leve efecto magnético.
    document.addEventListener(
      "pointermove",
      (e) => {
        const el = e.target instanceof Element ? e.target.closest("[data-magnetic]") : null;
        document.querySelectorAll("[data-magnetic].is-pulled").forEach((b) => {
          if (b !== el) {
            b.classList.remove("is-pulled");
            gsap.to(b, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
          }
        });
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.classList.add("is-pulled");
        gsap.to(el, { x: dx * 12, y: dy * 10, duration: 0.35, ease: "power3.out" });
      },
      { passive: true },
    );

    // Tilt 3D en tarjetas con data-tilt (paquetes).
    document.addEventListener(
      "pointermove",
      (e) => {
        const card = e.target instanceof Element ? e.target.closest("[data-tilt]") : null;
        document.querySelectorAll("[data-tilt].is-tilted").forEach((c) => {
          if (c !== card) {
            c.classList.remove("is-tilted");
            c.style.setProperty("--tx", "0deg");
            c.style.setProperty("--ty", "0deg");
          }
        });
        if (!card) return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add("is-tilted");
        card.style.setProperty("--tx", `${(-py * 8).toFixed(2)}deg`);
        card.style.setProperty("--ty", `${(px * 10).toFixed(2)}deg`);
      },
      { passive: true },
    );
  }

  return pointer;
}
