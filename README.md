# DOGUI · experiencia 3D

Rediseño del sitio de DOGUI como una experiencia de scroll-storytelling 3D: una sola cámara
recorre un mundo continuo (Three.js) mientras el usuario hace scroll. Conserva todo el
contenido del sitio actual y todo el texto vive en el DOM (SEO, lectores de pantalla y
versión sin WebGL).

**Estado:** recorrido 3D completo: loader, Hero, 01 Detectar, 02 Responder,
03 Automatizar, transición del logo y 04 Contacto. En móvil el contenido va en flujo
vertical con "ventanas" 3D por capítulo; con `prefers-reduced-motion`, sin WebGL o sin
JS se muestra la versión estática completa, con una imagen fija de la escena 3D de cada
capítulo (`public/renders/`).

Lighthouse sobre el sitio publicado (2026-10-30): rendimiento 95 en móvil y 95 en
escritorio; accesibilidad, buenas prácticas y SEO 100; CLS 0. (En `vite preview` local
buenas prácticas marca 96 por el 404 de `/api/health`, que en github.io no se consulta.)

Modelos 3D (todos de ciberseguridad, en `src/scenes/shared/`): radar de detección,
globo de amenazas con arcos, escudo hexagonal, evidencias (correo, documento filtrado,
credencial, llave, base de datos, chip), personas (factor humano), pipeline de datos,
racks de servidores con LEDs, muro de monitores SOC, mapa de México en puntos,
roadmap 30·60·90, nodos SOAR (baliza → engrane → escudo), chip central, anillo PDCA,
letras y números cromados, y el logo extruido del SVG oficial sobre placa negra.

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

Capturas de estaciones (con `npm run dev` corriendo):
`node scripts/capture.mjs <carpeta> @c1-intro "@c2-soc|+20"` (`VIEWPORT=1536x864` opcional).

Imágenes fijas del modo estático: `node scripts/renders.mjs` las regenera en
`public/renders/` (WebP 1600 y 800 px) desde la escena 3D real; con
`node scripts/renders.mjs <carpeta> @c1-intro "@h1!"` solo prueba tomas (`!` deja las
tarjetas HTML visibles). Regenéralas si cambia el modelado o la iluminación.

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
se toma del nombre del repositorio (`/<repo>/`).

La URL pública (canonical, Open Graph, JSON-LD, `robots.txt` y `sitemap.xml`, que se
generan en el build) sigue a la ruta base: `https://drdavid31.github.io/<base>/`. Hoy el
repositorio `dogui-3d` se publica como `https://drdavid31.github.io/dogui-3d/`; si esta
versión reemplaza al repositorio `doguiweb`, vuelve sola a la URL original. Para un
dominio propio: `SITE_URL=https://dominio/ npm run build`.

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
  mobile-windows.js        Móvil: reserva las ventanas 3D en el DOM (sin three.js).
  mobile.js                Móvil: llena las ventanas con los modelos (carga diferida).
  scenes/
    hero/                  Mesa + laptop + consola SOC + portal/túnel neón.
    detectar/              Capítulo 01 (index = guion y contenido, build = geometría).
    responder/             Capítulo 02: letras cromadas, racks, SOC, 24/7·360·90, vCISO, SPEI.
    automatizar/           Capítulo 03: hiperespacio, SOAR, catálogo, CIDSI, software, logo.
    contacto/              Capítulo 04: paquetes, cierre con logo y formulario.
    shared/                Materiales, luces por capítulo y modelos (cyber.js, ops.js).
  ui/                      Menú, formulario (API + mailto), cursor, magnéticos, tilt.
  styles/                  tokens, base, flow (estático), world (3D), ui.
public/
  assets/                  Logos oficiales, favicons, og-dogui.png, icons.svg.
  fonts/jakarta-800.typeface.json   Plus Jakarta Sans ExtraBold para TextGeometry.
  renders/                 Imágenes fijas por capítulo para el modo estático.
scripts/
  make-typeface.mjs        Regenera la fuente 3D (npm run fonts).
  capture.mjs              Captura cuadros de la experiencia (requiere npm run dev).
  renders.mjs              Genera public/renders/ desde la escena 3D (requiere npm run dev).
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
- **Modos.** Escritorio con WebGL2 → mundo 3D. Móvil (≤ 900 px o puntero táctil) →
  flujo con ventanas 3D. `prefers-reduced-motion`, sin WebGL o sin JS → versión
  estática completa con imágenes fijas.
- **Sin tirones de shaders.** Todos los capítulos comparten un solo juego de luces
  (`Stage.lights`; cada capítulo aporta un preset en `shared/lights.js` y se mezclan en
  el cambio): si cambiara el número de luces, three.js recompilaría todos los shaders
  visibles. Cada capítulo se construye oculto y se precompila con
  `KHR_parallel_shader_compile` (`Stage.precompile`) antes de mostrarse; el entorno PMREM
  y el posproceso también. Al agregar un objeto: no cambies `transparent`, `fog` ni los
  colores por instancia después de construirlo (es otra variante del shader).

## Editar textos

Todo el copy está en `src/content/content.js`. En `dev`, guardar ese archivo reinicia
el servidor y recarga el HTML.

### Datos de contacto y legales (pendientes de llenar)

| Dato | Dónde | Qué aparece al llenarlo |
| --- | --- | --- |
| Teléfono | `site.phone` en `src/content/content.js` | Contacto, botón «Llamar ahora» del incidente, aviso de privacidad y JSON-LD |
| WhatsApp | `site.whatsapp` (solo dígitos, con lada: `52…`) | Botón flotante, contacto y botón de WhatsApp del incidente |
| Agenda en línea | `site.bookingUrl` | Botón «Agendar llamada de 30 min» en contacto |
| Razón social y domicilio | `legal.owner` y `legal.address` en `src/content/legal.js` | Responsable en el aviso de privacidad (art. 15, fr. I LFPDPPP), aviso corto del formulario, términos y pie |
| Correo de privacidad | `legal.privacyEmail` | Derechos ARCO, revocación y reporte de vulnerabilidades |

Mientras un dato esté vacío no se muestra (no hay números de ejemplo en el sitio).

## Páginas legales y herramientas

- `privacidad/`: aviso de privacidad integral conforme a la LFPDPPP vigente (DOF 20-03-2025,
  última reforma 14-11-2025; autoridad: Secretaría Anticorrupción y Buen Gobierno), con
  secciones para RGPD, CCPA/CPRA y leyes de Latinoamérica. El formulario muestra el aviso
  simplificado (art. 16) y pide consentimiento; las comunicaciones son opcionales.
- `terminos/`: términos de uso del sitio y de las herramientas gratuitas.
- `checklist/`: checklist imprimible para PyMEs.
- En la página principal, después del contacto: autodiagnóstico, selector «¿Por dónde
  empiezo?» y revisión de SPF/DMARC (DNS público de Cloudflare, con Google de respaldo),
  reporte de ejemplo, preguntas frecuentes y glosario. Se calculan en el navegador.
- El build genera `robots.txt`, `sitemap.xml` (con las 4 páginas) y `.well-known/security.txt`.
- La medición propia (`client-integrations.js`) se puede desactivar desde el aviso y respeta
  Global Privacy Control y Do Not Track.

Al actualizar el aviso, cambia `legal.updated` / `legal.updatedISO`.
