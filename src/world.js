import { gsap } from "gsap";
import { Stage, LightSpec } from "./core/renderer.js";
import { Director } from "./core/director.js";
import { DomWorld } from "./core/dom3d.js";
import { Hud } from "./core/hud.js";
import { Env } from "./core/env.js";
import { Scroll } from "./core/scroll.js";
import { Loader } from "./core/loader.js";
import { smooth, Pace, yieldTask } from "./core/timeline.js";
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
// Al entrar a un capítulo, su luz se mezcla con la del anterior durante este tramo (vh).
const LIGHT_BLEND = 50;

export async function startWorld({ pointer, skipIntro = false }) {
  const html = document.documentElement;
  // Crear el contexto WebGL es lo más caro del arranque (hasta ~1 s bloqueando), así que
  // no se hace una prueba aparte: este es el único. Sin WebGL, main.js usa el modo estático.
  let stage;
  try {
    stage = new Stage(document.querySelector("[data-stage]"));
  } catch {
    return false;
  }
  // is-arranging: oculto mientras se acomoda en varias tareas (sin cuadros a medio
  // acomodar ni desplazamientos de diseño).
  html.classList.add("is-world", "has-stage", "is-loading", "is-arranging");
  html.dataset.tone = "light";

  const dir = new Director(stage.camera);
  for (const s of SCENES) s.stations(dir);
  dir.finalize();
  await yieldTask();

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
  for (const s of SCENES) {
    s.layout(ctx);
    await yieldTask();
  }
  html.classList.remove("is-arranging");
  const env = new Env(stage);
  env.set(envKeys);

  const total = dir.total + TAIL;
  const scroll = new Scroll({ track, total, pace: new Pace(dir.list, total) });
  scroll.stop();

  // Construcción diferida de cada capítulo (geometría pesada). Sus shaders se compilan
  // en paralelo antes de mostrarlo: sin eso, el primer cuadro del capítulo se congela.
  const built = new Map();
  const building = new Map();
  const build = (s) => {
    if (!building.has(s)) {
      building.set(
        s,
        s.build(ctx).then(async (r) => {
          await stage.ready;
          // La cámara también: algunas escenas le cuelgan objetos (líneas de hiperespacio).
          await Promise.all([stage.precompile(r.group), stage.precompile(stage.camera)]);
          built.set(s, r);
          return r;
        }),
      );
    }
    return building.get(s);
  };
  await build(hero);
  await Promise.all([stage.precompile(stage.scene), stage.post?.precompile(stage.camera)]);

  // Luces: manda el capítulo en curso; al entrar a uno nuevo se mezcla con el anterior.
  const lightNow = new LightSpec();
  const lightPrev = new LightSpec();
  const updateLights = (t) => {
    let i = -1;
    SCENES.forEach((s, k) => built.has(s) && t >= s.range[0] && (i = k));
    if (i < 0) return;
    built.get(SCENES[i]).light(t, lightNow);
    const prev = i > 0 && built.get(SCENES[i - 1]);
    const k = (t - SCENES[i].range[0]) / LIGHT_BLEND;
    if (prev && k < 1) {
      prev.light(t, lightPrev);
      stage.applyLights(lightPrev.lerp(lightNow, smooth(Math.max(0, k))));
    } else {
      stage.applyLights(lightNow);
    }
  };

  // ── Navegación: los anclas vuelan la cámara hasta su punto ─────────────
  const timeForId = (id) => (anchors.has(id) ? anchors.get(id) : null);
  const menu = initMenu({
    onNavigate: (id, target) => {
      const t = timeForId(id);
      if (t != null) scroll.scrollToTime(t);
      else scroll.lenis.scrollTo(target, { offset: 0, duration: 1.4 });
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

  // PageDown / PageUp / Espacio: de parada en parada, sin pasarse ninguna.
  document.addEventListener("keydown", (e) => {
    const forward = e.key === "PageDown" || (e.key === " " && !e.shiftKey);
    const back = e.key === "PageUp" || (e.key === " " && e.shiftKey);
    if ((!forward && !back) || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target instanceof Element && e.target.closest("a, button, input, select, textarea, summary, [data-menu]")) return;
    const now = scroll.rawTime;
    if (now >= total - 1 && forward) return; // Después del recorrido: scroll normal de la página.
    // Punto de lectura de cada parada. El margen evita quedarse en la misma parada al
    // llegar desde un enlace del menú, que deja la cámara justo en su inicio.
    const stop = (s) => s.t + s.hold * 0.15;
    const next = forward ? dir.list.find((s) => stop(s) > now + 12) : [...dir.list].reverse().find((s) => stop(s) < now - 12);
    e.preventDefault();
    scroll.scrollToTime(next ? stop(next) : forward ? total : 0, { duration: 0.8 });
  });

  // ── Indicador de capítulos ──────────────────────────────────────────────
  const chapterLinks = [...document.querySelectorAll("[data-chapter-link]")];
  const chapterRanges = SCENES.filter((s) => s.chapter).map((s) => ({ id: s.chapter, from: s.chapterFrom }));
  let currentChapter = null;
  const chaptersNav = document.querySelector("[data-chapters]");
  let lastP = -1;
  const updateChapters = (t) => {
    const p = Math.round((t / total) * 200) / 200;
    if (p !== lastP) {
      chaptersNav?.style.setProperty("--p", p);
      lastP = p;
    }
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
        if (s.range && t > s.range[0] - 800) build(s);
        continue;
      }
      const on = t >= s.range[0] - 30 && t <= s.range[1];
      r.group.visible = on;
      if (on) r.update(t, clock, dt);
    }

    updateLights(t);
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

  hud.splitWhenIdle();

  // Pre-construye los capítulos en tiempo libre, uno por uno, para que al avanzar rápido
  // (o saltar desde el menú) ya estén listos y no haya pausas a media ruta. Empieza al
  // terminar el loader (antes competiría con él por el GPU y lo retrasaría): primero el
  // capítulo siguiente y, a la primera señal de que hay alguien ahí, el resto.
  const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2500 }) : setTimeout(fn, 400));
  const preload = (i) => {
    const s = SCENES[i];
    if (!s) return;
    idle(() => build(s).then(() => setTimeout(() => preload(i + 1), 600)));
  };
  const preloadOnInteraction = () => {
    idle(() => build(detectar));
    const ac = new AbortController();
    for (const ev of ["pointermove", "wheel", "keydown", "touchstart"]) {
      window.addEventListener(
        ev,
        () => {
          ac.abort();
          preload(SCENES.indexOf(detectar) + 1);
        },
        { passive: true, signal: ac.signal },
      );
    }
  };

  // Hash inicial (#servicios, etc.) o ?nointro: sin loader.
  const hashId = decodeURIComponent(location.hash.slice(1));
  const startT = hashId ? timeForId(hashId) : null;
  const revealHero = () => gsap.to(ctx.heroHud, { gate: 1, duration: 0.7, ease: "power2.out" });

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
  preloadOnInteraction();
  menu.setCurrent?.(hashId || "inicio");
}
