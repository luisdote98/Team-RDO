import { dueDateFor } from "@/lib/date";
import type { TaskLike } from "@/lib/tasks";
import type { TaskPriority, TaskStatus } from "@/types/domain";

/**
 * DATOS DE DEMOSTRACIÓN — temporal.
 *
 * `demoMembers` y `demoCategories` son catálogos GLOBALES (compartidos por
 * todos los eventos). `getSeedEvents()` da el estado inicial de la lista de
 * eventos con la que arranca la app — a partir de ahí, cualquier evento
 * nuevo se crea desde cero vía el store (features/events/store/events-store).
 * En la fase 7 esto se sustituye por el seed SQL; la forma de los datos es
 * la misma a propósito.
 */

export type DemoMember = {
  id: string;
  name: string;
  role: string;
  /** Tinta: texto y bordes. */
  color: string;
  /** Fondo emparejado con la tinta, para chips y avatares. */
  bgColor: string;
};

export type DemoCategory = {
  id: string;
  name: string;
  color: string;
};

export const demoMembers: DemoMember[] = [
  {
    id: "luis",
    name: "Luis",
    role: "Sector técnico: sonido, equipo DJ, montaje, cartelería y archivo de contenido",
    color: "#3d5566",
    bgColor: "#e6ebee",
  },
  {
    id: "oliver",
    name: "Oliver",
    role: "Supervisión y control: coordinación de seguridad, DJs y camareros; pagos al staff y control del dinero de barra",
    color: "#8a6520",
    bgColor: "#f7ecd6",
  },
  {
    id: "guille",
    name: "Guille",
    role: "Sector comercial y RRPP: contenido, redes, ticketing y coordinación de accesos",
    color: "#4d6b3f",
    bgColor: "#e9efe6",
  },
];

export const demoCategories: DemoCategory[] = [
  { id: "booking", name: "Booking y line-up", color: "#b8863b" },
  { id: "entradas", name: "Entradas y tramos", color: "#6f8a5c" },
  { id: "seguridad", name: "Seguridad", color: "#8c6f5c" },
  { id: "villa", name: "Villa", color: "#9b7f5e" },
  { id: "sonido", name: "Equipo de sonido", color: "#5f7a8c" },
  { id: "dj", name: "Equipo DJ", color: "#5c6a94" },
  { id: "barra", name: "Barra y personal", color: "#a2553f" },
  { id: "invitados", name: "Invitados", color: "#9c6a60" },
  { id: "contenido", name: "Contenido y grabación", color: "#7d7050" },
  { id: "decoracion", name: "Decoración y temática", color: "#b07f5c" },
  { id: "carteleria", name: "Cartelería y redes", color: "#84708a" },
];

export type EventRule = {
  id: string;
  categoryId: string;
  title: string;
  detail: string;
  /** true si el dato concreto todavía está por decidir. */
  pending?: boolean;
};

export type EventChain = {
  id: string;
  note: string;
  taskIds: string[];
};

export type Expense = {
  id: string;
  personId: string;
  amount: number;
  concept: string;
  categoryId?: string;
  date: Date;
};

/** Un evento tal y como vive en el store: metadatos + su propia lista de tareas. */
export type EventRecord = {
  id: string;
  name: string;
  date: Date;
  venue: string;
  city: string;
  capacity: number;
  format: string;
  tasks: TaskLike[];
  rules: EventRule[];
  chains: EventChain[];
  expenses: Expense[];
  /** true cuando el evento se archiva: sigue accesible, pero fuera de las vistas activas. */
  archived?: boolean;
};

/**
 * Normas operativas de ESTE evento — distintas de la normativa general de la
 * promotora (esa vive en /team). Aquí van los detalles de cómo se ejecuta
 * la fiesta: turnos, aforos, accesos.
 */
const RODEO_SESSIONS_RULES: EventRule[] = [
  {
    id: "turno-portero-1",
    categoryId: "seguridad",
    title: "Turno del portero 1",
    detail:
      "Entra a las 23:30, media hora antes de medianoche, para controlar que nadie accede con bebida propia. Sale a las 11:30.",
  },
  {
    id: "turno-portero-2",
    categoryId: "seguridad",
    title: "Turno del portero 2",
    detail:
      "Entra a las 4:30 y cierra el recinto junto al equipo a las 15:30. Todo el mundo fuera como muy tarde a las 16:00 para empezar la limpieza.",
  },
  {
    id: "barra-despejada",
    categoryId: "barra",
    title: "La barra siempre despejada",
    detail:
      "No se permite que la barra se convierta en zona de estancia. Objetivo: maximizar ingresos y mantener el orden, sin presiones ni pérdidas de dinero por causas externas.",
  },
  {
    id: "quien-toca-dinero",
    categoryId: "barra",
    title: "Quién toca el dinero",
    detail:
      "Solo Sandro, como jefe de barra, maneja el efectivo antes de entregárselo a Oliver.",
  },
  {
    id: "tope-invitados",
    categoryId: "invitados",
    title: "Tope de invitados",
    detail:
      "Máximo ~30 invitados de 200 asistentes para que la fiesta salga rentable. Se ajusta según cómo vaya la venta de entradas.",
  },
  {
    id: "invitados-por-dj",
    categoryId: "invitados",
    title: "Invitados por DJ",
    detail: "Cada DJ tiene derecho a 2 invitados.",
  },
  {
    id: "acceso-interior-villa",
    categoryId: "villa",
    title: "Acceso al interior de la villa",
    detail:
      "Solo el DJ tiene acceso libre al interior. El resto de VIPs necesita pulsera para entrar.",
  },
  {
    id: "requisitos-fianza",
    categoryId: "villa",
    title: "Requisitos para recuperar la fianza",
    detail: "Por definir con el propietario de la villa.",
    pending: true,
  },
  {
    id: "como-funcionan-tramos",
    categoryId: "entradas",
    title: "Cómo funcionan los tramos",
    detail:
      "3 tramos de 7 días con cupo propio. Si un tramo se agota antes de tiempo, se pasa automáticamente al precio del siguiente.",
  },
];

/** Cadenas de dependencias destacadas, para explicar el efecto dominó. */
const RODEO_SESSIONS_CHAINS: EventChain[] = [
  {
    id: "lineup-cartel",
    note: "El line-up sigue sin cerrarse: arrastra el diseño del cartel y la campaña en redes, ambos ya en retraso.",
    taskIds: [
      "candidatos-lineup",
      "cerrar-lineup",
      "disenar-cartel",
      "publicar-cartel",
    ],
  },
  {
    id: "tramos-venta",
    note: "Campaña de 21 días en tres tramos de 7: el Tramo 2 lleva un día de retraso y arrastra los dos siguientes.",
    taskIds: [
      "definir-tramos",
      "tramo-1",
      "tramo-2",
      "tramo-3",
      "cerrar-campana",
    ],
  },
];

type RawTask = Omit<TaskLike, "dueDate" | "status"> & {
  /** Estado declarado. `blocked` nunca se escribe: lo calcula applyBlocking(). */
  status: Exclude<TaskStatus, "blocked">;
};

const raw = (
  offsetDays: number,
  id: string,
  title: string,
  categoryId: string,
  assigneeId: string,
  priority: TaskPriority,
  status: Exclude<TaskStatus, "blocked">,
  extra: Partial<Pick<RawTask, "isMilestone" | "blockedBy" | "notes">> = {},
): RawTask => ({
  id,
  title,
  categoryId,
  assigneeId,
  priority,
  status,
  offsetDays,
  ...extra,
});

const RODEO_SESSIONS_TASKS: RawTask[] = [
  // Booking y line-up
  raw(
    -40,
    "candidatos-lineup",
    "Elegir candidatos de line-up (Abad Manners, Sokar, Fhiga, Raúl Megías, Neige, Bort, Luis Dote, Politematik, Garza, Glasis)",
    "booking",
    "oliver",
    "critical",
    "completed",
    { isMilestone: true },
  ),
  raw(
    -30,
    "cerrar-lineup",
    "Cerrar line-up definitivo por unanimidad",
    "booking",
    "oliver",
    "critical",
    "in_progress",
    { blockedBy: ["candidatos-lineup"] },
  ),

  // Villa
  raw(
    -40,
    "confirmar-villa",
    "Confirmar fechas y firmar reserva de la villa (900€ + 200€ fianza)",
    "villa",
    "oliver",
    "critical",
    "completed",
    { isMilestone: true },
  ),
  raw(
    -37,
    "resolver-dudas-contrato",
    "Resolver dudas del contrato: qué ofrece, qué dificulta y requisitos para recuperar la fianza",
    "villa",
    "oliver",
    "high",
    "completed",
  ),
  raw(
    -34,
    "evaluar-electrico",
    "Mejorar el suministro eléctrico para que no salte la luz",
    "villa",
    "luis",
    "high",
    "in_progress",
  ),
  raw(
    -28,
    "taxis-piratas",
    "Valorar avisar a taxis piratas de la zona para facilitar el acceso",
    "villa",
    "guille",
    "normal",
    "pending",
  ),
  raw(
    -25,
    "piscina",
    "Confirmar disponibilidad de la piscina",
    "villa",
    "oliver",
    "normal",
    "completed",
  ),
  raw(
    -10,
    "pulseras-vip",
    "Definir pulseras VIP con acceso al interior de la villa",
    "villa",
    "oliver",
    "high",
    "pending",
    {
      blockedBy: ["lista-invitados"],
      notes:
        "Solo el DJ tiene acceso libre al interior; el resto de VIPs necesita pulsera.",
    },
  ),
  raw(
    1,
    "limpieza-devolucion",
    "Limpieza y devolución del equipo alquilado",
    "villa",
    "luis",
    "high",
    "pending",
  ),

  // Seguridad
  raw(
    -25,
    "porteros",
    "Contratar 2 porteros (360€: 2 × 12h × 15€/h)",
    "seguridad",
    "oliver",
    "critical",
    "completed",
  ),
  raw(
    -20,
    "turnos-seguridad",
    "Fijar turnos: portero 1 (23:30–11:30) y portero 2 (4:30–15:30), cierre y desalojo total antes de las 16:00",
    "seguridad",
    "oliver",
    "critical",
    "completed",
  ),
  raw(
    -8,
    "coordinar-portero-barra",
    "Coordinar al portero 2 en el control de acceso a la barra",
    "seguridad",
    "oliver",
    "high",
    "pending",
  ),
  raw(
    -3,
    "briefing-seguridad",
    "Briefing de seguridad: la barra siempre despejada, sin excepciones",
    "seguridad",
    "oliver",
    "high",
    "pending",
  ),
  raw(
    0,
    "apertura",
    "Apertura de la villa y control de accesos",
    "seguridad",
    "oliver",
    "critical",
    "pending",
    { isMilestone: true },
  ),
  raw(
    0,
    "cierre-desalojo",
    "Cierre a las 15:30 y desalojo total antes de las 16:00",
    "seguridad",
    "oliver",
    "critical",
    "pending",
  ),

  // Equipo de sonido
  raw(
    -32,
    "alquiler-sonido",
    "Alquilar equipo de sonido a Iván",
    "sonido",
    "luis",
    "critical",
    "completed",
  ),
  raw(
    -30,
    "preguntar-electrico-ivan",
    "Preguntar a Iván cómo aumentar la carga eléctrica límite de la villa",
    "sonido",
    "luis",
    "high",
    "pending",
    {
      blockedBy: ["evaluar-electrico"],
    },
  ),
  raw(
    -15,
    "monitores",
    "Pedir monitores para la escucha en la cabina del DJ",
    "sonido",
    "luis",
    "normal",
    "pending",
  ),
  raw(
    -15,
    "expandir-sonido",
    "Ver cómo expandir el sonido por si viene más gente que en la última fiesta",
    "sonido",
    "luis",
    "normal",
    "pending",
  ),

  // Equipo DJ
  raw(
    -32,
    "equipo-dj",
    "Cerrar alquiler de equipo DJ (¿DELARAVE?)",
    "dj",
    "luis",
    "critical",
    "in_progress",
    {
      notes:
        "Pedir mejora de precio o algún aparato extra tipo RMX. Comprobar que el equipo funciona bien: la última vez dio fallos.",
    },
  ),

  // Barra y personal
  raw(
    -22,
    "estimacion-gasto",
    "Definir estimación de gasto en barra para 200 personas",
    "barra",
    "oliver",
    "high",
    "completed",
  ),
  raw(
    -20,
    "compra-necesaria",
    "Calcular la compra necesaria para completar la estimación de barra",
    "barra",
    "oliver",
    "high",
    "in_progress",
    {
      blockedBy: ["estimacion-gasto"],
    },
  ),
  raw(
    -15,
    "sandro-jefe-barra",
    "Confirmar a Sandro como jefe de barra (único que maneja el dinero antes de dárselo a Oliver)",
    "barra",
    "oliver",
    "high",
    "completed",
  ),
  raw(
    -1,
    "caja-inicial",
    "Preparar caja inicial y última coordinación de staff",
    "barra",
    "oliver",
    "high",
    "pending",
  ),
  raw(
    2,
    "pago-staff",
    "Pago a staff, DJs y proveedores; traspaso del dinero de barra de Sandro a Oliver",
    "barra",
    "oliver",
    "critical",
    "pending",
    {
      notes:
        "La barra debe estar siempre despejada: no se permite que se convierta en zona de estancia.",
    },
  ),

  // Invitados
  raw(
    -20,
    "lista-invitados",
    "Cerrar lista de invitados (máx. ~30 de 200, 2 por DJ, ajustable según venta)",
    "invitados",
    "guille",
    "normal",
    "pending",
  ),

  // Entradas y tramos — campaña de 21 días en 3 tramos de 7
  raw(
    -29,
    "definir-tramos",
    "Definir presupuesto y precios por tramo (Early Bird 12€/40 · General 15€/100 · Last Release 18€/60 · Taquilla 20€)",
    "entradas",
    "guille",
    "critical",
    "completed",
    { isMilestone: true },
  ),
  raw(
    -26,
    "tramo-1",
    "Lanzar Tramo 1 — Early Bird (7 días, 40 entradas, 12€)",
    "entradas",
    "guille",
    "critical",
    "completed",
    { blockedBy: ["definir-tramos"] },
  ),
  raw(
    -19,
    "tramo-2",
    "Lanzar Tramo 2 — General (7 días, 100 entradas, 15€; antes si se agota el Tramo 1)",
    "entradas",
    "guille",
    "critical",
    "in_progress",
    { blockedBy: ["tramo-1"] },
  ),
  raw(
    -12,
    "tramo-3",
    "Lanzar Tramo 3 — Last Release (7 días, 60 entradas, 18€; antes si se agota el Tramo 2)",
    "entradas",
    "guille",
    "critical",
    "pending",
    { blockedBy: ["tramo-2"] },
  ),
  raw(
    -5,
    "cerrar-campana",
    "Cerrar campaña de venta (21 días) y pasar a taquilla (20€)",
    "entradas",
    "guille",
    "high",
    "pending",
    { blockedBy: ["tramo-3"] },
  ),
  raw(
    3,
    "cierre-economico",
    "Cierre económico: ingresos vs. gastos y reparto igualitario entre los tres",
    "entradas",
    "oliver",
    "critical",
    "pending",
  ),

  // Contenido y grabación
  raw(
    -20,
    "definir-camara",
    "Definir cámara y estilo de grabación: shorts por DJ, dron, ¿aftermovie?",
    "contenido",
    "guille",
    "normal",
    "completed",
  ),
  raw(
    -16,
    "buscar-creador",
    "Buscar creador de contenido afín a la marca y pedir precios",
    "contenido",
    "guille",
    "normal",
    "in_progress",
  ),
  raw(
    -2,
    "confirmar-fotografos",
    "Confirmar fotógrafos y grabación en directo",
    "contenido",
    "guille",
    "high",
    "pending",
  ),
  raw(
    5,
    "aftermovie",
    "Publicar aftermovie y contenido post-evento",
    "contenido",
    "guille",
    "normal",
    "pending",
  ),

  // Decoración
  raw(
    -14,
    "decoracion-tematica",
    "Definir decoración y temática del evento",
    "decoracion",
    "guille",
    "normal",
    "pending",
  ),

  // Cartelería y redes
  raw(
    -35,
    "disenar-cartel",
    "Diseñar cartel con el line-up confirmado",
    "carteleria",
    "luis",
    "high",
    "pending",
    { blockedBy: ["cerrar-lineup"] },
  ),
  raw(
    -24,
    "publicar-cartel",
    "Publicar cartel y campaña en redes",
    "carteleria",
    "guille",
    "high",
    "pending",
    { blockedBy: ["disenar-cartel"] },
  ),
];

const RODEO_SESSIONS_EXPENSES: (Omit<Expense, "date"> & {
  offsetDays: number;
})[] = [
  {
    id: "gasto-fianza-villa",
    personId: "oliver",
    amount: 1100,
    concept: "Reserva y fianza de la villa",
    categoryId: "villa",
    offsetDays: -40,
  },
  {
    id: "gasto-alquiler-sonido",
    personId: "luis",
    amount: 420,
    concept: "Alquiler de equipo de sonido y DJ",
    categoryId: "sonido",
    offsetDays: -20,
  },
  {
    id: "gasto-cartel",
    personId: "luis",
    amount: 60,
    concept: "Licencias de tipografía para el cartel",
    categoryId: "carteleria",
    offsetDays: -18,
  },
  {
    id: "gasto-portero",
    personId: "oliver",
    amount: 240,
    concept: "Pago adelantado a los dos porteros",
    categoryId: "seguridad",
    offsetDays: -10,
  },
  {
    id: "gasto-fotografo",
    personId: "guille",
    amount: 150,
    concept: "Señal al fotógrafo para el día del evento",
    categoryId: "contenido",
    offsetDays: -7,
  },
];

/**
 * Eventos con los que arranca la app en esta sesión del navegador.
 * Cualquier evento creado a partir de aquí (botón "Nuevo evento") empieza
 * con 0 tareas y se guarda solo en memoria — no persiste al recargar.
 */
export function getSeedEvents(): EventRecord[] {
  const rodeoSessionsDate = new Date(2026, 8, 28);

  return [
    {
      id: "rodeo-sessions",
      name: "RODEO SESSIONS",
      date: rodeoSessionsDate,
      venue: "Villa privada",
      city: "España",
      capacity: 200,
      format: "Fiesta en villa privada",
      tasks: RODEO_SESSIONS_TASKS.map((task) => ({
        ...task,
        dueDate: dueDateFor(rodeoSessionsDate, task.offsetDays),
      })),
      rules: RODEO_SESSIONS_RULES,
      chains: RODEO_SESSIONS_CHAINS,
      expenses: RODEO_SESSIONS_EXPENSES.map(({ offsetDays, ...expense }) => ({
        ...expense,
        date: dueDateFor(rodeoSessionsDate, offsetDays),
      })),
    },
  ];
}
