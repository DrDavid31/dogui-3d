// Móvil: cada capítulo abre una "ventana" donde se ve su modelo 3D. Las ventanas se
// insertan de inmediato (así el contenido no se desplaza cuando llega el 3D) y
// mobile.js las llena con WebGL cuando la página ya respondió.
const WINDOWS = [
  { after: ".sec--hero .hud--hero", model: "globe", tone: "light" },
  { after: '[data-hud="c1-title"]', model: "radar", tone: "light" },
  { after: '[data-hud="c2-title"]', model: "racks", tone: "dark" },
  { after: '[data-hud="c3-title"]', model: "soar", tone: "dark" },
  { before: '[data-hud="final"]', model: "logo", tone: "light" },
];

export function insertWindows() {
  const wins = [];
  for (const w of WINDOWS) {
    const ref = document.querySelector(w.after || w.before);
    if (!ref) continue;
    const el = document.createElement("div");
    el.className = "m3d";
    el.setAttribute("aria-hidden", "true");
    if (w.after) ref.after(el);
    else ref.before(el);
    wins.push({ el, kind: w.model, tone: w.tone, model: null });
  }
  document.documentElement.classList.add("has-m3d");
  return wins;
}
