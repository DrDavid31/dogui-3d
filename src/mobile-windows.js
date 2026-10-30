// Móvil: cada capítulo tiene una "ventana" (.m3d, ya en el HTML desde render.js y
// visible por CSS en pantallas chicas) donde mobile.js dibuja su modelo 3D cuando la
// página ya respondió. Aquí solo se recogen y se activa el modo.
export function collectWindows() {
  const wins = [...document.querySelectorAll(".m3d[data-m3d]")].map((el) => ({
    el,
    kind: el.dataset.m3d,
    tone: el.dataset.tone,
    model: null,
  }));
  document.documentElement.classList.add("has-m3d");
  return wins;
}
