import { defineConfig } from "vite";
import { renderApp, renderChrome } from "./src/content/render.js";

// GitHub Pages sirve el sitio bajo /doguiweb/. Para otra ruta: BASE=/otra/ npm run build
const base = process.env.BASE || "/doguiweb/";

// Inserta el HTML generado desde src/content en index.html (dev y build):
// todo el texto llega en el HTML inicial, sin depender de JS.
function contentHtml() {
  return {
    name: "dogui-content-html",
    enforce: "pre",
    transformIndexHtml(html) {
      const app = renderApp({ base });
      const chrome = renderChrome({ base });
      return html
        .replace("<!--app-chrome-->", chrome.header + chrome.chapters)
        .replace("<!--app-main-->", app.hero + app.detectar + app.responder + app.automatizar + app.contacto)
        .replace("<!--app-footer-->", chrome.footer);
    },
    configureServer(server) {
      // Vite empaqueta la config (y el contenido que importa): reiniciar recarga los textos.
      server.watcher.on("change", (file) => {
        if (/[\\/]src[\\/]content[\\/]/.test(file)) server.restart();
      });
    },
  };
}

export default defineConfig({
  base,
  plugins: [contentHtml()],
  build: {
    target: "es2020",
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  server: { port: 5178, strictPort: true },
});
