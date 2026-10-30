// Genera el HTML semántico de todo el sitio a partir de content.js.
// Corre en Node (plugin de Vite) para que el texto llegue en el HTML inicial:
// SEO, lectores de pantalla y la versión sin WebGL / sin JS usan este mismo DOM.
// En modo 3D, el JS toma los elementos marcados con data-o (objetos en el mundo)
// y data-hud (textos en pantalla) y los coloca sin duplicar contenido.
import * as C from "./content.js";
import { legal, privacyShort, privacy, terms } from "./legal.js";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Teléfono y WhatsApp: solo se muestran cuando están configurados en content.js.
const tel = () => (C.site.phone ? `tel:${C.site.phone.replace(/[^\d+]/g, "")}` : "");
const wa = (text) => (C.site.whatsapp ? `https://wa.me/${C.site.whatsapp}?text=${encodeURIComponent(text)}` : "");
const ARROW = `<span class="btn__arrow" aria-hidden="true">→</span>`;

export function renderApp({ base = "/" } = {}) {
  const A = (p) => `${base}assets/${p}`;
  const icon = (name) => `<svg class="i" aria-hidden="true"><use href="${A("icons.svg")}#icon-${name}"></use></svg>`;
  const arrow = `<span class="btn__arrow" aria-hidden="true">→</span>`;
  const mark = (cls = "") => `<img class="mark ${cls}" src="${A("logo-mark-small-dark.svg")}" alt="" width="20" height="25" />`;
  const list = (items, cls = "card__list") => `<ul class="${cls}">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
  const label = (n, text) => `<p class="label"><span class="label__n">${esc(n)}</span><span class="label__t">${esc(text)}</span></p>`;
  const btn = (b, variant = "primary") =>
    `<a class="btn btn--${variant}" href="${esc(b.href)}"${b.external ? ' target="_blank" rel="noopener noreferrer"' : ""} data-magnetic>${esc(b.label)}${arrow}</a>`;

  const socConsole = (key, extra = "") => `
    <div class="soc ${extra}" data-o="${key}" aria-hidden="true">
      <div class="soc__head">
        <span class="soc__brand">${mark("soc__mark")}${esc(C.socConsole.title)}</span>
        <span class="soc__live"><i></i>${esc(C.socConsole.live)}</span>
      </div>
      <ol class="soc__list">
        ${C.socConsole.alerts
          .map(
            (a) =>
              `<li class="soc__row"><span class="sev sev--${a.level}">${esc(a.sev)}</span><span class="soc__event">${esc(a.event)}</span><span class="soc__state">${esc(a.state)}</span></li>`,
          )
          .join("")}
      </ol>
    </div>`;

  const plan = (p, key, cls = "") => `
    <article class="card card--plan ${p.highlight ? "is-highlight" : ""} ${cls}" data-o="${key}">
      <p class="card__tier">${esc(p.tier)}</p>
      <h4 class="card__title">${esc(p.title)}</h4>
      <p class="card__text">${esc(p.text)}</p>
      ${list(p.items)}
      ${p.strong ? `<p class="card__strong">${esc(p.strong)}</p>` : ""}
    </article>`;

  const product = (p, key, h = "h5") => `
    <article class="card card--product" data-o="${key}">
      <div class="card__icon">${icon(p.icon)}</div>
      <${h} class="card__title">${esc(p.title)}</${h}>
      <p class="card__text">${esc(p.text)}</p>
      ${p.strong ? `<p class="card__strong">${esc(p.strong)}</p>` : ""}
    </article>`;

  // Ventana 3D del modo móvil (mobile.js dibuja ahí el modelo del capítulo). Va en el
  // HTML para que el espacio exista desde el primer pintado (ver flow.css).
  const win = (model, tone) => `<div class="m3d" data-m3d="${model}" data-tone="${tone}" aria-hidden="true"></div>`;

  // Imagen fija del capítulo: solo se muestra en el modo estático (ver flow.css).
  const still = (name, pos = "50% 50%") => `
    <figure class="render" style="--pos: ${pos}">
      <img src="${base}renders/${name}-1600.webp" srcset="${base}renders/${name}-800.webp 800w, ${base}renders/${name}-1600.webp 1600w" sizes="100vw" width="1600" height="900" alt="${esc(C.renders[name])}" loading="lazy" decoding="async" />
    </figure>`;

  const chapterHead = (ch, key) => `
    <header class="hud hud--chapter" data-hud="${key}">
      ${label(ch.n, ch.label)}
      <h2 class="h-chapter" id="${ch.id}-title">${esc(ch.title)}</h2>
      <p class="sub">${esc(ch.subtitle)}</p>
    </header>`;

  const [chDetect, chRespond, chAuto, chContact] = C.chapters;
  const H = C.hero;
  const E = C.exposicion;
  const P = C.pyme;
  const W = C.awareness;

  // ── Hero ───────────────────────────────────────────────────────────────
  const hero = `
  <section class="sec sec--hero" id="inicio" data-tone="light" aria-labelledby="hero-title">
    <div class="hud hud--hero" data-hud="hero">
      <p class="label"><span class="label__t">${esc(H.kicker)}</span></p>
      <h1 class="h-hero" id="hero-title">${esc(H.title)}</h1>
      <p class="lede">${esc(H.copy)}</p>
      <div class="actions">
        ${btn(H.primary, "primary")}
        <a class="btn btn--link" href="${esc(H.secondary.href)}">${esc(H.secondary.label)}${arrow}</a>
      </div>
    </div>
    ${win("globe", "light")}

    ${socConsole("hero-console", "soc--screen")}

    <div class="capabilities" data-wrap>
      <p class="hud hud--caption" data-hud="hero-caption">${esc(C.capabilities.lede)}</p>
      <ul class="chips" data-wrap aria-label="${esc(C.capabilities.label)}">
        ${C.capabilities.items.map((c, i) => `<li class="chip" data-o="cap-${i}">${icon(c.icon)}<span>${esc(c.label)}</span></li>`).join("")}
      </ul>
    </div>

    <aside class="card card--panel" data-o="hero-panel" aria-label="${esc(H.panel.label)}">
      <div class="panel__top">
        <span class="panel__brand">${mark()}<span>${esc(H.panel.status)}</span></span>
        <span class="pill">${esc(H.panel.pill)}</span>
      </div>
      <h2 class="card__title">${esc(H.panel.title)}</h2>
      <div class="panel__metrics">
        ${H.panel.metrics.map((m) => `<div>${icon(m.icon)}<strong>${esc(m.n)}</strong><span>${esc(m.label)}</span></div>`).join("")}
      </div>
      <div class="panel__stack">
        ${H.panel.stack.map((s) => `<div>${icon(s.icon)}<span>${esc(s.label)}</span><strong>${esc(s.value)}</strong></div>`).join("")}
      </div>
      <p class="card__text">${esc(H.panel.note)}</p>
    </aside>

    ${still("hero")}

    <div class="hud hud--statement hud--center hud--on-dark" data-hud="perimeter" aria-hidden="true">
      <p class="statement">${esc(C.story.perimeter)}</p>
    </div>
  </section>`;

  // ── Capítulo 01 · Detectar ─────────────────────────────────────────────
  const detectar = `
  <div class="chapter" id="detectar" data-ch="detectar" data-tone="light" aria-labelledby="detectar-title">
    ${chapterHead(chDetect, "c1-title")}
    ${win("radar", "light")}
    ${still("detectar", "55% 50%")}

    <div class="graph-ui" data-wrap aria-hidden="true">
      ${C.detectGraph.nodes.map((n, i) => `<span class="node-label" data-o="node-${i}">${esc(n)}</span>`).join("")}
      ${C.detectGraph.findings
        .map(
          (f, i) =>
            `<div class="finding" data-o="finding-${i}"><span class="finding__label"><i></i>${esc(C.detectGraph.findingLabel)}</span><strong>${esc(f)}</strong></div>`,
        )
        .join("")}
    </div>

    <section class="sec" id="${E.id}" aria-labelledby="${E.id}-title">
      <div class="hud hud--left" data-hud="tem-head">
        ${label("01", E.kicker)}
        <h3 class="h-section" id="${E.id}-title">${esc(E.title)}</h3>
        ${E.text.map((t) => `<p class="lede">${esc(t)}</p>`).join("")}
      </div>

      <aside class="card card--accent" data-o="tem-aside">
        <p class="card__tier">${esc(E.aside.label)}</p>
        <h4 class="card__title">${esc(E.aside.title)}</h4>
        <p class="card__text">${esc(E.aside.text)}</p>
      </aside>

      <article class="card card--tem" data-o="tem-product">
        <p class="card__tier">${esc(E.product.tag)}</p>
        <h4 class="card__title">${esc(E.product.title)}</h4>
        ${E.product.text.map((t) => `<p class="card__text">${esc(t)}</p>`).join("")}
        ${list(E.product.items)}
        <p class="card__strong">${esc(E.product.strong)}</p>
      </article>

      <div class="orbit" data-wrap>
        <h4 class="orbit__title" data-o="tem-monitor-title">${esc(E.monitor.title)}</h4>
        <ul class="orbit__list" data-wrap>
          ${E.monitor.items.map((m, i) => `<li class="chip chip--orbit" data-o="tem-mon-${i}">${esc(m)}</li>`).join("")}
        </ul>
      </div>

      <article class="card card--deliver" data-o="tem-deliver">
        <h4 class="card__title">${esc(E.deliver.title)}</h4>
        <ol class="card__list card__list--steps">${E.deliver.items.map((d) => `<li>${esc(d)}</li>`).join("")}</ol>
      </article>

      <div class="hud hud--kicker" data-hud="tem-flow">${label("01", E.flowLabel)}</div>
      <div class="steps" data-wrap aria-label="${esc(E.flowLabel)}">
        ${E.flow
          .map(
            (s, i) =>
              `<article class="card card--step" data-o="tem-step-${i}"><span class="card__num">${esc(s.n)}</span><h4 class="card__title">${esc(s.title)}</h4><p class="card__text">${esc(s.text)}</p></article>`,
          )
          .join("")}
      </div>

      <div class="plans" data-wrap aria-label="${esc(E.plansLabel)}">
        ${E.plans.map((p, i) => plan(p, `tem-plan-${i}`)).join("")}
      </div>
    </section>

    ${win("shield", "light")}
    <section class="sec" id="${P.id}" aria-labelledby="${P.id}-title">
      <div class="hud hud--left" data-hud="pyme-head">
        ${label("01", P.kicker)}
        <h3 class="h-section" id="${P.id}-title">${esc(P.title)}</h3>
        <p class="lede">${esc(P.text)}</p>
      </div>

      <article class="card card--accent card--wa" data-o="pyme-hero">
        <p class="card__tier">${esc(P.heroCard.label)}</p>
        <h4 class="card__title">${esc(P.heroCard.title)}</h4>
        <p class="card__text">${esc(P.heroCard.text)}</p>
        ${list(P.heroCard.items)}
      </article>

      <div class="phone-chat" data-o="phone-chat">
        <div class="phone-chat__contact" aria-hidden="true">
          <span class="phone-chat__avatar">${mark()}</span>
          <span><strong>${esc(C.whatsappChat.name)}</strong><small>${esc(C.whatsappChat.account)}</small></span>
        </div>
        <ul class="phone-chat__bubbles" aria-label="${esc(C.whatsappChat.label)}">
          ${C.whatsappChat.bubbles.map((b, i) => `<li class="bubble" data-bubble="${i}">${esc(b)}</li>`).join("")}
        </ul>
      </div>

      ${P.clusters
        .map(
          (cl, ci) => `
      <div class="cluster" data-wrap>
        <div class="cluster__title" data-o="pyme-cl-${ci}">
          <h4>${esc(cl.title)}</h4><span>${esc(cl.count)}</span>
        </div>
        <div class="grid grid--4" data-wrap aria-label="${esc(cl.label)}">
          ${cl.items.map((p, i) => product(p, `pyme-${ci}-${i}`)).join("")}
        </div>
      </div>`,
        )
        .join("")}

      <article class="card card--focus" data-o="pyme-focus">
        <h4 class="card__title">${esc(P.focus.title)}</h4>
        <ol class="card__list card__list--steps">${P.focus.items.map((f) => `<li>${esc(f)}</li>`).join("")}</ol>
      </article>

      <div class="grid grid--5" data-wrap aria-label="${esc(P.packagesLabel)}">
        ${P.packages
          .map(
            (p, i) => `
        <article class="card card--package" data-o="pyme-pkg-${i}">
          <h4 class="card__title">${esc(p.title)}</h4>
          <p class="card__text">${esc(p.text)}</p>
          ${list(p.items)}
        </article>`,
          )
          .join("")}
      </div>
    </section>

    ${win("crowd", "light")}
    <section class="sec" id="${W.id}" aria-labelledby="${W.id}-title">
      <div class="hud hud--left" data-hud="aw-head">
        ${label("01", W.kicker)}
        <h3 class="h-section" id="${W.id}-title">${esc(W.title)}</h3>
        ${W.text.map((t) => `<p class="lede">${esc(t)}</p>`).join("")}
      </div>

      <div class="grid grid--3" data-wrap>
        ${W.summary
          .map(
            (s, i) => `
        <article class="card card--summary" data-o="aw-sum-${i}">
          <h4 class="card__title">${esc(s.title)}</h4>
          ${list(s.items)}
        </article>`,
          )
          .join("")}
      </div>

      <div class="plans" data-wrap aria-label="${esc(W.plansLabel)}">
        ${W.plans.map((p, i) => plan(p, `aw-plan-${i}`)).join("")}
      </div>

      <div class="hud hud--left hud--narrow" data-hud="aw-wa">
        ${label("01", "WhatsApp")}
        <h4 class="h-sub">${esc(W.whatsapp.title)}</h4>
        <p class="lede">${esc(W.whatsapp.text)}</p>
      </div>

      <div class="courses" data-wrap aria-label="${esc(W.coursesLabel)}">
        <div class="hud hud--top" data-hud="aw-courses"><h4 class="h-sub">${esc(W.coursesTitle)}</h4></div>
        <div class="grid grid--5" data-wrap>
          ${W.courses
            .map(
              (c, i) =>
                `<article class="card card--course" data-o="aw-course-${i}"><span class="card__num">${esc(c.n)}</span><h5 class="card__title">${esc(c.title)}</h5><p class="card__text">${esc(c.text)}</p></article>`,
            )
            .join("")}
        </div>
      </div>

      <div class="grid grid--3 map" data-wrap aria-label="${esc(W.mapLabel)}">
        ${W.map.map((m, i) => `<div class="map__item" data-o="aw-map-${i}"><strong>${esc(m.title)}</strong><span>${esc(m.text)}</span></div>`).join("")}
      </div>
    </section>

    <div class="hud hud--statement hud--risk" data-hud="risk">
      <p class="statement">${esc(C.story.riskA)}</p>
      <p class="statement statement--muted">${esc(C.story.riskB)}</p>
    </div>
  </div>`;

  // ── Capítulo 02 · Responder ────────────────────────────────────────────
  const S = C.servicios;
  const V = C.vciso;
  const I = C.impacto;
  const M = C.metodo;
  const F = C.spei;
  const responder = `
  <div class="chapter" id="responder" data-ch="responder" data-tone="dark" aria-labelledby="responder-title">
    ${chapterHead(chRespond, "c2-title")}
    ${win("racks", "dark")}
    ${still("responder", "50% 30%")}

    <section class="sec" id="${S.id}" aria-labelledby="${S.id}-title">
      <div class="hud hud--left" data-hud="svc-head">
        ${label("02", S.kicker)}
        <h3 class="h-section" id="${S.id}-title">${esc(S.title)}</h3>
      </div>
      <div class="grid grid--4" data-wrap>
        ${S.items
          .map(
            (s, i) => `
        <article class="card card--service" data-o="svc-${i}">
          <div class="card__head"><span class="card__bignum">${String(i + 1).padStart(2, "0")}</span><div class="card__icon">${icon(s.icon)}</div></div>
          <p class="card__tier">${esc(s.kicker)}</p>
          <h4 class="card__title">${esc(s.title)}</h4>
          <p class="card__text">${esc(s.text)}</p>
          ${list(s.items)}
        </article>`,
          )
          .join("")}
      </div>
      ${socConsole("svc-console", "soc--big")}
      <div class="soc-sat" data-wrap aria-hidden="true">
        ${C.socConsole.satellites.map((s, i) => `<span class="chip chip--sat" data-o="soc-sat-${i}">${esc(s)}</span>`).join("")}
      </div>
    </section>

    <div class="trust" data-wrap aria-label="Resultados de DOGUI">
      ${C.trust
        .map(
          (t, i) =>
            `<div class="trust__item" data-o="trust-${i}">${icon(t.icon)}<strong>${esc(t.value)}</strong><span>${esc(t.label)}</span></div>`,
        )
        .join("")}
    </div>

    <section class="sec" id="${M.id}" aria-labelledby="${M.id}-title">
      <div class="hud hud--left" data-hud="method-head">
        ${label("02", M.kicker)}
        <h3 class="h-section" id="${M.id}-title">${esc(M.title)}</h3>
      </div>
      <ol class="grid grid--4 method" data-wrap>
        ${M.steps
          .map(
            (s, i) =>
              `<li class="card card--method" data-o="method-${i}"><span class="card__bignum">${esc(s.n)}</span><h4 class="card__title">${esc(s.title)}</h4><p class="card__text">${esc(s.text)}</p></li>`,
          )
          .join("")}
      </ol>
    </section>

    <section class="sec" id="${V.id}" aria-labelledby="${V.id}-title">
      <div class="hud hud--left" data-hud="vciso-head">
        ${label("02", V.kicker)}
        <h3 class="h-section" id="${V.id}-title">${esc(V.title)}</h3>
        ${V.text.map((t) => `<p class="lede">${esc(t)}</p>`).join("")}
      </div>
      <aside class="card card--accent" data-o="vciso-aside">
        <p class="card__tier">${esc(V.aside.label)}</p>
        <h4 class="card__title">${esc(V.aside.title)}</h4>
        <p class="card__text">${esc(V.aside.text)}</p>
      </aside>
      <article class="card card--problem" data-o="vciso-problem">
        <h4 class="card__title">${esc(V.problem.title)}</h4>
        ${list(V.problem.items)}
      </article>
      <div class="grid grid--4" data-wrap aria-label="${esc(V.deliverablesLabel)}">
        ${V.deliverables
          .map(
            (d, i) =>
              `<article class="card card--deliverable" data-o="vciso-d-${i}"><span class="card__num">${esc(d.n)}</span><h4 class="card__title">${esc(d.title)}</h4><p class="card__text">${esc(d.text)}</p><p class="card__strong">${esc(d.strong)}</p></article>`,
          )
          .join("")}
      </div>
      <div class="plans" data-wrap aria-label="${esc(V.plansLabel)}">
        ${V.plans.map((p, i) => plan(p, `vciso-plan-${i}`)).join("")}
      </div>
      <article class="card card--eco" data-o="vciso-eco">
        <h4 class="card__title">${esc(V.ecosystem.title)}</h4>
        <p class="card__text">${esc(V.ecosystem.text)}</p>
        <div class="eco" aria-label="${esc(V.ecosystem.label)}">
          ${V.ecosystem.items.map((e) => `<div><strong>${esc(e.problem)}</strong><span>${esc(e.service)}</span></div>`).join("")}
        </div>
      </article>
    </section>

    <section class="sec" id="${I.id}" aria-labelledby="${I.id}-title">
      <div class="hud hud--left" data-hud="impact-head">
        ${label("02", "Impacto")}
        <h3 class="h-section" id="${I.id}-title">${esc(I.title)}</h3>
      </div>
      <div class="grid grid--4" data-wrap>
        ${I.items
          .map(
            (it, i) =>
              `<article class="card card--impact" data-o="impact-${i}"><span class="card__num">${esc(it.n)}</span><h4 class="card__title">${esc(it.title)}</h4><p class="card__text">${esc(it.text)}</p></article>`,
          )
          .join("")}
      </div>
    </section>

    ${win("map", "dark")}
    <section class="sec" id="${F.id}" aria-labelledby="${F.id}-title">
      <div class="hud hud--left" data-hud="spei-head">
        ${label("02", F.kicker)}
        <h3 class="h-section" id="${F.id}-title">${esc(F.title)}</h3>
        <p class="lede">${esc(F.text)}</p>
      </div>
      <div class="grid grid--3" data-wrap aria-label="${esc(F.label)}">
        ${F.items.map((p, i) => product(p, `spei-${i}`, "h4")).join("")}
      </div>
      <ul class="audience" data-o="audience" aria-label="${esc(I.audienceLabel)}">
        ${I.audience.map((a) => `<li>${esc(a)}</li>`).join("")}
      </ul>
    </section>
  </div>`;

  // ── Capítulo 03 · Automatizar ──────────────────────────────────────────
  const AU = C.automation;
  const PR = C.productos;
  const SG = C.sgsi;
  const SA = C.saas;
  const automatizar = `
  <div class="chapter" id="automatizar" data-ch="automatizar" data-tone="dark" aria-labelledby="automatizar-title">
    ${chapterHead(chAuto, "c3-title")}
    ${win("soar", "dark")}
    ${still("automatizar", "72% 40%")}

    <section class="sec" id="${AU.id}" aria-labelledby="${AU.id}-title">
      <div class="hud hud--left" data-hud="soar-head">
        ${label("03", AU.kicker)}
        <h3 class="h-section" id="${AU.id}-title">${esc(AU.title)}</h3>
        <p class="lede">${esc(AU.text)}</p>
      </div>
      <ol class="grid grid--3 soar" data-wrap>
        ${AU.steps.map((s, i) => `<li class="card card--soar" data-o="soar-${i}"><h4 class="card__title">${esc(s.title)}</h4><p class="card__text">${esc(s.text)}</p></li>`).join("")}
      </ol>
    </section>

    ${win("core", "dark")}
    <section class="sec" id="${PR.id}" aria-labelledby="${PR.id}-title">
      <div class="hud hud--left" data-hud="prod-head">
        ${label("03", PR.kicker)}
        <h3 class="h-section" id="${PR.id}-title">${esc(PR.title)}</h3>
      </div>
      <div class="grid grid--3" data-wrap>
        ${PR.items
          .map(
            (p, i) => `
        <article class="card card--catalog" data-o="prod-${i}">
          <div class="card__head"><div class="card__icon">${icon(p.icon)}</div><p class="card__tier">${esc(p.tag)}</p></div>
          <h4 class="card__title">${esc(p.title)}</h4>
          <p class="card__text">${esc(p.text)}</p>
        </article>`,
          )
          .join("")}
      </div>
    </section>

    <section class="sec" id="${SG.id}" aria-labelledby="${SG.id}-title">
      <div class="hud hud--left" data-hud="sgsi-head">
        ${label("03", SG.kicker)}
        <h3 class="h-section" id="${SG.id}-title">${esc(SG.title)}</h3>
        <p class="lede">${esc(SG.text)}</p>
        <div class="actions">${btn(SG.primary, "primary")}${btn(SG.secondary, "ghost")}</div>
      </div>
      <div class="cidsi" data-o="sgsi-console" aria-label="${esc(SG.console.label)}">
        <div class="cidsi__head"><span>${esc(SG.console.tag)}</span><strong>${mark()}${esc(SG.console.title)}</strong></div>
        <div class="cidsi__grid">
          ${SG.console.blocks.map((b) => `<div><span>${esc(b.title)}</span><p>${esc(b.text)}</p></div>`).join("")}
        </div>
      </div>
      <div class="grid grid--4" data-wrap>
        ${SG.capabilities
          .map((c, i) => `<article class="card card--cap" data-o="sgsi-cap-${i}"><h4 class="card__title">${esc(c.title)}</h4><p class="card__text">${esc(c.text)}</p></article>`)
          .join("")}
      </div>
    </section>

    <section class="sec" id="${SA.id}" aria-labelledby="${SA.id}-title">
      <div class="hud hud--left" data-hud="saas-head">
        ${label("03", SA.kicker)}
        <h3 class="h-section" id="${SA.id}-title">${esc(SA.title)}</h3>
        <p class="lede">${esc(SA.text)}</p>
      </div>
      ${SA.clusters
        .map(
          (cl, ci) => `
      <div class="cluster" data-wrap>
        <div class="cluster__title" data-o="saas-cl-${ci}"><h4>${esc(cl.title)}</h4><span>${esc(cl.count)}</span></div>
        <div class="grid grid--4" data-wrap aria-label="${esc(cl.label)}">
          ${cl.items.map((p, i) => product(p, `saas-${ci}-${i}`)).join("")}
        </div>
      </div>`,
        )
        .join("")}
      <div class="counters" data-wrap>
        ${SA.counters.map((c, i) => `<p class="counter" data-o="counter-${i}"><strong>${esc(c.value)}</strong><span>${esc(c.label)}</span></p>`).join("")}
      </div>
    </section>

    <div class="hud hud--statement" data-hud="close-auto">
      <p class="statement">${esc(C.story.closeA)}</p>
      <p class="statement statement--muted">${esc(C.story.closeB)}</p>
    </div>

    <div class="logo-ring" data-wrap aria-hidden="true">
      ${SA.clusters
        .flatMap((cl) => cl.items)
        .map((p, i) => `<span class="chip chip--ring" data-o="ring-${i}">${icon(p.icon)}<span>${esc(p.title)}</span></span>`)
        .join("")}
    </div>
  </div>`;

  // ── Capítulo 04 · Contacto ─────────────────────────────────────────────
  const PK = C.paquetes;
  const CT = C.contacto;
  const FM = CT.form;
  const contacto = `
  <div class="chapter" id="cierre" data-ch="contacto" data-tone="light" aria-labelledby="contacto-chapter-title">
    <header class="hud hud--chapter" data-hud="c4-title">
      ${label(chContact.n, chContact.label)}
      <h2 class="h-chapter" id="contacto-chapter-title">${esc(chContact.title)}</h2>
    </header>

    <section class="sec" id="${PK.id}" aria-labelledby="${PK.id}-title">
      <div class="hud hud--top" data-hud="pkg-head">
        ${label("04", PK.kicker)}
        <h3 class="h-section" id="${PK.id}-title">${esc(PK.title)}</h3>
      </div>
      <div class="grid grid--4" data-wrap>
        ${PK.items
          .map(
            (p, i) => `
        <article class="card card--pkg ${p.highlight ? "is-highlight" : ""}" data-o="pkg-${i}" data-tilt>
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          <div class="card__icon">${icon(p.icon)}</div>
          <h4 class="card__title">${esc(p.title)}</h4>
          <p class="card__text">${esc(p.text)}</p>
          ${list(p.items)}
          <a class="card__cta" href="#contacto">${esc(p.cta)}${arrow}</a>
        </article>`,
          )
          .join("")}
      </div>
    </section>

    ${still("contacto", "50% 28%")}
    ${win("logo", "light")}

    <div class="hud hud--final" data-hud="final">
      <p class="statement">${esc(C.story.finalA)}</p>
      <p class="statement statement--accent">${esc(C.story.finalB)}</p>
      <div class="intro">
        <h3 class="h-sub">${esc(C.intro.title)}</h3>
        <p class="lede">${esc(C.intro.text)}</p>
      </div>
      <div class="actions actions--center">
        ${btn({ label: C.cta.label, href: "#contacto" }, "primary")}
        <a class="btn btn--ghost" href="#paquetes">Ver paquetes${arrow}</a>
      </div>
    </div>

    <section class="sec sec--contact" id="${CT.id}" aria-labelledby="${CT.id}-title">
      <div class="contact-panel" data-hud="contact">
      <div class="contact__copy">
        ${label("04", CT.kicker)}
        <h3 class="h-section" id="${CT.id}-title">${esc(CT.title)}</h3>
        <p class="lede">${esc(CT.text)}</p>
        <div class="contact__details">
          <a href="mailto:${esc(C.site.email)}">${esc(C.site.email)}</a>
          ${C.site.phone ? `<a href="${esc(tel())}">${esc(C.site.phone)}</a>` : ""}
          ${C.site.whatsapp ? `<a href="${esc(wa(C.whatsapp.message))}" target="_blank" rel="noopener noreferrer">${esc(C.whatsapp.label)}</a>` : ""}
        </div>
        ${C.site.bookingUrl ? `<a class="btn btn--ghost contact__booking" href="${esc(C.site.bookingUrl)}" target="_blank" rel="noopener noreferrer">${esc(FM.booking)}${arrow}</a>` : ""}
        <aside class="incident" aria-labelledby="incident-title">
          <h4 class="incident__title" id="incident-title"><span class="incident__dot" aria-hidden="true"></span>${esc(C.incident.title)}</h4>
          <p>${esc(C.incident.text)}</p>
          <div class="incident__actions">
            <a class="btn btn--primary btn--sm" href="#contacto" data-incident>${esc(C.incident.cta)}${arrow}</a>
            ${C.site.phone ? `<a class="btn btn--ghost btn--sm" href="${esc(tel())}">${esc(C.incident.call)}</a>` : ""}
            ${C.site.whatsapp ? `<a class="btn btn--ghost btn--sm" href="${esc(wa(C.whatsapp.incidentMessage))}" target="_blank" rel="noopener noreferrer">${esc(C.incident.whatsapp)}</a>` : ""}
          </div>
        </aside>
      </div>
      <form class="lead-form" data-lead-form data-lenis-prevent novalidate>
        <label class="hp-field" aria-hidden="true">${esc(FM.honeypot)}<input name="website" type="text" tabindex="-1" autocomplete="off" /></label>
        <label>${esc(FM.name)}<input name="name" type="text" autocomplete="name" maxlength="80" required /></label>
        <label>${esc(FM.company)}<input name="company" type="text" autocomplete="organization" maxlength="100" required /></label>
        <label>${esc(FM.email)}<input name="email" type="email" autocomplete="email" inputmode="email" maxlength="120" required /></label>
        <label>${esc(FM.phone)}<input name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="30" /></label>
        <label>${esc(FM.size)}
          <select name="size">
            <option value="">${esc(FM.sizePlaceholder)}</option>
            ${FM.sizes.map((o) => `<option>${esc(o)}</option>`).join("")}
          </select>
        </label>
        <label>${esc(FM.urgency)}
          <select name="urgency">
            ${FM.urgencies.map((o) => `<option>${esc(o)}</option>`).join("")}
          </select>
        </label>
        <label class="full">${esc(FM.service)}
          <select name="service" required>
            <option value="">${esc(FM.servicePlaceholder)}</option>
            ${FM.groups.map((g) => `<optgroup label="${esc(g.label)}">${g.options.map((o) => `<option>${esc(o)}</option>`).join("")}</optgroup>`).join("")}
          </select>
        </label>
        <label class="full">${esc(FM.message)}<textarea name="message" rows="3" maxlength="1200" placeholder="${esc(FM.messagePlaceholder)}"></textarea></label>
        <label class="check full"><input name="consent" type="checkbox" required /><span>${esc(FM.consentBefore)}<a href="${base}privacidad/">${esc(FM.consentLink)}</a>${esc(FM.consentAfter)}</span></label>
        <label class="check full"><input name="marketing" type="checkbox" /><span>${esc(FM.marketing)}</span></label>
        <button class="btn btn--primary full" type="submit" data-magnetic>${esc(FM.submit)}${arrow}</button>
        <p class="form-note full" data-form-note role="status" aria-live="polite">${esc(FM.note)}</p>
        <p class="form-privacy full">${esc(privacyShort(legal))} <a href="${base}privacidad/">${esc(FM.privacyMore)}</a>.</p>
      </form>
      </div>
    </section>
  </div>`;

  // ── Herramientas gratuitas y preguntas (flujo normal, también después del mundo 3D) ──
  const R = C.recursos;
  const Q = R.quiz;
  const SL = R.selector;
  const EM = R.email;
  const RP = R.report;
  const FQ = C.faq;
  const radios = (name, options, values = options) =>
    options
      .map((o, i) => `<label class="pick"><input type="radio" name="${name}" value="${esc(values[i])}" /><span>${esc(o)}</span></label>`)
      .join("");
  const recursos = `
  <div class="chapter chapter--tools" id="recursos" data-ch="contacto" data-tone="light">
    <section class="sec sec--tools" id="${R.id}" aria-labelledby="${R.id}-title">
      <header class="tools__head">
        ${label("05", R.kicker)}
        <h2 class="h-section" id="${R.id}-title">${esc(R.title)}</h2>
        <p class="lede">${esc(R.text)}</p>
      </header>

      <div class="tools" data-tools>
        <div class="tools__tabs" role="tablist" aria-label="${esc(R.kicker)}">
          ${R.tabs.map((t, i) => `<button class="tools__tab" type="button" role="tab" id="tool-tab-${i}" aria-controls="tool-${i}" aria-selected="${i === 0}">${esc(t)}</button>`).join("")}
        </div>

        <div class="tools__panel" role="tabpanel" id="tool-0" aria-labelledby="tool-tab-0">
          <h3 class="h-sub">${esc(Q.title)}</h3>
          <p class="tools__text">${esc(Q.text)}</p>
          <form class="quiz" data-quiz>
            ${Q.questions
              .map(
                (it, i) => `
            <fieldset class="quiz__q">
              <legend><span class="quiz__n">${String(i + 1).padStart(2, "0")}</span>${esc(it.q)}</legend>
              <div class="quiz__a">${radios(`q${i}`, Q.answers.map((a) => a.label), Q.answers.map((a) => a.points))}</div>
            </fieldset>`,
              )
              .join("")}
            <button class="btn btn--primary" type="submit">Ver mi resultado${arrow}</button>
          </form>
          <div class="tool-result" data-quiz-result hidden></div>
        </div>

        <div class="tools__panel" role="tabpanel" id="tool-1" aria-labelledby="tool-tab-1">
          <h3 class="h-sub">${esc(SL.title)}</h3>
          <p class="tools__text">${esc(SL.text)}</p>
          <form class="selector" data-selector>
            ${SL.steps
              .map(
                (s, i) => `
            <fieldset class="quiz__q">
              <legend><span class="quiz__n">${String(i + 1).padStart(2, "0")}</span>${esc(s.q)}</legend>
              <div class="quiz__a quiz__a--stack">${radios(s.id, s.options, s.options.map((_, k) => k))}</div>
            </fieldset>`,
              )
              .join("")}
            <button class="btn btn--primary" type="submit">Ver recomendación${arrow}</button>
          </form>
          <div class="tool-result" data-selector-result hidden></div>
        </div>

        <div class="tools__panel" role="tabpanel" id="tool-2" aria-labelledby="tool-tab-2">
          <h3 class="h-sub">${esc(EM.title)}</h3>
          <p class="tools__text">${esc(EM.text)}</p>
          <form class="mailcheck" data-mailcheck novalidate>
            <label>${esc(EM.label)}<input name="domain" type="text" inputmode="url" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${esc(EM.placeholder)}" maxlength="253" required /></label>
            <button class="btn btn--primary" type="submit">${esc(EM.submit)}${arrow}</button>
          </form>
          <div class="tool-result" data-mailcheck-result role="status" aria-live="polite"></div>
          <p class="tools__note">${esc(EM.note)}</p>
        </div>
      </div>

      <div class="tools__extras">
        <figure class="report" aria-labelledby="report-title">
          <figcaption>
            <h3 class="h-sub" id="report-title">${esc(RP.title)}</h3>
            <p class="tools__text">${esc(RP.text)}</p>
          </figcaption>
          <div class="report__doc">
            <div class="report__top">
              <span class="report__brand">${mark()}<span>${esc(RP.period)}</span></span>
              <span class="pill">${esc(RP.badge)}</span>
            </div>
            <p class="report__company">${esc(RP.company)}</p>
            <p class="report__risk">${esc(RP.risk)}: <strong class="risk risk--mid">${esc(RP.riskValue)}</strong></p>
            <table class="report__table">
              <thead><tr>${RP.head.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
              <tbody>
                ${RP.rows
                  .map(
                    ([f, r, a]) =>
                      `<tr><td>${esc(f)}</td><td><span class="risk risk--${r === "Alto" ? "high" : r === "Medio" ? "mid" : "low"}">${esc(r)}</span></td><td>${esc(a)}</td></tr>`,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </figure>
        <article class="card card--checklist">
          <div class="card__icon">${icon("file-lock")}</div>
          <h3 class="card__title">${esc(R.checklist.title)}</h3>
          <p class="card__text">${esc(R.checklist.text)}</p>
          <a class="card__cta" href="${base}checklist/">${esc(R.checklist.cta)}${arrow}</a>
        </article>
      </div>
    </section>

    <section class="sec sec--faq" id="${FQ.id}" aria-labelledby="${FQ.id}-title">
      <header class="tools__head">
        ${label("05", FQ.kicker)}
        <h2 class="h-section" id="${FQ.id}-title">${esc(FQ.title)}</h2>
      </header>
      <div class="faq">
        ${FQ.items.map((f) => `<details class="faq__item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
      </div>
      <div class="glossary">
        <h3 class="h-sub">${esc(FQ.glossaryTitle)}</h3>
        <dl>${FQ.glossary.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>
      </div>
    </section>
  </div>`;

  return { hero, detectar, responder, automatizar, contacto, recursos };
}

/** Página legal (aviso de privacidad o términos de uso). */
export function renderLegal({ base = "/", kind = "privacy" } = {}) {
  const doc = kind === "terms" ? terms(legal) : privacy(legal, { phone: C.site.phone });
  const block = (b) => {
    if (typeof b === "string") return `<p>${esc(b)}</p>`;
    if (b.h) return `<h3>${esc(b.h)}</h3>`;
    if (b.list) return `<ul>${b.list.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    if (b.measure)
      return `<div class="measure" data-measure><p>Medición del sitio en este navegador: <strong data-measure-state>activa</strong></p><button class="btn btn--ghost btn--sm" type="button" data-measure-toggle>Desactivar medición</button></div>`;
    return "";
  };
  const other = kind === "terms" ? { href: `${base}privacidad/`, label: "Aviso de privacidad" } : { href: `${base}terminos/`, label: "Términos de uso" };
  return `
  <article class="legal-doc">
    <p class="label"><span class="label__t">Legal</span></p>
    <h1 class="h-section">${esc(doc.title)}</h1>
    <p class="lede">${esc(doc.lede)}</p>
    <p class="legal-doc__meta">Última actualización: <time datetime="${legal.updatedISO}">${esc(legal.updated)}</time></p>
    <nav class="legal-doc__toc" aria-label="Contenido">
      <ol>${doc.sections.map((s) => `<li><a href="#${s.id}">${esc(s.h.replace(/^\d+\.\s*/, ""))}</a></li>`).join("")}</ol>
    </nav>
    ${doc.sections.map((s) => `<section id="${s.id}" aria-labelledby="${s.id}-h"><h2 id="${s.id}-h">${esc(s.h)}</h2>${s.body.map(block).join("")}</section>`).join("")}
    <p class="legal-doc__more"><a href="${other.href}">${esc(other.label)}${ARROW}</a></p>
  </article>`;
}

/** Checklist imprimible para PyMEs. */
export function renderChecklist({ base = "/" } = {}) {
  const K = C.checklist;
  let n = 0;
  return `
  <article class="legal-doc checklist">
    <p class="label"><span class="label__t">Recurso gratuito</span></p>
    <h1 class="h-section">${esc(K.title)}</h1>
    <p class="lede">${esc(K.lede)}</p>
    <button class="btn btn--primary btn--sm checklist__print" type="button" data-print>${esc(K.print)}</button>
    ${K.groups
      .map(
        (g) => `
    <section class="checklist__group">
      <h2>${esc(g.title)}</h2>
      <ul>${g.items.map((i) => `<li><label class="check"><input type="checkbox" /><span><b>${String(++n).padStart(2, "0")}</b> ${esc(i)}</span></label></li>`).join("")}</ul>
    </section>`,
      )
      .join("")}
    <p class="checklist__cta">${esc(K.cta)} <a class="btn btn--primary btn--sm" href="${base}#contacto">${esc(K.ctaLink)}${ARROW}</a></p>
  </article>`;
}

/**
 * Barra superior, indicador de capítulos y pie. `home` antepone la ruta del inicio a las
 * anclas (páginas legales: los enlaces vuelven a la página principal).
 */
export function renderChrome({ base = "/", home = "" } = {}) {
  const A = (p) => `${base}assets/${p}`;
  const waHref = wa(C.whatsapp.message);
  return {
    header: `
  <a class="skip-link" href="${home ? "#contenido" : "#contacto"}">${home ? "Saltar al contenido" : "Saltar a contacto"}</a>
  <header class="topbar" data-topbar>
    <a class="topbar__logo" href="${home || "#inicio"}" aria-label="DOGUI inicio">
      <img src="${A("logo-lockup-dark.svg")}" alt="DOGUI" width="92" height="30" />
    </a>
    <div class="topbar__right">
      <button class="topbar__menu" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-toggle>
        <span class="topbar__menu-icon" aria-hidden="true"><i></i><i></i></span><span>Menú</span>
      </button>
      <a class="btn btn--primary btn--sm" href="${esc(home + C.cta.href)}" data-magnetic>${esc(C.cta.label)}<span class="btn__arrow" aria-hidden="true">→</span></a>
    </div>
    <nav class="menu" id="site-menu" aria-label="Secciones" data-menu hidden>
      <ol>
        ${C.nav.map((n, i) => `<li><a href="${home}${n.href}"><span class="menu__n">${String(i + 1).padStart(2, "0")}</span>${esc(n.label)}</a></li>`).join("")}
      </ol>
    </nav>
  </header>
  ${waHref ? `<a class="wa-float" href="${esc(waHref)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(C.whatsapp.label)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg><span>${esc(C.whatsapp.label)}</span></a>` : ""}`,
    chapters: `
  <nav class="chapters" aria-label="Capítulos" data-chapters>
    ${C.chapters.map((c) => `<a href="#${c.id === "contacto" ? "cierre" : c.id}" data-chapter-link="${c.id}">${esc(c.label)}</a>`).join('<span aria-hidden="true">·</span>')}
  </nav>`,
    footer: `
  <footer class="footer">
    <a class="footer__logo" href="${home || "#inicio"}" aria-label="DOGUI inicio"><img src="${A("logo-lockup-dark.svg")}" alt="DOGUI" width="154" height="50" loading="lazy" /></a>
    <p>${esc(C.footer.text)}</p>
    <a class="footer__link" href="${esc(home + C.footer.link.href)}">${esc(C.footer.link.label)}<span class="btn__arrow" aria-hidden="true">→</span></a>
    <nav class="footer__legal" aria-label="Legal">
      ${C.footer.legal.map((l) => `<a href="${base}${l.path}">${esc(l.label)}</a>`).join("")}
    </nav>
    <p class="footer__copy">© ${legal.updatedISO.slice(0, 4)} ${esc(legal.owner)}. Todos los derechos reservados.</p>
  </footer>`,
  };
}
