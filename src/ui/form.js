import { contacto, site } from "../content/content.js";

// Mismo comportamiento que el sitio actual: POST /api/leads y, si no hay backend,
// abre el correo con los datos como respaldo.
export function initLeadForm() {
  const form = document.querySelector("[data-lead-form]");
  const note = document.querySelector("[data-form-note]");
  if (!form) return;
  const T = contacto.form;

  const payload = (fd) => ({
    name: String(fd.get("name") || "").trim(),
    company: String(fd.get("company") || "").trim(),
    email: String(fd.get("email") || "").trim(),
    service: String(fd.get("service") || "").trim(),
    message: String(fd.get("message") || "").trim(),
    website: String(fd.get("website") || "").trim(),
    source: "doguiweb",
  });

  const mailFallback = (lead) => {
    const subject = `Solicitud DOGUI - ${lead.service || "Ciberseguridad"}`;
    const body = [
      `Nombre: ${lead.name}`,
      `Empresa: ${lead.company}`,
      `Correo: ${lead.email}`,
      `Servicio: ${lead.service}`,
      "",
      "Mensaje:",
      lead.message || "Quiero que DOGUI me contacte para definir alcance.",
    ].join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const button = form.querySelector('button[type="submit"]');
    const lead = payload(new FormData(form));
    if (note) note.textContent = T.sending;
    button?.setAttribute("disabled", "true");
    try {
      if (window.DOGUIApiAvailable === false) throw new Error("lead_api_unavailable");
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error("lead_api_unavailable");
      if (note) note.textContent = T.success;
      form.reset();
    } catch {
      if (note) note.textContent = T.fallback;
      mailFallback(lead);
    } finally {
      button?.removeAttribute("disabled");
    }
  });
}
