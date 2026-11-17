(function () {
  // Dirección de la API (site.api en src/content/content.js). Sin API configurada no se
  // consulta nada: el formulario abre el correo y no hay medición.
  const meta = document.querySelector('meta[name="dogui-api"]');
  const configured = meta ? meta.content.trim() : "";
  const apiBase = configured === "/" ? "" : configured.replace(/\/+$/, "");
  const endpoint = `${apiBase}/api/events`;
  const storageKey = "dogui_distinct_id";
  window.DOGUIApiAvailable = false;
  window.DOGUIApiBase = apiBase;

  const shouldProbeApi = () => {
    if (!configured) return false;
    if (window.location.protocol === "file:") return false;
    return true;
  };

  const getDistinctId = () => {
    try {
      const existing = window.localStorage.getItem(storageKey);
      if (existing) return existing;
      const created = `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(storageKey, created);
      return created;
    } catch {
      return "anonymous";
    }
  };

  const detectApi = async () => {
    if (!shouldProbeApi()) return false;

    try {
      const response = await fetch(`${apiBase}/api/health`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      window.DOGUIApiAvailable = response.ok;
      return response.ok;
    } catch {
      window.DOGUIApiAvailable = false;
      return false;
    }
  };

  // Sin medición si la persona la desactivó (aviso de privacidad, sección 9) o si su
  // navegador envía Global Privacy Control / Do Not Track.
  const measurementOff = () => {
    if (navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") return true;
    try {
      return window.localStorage.getItem("dogui_measure_off") === "1";
    } catch {
      return true;
    }
  };

  const sendEvent = (event, properties = {}) => {
    if (!window.DOGUIApiAvailable || measurementOff()) return;

    const payload = JSON.stringify({
      event,
      distinctId: getDistinctId(),
      properties: {
        path: window.location.pathname,
        hash: window.location.hash,
        title: document.title,
        ...properties,
      },
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
      return;
    }

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  };

  window.DOGUITrack = sendEvent;

  window.addEventListener("load", async () => {
    if (await detectApi()) {
      sendEvent("website_page_view");
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a,button") : null;
    if (!target) return;

    const label = target.textContent ? target.textContent.trim().slice(0, 120) : "";
    const href = target.getAttribute("href") || "";

    if (href === "#contacto" || href === "#paquetes" || target.closest(".package-card")) {
      sendEvent("website_cta_clicked", { label, href });
    }
  });

  window.addEventListener("error", (event) => {
    sendEvent("website_client_error", {
      message: event.message,
      source: event.filename,
      line: event.lineno,
    });
  });
})();
