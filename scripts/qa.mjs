// Pruebas de punta a punta del sitio compilado. Requiere Google Chrome.
//   npm run build && npm run preview          (o el sitio ya publicado)
//   node scripts/qa.mjs http://localhost:4173/doguiweb/
//   node scripts/qa.mjs https://dogui.mx/ scroll     (agrega el recorrido completo, ~10 min)
//   node scripts/qa.mjs https://dogui.mx/ solo-scroll (solo el recorrido)
// Termina con código 1 si algo falla.
import { chromium } from "playwright-core";

const URL = (process.argv[2] || "http://localhost:4173/doguiweb/").replace(/\/?$/, "/");
const withScroll = process.argv.includes("scroll");
const onlyScroll = process.argv.includes("solo-scroll");
const GPU = ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const check = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
};

const browser = await chromium.launch({ channel: "chrome", args: GPU });

// Errores de consola y respuestas 4xx/5xx en cualquier página abierta.
async function open(ctxOpts = {}, path = "", { init, wait = "load" } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1536, height: 864 }, ...ctxOpts });
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.errors = [];
  page.on("pageerror", (e) => page.errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && page.errors.push(m.text().slice(0, 120)));
  page.on("response", (r) => r.status() >= 400 && page.errors.push(`${r.status()} ${r.url()}`));
  await page.goto(URL + path, { waitUntil: wait });
  return { ctx, page };
}
// Listo: el mundo 3D ya terminó el loader, o el sitio eligió la versión en flujo. (El módulo
// 3D se carga aparte: justo después de "load" todavía no hay ninguna de las dos clases.)
const ready = (page) =>
  page.waitForFunction(
    () => {
      const c = document.documentElement.classList;
      return (c.contains("is-world") && !c.contains("is-loading")) || c.contains("is-flow");
    },
    null,
    { timeout: 40000, polling: 100 },
  );
const opacity = (page, sel) => page.evaluate((s) => parseFloat(getComputedStyle(document.querySelector(s)).opacity), sel);

// ── Escritorio: loader, menú, saltos, teclado, formulario ────────────────
if (!onlyScroll) {
  const { ctx, page } = await open();
  const t0 = Date.now();
  await ready(page);
  check("Escritorio: el mundo 3D arranca", await page.evaluate(() => document.documentElement.classList.contains("is-world")), `${Date.now() - t0} ms hasta poder hacer scroll`);
  await sleep(800);

  await page.click(".hud--hero [data-menu-open]");
  await sleep(400);
  check("Botón «Ver todo lo que ofrecemos» abre el mapa", await page.evaluate(() => !document.querySelector("[data-menu]").hidden));

  await page.click('[data-menu] a[href="#forense"]');
  await page.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('[data-hud="for-head"]')).opacity) > 0.9, null, { timeout: 15000 }).catch(() => {});
  check("Salto del menú a Forense", (await opacity(page, '[data-hud="for-head"]')) > 0.9 && (await page.evaluate(() => document.querySelector("[data-menu]").hidden)));

  await page.evaluate(() => document.activeElement?.blur());
  const y0 = await page.evaluate(() => scrollY);
  await page.keyboard.press("PageDown");
  await sleep(1400);
  const y1 = await page.evaluate(() => scrollY);
  await page.keyboard.press("PageUp");
  await sleep(1400);
  const y2 = await page.evaluate(() => scrollY);
  check("PageDown y PageUp van de parada en parada", y1 > y0 + 100 && y2 < y1 - 100, `${y0} → ${y1} → ${y2}`);

  await page.goBack();
  await sleep(2500);
  check("Botón Atrás del navegador regresa", (await page.evaluate(() => location.hash)) === "");

  await page.click("[data-menu-toggle]");
  await sleep(300);
  await page.click('[data-menu] a[href="#contacto"]');
  await sleep(3000);
  const yForm = await page.evaluate(() => scrollY);
  await page.click('[data-lead-form] input[name="name"]');
  await sleep(1000);
  check("Clic en un campo no mueve la página", Math.abs((await page.evaluate(() => scrollY)) - yForm) < 5);

  // Rueda con el cursor sobre el formulario: debe seguir hasta lo que hay después.
  const box = await page.locator("[data-lead-form]").boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 120);
    await sleep(110);
  }
  await sleep(800);
  check("La rueda pasa el formulario y sigue bajando", (await page.evaluate(() => scrollY)) > yForm + 1000);

  // Formulario: no se envía sin consentimiento.
  const valid = await page.evaluate(() => {
    const f = document.querySelector("[data-lead-form]");
    f.elements.name.value = "Prueba";
    f.elements.company.value = "Empresa";
    f.elements.email.value = "prueba@ejemplo.com";
    f.elements.service.value = f.elements.service.options[1].value;
    return f.checkValidity();
  });
  check("El formulario exige aceptar el aviso de privacidad", valid === false);
  check("Escritorio sin errores de consola ni de red", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ── Teclado: cada elemento enfocado con Tab queda en pantalla ────────────
if (!onlyScroll) {
  const { ctx, page } = await open({}, "?nointro");
  await sleep(3000);
  const bad = [];
  let reached = false;
  for (let i = 0; i < 140 && !reached; i++) {
    await page.keyboard.press("Tab");
    await sleep(i < 6 ? 400 : 1200);
    const r = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const b = el.getBoundingClientRect();
      let o = 1;
      for (let x = el; x && x !== document.documentElement; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity);
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      const inView = cx > 0 && cx < innerWidth && cy > 0 && cy < innerHeight && b.width > 0;
      return { label: (el.textContent || el.name || el.tagName).trim().slice(0, 30), inView, o };
    });
    if (!r) continue;
    if (!r.inView || r.o < 0.6) bad.push(r.label);
    if (r.label.startsWith("Enviar")) reached = true;
  }
  check("Tab recorre el sitio con cada foco visible", reached && bad.length === 0, bad.slice(0, 4).join(", "));
  await ctx.close();
}

// ── Herramientas gratuitas ───────────────────────────────────────────────
for (const mobile of onlyScroll ? [] : [false, true]) {
  const opts = mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : {};
  const { ctx, page } = await open(opts, "?nointro");
  await sleep(2500);
  const tag = mobile ? "Celular" : "Escritorio";
  const out = await page.evaluate(() => {
    const quiz = document.querySelector("[data-quiz]");
    quiz.querySelectorAll('input[value="5"]').forEach((i) => (i.checked = true));
    quiz.requestSubmit();
    const sel = document.querySelector("[data-selector]");
    const set = (n, v) => (sel.querySelector(`input[name="${n}"][value="${v}"]`).checked = true);
    set("size", 1);
    set("worry", 5);
    set("team", 0);
    sel.requestSubmit();
    return {
      quiz: document.querySelector("[data-quiz-result]")?.innerText.includes("/100"),
      forense: document.querySelector("[data-selector-result] [data-service]")?.dataset.service,
    };
  });
  check(`${tag}: autodiagnóstico da resultado`, out.quiz === true);
  check(`${tag}: selector recomienda Forense ante un fraude`, out.forense === "Forense digital / Investigación de fraude", out.forense);
  // En el mundo 3D el botón solo se ve en la parada de contacto: se activa por código.
  await page.evaluate(() => document.querySelector("[data-incident]").click());
  await sleep(1500);
  const inc = await page.evaluate(() => ({ u: document.querySelector('[name="urgency"]').value, s: document.querySelector('[name="service"]').value }));
  check(`${tag}: «Reportar incidente» llena el formulario`, inc.u === "Tengo un incidente ahora" && inc.s === "Respuesta a incidentes");
  check(`${tag}: sin errores de consola ni de red`, page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ── Celular: mapa del menú y ventanas 3D ─────────────────────────────────
if (!onlyScroll) {
  const { ctx, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }, "", { wait: "networkidle" });
  await sleep(1500);
  const r = await page.evaluate(() => ({ w: document.documentElement.scrollWidth, cls: document.documentElement.className }));
  check("Celular: sin desplazamiento horizontal", r.w === 390, `${r.w} px`);
  check("Celular: ventanas 3D activas", r.cls.includes("has-m3d"));
  await page.tap(".hud--hero [data-menu-open]");
  await sleep(400);
  await page.tap('[data-menu] a[href="#forense"]');
  await sleep(1600);
  const top = await page.evaluate(() => Math.round(document.getElementById("forense").getBoundingClientRect().top));
  check("Celular: el menú lleva a Forense", top >= 0 && top < 160, `${top} px del borde`);
  check("Celular: sin errores", page.errors.length === 0, page.errors.slice(0, 3).join(" | "));
  await ctx.close();
}

// ── Modos sin 3D ─────────────────────────────────────────────────────────
for (const [name, opts, init] of onlyScroll ? [] : [
  ["Reducir movimiento", { reducedMotion: "reduce" }],
  ["Sin JavaScript", { javaScriptEnabled: false }],
  ["Sin WebGL", {}, () => (HTMLCanvasElement.prototype.getContext = () => null)],
]) {
  const { ctx, page } = await open(opts, "", { init });
  await sleep(2500);
  // Las imágenes cargan al acercarse (loading="lazy"): se recorre cada una.
  const renders = page.locator('img[src*="renders/"]');
  for (let i = 0; i < (await renders.count()); i++) {
    await renders.nth(i).scrollIntoViewIfNeeded();
    await sleep(500);
  }
  const r = await page.evaluate(() => ({
    world: document.documentElement.classList.contains("is-world"),
    imgs: [...document.images].filter((i) => /renders\//.test(i.currentSrc || i.src) && i.complete && i.naturalWidth > 0).length,
  }));
  check(`${name}: versión estática con imágenes`, !r.world && r.imgs >= 4, `${r.imgs} imágenes`);
  await ctx.close();
}

// ── Páginas legales y 404 ────────────────────────────────────────────────
for (const path of onlyScroll ? [] : ["privacidad/", "terminos/", "checklist/", "404.html", "robots.txt", "sitemap.xml"]) {
  const { ctx, page } = await open({}, path);
  const status = await page.evaluate(() => document.readyState);
  check(`/${path} abre sin errores`, status === "complete" && page.errors.length === 0, page.errors.slice(0, 2).join(" | "));
  await ctx.close();
}

// ── Recorrido completo con touchpad: nada se salta, de bajada y de subida ──
if (withScroll || onlyScroll) {
  const { ctx, page } = await open({}, "", {
    init: () => {
      window.__seen = { down: {}, up: {} };
      window.__dir = "down";
      let els = null;
      let last = performance.now();
      setInterval(() => {
        // Tiempo real entre muestras: con la máquina cargada el intervalo se atrasa.
        const now = performance.now();
        const dt = Math.min(now - last, 400);
        last = now;
        if (!els || els.length < 100) els = [...document.querySelectorAll("[data-hud], [data-o]")];
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
          let o = 1;
          for (let x = el; x && x !== document.documentElement; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity);
          const id = el.dataset.hud || el.dataset.o;
          if (o > 0.85) window.__seen[window.__dir][id] = (window.__seen[window.__dir][id] || 0) + dt;
        }
      }, 80);
    },
  });
  await ready(page);
  await page.mouse.move(768, 432);
  const end = await page.evaluate(() => document.getElementById("recursos").getBoundingClientRect().top + scrollY);
  const drive = async (sign, until) => {
    for (let n = 0; n < 200; n++) {
      for (let d = 90; d > 3; d *= 0.87) {
        await page.mouse.wheel(0, sign * d);
        await sleep(16);
      }
      await sleep(350);
      const y = await page.evaluate(() => scrollY);
      if (sign > 0 ? y >= until : y <= until) break;
    }
  };
  await drive(1, end);
  await page.evaluate(() => (window.__dir = "up"));
  await drive(-1, 0);
  const r = await page.evaluate(() => {
    const ids = [...document.querySelectorAll("[data-hud], [data-o]")].map((el) => el.dataset.hud || el.dataset.o);
    const short = (d) => ids.filter((id) => (window.__seen[d][id] || 0) < 600);
    return { n: ids.length, down: short("down"), up: short("up"), y: scrollY };
  });
  check("Touchpad: todo queda legible al bajar", r.down.length <= 2, `${r.down.length} de ${r.n} bloques < 0.6 s: ${r.down.join(", ")}`);
  check("Touchpad: todo queda legible al subir", r.up.length <= 2 && r.y < 10, `${r.up.length} de ${r.n}: ${r.up.join(", ")}`);
  check("Touchpad: sin errores durante el recorrido", page.errors.length === 0, [...new Set(page.errors)].slice(0, 3).join(" | "));
  await ctx.close();
}

await Promise.race([browser.close(), sleep(5000)]);
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} de ${results.length} pruebas pasaron.`);
process.exit(failed.length ? 1 : 0);
