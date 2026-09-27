# DOGUI · experiencia 3D

Rediseño del sitio de DOGUI como una experiencia de scroll-storytelling 3D: una sola cámara
recorre un mundo continuo (Three.js) mientras el usuario hace scroll. Conserva todo el
contenido del sitio actual y todo el texto vive en el DOM (SEO, lectores de pantalla y
versión sin WebGL).

**Estado:** Hero + Capítulo 01 · Detectar terminados. Capítulos 02 (Responder),
03 (Automatizar), la transición del logo y el 04 (Contacto) todavía se muestran en la
versión estática (flujo), debajo del mundo 3D.

## Requisitos

- Node 20 o superior (probado con Node 24).
- Para `scripts/capture.mjs`: Google Chrome o Microsoft Edge instalados.

## Instalación y desarrollo

```bash
npm install
npm run dev
```

Abre <http://localhost:5178/doguiweb/>.

Parámetros útiles en desarrollo:

| Parámetro | Efecto |
| --- | --- |
| `?nointro` | Salta el loader del logo 3D. |
| `?static` | Fuerza la versión estática (flujo), como en móvil o sin WebGL. |
| `?freeze=1.4` | Congela el loader en ese segundo (solo en `dev`). |
| `#pyme`, `#exposicion`… | Entra directo a esa estación de la cámara. |

En `dev`, `window.__dogui` expone el escenario, el director de cámara y el scroll
(p. ej. `__dogui.scroll.jumpToTime(585)`).

## Build y despliegue en GitHub Pages

```bash
npm run build      # genera dist/ con base /doguiweb/
npm run preview    # sirve dist/ localmente
```

La ruta base es `/doguiweb/`. Para otra ruta: `BASE=/otra/ npm run build`.

`.github/workflows/deploy.yml` publica `dist/` en GitHub Pages en cada push a `main`
(en el repositorio: *Settings → Pages → Source: GitHub Actions*). En Actions la ruta base
se toma del nombre del repositorio (`/<repo>/`). Si se reemplaza el
repositorio `doguiweb` actual, se conservan canonical, Open Graph, `og-dogui.png`,
`robots.txt` y `sitemap.xml`.

## Estructura

```text
index.html                 Plantilla: meta/OG/JSON-LD; el contenido se inserta en build.
vite.config.js             Base /doguiweb/ + plugin que genera el HTML desde src/content.
src/
  content/content.js       TODO el texto del sitio (editar aquí).
  content/render.js        HTML semántico a partir de content.js (corre en Node).
  main.js                  Decide modo: mundo 3D (escritorio + WebGL2) o flujo estático.
  world.js                 Arranque del mundo 3D, bucle, navegación, foco con teclado.
  core/
    renderer.js            Renderer, escena, cámara, entorno PMREM.
    camera.js              Ruta CatmullRom + parallax + colocación en encuadre.
    director.js            Estaciones de cámara (hold/travel) → tiempos y encuadres.
    scroll.js              Lenis + GSAP ScrollTrigger (scrub 1.2 s).
    post.js                Bloom selectivo (solo capa naranja), FXAA, viñeta y grano.
    dom3d.js               Proyecta tarjetas HTML en el mundo (matemática CSS3D).
    hud.js                 Textos en pantalla con revelado por líneas (SplitText).
    env.js                 Fondo/niebla claro ↔ oscuro por tiempo y tono de la UI.
    loader.js              Logo 3D (extruido del SVG oficial) que se ensambla.
    assets.js              SVG → ExtrudeGeometry, fuente 3D, sombras de contacto.
    timeline.js            Rampas, ventanas e interpolación monótona.
  scenes/
    hero/                  Mesa + laptop + consola SOC + portal/túnel neón.
    detectar/              Capítulo 01 (index = guion y contenido, build = geometría).
  ui/                      Menú, formulario (API + mailto), cursor, magnéticos, tilt.
  styles/                  tokens, base, flow (estático), world (3D), ui.
public/
  assets/                  Logos oficiales, favicons, og-dogui.png, icons.svg.
  fonts/jakarta-800.typeface.json   Plus Jakarta Sans ExtraBold para TextGeometry.
scripts/
  make-typeface.mjs        Regenera la fuente 3D (npm run fonts).
  capture.mjs              Captura cuadros de la experiencia (requiere npm run dev).
```

## Cómo funciona

- **Un solo tiempo maestro.** El scroll (Lenis) mueve un valor `time` en vh con
  ScrollTrigger (`scrub: 1.2`). Cámara, fondo, niebla, tarjetas y textos se derivan de él.
- **Estaciones.** Cada escena declara estaciones de cámara (dónde se lee y cuánto dura el
  viaje). El director arma la `CatmullRomCurve3` y reparte los tiempos.
- **Tarjetas HTML en 3D.** Las tarjetas son el mismo HTML del sitio; `dom3d.js` les aplica
  `perspective() matrix3d()` con la cámara de Three.js. Se ven nítidas y siguen siendo
  seleccionables, indexables y navegables con teclado (al enfocar una, la cámara viaja a
  ella).
- **Marca.** Naranja único `--dogui-orange: #FF6B00`, tomado del `fill` del SVG del logo.
  El logo 2D usa `logo-lockup-dark.svg` y `logo-mark-small-dark.svg` sin cambios; el logo
  3D se genera de ese mismo SVG (cada trazo con su color original, solo profundidad y
  bisel).
- **Modos.** Escritorio con WebGL2 → mundo 3D. Móvil (≤ 900 px o puntero táctil),
  `prefers-reduced-motion`, sin WebGL o sin JS → versión estática completa (flujo).

## Editar textos

Todo el copy está en `src/content/content.js`. En `dev`, guardar ese archivo reinicia
el servidor y recarga el HTML.
