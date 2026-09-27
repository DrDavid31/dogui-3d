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
const worldMode = !forceFlow && !reduceMotion && !small && hasWebGL2();

initLeadForm();
const pointer = initPointer({ motion: !reduceMotion });

if (worldMode) {
  import("./world.js").then(({ startWorld }) => startWorld({ pointer, skipIntro: params.has("nointro") }));
} else {
  // Modo flujo: navegación nativa con scroll suave del navegador.
  html.classList.add("is-flow");
  initMenu({
    onNavigate: (id, target) => target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }),
  });
}
