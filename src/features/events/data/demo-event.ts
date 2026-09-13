import { dueDateFor } from "@/lib/date";
import type { TaskLike } from "@/lib/tasks";
import type { TaskPriority, TaskStatus } from "@/types/domain";

/**
 * `demoMembers` y `demoCategories` son catálogos GLOBALES (compartidos por
 * todos los eventos): nadie los crea ni edita desde la UI, así que viven
 * como constantes aquí en vez de ir a buscarlos a Supabase en cada carga.
 * Sus mismos valores están sembrados en las tablas `members`/`categories`
 * (supabase/migrations/0003_seed.sql) para que las foreign keys de tareas,
 * normas y gastos tengan a qué apuntar.
 *
 * `DEFAULT_EVENT_TASKS`/`createDefaultTasks()` siguen siendo la checklist
 * base con la que arranca cualquier evento nuevo — ahora la usa el Server
 * Action de creación de eventos (`features/events/actions/events.ts`) para
 * generar filas reales en `tasks`, en vez de objetos en memoria.
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
    color: "#2c6e8f",
    bgColor: "#e3f0f6",
  },
  {
    id: "oliver",
    name: "Oliver",
    role: "Supervisión y control: coordinación de seguridad, DJs y camareros; pagos al staff y control del dinero de barra",
    color: "#6b3f8a",
    bgColor: "#efe3f5",
  },
  {
    id: "guille",
    name: "Guille",
    role: "Sector comercial y RRPP: contenido, redes, ticketing y coordinación de accesos",
    color: "#8a6d12",
    bgColor: "#f7f0d8",
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

/**
 * Checklist base para un evento nuevo: una tarea por área, con el
 * responsable habitual de esa área. `createDefaultTasks()` la convierte en
 * tareas reales con fecha, para el evento que se está creando.
 */
const DEFAULT_EVENT_TASKS: RawTask[] = [
  raw(
    -40,
    "confirmar-lugar",
    "Confirmar fecha y firmar contrato del lugar",
    "villa",
    "oliver",
    "critical",
    "pending",
    { isMilestone: true },
  ),
  raw(
    -35,
    "cerrar-proveedores",
    "Cerrar line-up o proveedores principales",
    "booking",
    "oliver",
    "critical",
    "pending",
  ),
  raw(
    -32,
    "reservar-sonido",
    "Reservar equipo de sonido y DJ",
    "sonido",
    "luis",
    "critical",
    "pending",
  ),
  raw(
    -30,
    "confirmar-djs",
    "Confirmar DJs y horario de sets",
    "dj",
    "oliver",
    "high",
    "pending",
  ),
  raw(
    -29,
    "definir-precios-entradas",
    "Definir precios y abrir venta de entradas",
    "entradas",
    "guille",
    "critical",
    "pending",
    { isMilestone: true },
  ),
  raw(
    -25,
    "contratar-seguridad",
    "Contratar personal de seguridad",
    "seguridad",
    "oliver",
    "critical",
    "pending",
  ),
  raw(
    -24,
    "cartel-evento",
    "Diseñar y publicar cartel del evento",
    "carteleria",
    "luis",
    "high",
    "pending",
  ),
  raw(
    -22,
    "presupuesto-barra",
    "Definir presupuesto y compra de barra",
    "barra",
    "oliver",
    "high",
    "pending",
  ),
  raw(
    -20,
    "cerrar-invitados",
    "Cerrar lista de invitados",
    "invitados",
    "guille",
    "normal",
    "pending",
  ),
  raw(
    -16,
    "confirmar-contenido",
    "Confirmar fotografía y grabación",
    "contenido",
    "guille",
    "normal",
    "pending",
  ),
  raw(
    -14,
    "definir-decoracion",
    "Definir decoración y ambientación",
    "decoracion",
    "guille",
    "normal",
    "pending",
  ),
  raw(
    3,
    "cierre-economico-evento",
    "Cierre económico: ingresos, gastos y reparto",
    "entradas",
    "oliver",
    "critical",
    "pending",
  ),
];

/**
 * Tareas de arranque de un evento nuevo, con fechas ya calculadas a partir
 * de la fecha del evento. Los ids llevan el id del evento para que nunca
 * choquen entre eventos distintos.
 */
export function createDefaultTasks(eventId: string, eventDate: Date): TaskLike[] {
  return DEFAULT_EVENT_TASKS.map((task) => ({
    ...task,
    id: `${task.id}-${eventId}`,
    dueDate: dueDateFor(eventDate, task.offsetDays),
  }));
}
