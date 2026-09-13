import { Check, Lock, MoreVertical, Trash2, User } from "lucide-react";
import { createElement } from "react";

import { TaskChips } from "@/components/common/task-badges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskView } from "@/features/tasks/types";
import { iconForCategory } from "@/lib/category-icons";
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
  /** Completa/reabre desde el botón inferior. La regla de bloqueo vive en el store. */
  onToggleDone?: () => void;
  /** Si se pasa, aparece un menú de "···" con la opción de borrar la tarea sin abrirla. */
  onDelete?: () => void;
  /** Solo se usa en vistas que cruzan varios eventos, como "Mis tareas". */
  eventName?: string;
}) {
  const { task, waitingFor, assignee, category } = view;
  const done = task.status === "completed";
  const blocked = task.status === "blocked";
  const CategoryIcon = iconForCategory(category.id);
  const accent = assignee?.color ?? category.color;

  return (
    <article
      className="rounded-[18px] border border-rodeo-card-line bg-card p-4 shadow-[0_1px_2px_rgba(27,23,18,0.04)]"
      style={
        assignee
          ? {
              backgroundColor: assignee.bgColor,
              borderColor: `color-mix(in oklab, ${assignee.color} 22%, white)`,
            }
          : undefined
      }
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/80 shadow-[0_1px_2px_rgba(27,23,18,0.06)]">
          {createElement(CategoryIcon, {
            className: "size-5",
            style: { color: accent },
          })}
        </span>

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
          className={cn("min-w-0 flex-1 pt-1.5", onClick && "cursor-pointer")}
        >
          <p
            className={cn(
              "text-[16px] leading-[1.35] font-semibold text-rodeo-ink",
              done && "text-rodeo-ink-soft line-through decoration-1",
            )}
          >
            {task.title}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <TaskChips view={view} showAssignee={false} />
            {eventName && (
              <span className="rounded-[7px] border border-rodeo-line px-[9px] py-[3px] text-xs text-rodeo-ink-soft">
                {eventName}
              </span>
            )}
          </div>

          {blocked && waitingFor.length > 0 && (
            <p className="mt-2.5 text-[13px] text-priority-critical">
              Bloqueada · espera a «{waitingFor.join(", ")}»
            </p>
          )}

          {task.notes && !done && (
            <p className="mt-2.5 text-[13px] leading-relaxed text-rodeo-ink-soft">
              {task.notes}
            </p>
          )}

          {assignee && (
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className="grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] bg-white"
                style={{ borderColor: assignee.color, color: assignee.color }}
              >
                <User className="size-3.5" />
              </span>
              <span
                className="rounded-full border-[1.5px] bg-white px-3 py-1 text-sm font-semibold"
                style={{ borderColor: assignee.color, color: assignee.color }}
              >
                {assignee.name}
              </span>
            </div>
          )}
        </div>

        {onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(event) => event.stopPropagation()}
              aria-label="Más opciones"
              className="relative -mt-1 -mr-1 flex size-9 shrink-0 items-center justify-center rounded-full text-rodeo-ink-soft hover:text-rodeo-ink"
            >
              <MoreVertical className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 />
                Eliminar tarea
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="mt-4 flex justify-end border-t border-black/[0.06] pt-3.5">
        <CompletionButton
          status={task.status}
          title={task.title}
          accent={accent}
          onToggle={onToggleDone}
        />
      </div>
    </article>
  );
}

/**
 * Botón de completar (3.5): siempre lleva su etiqueta al lado, para que se
 * entienda a simple vista qué hace sin tener que tocarlo primero.
 */
function CompletionButton({
  status,
  title,
  accent,
  onToggle,
}: {
  status: TaskStatus;
  title: string;
  accent: string;
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
      className={cn(
        "flex items-center gap-2 rounded-full border-[1.5px] bg-white py-2 pr-4 pl-3 text-sm font-semibold shadow-[0_1px_2px_rgba(27,23,18,0.06)]",
        done && "border-transparent bg-state-completed text-white",
        blocked &&
          !done &&
          "border-dashed border-[#cdbba4] text-rodeo-ink-soft",
      )}
      style={
        !done && !blocked ? { borderColor: accent, color: accent } : undefined
      }
    >
      {done && <Check className="size-4" strokeWidth={3} />}
      {blocked && !done && <Lock className="size-4" strokeWidth={2.5} />}
      {!done && !blocked && (
        <span
          className="grid size-4 shrink-0 place-items-center rounded-[5px] border-[1.5px]"
          style={{ borderColor: accent }}
        />
      )}
      {done ? "Completada" : blocked ? "Bloqueada" : "Marcar como completada"}
    </button>
  );
}
