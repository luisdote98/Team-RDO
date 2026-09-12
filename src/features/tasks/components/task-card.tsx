import { Check, Lock } from "lucide-react";

import { TaskChips } from "@/components/common/task-badges";
import type { TaskView } from "@/features/tasks/types";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/domain";

export function TaskCard({
  view,
  onClick,
  onToggleDone,
  eventName,
}: {
  view: TaskView;
  /** Abre la ficha completa de la tarea. */
  onClick?: () => void;
  /** Completa/reabre desde el círculo. La regla de bloqueo vive en el store. */
  onToggleDone?: () => void;
  /** Solo se usa en vistas que cruzan varios eventos, como "Mis tareas". */
  eventName?: string;
}) {
  const { task, waitingFor } = view;
  const done = task.status === "completed";
  const blocked = task.status === "blocked";

  return (
    <article className="border-rodeo-card-line bg-card flex gap-[14px] rounded-[14px] border p-4 shadow-[0_1px_2px_rgba(27,23,18,0.04)]">
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
        <p
          className={cn(
            "text-[16px] leading-[1.35] font-medium",
            done && "text-rodeo-ink-soft line-through decoration-1",
          )}
        >
          {task.title}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <TaskChips view={view} />
          {eventName && (
            <span className="border-rodeo-line text-rodeo-ink-soft rounded-[7px] border px-[9px] py-[3px] text-xs">
              {eventName}
            </span>
          )}
        </div>

        {blocked && waitingFor.length > 0 && (
          <p className="text-priority-critical mt-2 text-[13px]">
            Bloqueada · espera a «{waitingFor.join(", ")}»
          </p>
        )}

        {task.notes && !done && (
          <p className="text-rodeo-ink-soft mt-2 text-[13px] leading-relaxed">
            {task.notes}
          </p>
        )}
      </div>
    </article>
  );
}

/**
 * Círculo de completar: 27×27 visual, dentro de un botón con área táctil
 * real de 44×44 (el `before:` absoluto no participa del layout en flex).
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
      aria-label={`Marcar «${title}» como hecha`}
      className={cn(
        "before:absolute before:-inset-[8.5px] before:content-[''] relative mt-[1px] flex size-[27px] shrink-0 items-center justify-center rounded-full",
        done && "border-state-completed bg-state-completed border-2",
        blocked && !done && "border-2 border-dashed border-[#cdbba4] bg-white",
        !done && !blocked && "border-2 border-[#cdc2ae] bg-white",
      )}
    >
      {done && <Check className="size-3.5 text-white" strokeWidth={3} />}
      {blocked && (
        <Lock className="text-priority-critical size-3" strokeWidth={2.5} />
      )}
    </button>
  );
}
