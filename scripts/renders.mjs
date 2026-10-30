// Genera las imágenes fijas de cada capítulo (public/renders/*.webp) a partir de la
// experiencia 3D real. Se muestran en el modo estático: prefers-reduced-motion,
// navegadores sin WebGL y sin JS. Requiere el servidor de desarrollo (npm run dev).
//   node scripts/renders.mjs                 → escribe public/renders/
//   node scripts/renders.mjs <dir> @id ...   → solo prueba candidatos (PNG) en <dir>
// En cada toma se ocultan los textos en pantalla (HUD) y la barra superior; las
// tarjetas proyectadas en 3D (data-o) se ocultan salvo que la toma diga keepCards.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const URL = process.env.URL || "http://localhost:5178/doguiweb/?nointro";
const [, , outArg, ...specs] = process.argv;
const trial = specs.length > 0;
const outDir = resolve(outArg || "public/renders");

// Tomas finales: una por capítulo (y el hero). El nombre coincide con render.js.
const SHOTS = [
  { name: "hero", at: "@h2" },
  { name: "detectar", at: "@c1-intro" },
  { name: "responder", at: "@c2-soc" },
  { name: "automatizar", at: "@c3-soar" },
  { name: "contacto", at: "@c4-final" },
];
const shots = trial ? specs.map((at) => ({ name: at.slice(1).replace("|", "_"), at, keepCards: at.endsWith("!") })) : SHOTS;
const WIDTHS = [1600, 800];

mkdirSync(outDir, { recursive: true });
let browser;
for (const channel of ["chrome", "msedge"]) {
  try {
    browser = await chromium.launch({ channel, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
    break;
  } catch {}
}
if (!browser) throw new Error("No se pudo abrir Chrome ni Edge");
const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1.5 });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__dogui?.built?.size >= 2, null, { timeout: 30000 });
// Puntero fuera de la escena: sin paralaje ni cursor.
await page.mouse.move(800, 450);
await page.addStyleTag({
  content: `[data-hud], .topbar, .chapters, .cursor, .skip-link { visibility: hidden !important; }
    .hide-cards [data-o] { visibility: hidden !important; }`,
});

for (const s of shots) {
  const spec = s.at.replace(/!$/, "");
  await page.evaluate(
    ({ spec, keepCards }) => {
      document.documentElement.classList.toggle("hide-cards", !keepCards);
      const d = window.__dogui;
      const [id, off = "0"] = spec.slice(1).split("|");
      const st = d.dir.get(id);
      d.scroll.jumpToTime((st.t + st.end) / 2 + Number(off));
    },
    { spec, keepCards: Boolean(s.keepCards) },
  );
  await page.waitForTimeout(3200);
  const png = await page.screenshot({ type: "png" });
  if (trial) {
    const file = resolve(outDir, `${s.name}.png`);
    writeFileSync(file, png);
    console.log(file);
    continue;
  }
  // Conversión a WebP en el propio navegador (sin dependencias nativas).
  const out = await page.evaluate(
    async ({ b64, widths }) => {
      const img = new Image();
      img.src = `data:image/png;base64,${b64}`;
      await img.decode();
      return widths.map((w) => {
        const c = document.createElement("canvas");
        c.width = w;
        c.height = Math.round((w * img.height) / img.width);
        const g = c.getContext("2d");
        g.imageSmoothingQuality = "high";
        g.drawImage(img, 0, 0, c.width, c.height);
        return c.toDataURL("image/webp", 0.8).split(",")[1];
      });
    },
    { b64: png.toString("base64"), widths: WIDTHS },
  );
  out.forEach((b64, i) => {
    const file = resolve(outDir, `${s.name}-${WIDTHS[i]}.webp`);
    writeFileSync(file, Buffer.from(b64, "base64"));
    console.log(file);
  });
}
await browser.close();
