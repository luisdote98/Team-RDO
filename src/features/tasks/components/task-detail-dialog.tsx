"use client";

import { toast } from "sonner";

import { BottomSheet } from "@/components/common/bottom-sheet";
import { PillButton } from "@/components/common/pill-button";
import { TaskChips } from "@/components/common/task-badges";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useTaskStore } from "@/features/tasks/store/task-store";
import { TASK_PRIORITY_META, TASK_STATUS_META } from "@/lib/constants";
import { relativeDueLabel, toInputDate } from "@/lib/date";
import { unblocks } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/domain";

const STATUS_OPTIONS: TaskStatus[] = [
  "pending",
  "in_progress",
  "waiting",
  "completed",
];

export function TaskDetailDialog() {
  const {
    tasks,
    viewById,
    people,
    selectedTaskId,
    selectTask,
    updateStatus,
    updateNotes,
    updateAssignee,
    updateDueDate,
    toggleDone,
  } = useTaskStore();
  const view = selectedTaskId ? viewById.get(selectedTaskId) : undefined;

  return (
    <BottomSheet
      open={Boolean(view)}
      onOpenChange={(open) => {
        if (!open) selectTask(null);
      }}
    >
      {view &&
          (() => {
            const { task, category, waitingFor } = view;
            const blocked = task.status === "blocked";
            const done = task.status === "completed";
            const freed = unblocks(task, tasks);

            const handleStatusClick = (status: TaskStatus) => {
              if (blocked && status !== "pending") {
                toast("Está bloqueada: completa antes su dependencia.");
                return;
              }
              if (status === "completed") {
                if (!done) toggleDone(task.id);
                return;
              }
              updateStatus(task.id, status);
            };

            const handlePrimaryAction = () => {
              if (blocked) {
                toast(`Bloqueada: primero «${waitingFor[0]}».`);
                return;
              }
              toggleDone(task.id);
              selectTask(null);
            };

            return (
              <div className="px-5 pt-1 pb-7">
                <SheetTitle className="sr-only">{task.title}</SheetTitle>
                <SheetDescription className="sr-only">
                  Detalle y edición de la tarea
                </SheetDescription>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TaskChips view={view} />
                </div>

                <h2 className="font-display mt-3.5 text-[27px] leading-[1.15] font-medium">
                  {task.title}
                </h2>
                <p className="text-rodeo-ink-soft mt-2.5 text-sm">
                  {TASK_PRIORITY_META[task.priority].label} ·{" "}
                  {relativeDueLabel(task.dueDate)} · {category.name}
                </p>

                {blocked && (
                  <div className="bg-priority-critical-bg mt-4 rounded-[14px] p-4">
                    <p className="text-priority-critical text-[13px] font-bold tracking-[0.06em] uppercase">
                      Bloqueada automáticamente
                    </p>
                    <p className="text-priority-critical mt-2 text-sm leading-relaxed">
                      Espera a: {waitingFor.join(", ")}. Se desbloquea sola al
                      completarla.
                    </p>
                  </div>
                )}

                <p className="rodeo-eyebrow mt-[22px] mb-2.5">Estado</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <PillButton
                      key={status}
                      label={TASK_STATUS_META[status].label}
                      active={task.status === status}
                      activeClassName={
                        status === "completed" ? "bg-state-completed" : undefined
                      }
                      onClick={() => handleStatusClick(status)}
                    />
                  ))}
                </div>
                {blocked && (
                  <p className="text-priority-critical mt-2.5 text-[13px] leading-normal">
                    No se puede cambiar mientras esté bloqueada: primero
                    completa la dependencia.
                  </p>
                )}

                <p className="rodeo-eyebrow mt-[22px] mb-2.5">Responsable</p>
                <div className="flex gap-2">
                  {people.map((person) => (
                    <PillButton
                      key={person.id}
                      label={person.name}
                      active={task.assigneeId === person.id}
                      style={{ backgroundColor: person.color, color: "#fff" }}
                      onClick={() => updateAssignee(task.id, person.id)}
                    />
                  ))}
                </div>

                <p className="rodeo-eyebrow mt-[22px] mb-2.5">Fecha límite</p>
                <input
                  type="date"
                  value={toInputDate(task.dueDate)}
                  onChange={(event) => {
                    if (!event.target.value) return;
                    updateDueDate(
                      task.id,
                      new Date(`${event.target.value}T00:00:00`),
                    );
                  }}
                  className="border-rodeo-line w-full rounded-[14px] border bg-white px-[15px] py-[15px] text-base"
                />

                <p className="rodeo-eyebrow mt-[22px] mb-2.5">Notas</p>
                <Textarea
                  key={task.id}
                  defaultValue={task.notes ?? ""}
                  placeholder="Añade contexto para el equipo"
                  onChange={(event) => updateNotes(task.id, event.target.value)}
                  className="border-rodeo-line min-h-[92px] resize-y rounded-[14px] bg-white text-[15px]"
                />

                {freed.length > 0 && (
                  <div className="mt-5 rounded-[14px] bg-[#f3efe6] p-4">
                    <p className="text-rodeo-ink-soft text-[13px] font-bold tracking-[0.06em] uppercase">
                      Al completarla se libera
                    </p>
                    <div className="mt-2.5 flex flex-col gap-1.5">
                      {freed.map((title) => (
                        <p key={title} className="text-sm leading-normal">
                          {title}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-2.5">
                  <button
                    type="button"
                    onClick={handlePrimaryAction}
                    className={cn(
                      "flex-1 rounded-[14px] py-[15px] text-base font-bold text-white",
                      done && "bg-state-pending",
                      !done && blocked && "bg-[#cdbba4] text-[#7a6a53]",
                      !done && !blocked && "bg-state-completed",
                    )}
                  >
                    {done ? "Reabrir tarea" : blocked ? "Bloqueada" : "Marcar hecha"}
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTask(null)}
                    className="text-rodeo-ink-soft rounded-[14px] border border-[#d8cfbd] px-5 py-[15px] text-base font-semibold"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            );
          })()}
    </BottomSheet>
  );
}
