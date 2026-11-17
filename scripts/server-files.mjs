// Archivos extra del sitio publicado: página 404 y configuración para Apache.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/** Página 404 autocontenida (sin JS ni hojas externas: se ve bien desde cualquier ruta). */
export function notFoundPage({ base, email }) {
  return `<!doctype html>
<html lang="es-MX">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Página no encontrada | DOGUI</title>
    <meta name="robots" content="noindex" />
    <meta name="theme-color" content="#0a0a0a" />
    <link rel="icon" href="${base}assets/favicon.svg" type="image/svg+xml" />
    <style>
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100svh;
        display: grid;
        place-items: center;
        padding: 32px 20px;
        background: #0a0a0a;
        color: #f7f7f5;
        font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Inter, sans-serif;
      }
      main { width: min(560px, 100%); }
      img { display: block; width: 132px; height: auto; margin-bottom: 48px; }
      p.code { margin: 0 0 12px; color: #ff6b00; font: 600 13px/1 ui-monospace, Consolas, monospace; letter-spacing: 0.18em; }
      h1 { margin: 0 0 16px; font-size: clamp(32px, 7vw, 48px); line-height: 1.05; letter-spacing: -0.03em; }
      p { margin: 0 0 32px; color: #a8a8a4; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; }
      a.btn {
        display: inline-flex;
        align-items: center;
        min-height: 48px;
        padding: 0 22px;
        border-radius: 999px;
        font-weight: 600;
        text-decoration: none;
      }
      .btn--primary { background: #ff6b00; color: #0a0a0a; }
      .btn--ghost { border: 1px solid rgb(255 255 255 / 0.18); color: #f7f7f5; }
      a.btn:focus-visible { outline: 2px solid #ff6b00; outline-offset: 3px; }
    </style>
  </head>
  <body>
    <main>
      <img src="${base}assets/logo-lockup-dark.svg" alt="DOGUI" width="132" height="32" />
      <p class="code">ERROR 404</p>
      <h1>Esta página no existe.</h1>
      <p>Puede que el enlace esté mal escrito o que la página se haya movido. Desde el inicio encuentras todos los servicios de DOGUI.</p>
      <div class="actions">
        <a class="btn btn--primary" href="${base}">Volver al inicio</a>
        <a class="btn btn--ghost" href="mailto:${esc(email)}">Escribir a ${esc(email)}</a>
      </div>
    </main>
  </body>
</html>
`;
}

/** .htaccess para Apache (cPanel y la mayoría de los hostings compartidos). */
export function htaccess({ base }) {
  return `# DOGUI · configuración para Apache.
# Requiere que el hosting permita .htaccess (AllowOverride). Los bloques <IfModule> se
# ignoran si el módulo no está activo, así que el sitio funciona igual sin ellos.

Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 ${base}404.html

# ── HTTPS ────────────────────────────────────────────────────────────────
# Quita los "#" de las 4 líneas de abajo cuando el certificado SSL ya funcione
# (abre https://tu-dominio y revisa que cargue con candado). Antes de eso, dejarlas
# activas haría que el sitio no abra.
# <IfModule mod_rewrite.c>
#   RewriteEngine On
#   RewriteCond %{HTTPS} !=on
#   RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
# </IfModule>

<IfModule mod_mime.c>
  AddType application/manifest+json .webmanifest
  AddType font/woff2 .woff2
  AddType image/webp .webp
  AddType image/svg+xml .svg
  AddType text/javascript .js .mjs
</IfModule>

# ── Compresión ───────────────────────────────────────────────────────────
<IfModule mod_brotli.c>
  AddOutputFilterByType BROTLI_COMPRESS text/html text/css text/javascript application/javascript application/json application/manifest+json image/svg+xml text/plain application/xml
</IfModule>
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json application/manifest+json image/svg+xml text/plain application/xml
</IfModule>

# ── Seguridad ────────────────────────────────────────────────────────────
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  Header always set X-Frame-Options "SAMEORIGIN"
  # Con HTTPS ya activo, quita el "#" para que los navegadores usen siempre HTTPS:
  # Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# ── Caché ────────────────────────────────────────────────────────────────
# Las páginas se revisan en cada visita (los cambios se ven al instante). Los archivos
# con huella en el nombre (main-AbC123xy.js) nunca cambian: se guardan un año. El resto
# (imágenes, logos, fuente 3D), una semana.
<IfModule mod_headers.c>
  <FilesMatch "\\.(html|txt|xml)$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  <FilesMatch "\\.(js|css|svg|png|ico|webp|json|webmanifest|woff2?)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>
  <FilesMatch "-[A-Za-z0-9_-]{8}\\.(js|css|woff2?)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
`;
}
