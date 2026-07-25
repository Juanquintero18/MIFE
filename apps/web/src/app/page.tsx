import Image from "next/image";

// Lista de capacidades que se muestran como tarjetas en la seccion "Que hacemos".
const capabilities = [
  // Soluciones completas de electronica aplicada para uso real.
  {
    title: "Productos electronicos",
    text: "Diseno y fabricacion de soluciones electronicas enfocadas en uso real y mantenimiento simple.",
  },
  // Sistemas embebidos basados en microcontroladores.
  {
    title: "Sistemas con microcontroladores",
    text: "Arquitecturas embebidas para control, monitoreo y comunicacion en campo.",
  },
  // Integracion de dispositivos conectados y telemetria.
  {
    title: "IoT y telemetria",
    text: "Integracion de sensores, conectividad y paneles de datos para operacion remota.",
  },
  // Automatizacion para vivienda, comercio e industria ligera.
  {
    title: "Automatizacion y domotica",
    text: "Control inteligente para hogares, comercios e industria ligera.",
  },
  // Desarrollo de hardware adaptado a cada necesidad.
  {
    title: "Hardware personalizado",
    text: "Desarrollo de tarjetas y modulos adaptados al proceso de cada cliente.",
  },
  // Iteraciones rapidas para validar ideas y viabilidad.
  {
    title: "Prototipado rapido",
    text: "Iteraciones cortas para validar tecnologia, costos y viabilidad tecnica.",
  },
];

// Direccion principal de la empresa mostrada en contacto y usada para Google Maps.
const mifeAddress =
  "MIFE, Calle 43A #28 14, El Carmen de Viboral, Antioquia";

// Convierte la direccion en un formato seguro para URL.
const mapsQuery = encodeURIComponent(mifeAddress);

// URL para renderizar el mapa embebido dentro del iframe.
const mapsEmbedUrl = `https://www.google.com/maps?q=${mapsQuery}&z=16&output=embed`;

// URL para abrir la ubicacion en Google Maps en una nueva pestana.
const mapsOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

// URL para abrir Google Maps directamente en modo de rutas.
const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

// Componente principal de la pagina de inicio de MIFE.
export default function Home() {
  // Estructura general de la pagina: header, contenido principal y footer.
  return (
    <div className="mife-grid min-h-screen text-[var(--mife-ink)]">
      {/* Encabezado fijo con logo y navegacion interna por anclas. */}
      <header className="sticky top-0 z-50 border-b border-[var(--mife-line)] bg-white/80 backdrop-blur">
        {/* Contenedor centrado para alinear logo y menu. */}
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Marca principal: logo textual + nombre de la empresa. */}
          <a href="#inicio" className="flex items-center gap-3">
            {/* Isotipo circular con iniciales de la marca. */}
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--mife-blue)] to-[var(--mife-electric)] text-sm font-bold text-white shadow-lg">
              MF
            </span>

            {/* Nombre comercial y subtitulo. */}
            <span>
              <span className="block text-lg font-semibold leading-none">MIFE</span>
              <span className="block text-xs text-[var(--mife-muted)]">
                Futurista Electronica
              </span>
            </span>
          </a>

          {/* Menu de navegacion visible solo en pantallas medianas en adelante. */}
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#inicio" className="hover:text-[var(--mife-blue)]">
              Inicio
            </a>
            <a href="#nosotros" className="hover:text-[var(--mife-blue)]">
              Nosotros
            </a>
            <a href="#servicios" className="hover:text-[var(--mife-blue)]">
              Servicios
            </a>
            <a href="#contacto" className="hover:text-[var(--mife-blue)]">
              Contacto
            </a>
          </nav>
        </div>
      </header>

      {/* Contenido principal de la landing page. */}
      <main>
        {/* Seccion hero con mensaje principal y llamadas a la accion. */}
        <section id="inicio" className="px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          {/* Layout de dos columnas: texto a la izquierda, tarjeta visual a la derecha. */}
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
            {/* Columna de contenido principal del hero. */}
            <div className="reveal">
              {/* Etiqueta corta para posicionamiento de marca. */}
              <p className="mb-5 inline-flex rounded-full border border-[var(--mife-line)] bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--mife-blue)]">
                Ingenieria aplicada
              </p>

              {/* Titulo principal del sitio. */}
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Soluciones electronicas con vision futurista y ejecucion real.
              </h1>

              {/* Descripcion de propuesta de valor. */}
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--mife-muted)] sm:text-lg">
                En MIFE combinamos electronica, sistemas embebidos, IoT,
                automatizacion y domotica para convertir necesidades tecnicas en
                productos funcionales.
              </p>

              {/* Botones de navegacion rapida a secciones relevantes. */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#servicios"
                  className="glow-btn rounded-xl px-6 py-3 text-center text-sm font-semibold"
                >
                  Conocer servicios
                </a>
                <a
                  href="#contacto"
                  className="outline-btn rounded-xl px-6 py-3 text-center text-sm font-semibold"
                >
                  Contactar
                </a>
              </div>
            </div>

            {/* Columna visual: tarjeta de laboratorio con puntos clave y logo. */}
            <div className="reveal reveal-delay-2">
              <div className="glass-card relative overflow-hidden rounded-3xl p-6 shadow-2xl">
                {/* Efectos decorativos de fondo para dar profundidad visual. */}
                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/40 blur-3xl" />
                <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-blue-300/30 blur-3xl" />

                {/* Titulo secundario del bloque visual. */}
                <h2 className="text-2xl font-semibold">Laboratorio Futurista</h2>

                {/* Texto que resume el enfoque de escalabilidad. */}
                <p className="mt-3 text-sm leading-7 text-[var(--mife-muted)]">
                  Arquitectura pensada para crecer: desde prototipos hasta
                  despliegues comerciales.
                </p>

                {/* Lista de capacidades destacadas en el hero. */}
                <ul className="mt-5 space-y-2 text-sm text-[var(--mife-ink)]">
                  <li>Control y automatizacion a medida.</li>
                  <li>Integracion de sensores y conectividad.</li>
                  <li>Desarrollo de hardware personalizado.</li>
                </ul>

                {/* Bloque para presentar el logo oficial de la marca. */}
                <div className="mt-6 rounded-2xl border border-[var(--mife-line)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--mife-muted)]">
                    Marca MIFE
                  </p>

                  {/* Contenedor centrado para la imagen del logo. */}
                  <div className="mt-3 flex justify-center">
                    {/* Imagen optimizada por Next.js para mejor rendimiento. */}
                    <Image
                      src="/logo-mife.jpeg"
                      alt="Logo de MIFE"
                      width={220}
                      height={220}
                      className="h-auto w-auto max-h-44 rounded-xl object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Seccion institucional con descripcion de la empresa. */}
        <section id="nosotros" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--mife-line)] bg-white p-8 shadow-sm sm:p-10">
            <h2 className="text-3xl font-semibold">Quienes somos</h2>

            {/* Resumen corporativo y enfoque de trabajo. */}
            <p className="mt-5 max-w-3xl text-[15px] leading-8 text-[var(--mife-muted)]">
              MIFE es una empresa dedicada al desarrollo, fabricacion y
              comercializacion de soluciones electronicas. Nuestra mision es
              crear tecnologia util, robusta y escalable para personas,
              empresas e instituciones que necesitan resultados.
            </p>
          </div>
        </section>

        {/* Seccion de capacidades construida con datos del arreglo capabilities. */}
        <section id="hacemos" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold">Que hacemos</h2>

            {/* Grid responsive para tarjetas de servicios/capacidades. */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Recorre cada capacidad y la pinta como una tarjeta individual. */}
              {capabilities.map((item) => (
                <article
                  key={item.title}
                  className="glass-card rounded-2xl p-5 transition hover:-translate-y-1"
                >
                  {/* Titulo de la capacidad. */}
                  <h3 className="text-lg font-semibold">{item.title}</h3>

                  {/* Descripcion detallada de la capacidad. */}
                  <p className="mt-3 text-sm leading-7 text-[var(--mife-muted)]">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Seccion de servicios con dos bloques: catalogo y requerimientos. */}
        <section id="servicios" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-semibold">Servicios</h2>

            {/* Distribucion en dos columnas para separar los dos flujos de negocio. */}
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Bloque para estructura de catalogo de productos. */}
              <article className="rounded-3xl border border-[var(--mife-line)] bg-white p-7 shadow-sm">
                <h3 className="text-2xl font-semibold">Catalogo</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--mife-muted)]">
                  Estructura lista para publicar productos ya desarrollados.
                </p>

                {/* Lista de campos sugeridos para cada producto del catalogo. */}
                <ul className="mt-5 space-y-2 text-sm">
                  <li>Imagen</li>
                  <li>Nombre</li>
                  <li>Descripcion</li>
                  <li>Tecnologias utilizadas</li>
                  <li>Estado</li>
                  <li>Boton para solicitar informacion</li>
                </ul>
              </article>

              {/* Bloque para recibir solicitudes de proyectos a medida. */}
              <article className="rounded-3xl border border-[var(--mife-line)] bg-white p-7 shadow-sm">
                <h3 className="text-2xl font-semibold">Requerimientos</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--mife-muted)]">
                  Seccion para solicitar desarrollos personalizados a la medida.
                </p>

                {/* Campos recomendados para capturar un requerimiento inicial. */}
                <ul className="mt-5 space-y-2 text-sm">
                  <li>Nombre</li>
                  <li>Empresa (opcional)</li>
                  <li>Correo</li>
                  <li>Telefono</li>
                  <li>Tipo de proyecto</li>
                  <li>Descripcion del requerimiento</li>
                </ul>

                {/* Atajos visuales para que el usuario vaya rapidamente a contacto. */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#contacto"
                    className="glow-btn rounded-xl px-5 py-3 text-center text-sm font-semibold"
                  >
                    Enviar correo
                  </a>
                  <a
                    href="#contacto"
                    className="outline-btn rounded-xl px-5 py-3 text-center text-sm font-semibold"
                  >
                    Abrir WhatsApp
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Seccion de contacto con datos y mapa embebido de Google Maps. */}
        <section id="contacto" className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--mife-line)] bg-white p-8 sm:p-10">
            <h2 className="text-3xl font-semibold">Contacto</h2>

            {/* Tarjetas de informacion de contacto basica. */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <p className="rounded-xl bg-[var(--mife-bg)] p-4 text-sm">
                Direccion: {mifeAddress}
              </p>
              <p className="rounded-xl bg-[var(--mife-bg)] p-4 text-sm">
                Correo: [CORREO@DOMINIO.COM]
              </p>
              <p className="rounded-xl bg-[var(--mife-bg)] p-4 text-sm">
                Telefono: [000-000-0000]
              </p>
              <p className="rounded-xl bg-[var(--mife-bg)] p-4 text-sm">
                WhatsApp: [000-000-0000]
              </p>
              <p className="rounded-xl bg-[var(--mife-bg)] p-4 text-sm sm:col-span-2">
                Horario de atencion: [LUNES A VIERNES, 09:00 - 18:00]
              </p>
            </div>

            {/* Contenedor del mapa con borde, sombra y bloque de acciones. */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--mife-line)] bg-white shadow-sm">
              {/* Mapa embebido en modo lectura para ubicar la direccion exacta. */}
              <iframe
                title="Ubicacion de MIFE en Google Maps"
                src={mapsEmbedUrl}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />

              {/* Botones para abrir Maps o calcular ruta desde Google Maps. */}
              <div className="flex flex-col gap-3 border-t border-[var(--mife-line)] bg-[var(--mife-bg)] p-4 sm:flex-row">
                <a
                  href={mapsOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glow-btn rounded-xl px-5 py-3 text-center text-sm font-semibold"
                >
                  Abrir en Google Maps
                </a>
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="outline-btn rounded-xl px-5 py-3 text-center text-sm font-semibold"
                >
                  Como llegar
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Pie de pagina con texto legal y enlaces informativos. */}
      <footer className="border-t border-[var(--mife-line)] bg-white/90 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          {/* Texto de derechos de autor. */}
          <p className="text-sm text-[var(--mife-muted)]">
            MIFE. Derechos reservados. 2026.
          </p>

          {/* Enlaces legales del sitio. */}
          <div className="flex gap-5 text-sm">
            <a href="#" className="hover:text-[var(--mife-blue)]">
              Politica de privacidad
            </a>
            <a href="#" className="hover:text-[var(--mife-blue)]">
              Politica de cookies
            </a>
            <a href="#" className="hover:text-[var(--mife-blue)]">
              Aviso legal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
