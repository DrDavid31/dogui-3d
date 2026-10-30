// Páginas de texto (aviso de privacidad, términos, checklist): sin 3D, misma marca.
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
import "./styles/ui.css";
import "./styles/extras.css";

import { initMenu } from "./ui/menu.js";
import { initTopbar } from "./ui/topbar.js";

document.documentElement.classList.add("is-flow", "is-page");
initMenu({ onNavigate: (id, target) => target.scrollIntoView({ behavior: "smooth", block: "start" }) });
initTopbar();

// Medición del sitio: el usuario puede desactivarla (se recuerda en este navegador).
// client-integrations.js no envía eventos si está desactivada o si el navegador
// manda Global Privacy Control / Do Not Track.
const KEY = "dogui_measure_off";
const box = document.querySelector("[data-measure]");
if (box) {
  const state = box.querySelector("[data-measure-state]");
  const btn = box.querySelector("[data-measure-toggle]");
  const signal = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1";
  const read = () => {
    try {
      return localStorage.getItem(KEY) === "1";
    } catch {
      return false;
    }
  };
  const render = () => {
    const off = read() || signal;
    state.textContent = off ? (signal && !read() ? "desactivada por la configuración de tu navegador" : "desactivada") : "activa";
    btn.textContent = off ? "Activar medición" : "Desactivar medición";
    btn.hidden = signal;
  };
  btn.addEventListener("click", () => {
    try {
      if (read()) localStorage.removeItem(KEY);
      else {
        localStorage.setItem(KEY, "1");
        localStorage.removeItem("dogui_distinct_id");
      }
    } catch {
      /* almacenamiento bloqueado: no hay medición posible */
    }
    render();
  });
  render();
}

document.querySelector("[data-print]")?.addEventListener("click", () => window.print());
