import * as THREE from "three";
import { paquetes } from "../../content/content.js";

// Capítulo 04 · Contacto (fondo claro): paquetes, cierre con el logo 3D y formulario.
const deg = THREE.MathUtils.degToRad;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const look = (pos, yaw = 0, pitch = 0, dist = 2400) => {
  const d = V(-Math.sin(deg(yaw)) * Math.cos(deg(pitch)), Math.sin(deg(pitch)), -Math.cos(deg(yaw)) * Math.cos(deg(pitch)));
  return { pos: pos.toArray(), target: pos.clone().addScaledVector(d, dist).toArray() };
};

export const contacto = {
  id: "contacto",
  selector: "#cierre",
  chapter: "contacto",

  stations(dir) {
    const last = dir.list[dir.list.length - 1];
    const start = last.pos.clone().add(last.drift);
    const O = V(start.x, 160, start.z - 4400);
    this.O = O;
    const S = (id, a, o = {}) => dir.station(id, { ...a, hold: 56, travel: 60, ...o });
    S("c4-pkg", look(O, 0, -2), { drift: [0, 0, -120], hold: 64 });
    S("c4-final", look(V(O.x, 170, O.z - 1700), 0, -1), { drift: [0, 0, -140], hold: 66 });
    S("c4-contact", look(V(O.x, 170, O.z - 3300), 0, -1), { drift: [0, 0, -90], hold: 70 });
  },

  layout(ctx) {
    const { dir, dom, hud, anchors, env } = ctx;
    const q = (s) => document.querySelector(s);
    const F = (id) => dir.frame(id);
    const W = (id, o) => dir.win(id, o);
    const pkg = dir.get("c4-pkg");
    const contact = dir.get("c4-contact");
    const logo = dir.get("c3-logo");
    this.chapterFrom = pkg.t - 60;
    anchors.set("cierre", pkg.t);
    anchors.set("paquetes", pkg.t);
    anchors.set("contacto", contact.t);

    // Título del capítulo durante el final de la transición del logo.
    hud.add(q('[data-hud="c4-title"]'), { show: [logo.end - 30, logo.end, pkg.t - 30, pkg.t] });

    // Paquetes: inclinación 3D al pasar el mouse (pointer.js deja --tx / --ty en la tarjeta).
    hud.add(q('[data-hud="pkg-head"]'), { show: W("c4-pkg") });
    const xs = [-555, -185, 185, 555];
    paquetes.items.forEach((p, i) => {
      dom.add(q(`[data-o="pkg-${i}"]`), {
        anchor: F("c4-pkg"),
        pose: { x: xs[i], y: -40, z: p.highlight ? -70 : 30, ry: (1.5 - i) * 5, s: 0.9 },
        show: shiftW(W("c4-pkg"), i * 6),
        from: { y: -220, z: 520, rx: -24, o: 0 },
        live: (t, pose, it) => {
          const tx = parseFloat(it.el.style.getPropertyValue("--tx")) || 0;
          const ty = parseFloat(it.el.style.getPropertyValue("--ty")) || 0;
          it.tilt = it.tilt || { x: 0, y: 0 };
          it.tilt.x += (tx - it.tilt.x) * 0.15;
          it.tilt.y += (ty - it.tilt.y) * 0.15;
          pose.rx += it.tilt.x;
          pose.ry += it.tilt.y;
        },
      });
    });

    // Cierre: frases + intro + botones (el logo 3D va arriba, en build.js).
    hud.add(q('[data-hud="final"]'), { show: W("c4-final") });

    // Contacto: panel en pantalla que se queda al final del recorrido.
    hud.add(q('[data-hud="contact"]'), { show: [contact.t - 40, contact.t] });

    env.push(
      { t: logo.end + 10, color: "#F7F7F5", near: 2600, far: 13000, bloom: 0.3, vignette: 0.08, grain: 0.025 },
      { t: contact.end + 40, color: "#F7F7F5", near: 2600, far: 13000, bloom: 0.3, vignette: 0.08, grain: 0.025 },
    );
    this.range = [logo.t, contact.end + 200];
  },

  async build(ctx) {
    const { buildContacto } = await import("./build.js");
    return buildContacto(ctx, this);
  },
};

function shiftW(w, d) {
  return [w[0] + d, w[1] + d, w[2], w[3]];
}
