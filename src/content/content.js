// Todo el texto del sitio vive aquí. Edita este archivo para cambiar copy;
// el HTML se genera en build (SEO / sin JS) y la experiencia 3D lo reutiliza.

export const site = {
  lang: "es-MX",
  title: "DOGUI | Ciberseguridad, automatización y consultoría SPEI/SPID",
  description:
    "DOGUI protege empresas con SOC/MDR, Threat Exposure Monitoring, vCISO, SGSI con software propio CIDSI, awareness, automatización y consultoría SPEI/SPID.",
  ogTitle: "DOGUI | Ciberseguridad y consultoría SPEI/SPID",
  ogDescription:
    "Servicios gestionados, monitoreo de exposición digital, SGSI con software propio CIDSI, automatización y consultoría especializada para operaciones críticas.",
  ogImageAlt: "DOGUI · Ciberseguridad ofensiva, defensiva y financiera",
  twitterDescription:
    "SOC/MDR, Threat Exposure Monitoring, vCISO, Awareness, SGSI CIDSI y consultoría SPEI/SPID para empresas.",
  email: "ventas@dogui.mx",
  // Teléfono, WhatsApp y agenda: al llenarlos aparecen solos en contacto, el botón flotante
  // de WhatsApp, la línea de incidentes y los datos para buscadores. Vacíos no se muestran.
  phone: "", // Como se muestra, p. ej. "+52 55 1234 5678"
  whatsapp: "", // Solo dígitos con lada internacional, p. ej. "525512345678"
  bookingUrl: "", // Agenda en línea para la llamada de 30 min (Calendly, Cal.com…)
};

export const nav = [
  { href: "#servicios", label: "Servicios" },
  { href: "#productos", label: "Productos" },
  { href: "#exposicion", label: "Exposición" },
  { href: "#sgsi", label: "SGSI" },
  { href: "#pyme", label: "PyME" },
  { href: "#awareness", label: "Awareness" },
  { href: "#vciso", label: "vCISO" },
  { href: "#saas", label: "SaaS" },
  { href: "#spei-spid", label: "SPEI/SPID" },
  { href: "#metodo", label: "Método" },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#herramientas", label: "Diagnóstico gratis" },
  { href: "#preguntas", label: "Preguntas" },
  { href: "#contacto", label: "Contacto" },
];

export const cta = { label: "Agendar diagnóstico", href: "#contacto" };

// Capítulos de la narrativa (indicador inferior).
export const chapters = [
  { id: "detectar", n: "01", label: "Detectar", title: "Detectar", subtitle: "Todo incidente empieza con una señal." },
  { id: "responder", n: "02", label: "Responder", title: "Responder", subtitle: "Bienvenido al centro de operaciones." },
  { id: "automatizar", n: "03", label: "Automatizar", title: "Automatizar", subtitle: "Ahora responde solo." },
  { id: "contacto", n: "04", label: "Contacto", title: "Contacto", subtitle: "Elige el punto de entrada y crecemos desde ahí." },
];

// Frases de transición de la narrativa.
export const story = {
  perimeter: "Entra al perímetro.",
  riskA: "El mayor riesgo no es el ataque.",
  riskB: "Es no enterarte a tiempo.",
  closeA: "Detecta antes.",
  closeB: "Responde más rápido.",
  finalA: "Deja de perseguir alertas.",
  finalB: "Empieza a defender.",
};

export const hero = {
  kicker: "Ciberseguridad ofensiva, defensiva y financiera",
  title: "DOGUI protege tu operación antes, durante y después de un ataque.",
  copy:
    "Servicios gestionados, consultoría especializada y automatizaciones para detectar amenazas, responder incidentes y fortalecer entornos críticos, incluyendo flujos SPEI y SPID.",
  primary: { label: "Agendar diagnóstico", href: "#contacto", icon: "calendar-check" },
  secondary: { label: "Ver paquetes", href: "#paquetes", icon: "packages" },
  panel: {
    label: "Vista ejecutiva de DOGUI",
    status: "Operación lista para presentar",
    pill: "MX",
    title: "Defensa integral para entornos críticos",
    metrics: [
      { icon: "radar", n: "01", label: "Detectar" },
      { icon: "siren", n: "02", label: "Responder" },
      { icon: "workflow", n: "03", label: "Automatizar" },
    ],
    stack: [
      { icon: "eye", label: "Exposición digital", value: "Dark web, Telegram y filtraciones" },
      { icon: "shield-check", label: "Operación", value: "SOC/MDR, respuesta y automatización" },
      { icon: "building", label: "Dirección", value: "vCISO, SGSI y cumplimiento" },
    ],
    note: "SOC, inteligencia, pruebas ofensivas y consultoría financiera coordinadas en un mismo plan.",
  },
};

export const socConsole = {
  title: "Consola SOC",
  live: "En vivo",
  alerts: [
    { sev: "Alta", level: "high", event: "Inicio de sesión anómalo en VPN", state: "Contenido" },
    { sev: "Media", level: "mid", event: "Phishing reportado por un empleado", state: "Analizando" },
    { sev: "Baja", level: "low", event: "Escaneo de puertos desde IP externa", state: "Bloqueado" },
  ],
  satellites: ["Contención", "Evidencia", "Reporte"],
};

export const capabilities = {
  label: "Capacidades principales DOGUI",
  lede: "Detectamos exposición de credenciales, menciones de marca y señales de fraude en fuentes abiertas, Telegram, deep web y dark web.",
  items: [
    { icon: "radar", label: "CTI" },
    { icon: "eye", label: "Dark Web" },
    { icon: "database-zap", label: "Filtraciones" },
    { icon: "message-warning", label: "WhatsApp Security" },
    { icon: "shield-check", label: "SOC/MDR" },
    { icon: "bug", label: "Pentest" },
    { icon: "workflow", label: "SOAR" },
    { icon: "user-check", label: "vCISO" },
  ],
};

export const trust = [
  { icon: "shield-check", value: "24/7", label: "Monitoreo y respuesta" },
  { icon: "radar", value: "360", label: "Visión de riesgo técnico y operativo" },
  { icon: "building", value: "MX", label: "Enfoque para operación financiera mexicana" },
  { icon: "chart", value: "90", label: "Roadmap priorizado en días" },
];

export const intro = {
  title: "Deja de perseguir alertas sueltas. Construye una defensa que venda confianza.",
  text: "DOGUI combina especialistas, tecnología y automatización para que tu empresa mejore visibilidad, reduzca tiempos de respuesta y pueda demostrar controles ante clientes, auditores y socios de negocio.",
};

// ─── Capítulo 01 · Detectar ────────────────────────────────────────────────

export const detectGraph = {
  nodes: ["Dominio", "Correos", "Telegram", "Dark web", "Repositorios", "Ransomware leak sites"],
  findings: ["Credencial filtrada", "Dominio parecido detectado", "Documento expuesto"],
  findingLabel: "Hallazgo",
};

export const exposicion = {
  id: "exposicion",
  kicker: "Monitoreo de exposición digital",
  title: "Detecta filtraciones, menciones y señales de riesgo antes de que afecten a tu empresa.",
  text: [
    "DOGUI Threat Exposure Monitoring ayuda a identificar si la información de tu empresa, empleados, dominios, sistemas o marca aparece expuesta en fuentes abiertas, repositorios públicos, canales de Telegram, deep web, dark web y sitios de filtraciones.",
    "Este servicio está diseñado para empresas que necesitan visibilidad externa sin operar un equipo interno de inteligencia de amenazas.",
  ],
  aside: {
    label: "Producto estrella",
    title: "Monitoreo, evidencia y acciones concretas.",
    text: "Convertimos hallazgos externos en alertas claras, nivel de riesgo, recomendaciones de mitigación y seguimiento hasta cierre.",
  },
  // Texto del producto TEM (catálogo de productos del sitio actual).
  product: {
    tag: "TEM",
    title: "DOGUI Threat Exposure Monitoring",
    text: [
      "Monitoreo de filtraciones, dark web, deep web, Telegram y exposición digital.",
      "Identificamos menciones, credenciales expuestas, documentos filtrados, dominios sospechosos y señales de riesgo relacionadas con tu empresa.",
    ],
    items: [
      "Correos corporativos filtrados",
      "Menciones de marca y documentos expuestos",
      "Dominios similares, Telegram público y fuentes de filtraciones",
      "Alertas relevantes y reporte ejecutivo mensual",
    ],
    strong: "Detectamos exposición digital antes de que se convierta en fraude, phishing o incidente.",
  },
  monitor: {
    title: "Qué monitoreamos",
    items: [
      "Dominios corporativos",
      "Correos de empleados",
      "Nombres de marca",
      "Ejecutivos clave",
      "Sistemas internos",
      "Documentos expuestos",
      "Credenciales filtradas",
      "Canales públicos de Telegram",
      "Repositorios públicos",
      "Sitios de ransomware leak",
      "Foros y fuentes de filtraciones",
    ],
  },
  deliver: {
    title: "Qué entregamos",
    items: [
      "Alertas de hallazgos críticos",
      "Evidencia controlada",
      "Nivel de riesgo por hallazgo",
      "Recomendaciones de mitigación",
      "Reporte mensual ejecutivo",
      "Seguimiento de hallazgos hasta cierre",
    ],
  },
  flowLabel: "Cómo funciona DOGUI Threat Exposure Monitoring",
  flow: [
    { n: "01", title: "Definimos palabras clave", text: "Dominio, marca, correos, ejecutivos, sistemas y términos sensibles." },
    { n: "02", title: "Monitoreamos fuentes de riesgo", text: "DOGUI usa automatizaciones propias para buscar señales relevantes." },
    { n: "03", title: "Validamos hallazgos", text: "Clasificamos falsos positivos y priorizamos por impacto operativo." },
    { n: "04", title: "Alertamos y recomendamos", text: "El cliente recibe evidencia clara, riesgo y acciones sugeridas." },
    { n: "05", title: "Reportamos mensualmente", text: "Entregamos resumen ejecutivo con tendencias, hallazgos y pendientes." },
  ],
  plansLabel: "Niveles de DOGUI Threat Exposure Monitoring",
  plans: [
    {
      tier: "PyME",
      title: "DOGUI Leak Monitor",
      text: "Para empresas que quieren saber si correos, dominios o documentos aparecen filtrados.",
      items: ["1 dominio corporativo", "Correos expuestos", "Menciones básicas de marca", "Revisión mensual", "Alertas críticas", "Reporte ejecutivo"],
      strong: "Te avisamos si correos o información de tu empresa aparecen expuestos.",
    },
    {
      tier: "Medianas",
      title: "DOGUI Threat Exposure Plus",
      text: "Para organizaciones que necesitan monitoreo continuo de marca, dominios y fuentes OSINT.",
      items: [
        "Varios dominios",
        "Monitoreo de marca",
        "Telegram público y repositorios públicos",
        "Paste sites y documentos expuestos",
        "Dominios parecidos",
        "Alertas semanales y reporte mensual",
      ],
      strong: "Monitoreamos tu exposición digital para detectar filtraciones, suplantación y señales de fraude.",
      highlight: true,
    },
    {
      tier: "Alto riesgo",
      title: "DOGUI Dark Web Pro",
      text: "Para empresas con mayor exposición, clientes corporativos o riesgos de fraude dirigido.",
      items: [
        "Todo lo anterior",
        "Menciones en fuentes dark/deep web",
        "Ransomware leak sites",
        "Ejecutivos clave y palabras sensibles",
        "Seguimiento de hallazgos",
        "Reporte ejecutivo y técnico",
        "Recomendaciones de contención",
      ],
      strong: "Detectamos señales tempranas de amenazas contra tu organización en fuentes de alto riesgo.",
    },
  ],
};

export const pyme = {
  id: "pyme",
  kicker: "PyME | Paquetes de seguridad accionables",
  title: "Ciberseguridad entendible, medible y lista para operar sin un SOC interno.",
  text: "DOGUI empaqueta servicios ligeros para pequeñas y medianas empresas: reportes por WhatsApp, análisis de links y archivos, simulaciones de phishing, monitoreo de credenciales, exposición externa, protección de marca, correo seguro, ransomware readiness, compliance y defensa contra fraude con IA.",
  heroCard: {
    label: "Producto estrella",
    title: "DOGUI WhatsApp Security Assistant",
    text: "Tus empleados ya usan WhatsApp. DOGUI lo convierte en tu primera línea de defensa para reportar links, correos falsos, archivos raros, intentos de fraude, alertas internas y check-ins operativos.",
    items: [
      "Creación automática de tickets",
      "Respuestas automáticas de contención",
      "Canal oficial para empleados",
      "Ideal para PyMEs sin SOC ni mesa de ayuda de seguridad",
    ],
  },
  clusters: [
    {
      title: "Detección y respuesta",
      count: "4 productos",
      label: "Productos DOGUI de detección y respuesta",
      items: [
        { icon: "message-warning", title: "WhatsApp Security Assistant", text: "Canal oficial para reportar links, correos, archivos, fraude, alertas internas y tickets.", strong: "Tus empleados ya usan WhatsApp. DOGUI lo convierte en tu primera línea de defensa." },
        { icon: "link", title: "Link & File Checker", text: "Analiza links, PDFs, Excel, Word, ZIPs o imágenes antes de abrirlos, por WhatsApp o panel web.", strong: "Antes de abrir un archivo raro, mándalo a DOGUI." },
        { icon: "bug", title: "Phishing Simulator", text: "Campañas por correo, WhatsApp o SMS con métricas de clics, reportes, score y capacitación.", strong: "Medimos y reducimos el riesgo humano antes de que un fraude real ocurra." },
        { icon: "fingerprint", title: "Credential Exposure Monitor", text: "Detecta cuentas corporativas filtradas y prioriza usuarios críticos de dirección, finanzas, RH y TI.", strong: "Te avisamos cuando las cuentas de tu empresa aparecen expuestas." },
      ],
    },
    {
      title: "Protección de marca y superficie",
      count: "4 productos",
      label: "Productos DOGUI de protección de marca y superficie",
      items: [
        { icon: "shield-check", title: "Brand Protection", text: "Monitorea dominios parecidos, perfiles falsos, páginas clonadas, ofertas falsas y menciones sospechosas.", strong: "Detectamos cuando alguien intenta usar tu nombre para engañar a tus clientes." },
        { icon: "scan", title: "Exposure Scan", text: "Revisa subdominios, puertos, logins expuestos, certificados, headers y servicios vulnerables.", strong: "Te mostramos qué ve un atacante cuando busca tu empresa en internet." },
        { icon: "chart", title: "Executive Cyber Report", text: "Reporte mensual con riesgo general, hallazgos, empleados de mayor riesgo, incidentes y recomendaciones.", strong: "Ciberseguridad traducida a reportes claros para dirección." },
        { icon: "building", title: "Vendor Risk Lite", text: "Evalúa proveedores con checklist, dominio, correos filtrados, exposición, HTTPS, DNS, SPF, DKIM y DMARC.", strong: "Antes de confiar datos o accesos, DOGUI revisa su riesgo básico." },
      ],
    },
    {
      title: "Cumplimiento y continuidad",
      count: "4 productos",
      label: "Productos DOGUI de cumplimiento y continuidad",
      items: [
        { icon: "mail-warning", title: "Email Security Check", text: "Revisa SPF, DKIM, DMARC, MX, spoofing posible, seguridad del dominio y verificación mensual.", strong: "Evita que manden correos falsos usando el nombre de tu empresa." },
        { icon: "siren", title: "Ransomware Readiness", text: "Evalúa backups, MFA, usuarios administradores, servicios expuestos, parches, segmentación y respuesta.", strong: "Revisamos si puedes recuperarte sin detener la operación." },
        { icon: "file-lock", title: "Compliance Lite", text: "Ordena ISO 27001 básico, matriz de riesgos, políticas, activos, responsables, evidencias y avance.", strong: "Prepara tu empresa para auditorías, clientes corporativos y mejores prácticas." },
        { icon: "bot", title: "AI Fraud Defense", text: "Detecta mensajes sospechosos, solicitudes urgentes de pago, deepfake scams y fraude multicanal.", strong: "Protege finanzas y dirección contra fraudes generados con IA." },
      ],
    },
  ],
  focus: {
    title: "Un paquete fuerte para PyMEs empieza con WhatsApp, archivos, phishing, credenciales y exposición.",
    items: ["WhatsApp Security Assistant", "Link & File Checker", "Phishing Simulator", "Credential Exposure Monitor", "Exposure Scan"],
  },
  packagesLabel: "Paquetes comerciales PyME",
  packages: [
    { title: "DOGUI Essential", text: "Para PyMEs pequeñas que necesitan protección inmediata.", items: ["WhatsApp Security Assistant", "Link checker", "Revisión de correos filtrados", "Reporte mensual"] },
    { title: "DOGUI Awareness", text: "Para empresas preocupadas por el riesgo humano.", items: ["Phishing simulator", "Capacitaciones cortas", "Score por empleado", "Campañas por WhatsApp/correo"] },
    { title: "DOGUI Exposure", text: "Para empresas con presencia digital y marca pública.", items: ["Exposure scan", "Dominios parecidos", "Email security check", "Brand protection básico"] },
    { title: "DOGUI Resilience", text: "Para reducir riesgo operativo ante ransomware.", items: ["Ransomware readiness", "Backups checklist", "Usuarios críticos y MFA", "Plan de respuesta"] },
    { title: "DOGUI Compliance Lite", text: "Para ordenarse ante clientes, auditorías y mejores prácticas.", items: ["ISO 27001 básico", "Matriz de riesgos", "Políticas y evidencias", "Reporte de avance"] },
  ],
};

export const whatsappChat = {
  name: "DOGUI Awareness",
  account: "Cuenta de empresa",
  label: "Ejemplos de mensajes DOGUI Awareness",
  bubbles: [
    "Curso nuevo disponible: cómo detectar phishing.",
    "Responde esta pregunta de seguridad.",
    "¿Este link parece seguro o sospechoso?",
    "Reporta aquí cualquier mensaje extraño.",
    "Tu simulación de phishing fue completada.",
  ],
};

export const awareness = {
  id: "awareness",
  kicker: "DOGUI Awareness",
  title: "Programa de concientización en ciberseguridad para empresas.",
  text: [
    "El factor humano sigue siendo uno de los principales puntos de entrada para incidentes de seguridad. DOGUI Awareness ayuda a capacitar a los colaboradores mediante cursos prácticos, microcapacitaciones, simulaciones de phishing, evaluaciones, constancias y reportes ejecutivos.",
    "Capacita a tu equipo para detectar amenazas antes de que se conviertan en incidentes.",
  ],
  summary: [
    {
      title: "Qué incluye",
      items: [
        "Cursos de ciberseguridad para empleados",
        "Microcapacitaciones mensuales",
        "Evaluaciones por usuario",
        "Constancias de participación",
        "Simulaciones de phishing",
        "Campañas por correo y WhatsApp",
        "Reportes ejecutivos",
        "Recomendaciones por área",
        "Seguimiento de avance y nivel de riesgo",
      ],
    },
    {
      title: "Modalidades",
      items: [
        "Curso inicial para todo el personal",
        "Programa mensual con microcursos y reportes recurrentes",
        "Capacitación por área para Finanzas, RH, Dirección, TI y Operaciones",
      ],
    },
    {
      title: "Beneficios",
      items: [
        "Reduce el riesgo de phishing y fraudes digitales",
        "Mejora la capacidad de respuesta de los empleados",
        "Fortalece la cultura de seguridad",
        "Genera evidencia de capacitación",
        "Entrega métricas claras para dirección",
        "Facilita buenas prácticas y auditorías",
      ],
    },
  ],
  plansLabel: "Paquetes DOGUI Awareness",
  plans: [
    {
      tier: "Starter",
      title: "DOGUI Awareness Starter",
      text: "Para empresas pequeñas que quieren capacitar a su equipo una vez.",
      items: ["Curso inicial de ciberseguridad", "Evaluación final", "Constancias", "Reporte ejecutivo", "Material descargable"],
    },
    {
      tier: "Más vendible",
      title: "DOGUI Awareness Plus",
      text: "Para empresas que quieren seguimiento mensual y medición recurrente.",
      items: ["Curso inicial", "Microcurso mensual", "Evaluación mensual", "Simulación de phishing trimestral", "Reporte ejecutivo mensual", "Recomendaciones por área"],
      highlight: true,
    },
    {
      tier: "Completo",
      title: "DOGUI Awareness Pro",
      text: "Para empresas con mayor riesgo, más empleados o necesidades por área.",
      items: [
        "Todo lo de Plus",
        "Cursos por área",
        "Simulaciones de phishing mensuales",
        "Campañas por WhatsApp/correo",
        "Score individual y por departamento",
        "Dashboard",
        "Plan de mejora",
        "Sesión ejecutiva trimestral",
      ],
    },
  ],
  whatsapp: {
    title: "Awareness conectado al canal que tus empleados ya usan.",
    text: "DOGUI Awareness se integra con WhatsApp para reforzar la capacitación, enviar recordatorios, aplicar mini evaluaciones y permitir que los empleados reporten amenazas desde el mismo canal. Esto lo hace diferente a un curso común.",
  },
  coursesLabel: "Catálogo de cursos DOGUI Awareness",
  coursesTitle: "Cursos prácticos para reducir riesgo humano por rol y por amenaza.",
  courses: [
    { n: "Curso 1", title: "Ciberseguridad básica para empleados", text: "Para todo el personal." },
    { n: "Curso 2", title: "Phishing e ingeniería social", text: "Correos falsos, WhatsApp, llamadas y SMS." },
    { n: "Curso 3", title: "Seguridad en contraseñas y MFA", text: "Buenas prácticas de acceso." },
    { n: "Curso 4", title: "Protección de información confidencial", text: "Datos personales, documentos internos y clientes." },
    { n: "Curso 5", title: "Fraudes digitales para Finanzas y Administración", text: "Transferencias, proveedores y facturas falsas." },
    { n: "Curso 6", title: "Seguridad para Recursos Humanos", text: "CVs maliciosos, datos personales y ofertas falsas." },
    { n: "Curso 7", title: "Ransomware para usuarios no técnicos", text: "Cómo prevenir y qué hacer." },
    { n: "Curso 8", title: "Uso seguro de herramientas de IA", text: "ChatGPT, datos sensibles, prompts y documentos internos." },
    { n: "Curso 9", title: "Seguridad en home office", text: "Wi-Fi, dispositivos personales y acceso remoto." },
    { n: "Curso 10", title: "Respuesta inicial ante incidentes", text: "Qué reportar, a quién avisar y qué no hacer." },
  ],
  mapLabel: "Relación de productos DOGUI",
  map: [
    { title: "DOGUI WhatsApp Security Assistant", text: "Reporte de incidentes por WhatsApp" },
    { title: "DOGUI Link & File Checker", text: "Análisis de links y archivos" },
    { title: "DOGUI Phishing Simulator", text: "Simulaciones de phishing" },
    { title: "DOGUI Awareness", text: "Cursos y concientización" },
    { title: "DOGUI Exposure Scan", text: "Exposición externa" },
    { title: "DOGUI Compliance Lite", text: "Evidencia y controles" },
  ],
};

// ─── Capítulo 02 · Responder ───────────────────────────────────────────────

export const servicios = {
  id: "servicios",
  kicker: "Servicios",
  title: "Ciberseguridad lista para operar, no solo para presentarse.",
  items: [
    {
      icon: "shield-check",
      kicker: "Defensa gestionada",
      title: "SOC / MDR administrado",
      text: "Monitoreo, triage, investigación y respuesta coordinada para endpoints, nube, correo, identidad y red.",
      items: ["Detección y contención de amenazas", "Playbooks de respuesta a incidentes", "Reportes ejecutivos y técnicos"],
    },
    {
      icon: "bug",
      kicker: "Ofensiva",
      title: "Pentesting y Red Team",
      text: "Pruebas controladas para encontrar rutas reales de ataque antes de que alguien más las use.",
      items: ["Web, API, mobile, nube y red interna", "Ingeniería social y phishing controlado", "Explotación, evidencia y remediación"],
    },
    {
      icon: "hard-drive",
      kicker: "Defensiva",
      title: "Blue Team y hardening",
      text: "Mejora de configuraciones, telemetría, baselines y reglas de detección para ambientes críticos.",
      items: ["Windows, Linux, Active Directory y cloud", "Fortalecimiento de identidad y correo", "Validación con ejercicios Purple Team"],
    },
    {
      icon: "siren",
      kicker: "Crisis",
      title: "Respuesta a incidentes y forense",
      text: "Atención estructurada para ransomware, robo de credenciales, fugas de información y compromiso de cuentas.",
      items: ["Contención y erradicación", "Análisis de causa raíz", "Lecciones aprendidas y plan de mejora"],
    },
    {
      icon: "file-lock",
      kicker: "Cumplimiento",
      title: "GRC, PCI DSS e ISO 27001",
      text: "Mapeo de controles, evidencias y planes de acción para mejorar postura sin frenar la operación.",
      items: ["Diagnóstico de madurez", "Políticas y procedimientos", "Acompañamiento a auditorías"],
    },
    {
      icon: "graduation-cap",
      kicker: "Capacitación",
      title: "Awareness y simulaciones",
      text: "Programas para convertir usuarios, soporte y equipos técnicos en una capa real de defensa.",
      items: ["Campañas de phishing", "Entrenamiento por rol", "Métricas de mejora continua"],
    },
    {
      icon: "database-zap",
      kicker: "Software propio",
      title: "SGSI con plataforma CIDSI",
      text: "Implementación de un sistema de gestión de seguridad de la información con software desarrollado por DOGUI.",
      items: ["Marco normativo, evidencias y hallazgos", "Indicadores KPI, KRI y KCI", "Gestión de incidentes, accesos y vulnerabilidades"],
    },
    {
      icon: "building",
      kicker: "Dirección externa",
      title: "DOGUI vCISO",
      text: "Liderazgo estratégico de ciberseguridad para empresas que necesitan dirección, control y cumplimiento sin contratar un CISO interno.",
      items: ["Diagnóstico, roadmap y matriz de riesgos", "Políticas, comité y reportes ejecutivos", "Supervisión de proveedores e incidentes"],
    },
  ],
};

export const metodo = {
  id: "metodo",
  kicker: "Método",
  title: "Un camino claro desde diagnóstico hasta operación continua.",
  steps: [
    { n: "01", title: "Evaluamos", text: "Revisamos superficie de ataque, controles, procesos, herramientas y riesgos prioritarios." },
    { n: "02", title: "Priorizamos", text: "Separamos lo urgente de lo importante con un plan por impacto, costo y esfuerzo." },
    { n: "03", title: "Implementamos", text: "Configuramos controles, automatizaciones, monitoreo y documentación operativa." },
    { n: "04", title: "Operamos", text: "Mantenemos visibilidad, respuesta, reportes y mejora continua con indicadores claros." },
  ],
};

export const vciso = {
  id: "vciso",
  kicker: "DOGUI vCISO",
  title: "Dirección de ciberseguridad externa para empresas.",
  text: [
    "DOGUI vCISO brinda liderazgo estratégico de ciberseguridad para empresas que necesitan proteger su operación, cumplir requisitos de clientes, reducir riesgos y tomar mejores decisiones sin contratar un CISO de tiempo completo.",
    "Actuamos como tu responsable externo de seguridad: evaluamos riesgos, definimos prioridades, creamos políticas, damos seguimiento a controles, coordinamos proveedores y presentamos reportes ejecutivos para dirección.",
  ],
  aside: {
    label: "Liderazgo bajo demanda",
    title: "Tu CISO externo, sin contratar uno de tiempo completo.",
    text: "Ten un responsable de ciberseguridad externo que te diga qué hacer, qué priorizar y cómo reducir riesgos mes a mes.",
  },
  problem: {
    title: "Muchas empresas tienen herramientas, pero no una estrategia clara de seguridad.",
    items: [
      "No tienen CISO interno.",
      "No saben por dónde empezar en ciberseguridad.",
      "Necesitan responder cuestionarios de seguridad de clientes.",
      "Quieren prepararse para ISO 27001.",
      "Han tenido incidentes o fraudes.",
      "Tienen proveedores tecnológicos, pero nadie los supervisa.",
      "Necesitan reportes claros para dirección.",
      "Quieren reducir riesgos sin crear un área completa de seguridad.",
    ],
  },
  deliverablesLabel: "Entregables DOGUI vCISO",
  deliverables: [
    { n: "01", title: "Diagnóstico inicial de madurez", text: "Revisión de activos críticos, accesos, correo, respaldos, nube, proveedores, políticas, incidentes, controles, exposición externa y cumplimiento requerido.", strong: "Entregable: reporte de madurez, mapa de riesgos y plan de 90 días." },
    { n: "02", title: "Roadmap de ciberseguridad", text: "Plan de 30, 60 y 90 días con acciones como MFA, cuentas críticas, SPF/DKIM/DMARC, backups, awareness, matriz de riesgos y respuesta a incidentes.", strong: "Entregable: roadmap mensual priorizado por riesgo, costo e impacto." },
    { n: "03", title: "Gobierno y políticas", text: "Políticas de seguridad, contraseñas, uso aceptable, correo, clasificación, accesos, respaldo, incidentes, altas/bajas/cambios y proveedores.", strong: "Entregable: kit documental DOGUI adaptado al cliente." },
    { n: "04", title: "Gestión de riesgos", text: "Matriz con impacto, probabilidad, nivel de riesgo, responsable, plan de tratamiento, fecha compromiso y seguimiento mensual.", strong: "Entregable: registro de riesgos actualizado mensualmente." },
    { n: "05", title: "Comité mensual de seguridad", text: "Resumen del mes, riesgos abiertos, incidentes, avances del roadmap, decisiones pendientes, prioridades y recomendaciones de inversión.", strong: "Entregable: minuta ejecutiva, acuerdos y responsables." },
    { n: "06", title: "Supervisión de proveedores", text: "Checklist de seguridad, accesos, contratos básicos, respaldos, MFA, parches y seguimiento a pendientes de proveedores críticos.", strong: "Entregable: score de riesgo por proveedor." },
    { n: "07", title: "Auditorías y clientes", text: "Apoyo para cuestionarios de seguridad, solicitudes de evidencia, requerimientos de clientes, auditorías internas y controles ISO 27001.", strong: "Entregable: carpeta de evidencias de seguridad." },
    { n: "08", title: "Respuesta ejecutiva ante incidentes", text: "Definición de severidad, recomendación de contención, coordinación con TI/proveedores, evidencia, comunicación y lecciones aprendidas.", strong: "Entregable: reporte post-incidente y plan de mejora." },
  ],
  plansLabel: "Paquetes DOGUI vCISO",
  plans: [
    {
      tier: "Starter",
      title: "DOGUI vCISO Starter",
      text: "Para PyMEs pequeñas de 10 a 50 empleados.",
      items: ["Diagnóstico inicial", "Roadmap de 90 días", "1 reunión mensual", "Matriz básica de riesgos", "3 políticas base", "Reporte ejecutivo mensual", "Soporte por correo/WhatsApp para dudas críticas"],
    },
    {
      tier: "Crecimiento",
      title: "DOGUI vCISO Plus",
      text: "Para empresas de 50 a 250 empleados que necesitan seguimiento continuo.",
      items: [
        "Todo lo de Starter",
        "Comité mensual de seguridad",
        "Seguimiento quincenal",
        "Matriz de riesgos completa",
        "Kit documental de seguridad",
        "Revisión de proveedores críticos",
        "Apoyo en cuestionarios de clientes",
        "Coordinación de awareness",
        "Revisión mensual de exposición externa",
      ],
      highlight: true,
    },
    {
      tier: "Premium",
      title: "DOGUI vCISO Pro",
      text: "Para empresas reguladas, financieras o con clientes corporativos.",
      items: [
        "Todo lo de Plus",
        "Sesiones ejecutivas con dirección",
        "Roadmap anual",
        "Seguimiento semanal",
        "Preparación ISO 27001",
        "Gestión formal de riesgos",
        "Plan de respuesta a incidentes",
        "Ejercicios de tabletop",
        "KPIs, KRIs y KCIs",
        "Supervisión de SOC/MDR/SIEM/proveedores",
        "Reporte trimestral para consejo o dirección",
      ],
    },
  ],
  ecosystem: {
    title: "El vCISO ordena y activa el ecosistema de servicios DOGUI.",
    text: "DOGUI protege a tu empresa desde tres frentes: empleados, exposición digital y dirección estratégica de ciberseguridad.",
    label: "Servicios activados por vCISO",
    items: [
      { problem: "Empleados caen en phishing", service: "DOGUI Awareness" },
      { problem: "No hay canal de reporte", service: "WhatsApp Security Assistant" },
      { problem: "Links y archivos sospechosos", service: "Link & File Checker" },
      { problem: "Correos expuestos", service: "Credential Exposure Monitor" },
      { problem: "Empresa expuesta en internet", service: "Exposure Scan" },
      { problem: "Riesgo de marca", service: "Brand Protection" },
      { problem: "Falta de controles", service: "Compliance Lite" },
      { problem: "Riesgo de ransomware", service: "Ransomware Readiness" },
      { problem: "Necesita monitoreo avanzado", service: "SOC/MDR" },
    ],
  },
};

export const impacto = {
  id: "impacto",
  title: "Una propuesta clara para dirección, tecnología y cumplimiento.",
  items: [
    { n: "01", title: "Menos superficie expuesta", text: "Priorizamos vulnerabilidades, accesos y configuraciones que realmente elevan el riesgo." },
    { n: "02", title: "Respuesta más rápida", text: "Convertimos alertas en decisiones, tickets, bloqueos y evidencias con playbooks medibles." },
    { n: "03", title: "Mayor confianza comercial", text: "Entregables ejecutivos para demostrar controles ante clientes, aliados, auditorías y comités." },
    { n: "04", title: "Operación financiera cuidada", text: "Enfoque especializado para procesos sensibles, trazabilidad, continuidad y flujos SPEI/SPID." },
  ],
  audienceLabel: "Audiencias objetivo",
  audience: ["Bancos", "Fintech", "Sofomes", "Retail", "Gobierno", "Empresas críticas"],
};

export const spei = {
  id: "spei-spid",
  kicker: "SPEI/SPID",
  title: "SPEI/SPID con controles, trazabilidad y respuesta operativa.",
  text: "Apoyamos a instituciones y proveedores que participan en flujos de pagos a fortalecer seguridad, evidencia, continuidad y monitoreo. El objetivo: operar con menor riesgo y mejor capacidad de reacción.",
  label: "Servicios SPEI y SPID",
  items: [
    { icon: "scan", title: "Diagnóstico de controles", text: "Revisión de arquitectura, accesos, bitácoras, segregación de funciones y procesos sensibles." },
    { icon: "chart", title: "Monitoreo y alertamiento", text: "Casos de uso para SIEM/SOAR, trazabilidad de eventos y alertas operativas priorizadas." },
    { icon: "workflow", title: "Continuidad e incidentes", text: "Playbooks, pruebas de mesa, evidencia y coordinación de respuesta para escenarios de alto impacto." },
  ],
};

// ─── Capítulo 03 · Automatizar ─────────────────────────────────────────────

export const automation = {
  id: "automatizacion",
  kicker: "SOAR",
  title: "Menos trabajo repetitivo. Más respuesta medible.",
  text: "DOGUI crea automatizaciones para enriquecer alertas, bloquear indicadores, generar tickets, notificar responsables y documentar evidencias sin depender de procesos manuales frágiles.",
  steps: [
    { title: "Entrada", text: "Alerta, IOC, ticket o evento crítico" },
    { title: "Playbook", text: "Enriquecimiento, validación y decisión" },
    { title: "Salida", text: "Contención, evidencia y reporte" },
  ],
};

export const productos = {
  id: "productos",
  kicker: "Productos",
  title: "Tecnología para visibilidad, control y velocidad.",
  items: [
    { icon: "radar", tag: "CTI", title: "Inteligencia de amenazas", text: "Vigilancia de actores, dominios, credenciales expuestas, infraestructura sospechosa y campañas activas." },
    { icon: "hard-drive", tag: "EDR", title: "Endpoint y antimalware", text: "Protección, telemetría y contención de equipos con seguimiento operativo y recomendaciones accionables." },
    { icon: "chart", tag: "SIEM", title: "Correlación y monitoreo", text: "Centralización de logs, reglas de detección, dashboards y alertamiento para equipos de seguridad." },
    { icon: "eye", tag: "TEM", title: "DOGUI Threat Exposure Monitoring", text: "Monitoreo de filtraciones, dark web, deep web, Telegram y exposición digital.", ref: "#exposicion" },
    { icon: "file-lock", tag: "GRC", title: "Gestión de riesgos", text: "Inventario de controles, matriz de riesgos, evidencias, hallazgos y seguimiento de remediación." },
    { icon: "workflow", tag: "SOAR", title: "Automatización de seguridad", text: "Playbooks, integraciones y asistentes para bajar tiempos de respuesta y reducir tareas manuales repetitivas." },
  ],
};

export const sgsi = {
  id: "sgsi",
  kicker: "CIDSI · SGSI",
  title: "CIDSI convierte la seguridad de la información en un sistema gestionable.",
  text: "DOGUI integra su propio software CIDSI para ayudar a organizaciones a operar un Sistema de Gestión de Seguridad de la Información con control, evidencias, seguimiento y mejora continua. La plataforma organiza el trabajo del SGSI bajo una visión práctica: planear, ejecutar controles, supervisar, medir y corregir.",
  primary: { label: "Solicitar demo SGSI", href: "#contacto" },
  secondary: { label: "Ver proyecto CIDSI", href: "https://www.dogui.net/proyecto", external: true },
  console: {
    tag: "CIDSI",
    title: "SGSI operativo",
    label: "Módulos CIDSI",
    blocks: [
      { title: "PDCA", text: "Planeación, ejecución, supervisión y mejora continua." },
      { title: "Normativo", text: "Leyes, regulaciones, mejores prácticas y controles aplicables." },
      { title: "Evidencia", text: "Hallazgos, auditorías, recomendaciones y cumplimiento." },
      { title: "Indicadores", text: "KPI, KRI y KCI para seguimiento ejecutivo y operativo." },
    ],
    pdca: ["Planeación", "Ejecución", "Supervisión", "Mejora continua"],
  },
  capabilities: [
    { title: "Gobierno y cumplimiento", text: "Administra marco normativo, modelo de gestión, medidas de seguridad, supervisión, auditoría, hallazgos y evidencias para dar trazabilidad al cumplimiento." },
    { title: "Operación de seguridad", text: "Integra gestión de incidentes, vulnerabilidades, fraude, identidades y accesos para convertir procesos dispersos en flujos controlados." },
    { title: "Datos personales", text: "Facilita el seguimiento de obligaciones relacionadas con protección de datos personales, considerando disposiciones mexicanas y referencias como RGPD." },
    { title: "Administración centralizada", text: "Incluye gestión de usuarios, portales especializados, ayudas del sistema y datos maestros para soportar una operación ordenada." },
  ],
};

export const saas = {
  id: "saas",
  kicker: "Software DOGUI",
  title: "Un stack completo de software, autoalojado y sin depender de terceros.",
  text: "Trece productos propios que cubren seguridad, comunicación, inteligencia artificial y continuidad operativa. Corren en tu infraestructura o en la nuestra, nunca en la nube de un tercero.",
  counters: [
    { value: "13", label: "productos propios" },
    { value: "30+", label: "módulos OSINT" },
  ],
  clusters: [
    {
      title: "Seguridad y monitoreo",
      count: "4 productos",
      label: "Software DOGUI de seguridad y monitoreo",
      items: [
        { icon: "radar", title: "Ciberpatrullaje", text: "Más de 30 módulos de inteligencia OSINT que vigilan GitHub, buckets en la nube, Pastebin y dark web indexada en busca de datos expuestos de tu empresa.", strong: "Detecta secretos filtrados antes de que alguien más los encuentre." },
        { icon: "bug", title: "Pentest autónomo", text: "Un agente de IA planea y ejecuta pruebas de seguridad dentro de contenedores aislados, con más de 20 herramientas profesionales integradas.", strong: "Memoria de hallazgos reutilizable y reportes de vulnerabilidades automáticos." },
        { icon: "bot", title: "Cronos", text: "Asistente de ciberseguridad por voz que ejecuta escaneos de red reales y narra en vivo lo que va encontrando.", strong: "Alcance auditado: bloquea comandos fuera del scope autorizado." },
        { icon: "graduation-cap", title: "Awareness", text: "Plataforma de concientización con 11 cursos, video obligatorio por lección y simulaciones de phishing por plan.", strong: "Reporte ejecutivo mensual y creador de cursos propios sin tocar código." },
      ],
    },
    {
      title: "Comunicación e IA",
      count: "3 productos",
      label: "Software DOGUI de comunicación e inteligencia artificial",
      items: [
        { icon: "message-warning", title: "WhatsApp Suite", text: "Reporta links y archivos sospechosos, simula campañas de phishing y resuelve dudas con Joule, el copiloto de IA, todo dentro de WhatsApp.", strong: "Crea tickets y alertas automáticas sin que el empleado salga del chat." },
        { icon: "workflow", title: "Houston", text: "Agentes de IA con misiones en paralelo que navegan la web, usan Gmail y ejecutan tareas reales, siempre con tu aprobación antes de actuar.", strong: "Aprenden de cada misión y aplican lo aprendido a las futuras." },
        { icon: "database-zap", title: "Dogui IA", text: "Interfaz unificada para chatear con cualquier modelo, local o en la nube, con búsqueda RAG sobre tus propios documentos.", strong: "Multiusuario con roles y permisos, listo para todo un equipo." },
      ],
    },
    {
      title: "Productividad",
      count: "3 productos",
      label: "Software DOGUI de productividad",
      items: [
        { icon: "user-check", title: "CRM", text: "Contactos, empresas, oportunidades y workflows en un solo lugar, con API GraphQL y REST abiertas para integrar con el resto de tu operación.", strong: "Listo para conectarse con EVA, el asistente propio de DOGUI." },
        { icon: "file-lock", title: "PDF Toolkit", text: "Más de 50 herramientas para fusionar, firmar, convertir y hacer OCR a tus documentos, sin que un solo archivo salga de tu infraestructura.", strong: "API REST documentada para automatizar flujos completos." },
        { icon: "scan", title: "Whisper", text: "Dictado de voz a texto y transcripción de reuniones con privacidad total: el audio puede procesarse localmente y nunca salir del equipo.", strong: "Diarización de hablantes y agente de IA controlable por voz." },
      ],
    },
    {
      title: "Datos y continuidad",
      count: "3 productos",
      label: "Software DOGUI de datos y continuidad",
      items: [
        { icon: "hard-drive", title: "Storage", text: "Tu propia nube de fotos y videos, con respaldo automático desde el celular, reconocimiento facial y búsqueda semántica.", strong: "Alternativa privada a Google Fotos, en tu propia infraestructura." },
        { icon: "fingerprint", title: "Vault", text: "Gestor de contraseñas autoalojado, compatible con las apps oficiales de Bitwarden en navegador, escritorio y móvil.", strong: "Sincronización en tiempo real y panel de administración protegido." },
        { icon: "link", title: "Remote", text: "Escritorio remoto propio, cifrado extremo a extremo, para dar soporte o acceder a un equipo sin depender de TeamViewer ni AnyDesk.", strong: "Emparejamiento por código rotativo, como las herramientas comerciales." },
      ],
    },
  ],
};

// ─── Capítulo 04 · Contacto ────────────────────────────────────────────────

export const paquetes = {
  id: "paquetes",
  kicker: "Paquetes",
  title: "Elige el punto de entrada y crecemos desde ahí.",
  items: [
    {
      icon: "scan",
      title: "Diagnóstico",
      text: "Ideal para saber dónde estás parado y qué resolver primero.",
      items: ["Revisión ejecutiva de postura", "Mapa de riesgos prioritarios", "Plan de 30, 60 y 90 días"],
      cta: "Solicitar alcance",
    },
    {
      icon: "shield-check",
      title: "Operación protegida",
      text: "Para empresas que necesitan monitoreo, respuesta y reportes continuos.",
      items: ["SOC/MDR y casos de uso", "Inteligencia y monitoreo dark web", "Automatizaciones de respuesta"],
      cta: "Cotizar servicio",
      highlight: true,
      badge: "Recomendado",
    },
    {
      icon: "eye",
      title: "Exposición digital",
      text: "Para saber si información, marca o empleados aparecen expuestos en internet, dark web o fuentes de filtraciones.",
      items: [
        "Monitoreo de 1 o más dominios",
        "Correos filtrados y menciones de marca",
        "Telegram público, OSINT y dominios parecidos",
        "Documentos expuestos, alertas críticas y reporte mensual",
      ],
      cta: "Activar monitoreo",
    },
    {
      icon: "globe-lock",
      title: "Financiero crítico",
      text: "Para entornos con operaciones sensibles, SPEI/SPID o auditorías exigentes.",
      items: ["Controles y evidencia", "SIEM/SOAR para flujos críticos", "Continuidad e incidentes"],
      cta: "Hablar con DOGUI",
    },
  ],
};

export const contacto = {
  id: "contacto",
  kicker: "Contacto",
  title: "Cuéntanos qué quieres proteger y armamos el primer alcance.",
  text: "Agenda una llamada para revisar riesgos, prioridades y el tipo de servicio que conviene activar primero. DOGUI puede iniciar con diagnóstico, proyecto puntual u operación continua.",
  form: {
    honeypot: "Sitio web",
    name: "Nombre",
    company: "Empresa",
    email: "Correo",
    service: "Servicio de interés",
    servicePlaceholder: "Selecciona una opción",
    groups: [
      { label: "Servicios gestionados", options: ["SOC / MDR", "Pentesting / Red Team", "Respuesta a incidentes", "GRC / Cumplimiento", "DOGUI vCISO", "Automatizaciones"] },
      {
        label: "Productos y plataformas",
        options: ["Threat Exposure Monitoring / Dark Web", "SGSI / CIDSI", "DOGUI Awareness", "PyME / WhatsApp Security Assistant", "Software DOGUI (SaaS)"],
      },
      { label: "Sector financiero", options: ["SPEI / SPID"] },
    ],
    phone: "Teléfono o WhatsApp (opcional)",
    size: "Tamaño de la empresa",
    sizePlaceholder: "Selecciona",
    sizes: ["1 a 10 personas", "11 a 50 personas", "51 a 250 personas", "Más de 250 personas"],
    urgency: "¿Qué tan urgente es?",
    urgencies: ["Quiero información", "En las próximas semanas", "Esta semana", "Tengo un incidente ahora"],
    message: "Mensaje",
    messagePlaceholder: "Cuéntanos tu necesidad, urgencia o contexto",
    consentBefore: "He leído el ",
    consentLink: "Aviso de privacidad",
    consentAfter: " y acepto que DOGUI use mis datos para atender mi solicitud.",
    marketing: "Quiero recibir alertas de amenazas, novedades e invitaciones de DOGUI (opcional).",
    privacyMore: "Aviso de privacidad integral",
    submit: "Enviar solicitud",
    note: "Te contactamos para entender tu caso y preparar tu cotización: cada propuesta se arma según el alcance de tu empresa.",
    sending: "Enviando solicitud...",
    success: "Listo: recibimos tu solicitud y DOGUI te contactará.",
    fallback: "No pudimos enviar el formulario desde el sitio; abrimos tu correo con los datos listos para que nos escribas.",
    booking: "Agendar llamada de 30 min",
  },
};

export const footer = {
  text: "Servicios de ciberseguridad, automatización y consultoría financiera especializada.",
  link: { label: "Agenda tu diagnóstico", href: "#contacto" },
  legal: [
    { label: "Aviso de privacidad", path: "privacidad/" },
    { label: "Términos de uso", path: "terminos/" },
    { label: "Checklist para PyMEs", path: "checklist/" },
  ],
};

// ── Incidente en curso ───────────────────────────────────────────────────
export const incident = {
  title: "¿Te están atacando ahora?",
  text: "Ransomware, una cuenta tomada o un fraude en curso: márcalo como incidente y lo atendemos con prioridad. Mientras tanto, desconecta de la red los equipos afectados sin apagarlos ni borrar nada, para conservar la evidencia.",
  cta: "Reportar incidente",
  call: "Llamar ahora",
  whatsapp: "WhatsApp",
};

export const whatsapp = {
  label: "Escríbenos por WhatsApp",
  message: "Hola DOGUI, quiero información sobre ciberseguridad para mi empresa.",
  incidentMessage: "Hola DOGUI, tengo un incidente de seguridad en curso y necesito ayuda.",
};

// ── Herramientas gratuitas (se calculan en el navegador) ─────────────────
export const recursos = {
  id: "herramientas",
  kicker: "Gratis para tu empresa",
  title: "Revisa hoy cómo está tu empresa.",
  text: "Herramientas rápidas y sin registro. Tus respuestas se calculan en tu navegador: no se envían a DOGUI.",
  tabs: ["Autodiagnóstico", "¿Por dónde empiezo?", "Revisión de correo"],
  quiz: {
    title: "Autodiagnóstico en 2 minutos",
    text: "10 preguntas sobre las prácticas que más evitan incidentes en una PyME.",
    answers: [
      { label: "Sí", points: 10 },
      { label: "En parte", points: 5 },
      { label: "No / no sé", points: 0 },
    ],
    questions: [
      { q: "¿Todas las cuentas de correo y nube piden un segundo factor (MFA) además de la contraseña?", fix: "Activa MFA en correo, nube y banca: es la medida que más ataques de cuentas detiene.", service: "DOGUI Resilience" },
      { q: "¿Tienes respaldos automáticos fuera de tu red y probaste restaurarlos en los últimos 3 meses?", fix: "Ten respaldos fuera de la red y prueba restaurarlos: es lo que te salva de un ransomware.", service: "DOGUI Resilience" },
      { q: "¿Las computadoras y sistemas se actualizan de forma automática?", fix: "Automatiza las actualizaciones de sistema operativo, navegador y programas críticos.", service: "DOGUI Essential" },
      { q: "¿Tu equipo recibió capacitación contra phishing y fraudes en el último año?", fix: "Capacita a tu equipo con simulaciones cortas: el factor humano es la entrada más común.", service: "DOGUI Awareness" },
      { q: "¿Sabes quién tiene acceso a qué sistemas y quitas los accesos cuando alguien se va?", fix: "Haz un inventario de accesos y un proceso de alta y baja de personal.", service: "DOGUI Compliance Lite" },
      { q: "¿Tu dominio tiene SPF y DMARC para evitar que suplanten tus correos?", fix: "Configura SPF, DKIM y DMARC para que nadie envíe correos haciéndose pasar por ti.", service: "DOGUI Exposure" },
      { q: "¿Revisas si correos o contraseñas de tu empresa aparecen en filtraciones?", fix: "Monitorea filtraciones de correos y contraseñas para cambiarlas antes de que las usen.", service: "DOGUI Leak Monitor" },
      { q: "¿Todas las computadoras tienen antivirus o EDR administrado y alguien revisa sus alertas?", fix: "Protege cada equipo con un EDR administrado y que alguien atienda sus alertas.", service: "Operación protegida" },
      { q: "¿Tienes un plan escrito de qué hacer y a quién llamar ante un incidente?", fix: "Escribe un plan de respuesta de una página: quién decide, a quién llamar y qué aislar.", service: "DOGUI Resilience" },
      { q: "¿Alguien vigila la seguridad de forma continua y te reporta riesgos a dirección?", fix: "Asigna un responsable de seguridad, interno o externo, que reporte riesgos a dirección.", service: "DOGUI vCISO Starter" },
    ],
    levels: [
      { min: 70, label: "Buena base", text: "Tienes prácticas sólidas. El siguiente paso es vigilar de forma continua y medir." },
      { min: 40, label: "En desarrollo", text: "Hay avances, pero quedan huecos que un atacante aprovecharía. Prioriza los de abajo." },
      { min: 0, label: "Riesgo alto", text: "Tu empresa está expuesta a los ataques más comunes. Empieza por los tres puntos de abajo." },
    ],
    result: "Tu resultado",
    gaps: "Lo primero que conviene resolver",
    cta: "Quiero mi diagnóstico completo",
    restart: "Volver a empezar",
    note: "Resultado orientativo; no sustituye una evaluación profesional.",
  },
  selector: {
    title: "¿Por dónde empiezo?",
    text: "Tres preguntas y te decimos qué paquete conviene activar primero.",
    steps: [
      { id: "size", q: "¿Cuántas personas trabajan en tu empresa?", options: ["1 a 10", "11 a 50", "51 a 250", "Más de 250"] },
      {
        id: "worry",
        q: "¿Qué te preocupa más hoy?",
        options: [
          "Que mi equipo caiga en fraudes o phishing",
          "Que se filtren correos, contraseñas o datos",
          "Cumplir con clientes, auditorías o ISO 27001",
          "Detectar y responder ataques todo el tiempo",
          "Proteger operaciones financieras (SPEI/SPID)",
        ],
      },
      { id: "team", q: "¿Quién ve la seguridad hoy?", options: ["Nadie, o el dueño", "Alguien de TI, sin ser especialista", "Un equipo de seguridad"] },
    ],
    result: "Te recomendamos empezar con",
    plus: "Y para dar dirección",
    cta: "Cotizar esta recomendación",
    restart: "Cambiar respuestas",
  },
  email: {
    title: "Revisión de correo",
    text: "Escribe el dominio de tu empresa y revisamos si tiene SPF y DMARC, las configuraciones que evitan que alguien envíe correos haciéndose pasar por ti.",
    label: "Dominio de tu empresa",
    placeholder: "tuempresa.com",
    submit: "Revisar",
    checking: "Revisando registros públicos…",
    invalid: "Escribe un dominio válido, por ejemplo tuempresa.com",
    failed: "No pudimos consultar el DNS en este momento. Intenta de nuevo en unos minutos.",
    note: "Solo consulta registros DNS públicos, a través del DNS de Cloudflare. DKIM requiere conocer el selector de tu proveedor: lo revisamos en el diagnóstico completo.",
    cta: "Quiero que lo revisen a fondo",
  },
  report: {
    title: "Así se ve tu reporte mensual",
    text: "Cada mes recibes hallazgos con evidencia, su nivel de riesgo y qué hacer, en lenguaje claro para dirección.",
    badge: "Ejemplo con datos ficticios",
    company: "Empresa Ejemplo, S.A. de C.V.",
    period: "Reporte ejecutivo · Monitoreo de exposición",
    risk: "Riesgo general",
    riskValue: "Medio",
    head: ["Hallazgo", "Riesgo", "Qué hacer"],
    rows: [
      ["Contraseña de un correo corporativo en una filtración pública", "Alto", "Cambiarla, cerrar sesiones abiertas y activar MFA"],
      ["Dominio parecido al de la empresa registrado este mes", "Medio", "Vigilarlo y preparar la solicitud de baja"],
      ["DMARC solo en modo de monitoreo", "Bajo", "Pasar a cuarentena después de revisar remitentes"],
    ],
  },
  checklist: {
    title: "Checklist de ciberseguridad para PyMEs",
    text: "20 puntos para revisar con tu equipo. Imprímelo o guárdalo en PDF.",
    cta: "Abrir checklist",
  },
};

// Checklist imprimible (página /checklist/).
export const checklist = {
  title: "Checklist de ciberseguridad para PyMEs",
  lede: "Prácticas básicas que evitan la mayoría de los incidentes en empresas pequeñas y medianas. Marca lo que ya tienes y empieza por lo que falta.",
  print: "Imprimir o guardar en PDF",
  groups: [
    {
      title: "Cuentas y accesos",
      items: [
        "MFA activo en correo, nube, banca y redes sociales de la empresa.",
        "Contraseñas únicas y un gestor de contraseñas para el equipo.",
        "Cuentas personales para cada empleado (nada de usuarios compartidos).",
        "Accesos que se quitan el mismo día que alguien deja la empresa.",
      ],
    },
    {
      title: "Correo y dominio",
      items: [
        "SPF, DKIM y DMARC configurados en el dominio.",
        "Filtro de correo con protección contra phishing y adjuntos peligrosos.",
        "Un canal claro para reportar correos o mensajes sospechosos.",
      ],
    },
    {
      title: "Equipos y sistemas",
      items: [
        "Actualizaciones automáticas en computadoras, celulares y servidores.",
        "Antivirus o EDR en todos los equipos, con alguien que atienda sus alertas.",
        "Discos cifrados en laptops y bloqueo automático de pantalla.",
        "Inventario de equipos, sistemas y servicios en la nube.",
      ],
    },
    {
      title: "Respaldos y continuidad",
      items: [
        "Respaldos automáticos con una copia fuera de la red.",
        "Prueba de restauración al menos cada tres meses.",
        "Lista de sistemas críticos y cuánto tiempo puede operar la empresa sin ellos.",
      ],
    },
    {
      title: "Personas",
      items: [
        "Capacitación corta contra phishing y fraudes al menos una vez al año.",
        "Regla de doble verificación para pagos, cambios de cuenta bancaria y transferencias.",
        "Política simple de uso de equipos, WhatsApp y herramientas de IA.",
      ],
    },
    {
      title: "Monitoreo y respuesta",
      items: [
        "Revisión periódica de correos y contraseñas de la empresa en filtraciones.",
        "Plan de una página: quién decide, a quién llamar y qué aislar ante un incidente.",
        "Un responsable de seguridad, interno o externo, que reporte riesgos a dirección.",
      ],
    },
  ],
  cta: "¿Quieres que lo revisemos contigo?",
  ctaLink: "Agendar diagnóstico",
};

// ── Preguntas frecuentes y glosario ──────────────────────────────────────
export const faq = {
  id: "preguntas",
  kicker: "Preguntas frecuentes",
  title: "Lo que nos preguntan antes de empezar.",
  items: [
    {
      q: "¿Necesito tener un área de TI o de seguridad?",
      a: "No. Muchos servicios de DOGUI están pensados para PyMEs sin SOC ni mesa de ayuda: monitoreamos, te alertamos y te decimos qué hacer en lenguaje claro. Si tienes equipo de TI, trabajamos con él.",
    },
    {
      q: "Ya tengo antivirus, ¿no es suficiente?",
      a: "El antivirus protege las computadoras, pero no te avisa si tus correos o contraseñas aparecen en una filtración, si alguien registra un dominio parecido al tuyo para engañar a tus clientes o si un empleado cae en un fraude por WhatsApp. Por eso combinamos monitoreo, capacitación y respuesta.",
    },
    {
      q: "¿Cuánto cuesta?",
      a: "Depende del alcance: número de personas, dominios, equipos y servicios que necesitas. Después de una llamada para entender tu caso te enviamos una cotización a la medida.",
    },
    {
      q: "¿Cómo empezamos?",
      a: "Con una llamada para revisar tu situación y tus prioridades. Después recibes una propuesta con alcance y entregables. Puedes iniciar con un diagnóstico, un proyecto puntual u operación continua.",
    },
    {
      q: "¿Qué recibo cada mes?",
      a: "Depende del servicio. En el monitoreo de exposición, por ejemplo, recibes alertas de hallazgos críticos con evidencia, nivel de riesgo por hallazgo, recomendaciones y un reporte ejecutivo mensual.",
    },
    {
      q: "¿Qué hacen si nos atacan?",
      a: "Atendemos el incidente: contención, análisis de causa raíz y un plan de mejora para que no se repita. Si te está pasando ahora, marca «Tengo un incidente ahora» en el formulario.",
    },
    {
      q: "¿Funciona por WhatsApp?",
      a: "Sí. Con DOGUI WhatsApp Security Assistant tus empleados reportan links, correos, archivos y fraudes desde el canal que ya usan, y DOGUI Awareness envía capacitaciones y evaluaciones por ahí.",
    },
    {
      q: "¿Qué hacen con la información de mi empresa?",
      a: "La tratamos con confidencialidad y conforme a nuestro Aviso de privacidad. El alcance y las reglas de confidencialidad de cada servicio quedan por escrito en la propuesta y el contrato.",
    },
    {
      q: "¿Trabajan con empresas reguladas o del sector financiero?",
      a: "Sí: acompañamos cumplimiento de ISO 27001 y PCI DSS, y damos consultoría especializada para participantes de SPEI y SPID.",
    },
  ],
  glossaryTitle: "Glosario rápido",
  glossary: [
    ["SOC", "Centro de operaciones de seguridad: un equipo que vigila alertas todo el día."],
    ["MDR", "Detección y respuesta administradas: el SOC no solo avisa, también contiene el ataque."],
    ["EDR", "Protección avanzada para computadoras que detecta comportamientos sospechosos, no solo virus conocidos."],
    ["TEM", "Monitoreo de exposición: buscar si tus datos, correos o marca aparecen en filtraciones o en la dark web."],
    ["SIEM", "Sistema que junta los registros de tus equipos y servicios para detectar ataques."],
    ["SOAR", "Automatización de respuesta: acciones automáticas ante una alerta (bloquear, abrir ticket, avisar)."],
    ["vCISO", "Director de seguridad externo: dirección y plan de seguridad sin contratar a alguien de tiempo completo."],
    ["SGSI", "Sistema de gestión de seguridad de la información: el método ordenado que pide ISO 27001."],
    ["CIDSI", "Software propio de DOGUI para operar el SGSI: controles, evidencias, riesgos e indicadores."],
    ["MFA", "Segundo factor de autenticación: un código o app además de la contraseña."],
    ["SPF · DKIM · DMARC", "Registros del dominio que evitan que alguien envíe correos haciéndose pasar por tu empresa."],
    ["Phishing", "Engaño por correo, WhatsApp o SMS para robar contraseñas, datos o dinero."],
    ["Ransomware", "Ataque que cifra tu información y pide un rescate para devolverla."],
    ["ISO 27001 · PCI DSS", "Normas de seguridad: la primera para la información en general, la segunda para datos de tarjetas."],
    ["SPEI · SPID", "Sistemas de pagos electrónicos de Banxico en pesos y en dólares."],
  ],
};

// Imágenes fijas de la experiencia 3D, una por capítulo. Se ven en el modo estático
// (reducir movimiento, sin WebGL, sin JS); el texto alternativo describe la escena.
export const renders = {
  hero: "Laptop con un túnel de luz naranja en la pantalla, la entrada al perímetro",
  detectar: "Radar de detección con hallazgos marcados en naranja",
  responder: "Muro de monitores de un SOC con tableros de alertas, entre racks de servidores",
  automatizar: "Flujo de automatización: alerta, engrane del playbook y escudo de contención conectados",
  contacto: "Logo 3D de DOGUI sobre una placa negra, rodeado de evidencias digitales",
};
