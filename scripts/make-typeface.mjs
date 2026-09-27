// Convierte Plus Jakarta Sans ExtraBold (800) a typeface JSON para THREE.FontLoader / TextGeometry.
// Solo incluye los glifos que usa el texto 3D del sitio, para que el archivo pese poco.
// Uso: npm run fonts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, "node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff");
const out = resolve(root, "public/fonts/jakarta-800.typeface.json");

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/+-.· ";

const buf = readFileSync(src);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const scale = 1000 / font.unitsPerEm;
const r = (v) => Math.round(v * scale);

const glyphs = {};
for (const ch of CHARS) {
  const glyph = font.charToGlyph(ch);
  if (!glyph) continue;
  const bb = glyph.getBoundingBox();
  let o = "";
  // glyph.path está en unidades de la fuente con Y hacia arriba (sin invertir).
  for (const c of glyph.path.commands) {
    if (c.type === "M") o += `m ${r(c.x)} ${r(c.y)} `;
    else if (c.type === "L") o += `l ${r(c.x)} ${r(c.y)} `;
    // Formato typeface: el punto final va primero y después los puntos de control.
    else if (c.type === "Q") o += `q ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} `;
    else if (c.type === "C") o += `b ${r(c.x)} ${r(c.y)} ${r(c.x1)} ${r(c.y1)} ${r(c.x2)} ${r(c.y2)} `;
  }
  glyphs[ch] = { ha: r(glyph.advanceWidth), x_min: r(bb.x1), x_max: r(bb.x2), o: o.trim() };
}

const head = font.tables.head;
const data = {
  glyphs,
  familyName: "Plus Jakarta Sans",
  ascender: r(font.ascender),
  descender: r(font.descender),
  underlinePosition: r(font.tables.post.underlinePosition),
  underlineThickness: r(font.tables.post.underlineThickness),
  boundingBox: { xMin: r(head.xMin), yMin: r(head.yMin), xMax: r(head.xMax), yMax: r(head.yMax) },
  resolution: 1000,
  original_font_information: { format: 0, fontFamily: "Plus Jakarta Sans", fontSubfamily: "ExtraBold", license: "SIL Open Font License 1.1" },
  cssFontWeight: "800",
  cssFontStyle: "normal",
};

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data));
console.log(`typeface: ${Object.keys(glyphs).length} glifos → ${out}`);
