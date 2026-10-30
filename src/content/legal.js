// Aviso de privacidad y términos de uso del sitio.
// Base: Ley Federal de Protección de Datos Personales en Posesión de los Particulares
// (nueva ley, DOF 20-03-2025; última reforma DOF 14-11-2025). Autoridad: Secretaría
// Anticorrupción y Buen Gobierno. El reglamento de la ley de 2025 no se había publicado
// al 30-10-2026. Incluye, en lo aplicable, derechos de RGPD (UE/Reino Unido), leyes de
// privacidad de EE. UU. (CCPA/CPRA) y leyes de Latinoamérica.
//
// Datos del responsable: completar `owner` (razón social) y `address` (domicilio) para
// cumplir la fracción I del artículo 15. Mientras estén vacíos se muestra solo "DOGUI".

export const legal = {
  updated: "30 de octubre de 2026",
  updatedISO: "2026-10-30",
  owner: "DOGUI", // Razón social, p. ej. "Nombre Comercial, S.A. de C.V."
  address: "", // Domicilio completo: calle, número, colonia, C.P., municipio/alcaldía, estado
  privacyEmail: "ventas@dogui.mx", // Contacto del área de privacidad (puede ser privacidad@…)
};

const who = (L) => `${L.owner}${L.address ? `, con domicilio en ${L.address}` : ""}`;

/** Aviso simplificado (art. 16, fracción II): se muestra junto al formulario. */
export const privacyShort = (L) =>
  `${who(L)}, es responsable de los datos que nos das en este formulario (nombre, empresa, correo, teléfono opcional, tamaño de empresa, servicio, urgencia y mensaje). Los usamos para atender tu solicitud y preparar tu diagnóstico o cotización; con tu permiso, también para enviarte novedades. Puedes limitar su uso o negarte a las finalidades opcionales escribiendo a ${L.privacyEmail}.`;

/**
 * Aviso de privacidad integral. Cada sección: { id, h, body: [bloques] } donde un bloque es
 * un párrafo (string) o { list: [...] } / { h: "subtítulo" }.
 */
export const privacy = (L, { phone } = {}) => ({
  title: "Aviso de privacidad integral",
  lede: `Cómo ${L.owner} trata los datos personales que recaba a través de este sitio, por correo, WhatsApp, llamadas y en la relación comercial con sus clientes.`,
  sections: [
    {
      id: "responsable",
      h: "1. Responsable",
      body: [
        `${who(L)} («DOGUI» o «nosotros»), es responsable del tratamiento de tus datos personales en términos de la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP), publicada en el Diario Oficial de la Federación el 20 de marzo de 2025 (última reforma del 14 de noviembre de 2025).`,
        `El área de privacidad de DOGUI atiende todo lo relacionado con tus datos en ${L.privacyEmail}${phone ? ` y en el ${phone}` : ""}.`,
      ],
    },
    {
      id: "datos",
      h: "2. Datos personales que tratamos",
      body: [
        { h: "Los que tú nos das" },
        {
          list: [
            "Identificación y contacto: nombre, empresa, cargo (si lo indicas), correo electrónico y, de forma opcional, teléfono o WhatsApp.",
            "Datos de tu solicitud: tamaño de la empresa, servicio de interés, nivel de urgencia y el mensaje que escribas.",
            "Si contratas: datos de contacto de las personas responsables del proyecto y datos de facturación (razón social, RFC, domicilio fiscal, régimen fiscal y correo para facturas).",
          ],
        },
        { h: "Los que se generan al usar el sitio" },
        {
          list: [
            "Datos técnicos de navegación (dirección IP, navegador, fecha y hora, páginas solicitadas) que el proveedor de hospedaje registra por seguridad y operación.",
            "En el dominio propio de DOGUI, una medición básica con un identificador seudónimo guardado en tu navegador (ver sección 9). No usamos cookies de publicidad ni de terceros.",
          ],
        },
        { h: "Herramientas gratuitas" },
        "El autodiagnóstico y el selector de paquete se calculan en tu navegador: tus respuestas no se envían a DOGUI, salvo que decidas copiar el resultado al formulario de contacto. La revisión de correo consulta registros DNS públicos del dominio que escribas (no de personas) a través de un servicio DNS público.",
        { h: "Datos sensibles y financieros" },
        "No solicitamos datos personales sensibles (por ejemplo, de salud, origen, creencias u orientación sexual). Te pedimos no incluirlos en tus mensajes. El sitio no recaba datos financieros o patrimoniales; si para contratar un servicio llegaran a requerirse, te pediremos tu consentimiento expreso, como exige el artículo 7 de la LFPDPPP.",
        "Este sitio está dirigido a empresas y profesionales; no recabamos de forma intencional datos de menores de 18 años.",
      ],
    },
    {
      id: "finalidades",
      h: "3. Para qué usamos tus datos",
      body: [
        { h: "Finalidades necesarias (primarias)" },
        {
          list: [
            "Atender tu solicitud y ponernos en contacto contigo.",
            "Entender tu necesidad y preparar un diagnóstico, una propuesta o una cotización.",
            "Agendar y realizar llamadas o reuniones.",
            "Si contratas: celebrar, ejecutar y administrar la relación contractual, darte soporte, enviarte reportes y facturar.",
            "Atender tus solicitudes de derechos y cumplir obligaciones legales.",
            "Proteger el sitio y prevenir fraude, abuso o envíos automatizados (spam).",
          ],
        },
        { h: "Finalidades opcionales (secundarias)" },
        "Solo con tu permiso, que puedes dar marcando la casilla del formulario:",
        {
          list: [
            "Enviarte boletines, alertas de amenazas, novedades e invitaciones a eventos o webinars.",
            "Invitarte a encuestas de satisfacción o estudios de mercado.",
            "Medir de forma estadística el uso del sitio para mejorarlo.",
          ],
        },
        `Si no quieres que usemos tus datos para estas finalidades, no marques la casilla o escríbenos en cualquier momento a ${L.privacyEmail} con el asunto «Finalidades secundarias». Cada correo informativo incluye una forma de darte de baja. Negarte no afecta los servicios que nos solicites o contrates.`,
        { h: "Fundamento (para quienes aplique el RGPD u otras leyes internacionales)" },
        "Tratamos tus datos para aplicar medidas precontractuales o ejecutar un contrato (finalidades necesarias), para cumplir obligaciones legales, por interés legítimo en la seguridad del sitio y, para las finalidades opcionales, con tu consentimiento, que puedes retirar cuando quieras.",
      ],
    },
    {
      id: "limitar",
      h: "4. Cómo limitar el uso o la divulgación de tus datos",
      body: [
        {
          list: [
            `Escribe a ${L.privacyEmail} pidiendo que limitemos el uso de tus datos o que te incluyamos en nuestra lista de exclusión para no recibir comunicaciones.`,
            "Desactiva la medición del sitio desde la sección 9 de este aviso. También respetamos las señales Global Privacy Control y «Do Not Track» de tu navegador.",
            "Si eres consumidor en México, puedes inscribirte en el Registro Público para Evitar Publicidad (REPEP) de la PROFECO.",
          ],
        },
      ],
    },
    {
      id: "arco",
      h: "5. Derechos ARCO y revocación del consentimiento",
      body: [
        "Tienes derecho a conocer qué datos tuyos tenemos y cómo los usamos (Acceso), a pedir que los corrijamos (Rectificación), a que los eliminemos (Cancelación) y a oponerte a su uso para fines específicos (Oposición). También puedes revocar en cualquier momento el consentimiento que nos diste, sin efectos retroactivos.",
        { h: "Cómo presentar tu solicitud" },
        `Envía un correo a ${L.privacyEmail} con el asunto «Derechos ARCO» que incluya, conforme al artículo 28 de la LFPDPPP:`,
        {
          list: [
            "Tu nombre y un domicilio o correo para recibir la respuesta.",
            "Una copia de tu identificación oficial o, si actúa un representante, el documento que acredite su representación y su identidad.",
            "La descripción clara de los datos sobre los que quieres ejercer tu derecho (salvo en el caso de acceso) y del derecho que ejerces.",
            "Cualquier otro elemento que ayude a localizar tus datos. Si pides una rectificación, indica qué corregir y adjunta el documento que lo respalde.",
          ],
        },
        { h: "Plazos y costo" },
        "Te comunicaremos nuestra respuesta en un plazo máximo de 20 días contados desde que recibamos tu solicitud; si resulta procedente, la haremos efectiva dentro de los 15 días siguientes. Estos plazos pueden ampliarse una sola vez por un periodo igual cuando el caso lo justifique (artículo 31). Ejercer tus derechos es gratuito; solo podrían cobrarse costos de reproducción o envío (artículo 34).",
        "En algunos casos no podremos cancelar tus datos o dejar de tratarlos, por ejemplo cuando una ley nos obligue a conservarlos o sean necesarios para cumplir un contrato vigente contigo. Si es así, te lo explicaremos en la respuesta.",
      ],
    },
    {
      id: "transferencias",
      h: "6. Con quién compartimos tus datos",
      body: [
        "No vendemos ni rentamos tus datos personales, ni los compartimos con terceros para fines de publicidad.",
        "Para operar nos apoyamos en proveedores (encargados) que tratan los datos por cuenta nuestra, solo para darnos su servicio y con obligaciones de confidencialidad y seguridad:",
        {
          list: [
            "Hospedaje del sitio: GitHub Pages (GitHub, Inc., Estados Unidos).",
            "Correo electrónico y herramientas de trabajo de DOGUI.",
            "Mensajería y agenda en línea, cuando decidas usarlas para contactarnos (por ejemplo, WhatsApp de Meta o un servicio de citas).",
            "Servicio DNS público usado por la revisión de correo (Cloudflare, Inc.).",
          ],
        },
        "Solo transferiremos tus datos a terceros sin tu consentimiento en los casos que permite el artículo 36 de la LFPDPPP, como cuando lo exija una ley o una autoridad competente, cuando sea necesario para un contrato celebrado en tu interés o para reconocer, ejercer o defender un derecho en un proceso judicial. En toda transferencia comunicaremos este aviso al destinatario (artículo 35).",
        "Algunos proveedores están fuera de México. Cuando tus datos salen de tu país, trabajamos con proveedores que ofrecen garantías contractuales de protección, como cláusulas contractuales tipo cuando la ley aplicable lo exige.",
      ],
    },
    {
      id: "conservacion",
      h: "7. Cuánto tiempo conservamos tus datos",
      body: [
        "Si no llegas a contratar, conservamos los datos de tu solicitud hasta 24 meses desde el último contacto, para dar seguimiento a tu propuesta. Si contratas, durante la relación comercial y después por los plazos que exijan las leyes fiscales y mercantiles. Al terminar, los bloqueamos y eliminamos de forma segura.",
      ],
    },
    {
      id: "seguridad",
      h: "8. Seguridad de tus datos",
      body: [
        "Aplicamos medidas de seguridad administrativas, técnicas y físicas para proteger tus datos contra daño, pérdida, alteración, destrucción o uso, acceso o tratamiento no autorizado (artículo 18), entre ellas cifrado en tránsito (HTTPS), acceso solo para el personal que lo necesita y autenticación de múltiples factores en nuestras cuentas. Quienes intervienen en el tratamiento guardan confidencialidad, incluso después de terminar su relación con DOGUI (artículo 20).",
        "Si ocurriera una vulneración de seguridad que afecte de forma significativa tus derechos patrimoniales o morales, te lo informaremos de inmediato para que puedas tomar medidas (artículo 19).",
      ],
    },
    {
      id: "cookies",
      h: "9. Cookies y tecnologías de rastreo",
      body: [
        "Este sitio no usa cookies de publicidad ni herramientas de rastreo de terceros (como píxeles de redes sociales o Google Analytics), y sus tipografías se sirven desde el propio sitio.",
        "Usamos el almacenamiento local de tu navegador solo para: (a) recordar si desactivaste la medición y (b) en el dominio propio de DOGUI, guardar un identificador seudónimo para medir visitas, clics en botones de contacto y errores técnicos. No lo usamos para identificarte ni lo compartimos.",
        { measure: true },
      ],
    },
    {
      id: "internacional",
      h: "10. Si vives fuera de México",
      body: [
        "Te reconocemos los derechos que te otorgue la ley de tu país y los atendemos por el mismo medio (sección 5):",
        {
          list: [
            "Unión Europea, Espacio Económico Europeo y Reino Unido (RGPD): acceso, rectificación, supresión, limitación, portabilidad, oposición y retiro del consentimiento, y presentar una reclamación ante la autoridad de control de tu país.",
            "California y otros estados de EE. UU. con leyes de privacidad (como la CCPA/CPRA): saber qué datos tratamos, acceder, corregir, eliminar y portar tus datos, y no ser discriminado por ejercer tus derechos. No vendemos ni compartimos datos personales para publicidad conductual y respetamos la señal Global Privacy Control. Puedes actuar mediante un agente autorizado.",
            "Brasil (LGPD), Colombia, Argentina, Chile, Perú y otros países: los derechos que prevea tu legislación local.",
          ],
        },
        "No tomamos decisiones con efectos jurídicos sobre ti basadas únicamente en tratamientos automatizados. Los resultados de las herramientas gratuitas son solo orientativos.",
      ],
    },
    {
      id: "autoridad",
      h: "11. Autoridad",
      body: [
        "Si consideras que tu derecho a la protección de datos fue vulnerado, puedes iniciar un procedimiento de protección de derechos ante la Secretaría Anticorrupción y Buen Gobierno, autoridad en la materia conforme a la LFPDPPP. La solicitud se presenta dentro de los 15 días siguientes a la fecha en que te comuniquemos nuestra respuesta o, si no la recibes, a partir de que venza el plazo para darla (artículo 40).",
      ],
    },
    {
      id: "cambios",
      h: "12. Cambios a este aviso",
      body: [
        "Publicaremos cualquier cambio en esta página, con la fecha de la última actualización. Si el cambio es sustancial, también lo informaremos por correo a quienes tengamos registrados. Si quisiéramos usar tus datos para una finalidad nueva, te pediremos de nuevo tu consentimiento (artículo 11).",
      ],
    },
  ],
});

/** Términos de uso del sitio. */
export const terms = (L) => ({
  title: "Términos de uso del sitio",
  lede: "Condiciones para navegar este sitio y usar sus herramientas gratuitas.",
  sections: [
    {
      id: "aceptacion",
      h: "1. Aceptación",
      body: [`Al usar este sitio aceptas estos términos y el Aviso de privacidad. El sitio es operado por ${who(L)}.`],
    },
    {
      id: "contenido",
      h: "2. Información, no oferta vinculante",
      body: [
        "El contenido del sitio describe los servicios y productos de DOGUI con fines informativos. Los precios se determinan por cotización según el alcance de cada empresa; ninguna sección del sitio constituye una oferta vinculante. Cada servicio se formaliza con una propuesta y un contrato que definen alcance, entregables y vigencia.",
      ],
    },
    {
      id: "herramientas",
      h: "3. Herramientas gratuitas",
      body: [
        "El autodiagnóstico, el selector de paquete, la revisión de correo y el checklist son orientativos: no sustituyen una evaluación profesional ni garantizan la seguridad de tu empresa.",
        "Usa la revisión de correo solo con dominios de tu empresa o que tengas autorización para revisar. Solo consulta registros DNS públicos; no realiza pruebas intrusivas.",
      ],
    },
    {
      id: "uso",
      h: "4. Uso permitido",
      body: [
        "No está permitido intentar vulnerar, escanear de forma agresiva o sobrecargar el sitio, ni usar los formularios para enviar spam, código malicioso o contenido ilícito.",
        `Si encuentras una vulnerabilidad, repórtala de forma responsable a ${L.privacyEmail}; te agradeceremos que no la divulgues hasta que la hayamos corregido.`,
      ],
    },
    {
      id: "propiedad",
      h: "5. Propiedad intelectual",
      body: [
        "La marca y el logotipo DOGUI, los textos, el diseño, las ilustraciones y los modelos 3D de este sitio pertenecen a DOGUI o se usan con autorización. No pueden reproducirse ni usarse con fines comerciales sin permiso por escrito. Las marcas de terceros mencionadas pertenecen a sus titulares.",
      ],
    },
    {
      id: "terceros",
      h: "6. Enlaces y servicios de terceros",
      body: [
        "Algunos enlaces llevan a sitios o servicios de terceros (por ejemplo, mensajería o agenda en línea), que se rigen por sus propios términos y avisos de privacidad.",
      ],
    },
    {
      id: "responsabilidad",
      h: "7. Responsabilidad",
      body: [
        "Procuramos que la información del sitio sea exacta y esté disponible, pero puede contener errores o cambiar sin aviso. En la medida que lo permita la ley, DOGUI no responde por daños derivados del uso del sitio o de sus herramientas gratuitas. Esto no limita los derechos que te otorguen las leyes de protección al consumidor ni las obligaciones que DOGUI asuma en un contrato.",
      ],
    },
    {
      id: "ley",
      h: "8. Legislación aplicable",
      body: [
        "Estos términos se rigen por las leyes federales de los Estados Unidos Mexicanos. Cualquier controversia se resolverá ante los tribunales competentes del domicilio de DOGUI en México, salvo que una ley aplicable a ti disponga otra cosa.",
      ],
    },
    {
      id: "cambios",
      h: "9. Cambios",
      body: ["Podemos actualizar estos términos; la versión vigente es la publicada en esta página, con su fecha de actualización."],
    },
  ],
});
