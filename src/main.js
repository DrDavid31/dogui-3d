import "@fontsource/plus-jakarta-sans/latin-700.css";
import "@fontsource/plus-jakarta-sans/latin-800.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/jetbrains-mono/latin-400.css";
import "@fontsource/jetbrains-mono/latin-500.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/flow.css";
import "./styles/world.css";
import "./styles/ui.css";

import { initMenu } from "./ui/menu.js";
import { initLeadForm } from "./ui/form.js";
import { initPointer } from "./ui/pointer.js";
import { insertWindows } from "./mobile-windows.js";

const html = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
const params = new URLSearchParams(location.search);

function hasWebGL2() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2"));
  } catch {
    return false;
  }
}

const forceFlow = params.has("static");
const webgl = hasWebGL2();
const worldMode = !forceFlow && !reduceMotion && !small && webgl;
const mobile3d = !forceFlow && !reduceMotion && small && webgl;

// Si la ventana cruza el umbral escritorio ↔ móvil, se recarga en el modo correcto.
window.matchMedia("(max-width: 900px), (pointer: coarse)").addEventListener("change", () => {
  if (!forceFlow && !reduceMotion) location.reload();
});

initLeadForm();
const pointer = initPointer({ motion: !reduceMotion });

if (worldMode) {
  import("./world.js").then(({ startWorld }) => startWorld({ pointer, skipIntro: params.has("nointro") }));
} else {
  // Modo flujo: navegación nativa con scroll suave del navegador.
  html.classList.add("is-flow");
  // Sin ventanas 3D (reducir movimiento, sin WebGL, ?static): se muestran las imágenes fijas.
  if (!mobile3d) html.classList.add("is-static");
  if (mobile3d) {
    // Las ventanas se reservan ya; el 3D (three.js y modelos) llega cuando la página
    // terminó de cargar y está libre, sin competir con el primer pantallazo.
    const wins = insertWindows();
    const start = () => import("./mobile.js").then(({ startMobile }) => startMobile(wins));
    const idle = () => (window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 200));
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
  }
  initMenu({
    onNavigate: (id, target) => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }),
  });
}
