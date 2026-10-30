// En celular, cada grupo de tarjetas es un carrusel horizontal (flow.css). Aquí se le
// agregan los puntos de posición y, si no tiene enlaces, se vuelve enfocable para
// poder recorrerlo con teclado.
const SELECTOR = ".plans, .steps, .grid";

export function initCarousels() {
  const mq = window.matchMedia("(max-width: 700px)");
  if (!mq.matches) return;
  for (const track of document.querySelectorAll(SELECTOR)) {
    const cards = [...track.children];
    if (cards.length < 2 || track.scrollWidth <= track.clientWidth + 4) continue;
    if (!track.querySelector("a, button, input, select, textarea")) track.tabIndex = 0;

    const dots = document.createElement("div");
    dots.className = "dots";
    dots.setAttribute("aria-hidden", "true");
    const marks = cards.map(() => dots.appendChild(document.createElement("i")));
    track.after(dots);

    // Tarjeta activa: la más visible dentro del carrusel.
    const seen = new Map();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target, e.intersectionRatio);
        let best = 0;
        cards.forEach((c, i) => {
          if ((seen.get(c) || 0) > (seen.get(cards[best]) || 0)) best = i;
        });
        marks.forEach((m, i) => m.classList.toggle("is-on", i === best));
      },
      { root: track, threshold: [0.25, 0.5, 0.75, 1] },
    );
    cards.forEach((c) => io.observe(c));
  }
}
