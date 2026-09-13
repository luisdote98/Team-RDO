import { Check, Lock, Trash2 } from "lucide-react";

import { TaskChips } from "@/components/common/task-badges";
import type { TaskView } from "@/features/tasks/types";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/domain";

export function TaskCard({
  view,
  onClick,
  onToggleDone,
  onDelete,
  eventName,
}: {
  view: TaskView;
  /** Abre la ficha completa de la tarea. */
  onClick?: () => void;
  /** Completa/reabre desde el círculo. La regla de bloqueo vive en el store. */
  onToggleDone?: () => void;
  /** Si se pasa, aparece un icono para borrar la tarea sin abrirla. */
  onDelete?: () => void;
  /** Solo se usa en vistas que cruzan varios eventos, como "Mis tareas". */
  eventName?: string;
}) {
  const { task, waitingFor, assignee } = view;
  const done = task.status === "completed";
  const blocked = task.status === "blocked";

  return (
    <article
      className="flex gap-[14px] rounded-[14px] border border-l-4 border-rodeo-card-line bg-card p-4 shadow-[0_1px_2px_rgba(27,23,18,0.04)]"
      style={
        assignee
          ? {
              backgroundColor: assignee.bgColor,
              borderLeftColor: assignee.color,
            }
          : undefined
      }
    >
      <CompletionCircle
        status={task.status}
        title={task.title}
        onToggle={onToggleDone}
      />

      <div
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
        className={cn("min-w-0 flex-1", onClick && "cursor-pointer")}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "min-w-0 text-[16px] leading-[1.35] font-medium",
              done && "text-rodeo-ink-soft line-through decoration-1",
            )}
          >
            {task.title}
          </p>
          {onDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              aria-label={`Eliminar «${task.title}»`}
              className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-rodeo-ink-soft before:absolute before:-inset-[10px] before:content-[''] hover:text-priority-critical"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <TaskChips view={view} />
          {eventName && (
            <span className="rounded-[7px] border border-rodeo-line px-[9px] py-[3px] text-xs text-rodeo-ink-soft">
              {eventName}
            </span>
          )}
        </div>

        {blocked && waitingFor.length > 0 && (
          <p className="mt-2 text-[13px] text-priority-critical">
            Bloqueada · espera a «{waitingFor.join(", ")}»
          </p>
        )}

        {task.notes && !done && (
          <p className="mt-2 text-[13px] leading-relaxed text-rodeo-ink-soft">
            {task.notes}
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * Botón de completar: un check verde, siempre visible, para que se entienda
 * a simple vista que sirve para marcar la tarea como hecha. 27×27 visual,
 * dentro de un botón con área táctil real de 44×44 (el `before:` absoluto
 * no participa del layout en flex).
 */
function CompletionCircle({
  status,
  title,
  onToggle,
}: {
  status: TaskStatus;
  title: string;
  onToggle?: () => void;
}) {
  const done = status === "completed";
  const blocked = status === "blocked";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle?.();
      }}
      aria-label={done ? `Reabrir «${title}»` : `Completar «${title}»`}
      title={done ? "Reabrir tarea" : "Completar tarea"}
      className={cn(
        "relative mt-[1px] flex size-[27px] shrink-0 items-center justify-center rounded-full before:absolute before:-inset-[8.5px] before:content-['']",
        done && "border-2 border-state-completed bg-state-completed",
        blocked && !done && "border-2 border-dashed border-[#cdbba4] bg-white",
        !done &&
          !blocked &&
          "border-2 border-state-completed bg-state-completed-bg",
      )}
    >
      {done && <Check className="size-3.5 text-white" strokeWidth={3} />}
      {!done && !blocked && (
        <Check className="size-3.5 text-state-completed" strokeWidth={3} />
      )}
      {blocked && (
        <Lock className="size-3 text-priority-critical" strokeWidth={2.5} />
      )}
    </button>
  );
}
