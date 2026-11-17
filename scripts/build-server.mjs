// Paquete para subir a un servidor propio (raíz del dominio).
//   npm run build:server                       → https://dogui.mx/
//   SITE_URL=https://www.otro.mx/ npm run build:server
// Deja el sitio en dist/ y un .zip listo en entregable/.
import { execSync } from "node:child_process";
import { mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
let siteUrl = process.env.SITE_URL || "https://dogui.mx/";
if (!/^https?:\/\/[^/]+\//.test(siteUrl)) siteUrl = siteUrl.replace(/\/?$/, "/");
const host = new URL(siteUrl).host;

console.log(`Sitio para ${siteUrl}`);
execSync("npx vite build", {
  cwd: root,
  stdio: "inherit",
  env: { ...process.env, BASE: "/", SITE_URL: siteUrl, SERVER: "1", SOURCEMAP: "0" },
});

const out = resolve(root, "entregable");
mkdirSync(out, { recursive: true });
const zip = resolve(out, `dogui-web-${host}.zip`);
if (existsSync(zip)) rmSync(zip);
// tar (incluido en Windows 10+, macOS y Linux) arma el zip con los archivos ocultos
// (.htaccess, .well-known).
// En Windows, el tar del sistema (bsdtar) sabe crear .zip; el de Git Bash no.
const tar = process.platform === "win32" ? `"${join(process.env.SystemRoot || "C:/Windows", "System32", "tar.exe")}"` : "tar";
execSync(`${tar} -a -c -f "${zip}" -C "${resolve(root, "dist")}" .`, { stdio: "inherit" });
console.log(`\nListo: ${zip}\nSube el CONTENIDO de ese zip a la carpeta pública del dominio (public_html, www o htdocs).`);
