import { PRIORITY_WEIGHTS } from "@/lib/constants";
import { daysFromToday } from "@/lib/date";
import type { TaskPriority, TaskStatus } from "@/types/domain";

/**
 * Cálculos de dominio sobre tareas.
 *
 * Son un espejo en TypeScript de lo que la base de datos hará en la fase 1
 * (triggers de bloqueo y vistas de agregación). Se mantienen puros y sin
 * dependencias de React para poder reutilizarlos en servidor y en cliente.
 */

export type TaskLike = {
  id: string;
  title: string;
  categoryId: string;
  assigneeId: string;
  priority: TaskPriority;
  status: TaskStatus;
  offsetDays: number;
  dueDate: Date;
  isMilestone?: boolean;
  /** Ids de tareas que deben completarse antes que ésta. */
  blockedBy?: string[];
  notes?: string;
};

export function isClosed(task: TaskLike): boolean {
  return task.status === "completed" || task.status === "cancelled";
}

export function isOverdue(task: TaskLike): boolean {
  return !isClosed(task) && daysFromToday(task.dueDate) < 0;
}

export function daysLate(task: TaskLike): number {
  return Math.max(0, -daysFromToday(task.dueDate));
}

/**
 * Espejo del trigger `recalc_dependents()`: una tarea abierta cuya dependencia
 * sigue sin completarse pasa a `blocked`. Nadie marca ese estado a mano.
 */
export function applyBlocking<T extends TaskLike>(tasks: T[]): T[] {
  const byId = new Map(tasks.map((task) => [task.id, task]));

  return tasks.map((task) => {
    if (isClosed(task) || !task.blockedBy?.length) return task;

    const waiting = task.blockedBy.some((id) => {
      const blocker = byId.get(id);
      return blocker ? blocker.status !== "completed" : false;
    });

    return waiting ? { ...task, status: "blocked" as TaskStatus } : task;
  });
}

export type TaskSummary = {
  total: number;
  completed: number;
  open: number;
  inProgress: number;
  overdue: number;
  blocked: number;
  /** Porcentaje de preparación ponderado por prioridad. */
  readiness: number;
  /** Porcentaje por conteo simple, para contrastar. */
  rawCompletion: number;
};

export function summarize(tasks: TaskLike[]): TaskSummary {
  const scored = tasks.filter((task) => task.status !== "cancelled");
  const weightTotal = scored.reduce(
    (sum, t) => sum + PRIORITY_WEIGHTS[t.priority],
    0,
  );
  const weightDone = scored
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + PRIORITY_WEIGHTS[t.priority], 0);

  const completed = tasks.filter((t) => t.status === "completed").length;

  return {
    total: tasks.length,
    completed,
    open: tasks.length - completed,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    overdue: tasks.filter(isOverdue).length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
    readiness: weightTotal ? Math.round((weightDone / weightTotal) * 100) : 0,
    rawCompletion: scored.length
      ? Math.round((completed / scored.length) * 100)
      : 0,
  };
}

export type CategoryProgress = {
  categoryId: string;
  total: number;
  completed: number;
  overdue: number;
  percent: number;
};

export function progressByCategory(
  tasks: TaskLike[],
  categoryIds: string[],
): CategoryProgress[] {
  return categoryIds.map((categoryId) => {
    const list = tasks.filter((task) => task.categoryId === categoryId);
    const completed = list.filter((task) => task.status === "completed").length;
    return {
      categoryId,
      total: list.length,
      completed,
      overdue: list.filter(isOverdue).length,
      percent: list.length ? Math.round((completed / list.length) * 100) : 0,
    };
  });
}

export type BlockerRule =
  | "critical_overdue"
  | "critical_blocked"
  | "milestone_soon"
  | "overdue"
  | "unassigned";

export type Blocker = {
  task: TaskLike;
  rule: BlockerRule;
  severity: 1 | 2 | 3;
  /** Explicación corta de por qué aparece aquí. */
  detail: string;
};

const MILESTONE_HORIZON_DAYS = 14;

/**
 * "¿Qué falta para RODEO?": los puntos que impiden dar el evento por preparado,
 * ordenados por gravedad. Cada tarea aparece una sola vez, con la regla más
 * grave que la haya seleccionado.
 */
export function findBlockers(tasks: TaskLike[], limit = 6): Blocker[] {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const open = tasks.filter((task) => !isClosed(task));
  const seen = new Set<string>();
  const blockers: Blocker[] = [];

  const push = (
    task: TaskLike,
    rule: BlockerRule,
    severity: 1 | 2 | 3,
    detail: string,
  ) => {
    if (seen.has(task.id)) return;
    seen.add(task.id);
    blockers.push({ task, rule, severity, detail });
  };

  const blockerNames = (task: TaskLike) =>
    (task.blockedBy ?? [])
      .map((id) => byId.get(id))
      .filter((blocker) => blocker && blocker.status !== "completed")
      .map((blocker) => blocker!.title)
      .join(", ");

  for (const task of open.filter(
    (t) => t.priority === "critical" && isOverdue(t),
  )) {
    push(
      task,
      "critical_overdue",
      1,
      `Crítica y ${daysLate(task)} días de retraso`,
    );
  }

  for (const task of open.filter(
    (t) => t.priority === "critical" && t.status === "blocked",
  )) {
    push(task, "critical_blocked", 1, `Bloqueada por: ${blockerNames(task)}`);
  }

  for (const task of open.filter(isOverdue)) {
    push(task, "overdue", 2, `${daysLate(task)} días de retraso`);
  }

  for (const task of open.filter((t) => t.isMilestone)) {
    const days = daysFromToday(task.dueDate);
    if (days >= 0 && days <= MILESTONE_HORIZON_DAYS) {
      push(task, "milestone_soon", 3, `Hito dentro de ${days} días`);
    }
  }

  for (const task of open.filter((t) => !t.assigneeId)) {
    push(task, "unassigned", 3, "Sin responsable asignado");
  }

  const priorityRank: Record<TaskPriority, number> = {
    critical: 0,
    high: 1,
    normal: 2,
    low: 3,
  };

  return blockers
    .sort(
      (a, b) =>
        a.severity - b.severity ||
        priorityRank[a.task.priority] - priorityRank[b.task.priority] ||
        daysLate(b.task) - daysLate(a.task),
    )
    .slice(0, limit);
}

/** Títulos de las tareas abiertas que se desbloquean al completar `task`. */
export function unblocks(task: TaskLike, tasks: TaskLike[]): string[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));

  return tasks
    .filter((t) => !isClosed(t) && (t.blockedBy ?? []).includes(task.id))
    .filter((t) =>
      (t.blockedBy ?? [])
        .filter((id) => id !== task.id)
        .every((id) => byId.get(id)?.status === "completed"),
    )
    .map((t) => t.title);
}

/** Títulos de las dependencias de `task` que siguen sin completarse. */
export function waitingOn(task: TaskLike, tasks: TaskLike[]): string[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));

  return (task.blockedBy ?? [])
    .map((id) => byId.get(id))
    .filter(
      (blocker): blocker is TaskLike =>
        blocker !== undefined && blocker.status !== "completed",
    )
    .map((blocker) => blocker.title);
}

export type ToggleDoneResult =
  | { action: "blocked"; message: string }
  | { action: "reopened"; nextStatus: TaskStatus; message: string }
  | { action: "completed"; nextStatus: TaskStatus; message: string };

/**
 * Regla de completar/reabrir desde el círculo de la fila, sin acoplarse a
 * dónde vive el estado: si está bloqueada no cambia nada (solo explica por
 * qué), si está completada la reabre, si no la completa. Cada llamador
 * decide cómo aplicar `nextStatus` y qué hacer con `message` (p. ej. un toast).
 */
export function toggleDoneResult(
  task: TaskLike,
  tasks: TaskLike[],
): ToggleDoneResult {
  if (task.status === "blocked") {
    const [first] = waitingOn(task, tasks);
    return {
      action: "blocked",
      message: `Bloqueada: primero «${first ?? "su dependencia"}».`,
    };
  }

  if (task.status === "completed") {
    return { action: "reopened", nextStatus: "pending", message: "Reabierta." };
  }

  const freed = unblocks(task, tasks);
  return {
    action: "completed",
    nextStatus: "completed",
    message: freed.length > 0 ? `Hecho. Se libera: ${freed[0]}` : "Hecho.",
  };
}

export type UrgencyGroupKey = "late" | "week" | "later" | "done";

export type UrgencyGroup = {
  key: UrgencyGroupKey;
  label: string;
  tasks: TaskLike[];
};

const URGENCY_WEEK_HORIZON_DAYS = 7;

/**
 * Agrupa por urgencia para la lista única: atrasadas, vence en ≤7 días, resto.
 * Dentro de cada grupo: bloqueadas primero, luego prioridad desc, luego retraso desc.
 */
export function groupByUrgency(tasks: TaskLike[]): UrgencyGroup[] {
  const late: TaskLike[] = [];
  const week: TaskLike[] = [];
  const later: TaskLike[] = [];
  const done: TaskLike[] = [];

  for (const task of tasks) {
    if (isClosed(task)) {
      done.push(task);
    } else if (isOverdue(task)) {
      late.push(task);
    } else if (daysFromToday(task.dueDate) <= URGENCY_WEEK_HORIZON_DAYS) {
      week.push(task);
    } else {
      later.push(task);
    }
  }

  const sortByUrgency = (list: TaskLike[]) =>
    [...list].sort((a, b) => {
      const blockedDiff =
        Number(b.status === "blocked") - Number(a.status === "blocked");
      if (blockedDiff !== 0) return blockedDiff;
      const weightDiff =
        PRIORITY_WEIGHTS[b.priority] - PRIORITY_WEIGHTS[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return daysLate(b) - daysLate(a);
    });

  return [
    { key: "late", label: "Atrasadas", tasks: sortByUrgency(late) },
    { key: "week", label: "Esta semana", tasks: sortByUrgency(week) },
    { key: "later", label: "Más adelante", tasks: sortByUrgency(later) },
    { key: "done", label: "Hechas", tasks: sortByUrgency(done) },
  ];
}
