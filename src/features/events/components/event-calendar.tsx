"use client";

import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useEventsStore } from "@/features/events/store/events-store";
import { SwipeableTaskRow } from "@/features/tasks/components/swipeable-task-row";
import { TaskCard } from "@/features/tasks/components/task-card";
import { useTaskStore } from "@/features/tasks/store/task-store";
import { isOverdue, type TaskLike } from "@/lib/tasks";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function EventCalendar() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = useEventsStore();
  const { views, selectTask, toggleDone, updateDueDate, deleteTask } =
    useTaskStore();
  const eventDate = events.find((e) => e.id === eventId)?.date ?? new Date();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [taskPendingDelete, setTaskPendingDelete] = useState<TaskLike | null>(
    null,
  );
  const [taskPendingComplete, setTaskPendingComplete] =
    useState<TaskLike | null>(null);

  /** Pide confirmación solo cuando se va a completar; reabrir o tocar una bloqueada no la necesita. */
  const requestComplete = (task: TaskLike) => {
    if (task.status === "completed" || task.status === "blocked") {
      toggleDone(task.id);
      return;
    }
    setTaskPendingComplete(task);
  };

  const byDay = useMemo(() => {
    const map = new Map<string, typeof views>();
    for (const view of views) {
      const key = format(view.task.dueDate, "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(view);
      map.set(key, list);
    }
    return map;
  }, [views]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedTasks = selectedDate
    ? (byDay.get(format(selectedDate, "yyyy-MM-dd")) ?? [])
    : [];
  const selectedIsEventDay = selectedDate && isSameDay(selectedDate, eventDate);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-[15px] tracking-[0.16em] text-rodeo-ink-soft uppercase">
          {format(month, "MMMM yyyy", { locale: es })}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="Mes anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => {
              setMonth(startOfMonth(new Date()));
              setSelectedDate(new Date());
            }}
          >
            Hoy
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Mes siguiente"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[11px] tracking-[0.08em] text-rodeo-ink-soft uppercase"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const selected = Boolean(
            selectedDate && isSameDay(day, selectedDate),
          );
          const today = isToday(day);
          const isEventDay = isSameDay(day, eventDate);
          const hasLate = dayTasks.some(({ task }) => isOverdue(task));

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={cn(
                "flex h-[46px] flex-col items-center justify-center gap-[3px] rounded-[11px] border transition-colors",
                today
                  ? "border-[1.5px] border-rodeo-ink"
                  : "border-transparent",
                !inMonth && "opacity-35",
                selected
                  ? "bg-primary"
                  : isEventDay
                    ? "bg-[#f7ecd6]"
                    : dayTasks.length > 0
                      ? "bg-card"
                      : "bg-transparent",
              )}
            >
              <span
                className={cn(
                  "text-[14px]",
                  selected ? "text-primary-foreground" : "text-rodeo-ink",
                  (isEventDay || today) && "font-bold",
                )}
              >
                {format(day, "d")}
              </span>
              <span
                className={cn(
                  "size-[5px] rounded-full",
                  dayTasks.length === 0
                    ? "bg-transparent"
                    : selected
                      ? "bg-primary-foreground"
                      : hasLate
                        ? "bg-[#a8552f]"
                        : "bg-rodeo-gold",
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <p className="mb-3 font-display text-[15px] tracking-[0.14em] text-rodeo-ink-soft uppercase">
          {selectedDate
            ? `${format(selectedDate, "eee d 'de' MMMM", { locale: es })}${selectedIsEventDay ? " · día del evento" : ""}`
            : "Elige un día"}
        </p>
        {selectedTasks.length === 0 ? (
          <p className="text-sm text-rodeo-ink-soft">Nada previsto este día.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {selectedTasks.map((view) => (
              <SwipeableTaskRow
                key={view.task.id}
                blocked={view.task.status === "blocked"}
                onComplete={() => requestComplete(view.task)}
                onPostpone={() =>
                  updateDueDate(view.task.id, addDays(view.task.dueDate, 1))
                }
                onBlockedAttempt={() => toggleDone(view.task.id)}
              >
                <TaskCard
                  view={view}
                  onClick={() => selectTask(view.task.id)}
                  onToggleDone={() => requestComplete(view.task)}
                  onDelete={() => setTaskPendingDelete(view.task)}
                />
              </SwipeableTaskRow>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(taskPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setTaskPendingDelete(null);
        }}
        title="Eliminar tarea"
        description={
          taskPendingDelete
            ? `¿Seguro que quieres eliminar «${taskPendingDelete.title}»? No se puede deshacer.`
            : ""
        }
        onConfirm={() => {
          if (!taskPendingDelete) return;
          deleteTask(taskPendingDelete.id);
          toast("Tarea eliminada.");
        }}
      />

      <ConfirmDialog
        open={Boolean(taskPendingComplete)}
        onOpenChange={(open) => {
          if (!open) setTaskPendingComplete(null);
        }}
        title="Marcar como hecha"
        description={
          taskPendingComplete
            ? `¿Confirmas que «${taskPendingComplete.title}» está terminada?`
            : ""
        }
        confirmLabel="Marcar hecha"
        variant="default"
        onConfirm={() => {
          if (!taskPendingComplete) return;
          toggleDone(taskPendingComplete.id);
        }}
      />
    </div>
  );
}
