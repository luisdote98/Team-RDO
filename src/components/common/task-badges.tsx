import { AlertCircle } from "lucide-react";

import type { TaskView } from "@/features/tasks/types";
import { relativeDueLabel } from "@/lib/date";
import { daysLate, isOverdue } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export function CategoryChip({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-rodeo-line bg-rodeo-chip px-2 py-0.5 text-[11px] whitespace-nowrap text-rodeo-ink-soft",
        className,
      )}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {name}
    </span>
  );
}

/**
 * Fila de chips de tarea (3.4): tiempo, área, persona, y las etiquetas
 * condicionales de crítica/en curso/hito. Compartida por la fila de lista
 * y la ficha, para que ambas muestren siempre lo mismo.
 */
export function TaskChips({
  view,
  showAssignee = true,
}: {
  view: TaskView;
  /** La tarjeta de tarea (3.5) muestra al responsable en su propia fila, con avatar. */
  showAssignee?: boolean;
}) {
  const { task, category, assignee } = view;
  const late = isOverdue(task);

  return (
    <>
      {late ? (
        <span className="inline-flex items-center gap-1 rounded-[7px] bg-priority-critical-bg px-[9px] py-[3px] text-xs font-bold text-priority-critical">
          <AlertCircle className="size-3.5" />
          {daysLate(task)} {daysLate(task) === 1 ? "día" : "días"} tarde
        </span>
      ) : (
        <span className="rounded-[7px] bg-rodeo-chip px-[9px] py-[3px] text-xs font-medium text-rodeo-ink-soft">
          {relativeDueLabel(task.dueDate)}
        </span>
      )}

      <CategoryChip name={category.name} color={category.color} />

      {assignee && showAssignee && (
        <span
          className="rounded-[7px] border bg-white px-[9px] py-[3px] text-xs font-semibold"
          style={{ borderColor: assignee.color, color: assignee.color }}
        >
          {assignee.name}
        </span>
      )}

      {task.priority === "critical" && (
        <span className="rounded-[7px] bg-priority-critical-bg px-[9px] py-[3px] text-xs font-bold text-priority-critical">
          Crítica
        </span>
      )}

      {task.status === "in_progress" && (
        <span className="rounded-[7px] bg-state-in-progress-bg px-[9px] py-[3px] text-xs font-semibold text-state-in-progress">
          En curso
        </span>
      )}

      {task.isMilestone && (
        <span className="rounded-[7px] bg-primary px-[9px] py-[3px] text-xs font-semibold text-primary-foreground">
          Hito
        </span>
      )}
    </>
  );
}
