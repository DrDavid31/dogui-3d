// Herramientas gratuitas: autodiagnóstico, selector de paquete y revisión de correo.
// Todo se calcula en el navegador; solo la revisión de correo consulta DNS público.
import * as C from "../content/content.js";

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Descripción de cada paquete o plan, tomada del propio contenido del sitio.
const descriptions = new Map();
(function collect(v) {
  if (Array.isArray(v)) v.forEach(collect);
  else if (v && typeof v === "object") {
    if (typeof v.title === "string" && typeof v.text === "string" && !descriptions.has(v.title)) descriptions.set(v.title, v.text);
    Object.values(v).forEach(collect);
  }
})([C.pyme, C.exposicion, C.awareness, C.vciso, C.servicios, C.paquetes]);

// Opción del formulario que corresponde a cada recomendación.
const SERVICE = [
  [/Awareness/, "DOGUI Awareness"],
  [/Leak|Threat Exposure|Dark Web|Exposición digital/, "Threat Exposure Monitoring / Dark Web"],
  [/Compliance/, "GRC / Cumplimiento"],
  [/SGSI|CIDSI/, "SGSI / CIDSI"],
  [/vCISO/, "DOGUI vCISO"],
  [/Operación protegida/, "SOC / MDR"],
  [/Financiero/, "SPEI / SPID"],
  [/Essential|Resilience|Exposure/, "PyME / WhatsApp Security Assistant"],
];
const serviceFor = (name) => SERVICE.find(([re]) => re.test(name))?.[1] || "";

const cta = (label, service, message) =>
  `<a class="btn btn--primary" href="#contacto" data-prefill data-service="${esc(service)}" data-message="${esc(message)}">${esc(label)}<span class="btn__arrow" aria-hidden="true">→</span></a>`;

function initTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')];
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));
  const select = (i, focus = false) => {
    tabs.forEach((t, k) => {
      t.setAttribute("aria-selected", String(k === i));
      t.tabIndex = k === i ? 0 : -1;
      panels[k].hidden = k !== i;
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) select((i + d + tabs.length) % tabs.length, true);
    });
  });
  select(0);
}

function initQuiz(form, out) {
  const Q = C.recursos.quiz;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const points = Q.questions.map((_, i) => Number(fd.get(`q${i}`) ?? 0));
    const score = points.reduce((a, b) => a + b, 0);
    const level = Q.levels.find((l) => score >= l.min);
    // Huecos: primero los "no", luego los "en parte", en el orden de prioridad de la lista.
    const gaps = Q.questions
      .map((q, i) => ({ ...q, p: points[i], i }))
      .filter((q) => q.p < 10)
      .sort((a, b) => a.p - b.p || a.i - b.i)
      .slice(0, 3);
    const summary = `Mi autodiagnóstico en el sitio: ${score}/100 (${level.label}).${gaps.length ? ` Pendientes: ${gaps.map((g) => g.fix.split(":")[0]).join("; ")}.` : ""}`;
    out.innerHTML = `
      <div class="score" style="--p: ${score}">
        <span class="score__n">${score}<small>/100</small></span>
        <div><p class="score__label">${esc(Q.result)}: <strong>${esc(level.label)}</strong></p><p>${esc(level.text)}</p></div>
      </div>
      ${
        gaps.length
          ? `<h4>${esc(Q.gaps)}</h4><ol class="gaps">${gaps.map((g) => `<li><p>${esc(g.fix)}</p><span class="gaps__svc">${esc(g.service)}</span></li>`).join("")}</ol>`
          : ""
      }
      <div class="tool-result__actions">${cta(Q.cta, gaps[0] ? serviceFor(gaps[0].service) : "", summary)}<button class="btn btn--ghost" type="button" data-restart>${esc(Q.restart)}</button></div>
      <p class="tools__note">${esc(Q.note)}</p>`;
    form.hidden = true;
    out.hidden = false;
    out.querySelector("[data-restart]").addEventListener("click", () => {
      form.reset();
      form.hidden = false;
      out.hidden = true;
      form.querySelector("input")?.focus();
    });
    out.querySelector(".score")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  });
}

/** Recomendación según tamaño (0–3), preocupación (0–4) y quién ve la seguridad (0–2). */
function recommend(size, worry, team) {
  const pick = (...byS) => byS[Math.min(size, byS.length - 1)];
  const main = [
    pick("DOGUI Awareness", "DOGUI Awareness", "DOGUI Awareness Plus", "DOGUI Awareness Pro"),
    pick("DOGUI Leak Monitor", "DOGUI Threat Exposure Plus", "DOGUI Threat Exposure Plus", "DOGUI Dark Web Pro"),
    pick("DOGUI Compliance Lite", "DOGUI Compliance Lite", "SGSI con plataforma CIDSI"),
    size === 0 && team === 0 ? "DOGUI Essential" : "Operación protegida",
    "Financiero crítico",
  ][worry];
  const plus = team === 2 ? null : size === 0 ? "Diagnóstico" : pick(null, "DOGUI vCISO Starter", "DOGUI vCISO Plus", "DOGUI vCISO Pro");
  return { main, plus };
}

function initSelector(form, out) {
  const S = C.recursos.selector;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const missing = S.steps.find((s) => fd.get(s.id) === null);
    if (missing) {
      form.querySelector(`input[name="${missing.id}"]`)?.focus();
      return;
    }
    const [size, worry, team] = S.steps.map((s) => Number(fd.get(s.id)));
    const { main, plus } = recommend(size, worry, team);
    const card = (name, kicker) => `<article class="rec"><p class="card__tier">${esc(kicker)}</p><h4 class="card__title">${esc(name)}</h4><p class="card__text">${esc(descriptions.get(name) || "")}</p></article>`;
    const message = `Me interesa: ${main}${plus ? ` + ${plus}` : ""}. Empresa de ${S.steps[0].options[size]} personas; preocupación principal: ${S.steps[1].options[worry].toLowerCase()}.`;
    out.innerHTML = `
      <div class="recs">${card(main, S.result)}${plus ? card(plus, S.plus) : ""}</div>
      <div class="tool-result__actions">${cta(S.cta, serviceFor(main), message)}<button class="btn btn--ghost" type="button" data-restart>${esc(S.restart)}</button></div>`;
    form.hidden = true;
    out.hidden = false;
    out.querySelector("[data-restart]").addEventListener("click", () => {
      form.hidden = false;
      out.hidden = true;
      form.querySelector("input")?.focus();
    });
  });
}

// ── Revisión de correo: SPF, DMARC y MX por DNS sobre HTTPS ────────────────
const DOH = [
  (name, type) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`,
  (name, type) => `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`,
];

async function dns(name, type) {
  for (const url of DOH) {
    try {
      const res = await fetch(url(name, type), { headers: { accept: "application/dns-json" } });
      if (!res.ok) continue;
      const data = await res.json();
      const code = type === "TXT" ? 16 : 15;
      return (data.Answer || []).filter((a) => a.type === code).map((a) => a.data.replace(/^"|"$/g, "").replace(/"\s*"/g, ""));
    } catch {
      /* siguiente proveedor */
    }
  }
  throw new Error("dns_unavailable");
}

function evaluate(mx, spf, dmarc) {
  const out = [];
  out.push(mx.length ? ["ok", "Recibe correo", "El dominio tiene servidores de correo (MX)."] : ["warn", "Sin servidores de correo", "No encontramos registros MX: si usas este dominio para correo, revisa su configuración."]);
  if (!spf.length) out.push(["bad", "Sin SPF", "Cualquiera podría enviar correos a nombre de tu dominio sin que los servidores lo detecten."]);
  else if (spf.length > 1) out.push(["bad", "SPF duplicado", "Hay más de un registro SPF; eso invalida la verificación. Debe quedar uno solo."]);
  else if (/-all\b/.test(spf[0])) out.push(["ok", "SPF estricto", "Solo los servidores autorizados pueden enviar por tu dominio (-all)."]);
  else if (/~all\b/.test(spf[0])) out.push(["warn", "SPF suave", "Tienes SPF, pero en modo suave (~all): los correos no autorizados se marcan, no se rechazan."]);
  else out.push(["bad", "SPF permisivo", "Tu SPF permite casi cualquier remitente (?all, +all o sin cierre)."]);
  const d = dmarc.find((r) => /^v=DMARC1/i.test(r));
  if (!d) out.push(["bad", "Sin DMARC", "No hay política DMARC: los correos que suplantan tu dominio pueden llegar a la bandeja de entrada."]);
  else {
    const p = (d.match(/;\s*p=(\w+)/i) || [])[1]?.toLowerCase();
    if (p === "reject") out.push(["ok", "DMARC en rechazo", "Los correos que suplantan tu dominio se rechazan (p=reject)."]);
    else if (p === "quarantine") out.push(["ok", "DMARC en cuarentena", "Los correos que suplantan tu dominio se mandan a spam (p=quarantine)."]);
    else out.push(["warn", "DMARC solo monitorea", "Tienes DMARC en modo de observación (p=none): todavía no bloquea suplantaciones."]);
    if (!/rua=/i.test(d)) out.push(["warn", "DMARC sin reportes", "No recibes reportes (rua): no sabrás quién intenta enviar a tu nombre."]);
  }
  return out;
}

function initMailcheck(form, out) {
  const E = C.recursos.email;
  const ICON = { ok: "✓", warn: "!", bad: "✕" };
  const STATUS = { ok: "Bien", warn: "Mejorable", bad: "Riesgo" };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const raw = String(new FormData(form).get("domain") || "").trim().toLowerCase();
    // Acepta "tuempresa.com", "https://www.tuempresa.com/…" o un correo "ana@tuempresa.com".
    const domain = raw
      .replace(/^[a-z]+:\/\//, "")
      .split(/[/?#\s]/)[0]
      .split("@")
      .pop()
      .replace(/^www\./, "")
      .replace(/\.$/, "");
    if (!/^(?=.{3,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
      out.innerHTML = `<p class="tool-msg">${esc(E.invalid)}</p>`;
      return;
    }
    out.innerHTML = `<p class="tool-msg">${esc(E.checking)}</p>`;
    try {
      const [mx, txt, dm] = await Promise.all([dns(domain, "MX"), dns(domain, "TXT"), dns(`_dmarc.${domain}`, "TXT")]);
      // "0 ." es un MX nulo: el dominio declara que no recibe correo (RFC 7505).
      const rows = evaluate(mx.filter((r) => !/^0\s+\.?$/.test(r.trim())), txt.filter((r) => /^v=spf1/i.test(r)), dm);
      const bad = rows.filter(([s]) => s !== "ok").length;
      out.innerHTML = `
        <p class="tool-msg"><strong>${esc(domain)}</strong></p>
        <ul class="checks">${rows.map(([s, t, d]) => `<li class="checks__${s}"><span class="checks__i" aria-hidden="true">${ICON[s]}</span><div><p><strong>${esc(t)}</strong> <span class="sr-only">(${STATUS[s]})</span></p><p>${esc(d)}</p></div></li>`).join("")}</ul>
        ${bad ? `<div class="tool-result__actions">${cta(E.cta, "Threat Exposure Monitoring / Dark Web", `Quiero revisar a fondo el correo de ${domain} (SPF, DKIM y DMARC).`)}</div>` : ""}`;
    } catch {
      out.innerHTML = `<p class="tool-msg">${esc(E.failed)}</p>`;
    }
  });
}

export function initTools() {
  const root = document.querySelector("[data-tools]");
  if (!root) return;
  initTabs(root);
  const q = root.querySelector("[data-quiz]");
  if (q) initQuiz(q, root.querySelector("[data-quiz-result]"));
  const s = root.querySelector("[data-selector]");
  if (s) initSelector(s, root.querySelector("[data-selector-result]"));
  const m = root.querySelector("[data-mailcheck]");
  if (m) initMailcheck(m, root.querySelector("[data-mailcheck-result]"));
}
