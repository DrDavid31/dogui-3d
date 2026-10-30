/**
 * Barra superior en modo flujo: al hacer scroll gana un fondo (ui.css) en el tono de la
 * sección que pasa por debajo, para que el texto no choque con los botones.
 */
export function initTopbar() {
  const bar = document.querySelector("[data-topbar]");
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    bar.classList.toggle("is-solid", window.scrollY > 8);
    const y = bar.getBoundingClientRect().bottom + 10;
    const under = document.elementFromPoint(window.innerWidth / 2, y);
    const tone = under?.closest("[data-tone]")?.dataset.tone || "light";
    if (bar.dataset.bar !== tone) bar.dataset.bar = tone;
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);
  update();
}
