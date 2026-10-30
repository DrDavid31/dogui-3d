import { contacto, site } from "../content/content.js";

// Mismo comportamiento que el sitio actual: POST /api/leads y, si no hay backend,
// abre el correo con los datos como respaldo.
export function initLeadForm() {
  const form = document.querySelector("[data-lead-form]");
  const note = document.querySelector("[data-form-note]");
  if (!form) return;
  const T = contacto.form;
  const field = (name) => form.elements.namedItem(name);

  const payload = (fd) => ({
    name: String(fd.get("name") || "").trim(),
    company: String(fd.get("company") || "").trim(),
    email: String(fd.get("email") || "").trim(),
    phone: String(fd.get("phone") || "").trim(),
    size: String(fd.get("size") || "").trim(),
    urgency: String(fd.get("urgency") || "").trim(),
    service: String(fd.get("service") || "").trim(),
    message: String(fd.get("message") || "").trim(),
    // Consentimiento (aviso de privacidad) y permiso opcional para comunicaciones.
    consent: fd.get("consent") === "on",
    marketing: fd.get("marketing") === "on",
    website: String(fd.get("website") || "").trim(),
    source: "doguiweb",
  });

  const mailFallback = (lead) => {
    const subject = `${lead.urgency === T.urgencies.at(-1) ? "[INCIDENTE] " : ""}Solicitud DOGUI - ${lead.service || "Ciberseguridad"}`;
    const lines = [`Nombre: ${lead.name}`, `Empresa: ${lead.company}`, `Correo: ${lead.email}`];
    if (lead.phone) lines.push(`Teléfono/WhatsApp: ${lead.phone}`);
    if (lead.size) lines.push(`Tamaño: ${lead.size}`);
    lines.push(
      `Urgencia: ${lead.urgency}`,
      `Servicio: ${lead.service}`,
      `Acepta comunicaciones: ${lead.marketing ? "sí" : "no"}`,
      "",
      "Mensaje:",
      lead.message || "Quiero que DOGUI me contacte para definir alcance.",
    );
    const body = lines.join("\n");
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Botones de otras secciones (incidente, herramientas) que llenan el formulario.
  const prefill = ({ service, message, urgency }) => {
    if (service) {
      const opt = [...field("service").options].find((o) => o.value === service || o.text === service);
      if (opt) field("service").value = opt.value;
    }
    if (urgency) field("urgency").value = urgency;
    if (message) field("message").value = message;
    // Tras el desplazamiento hasta el formulario, el foco va al primer campo vacío.
    setTimeout(() => {
      const first = ["name", "company", "email"].map(field).find((el) => !el.value) || field("message");
      first?.focus({ preventScroll: true });
    }, 900);
  };
  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest("[data-incident], [data-prefill]") : null;
    if (!el) return;
    if (el.hasAttribute("data-incident")) {
      prefill({ urgency: T.urgencies.at(-1), service: "Respuesta a incidentes" });
    } else {
      prefill({ service: el.dataset.service, message: el.dataset.message });
    }
  });

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
