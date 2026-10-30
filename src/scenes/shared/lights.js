// Presets de luz por capítulo. Se aplican sobre el juego de luces compartido
// (Stage.lights en core/renderer.js); world.js mezcla el del capítulo anterior con el
// nuevo durante el cambio. La llave y el contraluz acompañan a la cámara.

/** Estudio claro: cielo blanco, llave alta; sin contraluz. */
export const studioLight = (stage) => (t, L) => {
  const c = stage.camera.position;
  L.sky.set(0xffffff);
  L.ground.set(0xd9d6cf);
  L.hemi = 1.15;
  L.key = 2.1;
  L.keyPos.set(c.x - 1600, c.y + 2400, c.z + 1800);
  L.keyAt.set(c.x, c.y, c.z - 2000);
  L.rim = 0;
  L.rimPos.set(c.x + 2400, c.y + 800, c.z - 5200);
  L.rimAt.set(c.x, c.y, c.z - 1600);
};

/** Capítulos oscuros: relleno tenue + llave y contraluz para que el cromo tenga brillos. */
export const darkLight = (stage, { sky = 0x9a9a9a, hemi = 0.55 } = {}) => (t, L) => {
  const c = stage.camera.position;
  L.sky.set(sky);
  L.ground.set(0x0a0a0a);
  L.hemi = hemi;
  L.key = 2.2;
  L.keyPos.set(c.x - 1800, c.y + 2600, c.z + 1200);
  L.keyAt.set(c.x, c.y, c.z - 2400);
  L.rim = 1.4;
  L.rimPos.set(c.x + 2400, c.y + 800, c.z - 5200);
  L.rimAt.set(c.x, c.y, c.z - 1600);
};
