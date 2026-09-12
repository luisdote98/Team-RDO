import type {
  EventStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@/types/domain";

export const APP_NAME = "RODEO Manager";
export const APP_SHORT_NAME = "RODEO";
export const APP_DESCRIPTION =
  "Gestión interna de la producción de eventos de RODEO.";

/** Pesos de la fórmula de preparación del evento. Deben coincidir con el SQL. */
export const PRIORITY_WEIGHTS: Record<TaskPriority, number> = {
  critical: 4,
  high: 3,
  normal: 2,
  low: 1,
};

type Meta = {
  label: string;
  /** Clases Tailwind para el badge (fondo + texto + borde). */
  className: string;
  /** Color plano, para gráficos y anillos de progreso. */
  color: string;
};

export const TASK_STATUS_META: Record<TaskStatus, Meta> = {
  pending: {
    label: "Pendiente",
    className: "bg-rodeo-chip text-state-pending border-rodeo-line",
    color: "var(--state-pending)",
  },
  in_progress: {
    label: "En curso",
    className:
      "bg-state-in-progress-bg text-state-in-progress border-state-in-progress/25",
    color: "var(--state-in-progress)",
  },
  waiting: {
    label: "En espera",
    className: "bg-rodeo-chip text-state-waiting border-rodeo-line",
    color: "var(--state-waiting)",
  },
  blocked: {
    label: "Bloqueada",
    className: "bg-state-blocked-bg text-state-blocked border-state-blocked/25",
    color: "var(--state-blocked)",
  },
  completed: {
    label: "Completada",
    className:
      "bg-state-completed-bg text-state-completed border-state-completed/25",
    color: "var(--state-completed)",
  },
  cancelled: {
    label: "Cancelada",
    className: "bg-rodeo-chip text-state-cancelled border-rodeo-line",
    color: "var(--state-cancelled)",
  },
};

export const TASK_PRIORITY_META: Record<TaskPriority, Meta> = {
  critical: {
    label: "Crítica",
    className:
      "bg-priority-critical-bg text-priority-critical border-priority-critical/25",
    color: "var(--priority-critical)",
  },
  high: {
    label: "Alta",
    className: "bg-priority-high-bg text-priority-high border-priority-high/25",
    color: "var(--priority-high)",
  },
  normal: {
    label: "Normal",
    className:
      "bg-priority-normal-bg text-priority-normal border-priority-normal/25",
    color: "var(--priority-normal)",
  },
  low: {
    label: "Baja",
    className: "bg-priority-low-bg text-priority-low border-priority-low/25",
    color: "var(--priority-low)",
  },
};

export const EVENT_STATUS_META: Record<EventStatus, Meta> = {
  draft: {
    label: "Borrador",
    className: "bg-muted text-muted-foreground border-border",
    color: "var(--muted-foreground)",
  },
  planning: {
    label: "En preparación",
    className: "bg-rodeo-gold/12 text-rodeo-gold border-rodeo-gold/30",
    color: "var(--rodeo-gold)",
  },
  active: {
    label: "Activo",
    className:
      "bg-state-in-progress/12 text-state-in-progress border-state-in-progress/30",
    color: "var(--state-in-progress)",
  },
  completed: {
    label: "Finalizado",
    className:
      "bg-state-completed/12 text-state-completed border-state-completed/30",
    color: "var(--state-completed)",
  },
  cancelled: {
    label: "Cancelado",
    className:
      "bg-state-cancelled/12 text-state-cancelled border-state-cancelled/30",
    color: "var(--state-cancelled)",
  },
};

export const USER_ROLE_META: Record<UserRole, { label: string }> = {
  admin: { label: "Administrador" },
  member: { label: "Miembro" },
};

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  events: "/events",
  event: (id: string) => `/events/${id}`,
  eventTasks: (id: string) => `/events/${id}/tasks`,
  eventCalendar: (id: string) => `/events/${id}/calendar`,
  eventTeam: (id: string) => `/events/${id}/team`,
  eventRules: (id: string) => `/events/${id}/rules`,
  eventExpenses: (id: string) => `/events/${id}/expenses`,
  myTasks: "/my-tasks",
  templates: "/templates",
  template: (id: string) => `/templates/${id}`,
  team: "/team",
  settings: "/settings",
} as const;
