import { defineConfig } from "vite";
import { renderApp, renderChrome } from "./src/content/render.js";

// GitHub Pages sirve el sitio bajo /doguiweb/. Para otra ruta: BASE=/otra/ npm run build
const base = process.env.BASE || "/doguiweb/";
// URL pública (canonical, Open Graph, JSON-LD, sitemap): sigue a la ruta base, así cada
// despliegue se identifica con su propia dirección. Otra: SITE_URL=https://… npm run build
const siteUrl = process.env.SITE_URL || `https://drdavid31.github.io${base}`;

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
        .replaceAll("__SITE_URL__", siteUrl)
        .replace("<!--app-chrome-->", chrome.header + chrome.chapters)
        .replace("<!--app-main-->", app.hero + app.detectar + app.responder + app.automatizar + app.contacto)
        .replace("<!--app-footer-->", chrome.footer);
    },
    // robots.txt y sitemap.xml con la URL de este despliegue.
    generateBundle() {
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: "asset",
        fileName: "robots.txt",
        source: `User-agent: *
Allow: /

Sitemap: ${siteUrl}sitemap.xml
`,
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
      });
    },
    configureServer(server) {
      // Vite empaqueta la config (y el contenido que importa): reiniciar recarga los textos.
      server.watcher.on("change", (file) => {
        if (/[\\/]src[\\/]content[\\/]/.test(file)) server.restart();
      });
    },
  };
}

// Precarga las fuentes visibles en el primer cuadro (título, texto, etiquetas): sin
// esto, el cambio de fuente de respaldo a la real desplaza el hero en móvil (CLS).
const PRELOAD_FONTS = /(plus-jakarta-sans-latin-800|inter-latin-400|inter-latin-600|jetbrains-mono-latin-500)-normal-[\w-]+\.woff2$/;

function fontPreload() {
  return {
    name: "dogui-font-preload",
    transformIndexHtml: {
      order: "post",
      handler(html, { bundle }) {
        if (!bundle) return html;
        return Object.keys(bundle)
          .filter((f) => PRELOAD_FONTS.test(f))
          .map((f) => ({
            tag: "link",
            attrs: { rel: "preload", href: base + f, as: "font", type: "font/woff2", crossorigin: "" },
            injectTo: "head",
          }));
      },
    },
  };
}

export default defineConfig({
  base,
  plugins: [contentHtml(), fontPreload()],
  build: {
    target: "es2020",
    // Mapas de fuente publicados (el repositorio es público): depuración en producción.
    sourcemap: true,
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  server: { port: 5178, strictPort: true },
});
