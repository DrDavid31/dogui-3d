/** Menú de secciones (pastilla "Menú"): accesible con teclado, Escape cierra. */
export function initMenu({ onNavigate } = {}) {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (!toggle || !menu) return { setCurrent() {} };
  const links = [...menu.querySelectorAll("a")];

  const open = (state) => {
    toggle.setAttribute("aria-expanded", String(state));
    menu.hidden = !state;
    if (state) links[0]?.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", () => open(menu.hidden));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      open(false);
      toggle.focus({ preventScroll: true });
    }
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && !toggle.contains(e.target)) open(false);
  });

  // Cualquier enlace interno (#ancla) pasa por el navegador de la experiencia.
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    const hash = a.getAttribute("href");
    if (!hash || hash === "#") return;
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    open(false);
    history.pushState(null, "", hash);
    onNavigate?.(id, target);
  });

  return {
    setCurrent(id) {
      for (const l of links) {
        if (l.getAttribute("href") === `#${id}`) l.setAttribute("aria-current", "true");
        else l.removeAttribute("aria-current");
      }
    },
  };
}
