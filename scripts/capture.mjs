// Captura cuadros de la experiencia 3D en tiempos de scroll concretos.
// Requiere el servidor de desarrollo corriendo (npm run dev) y Chrome instalado.
//   node scripts/capture.mjs <carpeta-salida> [t1 t2 ...]
// Sin tiempos, captura los puntos clave del hero y del capítulo 01.
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const [, , outDir = "captures", ...times] = process.argv;
const URL = process.env.URL || "http://localhost:5178/doguiweb/?nointro";
const shots = times.length
  ? times.map((t) => ({ t, name: t.startsWith("@") ? t.slice(1).replace("|", "_") : `t${t}` }))
  : [
      { t: 0, name: "01-hero" },
      { t: 165, name: "02-hero-capacidades" },
      { t: 318, name: "03-entra-al-perimetro" },
      { t: 440, name: "04-tunel" },
      { t: 585, name: "05-detectar" },
      { t: 713, name: "06-exposicion" },
      { t: 846, name: "07-que-monitoreamos" },
      { t: 980, name: "08-que-entregamos" },
      { t: 1108, name: "09-proceso" },
      { t: 1239, name: "10-planes-tem" },
      { t: 1390, name: "11-pyme-telefono" },
      { t: 1636, name: "12-cluster-marca" },
      { t: 1885, name: "13-paquetes-pyme" },
      { t: 2017, name: "14-awareness" },
      { t: 2277, name: "15-awareness-planes" },
      { t: 2545, name: "16-cursos" },
      { t: 2690, name: "17-letras-detectar" },
    ];

mkdirSync(outDir, { recursive: true });
let browser;
for (const channel of ["chrome", "msedge"]) {
  try {
    browser = await chromium.launch({ channel, args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"] });
    break;
  } catch {}
}
if (!browser) throw new Error("No se pudo abrir Chrome ni Edge");
const [VW, VH] = (process.env.VIEWPORT || "1440x900").split("x").map(Number);
const page = await browser.newPage({ viewport: { width: VW, height: VH } });
await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForFunction(() => window.__dogui?.built?.size >= 2, null, { timeout: 30000 });
await page.mouse.move(720, 450);

for (const s of shots) {
  // "@id" = mitad del hold de esa estación; "@id|+30" = desplazado.
  await page.evaluate((spec) => {
    const d = window.__dogui;
    let t = Number(spec);
    if (typeof spec === "string" && spec.startsWith("@")) {
      const [id, off = "0"] = spec.slice(1).split("|");
      const st = d.dir.get(id);
      t = (st.t + st.end) / 2 + Number(off);
    }
    d.scroll.jumpToTime(t);
  }, String(s.t));
  await page.waitForTimeout(2600);
  const file = resolve(outDir, `${s.name}.png`);
  await page.screenshot({ path: file });
  console.log(file);
}

if (!times.length) {
  // Loader: congela el logo 3D ya ensamblado, en pleno destello.
  await page.goto(URL.replace("?nointro", "?freeze=1.42"), { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  const file = resolve(outDir, "00-loader.png");
  await page.screenshot({ path: file });
  console.log(file);
}
await browser.close();
