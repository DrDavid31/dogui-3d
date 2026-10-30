import { gsap } from "gsap";
import { Stage } from "./core/renderer.js";
import { Director } from "./core/director.js";
import { DomWorld } from "./core/dom3d.js";
import { Hud } from "./core/hud.js";
import { Env } from "./core/env.js";
import { Scroll } from "./core/scroll.js";
import { Loader } from "./core/loader.js";
import { initMenu } from "./ui/menu.js";
import { setLineResolution } from "./scenes/shared/materials.js";
import { hero } from "./scenes/hero/index.js";
import { detectar } from "./scenes/detectar/index.js";
import { responder } from "./scenes/responder/index.js";
import { automatizar } from "./scenes/automatizar/index.js";
import { contacto } from "./scenes/contacto/index.js";

// Escenas en orden de scroll. Cada una declara estaciones de cámara (stations),
// coloca su contenido HTML (layout) y construye su geometría WebGL (build, diferido).
const SCENES = [hero, detectar, responder, automatizar, contacto];
const TAIL = 30;

export async function startWorld({ pointer, skipIntro = false }) {
  const html = document.documentElement;
  html.classList.add("is-world", "has-stage", "is-loading");
  html.dataset.tone = "light";

  const stage = new Stage(document.querySelector("[data-stage]"));
  const dir = new Director(stage.camera);
  for (const s of SCENES) s.stations(dir);
  dir.finalize();

  // Capítulos que viven en el mundo 3D: capas fijas. El resto sigue en flujo normal.
  const worldEls = SCENES.map((s) => document.querySelector(s.selector));
  worldEls.forEach((el) => el.classList.add("is-world-ch"));
  const track = document.createElement("div");
  track.className = "track";
  track.setAttribute("aria-hidden", "true");
  worldEls.at(-1).after(track);

  const dom = new DomWorld(stage);
  const hud = new Hud();
  const envKeys = [];
  const anchors = new Map([["inicio", 0]]);
  let clock = 0;
  const ctx = { stage, dir, dom, hud, env: envKeys, anchors, root: document, clock: () => clock };
  for (const s of SCENES) s.layout(ctx);
  const env = new Env(stage);
  env.set(envKeys);

  const total = dir.total + TAIL;
  const scroll = new Scroll({ track, total });
  scroll.stop();

  // Construcción diferida de cada capítulo (geometría pesada).
  const built = new Map();
  const building = new Map();
  const build = (s) => {
    if (!building.has(s)) {
      building.set(
        s,
        s.build(ctx).then((r) => {
          built.set(s, r);
          return r;
        }),
      );
    }
    return building.get(s);
  };
  await build(hero);

  // ── Navegación: los anclas vuelan la cámara hasta su punto ─────────────
  const timeForId = (id) => (anchors.has(id) ? anchors.get(id) : null);
  const menu = initMenu({
    onNavigate: (id, target) => {
      const t = timeForId(id);
      if (t != null) scroll.scrollToTime(t);
      else scroll.lenis.scrollTo(target, { offset: 0, duration: 2 });
    },
  });

  // Foco con teclado dentro del mundo: lleva la cámara al elemento enfocado.
  document.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!(el instanceof Element) || !el.closest(".is-world-ch")) return;
    const t = dom.timeFor(el) ?? hud.timeFor(el);
    if (t == null) return;
    if (Math.abs(t - scroll.time) > 8) scroll.jumpToTime(t);
  });

  // ── Indicador de capítulos ──────────────────────────────────────────────
  const chapterLinks = [...document.querySelectorAll("[data-chapter-link]")];
  const chapterRanges = SCENES.filter((s) => s.chapter).map((s) => ({ id: s.chapter, from: s.chapterFrom }));
  let currentChapter = null;
  const updateChapters = (t) => {
    let id = null;
    for (const r of chapterRanges) if (t >= r.from) id = r.id;
    if (t >= total - 1) {
      // Después del mundo 3D: capítulo según la sección en pantalla (flujo).
      for (const el of document.querySelectorAll(".chapter:not(.is-world-ch)")) {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.5) id = el.dataset.ch;
      }
    }
    if (id === currentChapter) return;
    currentChapter = id;
    for (const a of chapterLinks) {
      if (a.dataset.chapterLink === id) a.setAttribute("aria-current", "step");
      else a.removeAttribute("aria-current");
    }
  };

  // Tono de la interfaz fuera del mundo (secciones en flujo).
  const flowTone = () => {
    for (const el of document.querySelectorAll(".chapter:not(.is-world-ch)")) {
      const r = el.getBoundingClientRect();
      if (r.top < 80 && r.bottom > 80) return el.dataset.tone;
    }
    return null;
  };

  // ── Bucle principal ─────────────────────────────────────────────────────
  const pVec = { x: 0, y: 0 };
  let visible = true;
  document.addEventListener("visibilitychange", () => (visible = document.visibilityState === "visible"));
  let loader = null;

  const tick = (_, deltaMs) => {
    if (!visible) return;
    const dt = Math.min(deltaMs / 1000, 0.05);
    clock += dt;
    const t = scroll.time;

    pVec.x = pointer.nx;
    pVec.y = pointer.ny;
    dir.rig.update(t, pVec, stage.camera.aspect);
    env.update(t);
    loader?.apply();
    if (t >= total - 1) {
      const tone = flowTone();
      if (tone) html.dataset.tone = tone;
    }

    for (const s of SCENES) {
      const r = built.get(s);
      if (!r) {
        if (s.range && t > s.range[0] - 400) build(s);
        continue;
      }
      const on = t >= s.range[0] - 30 && t <= s.range[1];
      r.group.visible = on;
      if (on) r.update(t, clock, dt);
    }

    dom.update(t);
    hud.update(t);
    updateChapters(t);
    stage.render(dt, clock, env.fx);
  };

  window.addEventListener("resize", () => {
    stage.resize();
    setLineResolution(window.innerWidth, window.innerHeight);
  });

  gsap.ticker.add(tick);
  if (import.meta.env.DEV) window.__dogui = { stage, dir, scroll, dom, hud, env, built };

  // Pre-construye el siguiente capítulo mientras el usuario está en el hero.
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
  idle(() => build(detectar));

  // Hash inicial (#servicios, etc.) o ?nointro: sin loader.
  const hashId = decodeURIComponent(location.hash.slice(1));
  const startT = hashId ? timeForId(hashId) : null;
  const revealHero = () => gsap.to(ctx.heroHud, { gate: 1, duration: 1.1, ease: "power2.out" });

  if (skipIntro || hashId) {
    html.classList.remove("is-loading");
    ctx.heroHud.gate = 1;
    scroll.start();
    if (startT != null) scroll.jumpToTime(startT);
    else if (hashId) document.getElementById(hashId)?.scrollIntoView();
  } else {
    loader = new Loader(stage, { onReveal: revealHero });
    if (import.meta.env.DEV) window.__dogui.loader = loader;
    await loader.start();
    loader = null;
    scroll.start();
  }
  menu.setCurrent?.(hashId || "inicio");
}
