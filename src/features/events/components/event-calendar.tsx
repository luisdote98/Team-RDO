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

import { Button } from "@/components/ui/button";
import { useEventsStore } from "@/features/events/store/events-store";
import { SwipeableTaskRow } from "@/features/tasks/components/swipeable-task-row";
import { TaskCard } from "@/features/tasks/components/task-card";
import { useTaskStore } from "@/features/tasks/store/task-store";
import { isOverdue } from "@/lib/tasks";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

export function EventCalendar() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = useEventsStore();
  const { views, selectTask, toggleDone, updateDueDate } = useTaskStore();
  const eventDate = events.find((e) => e.id === eventId)?.date ?? new Date();

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
        <p className="font-display text-rodeo-ink-soft text-[15px] tracking-[0.16em] uppercase">
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
            className="text-rodeo-ink-soft py-1 text-center text-[11px] tracking-[0.08em] uppercase"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = byDay.get(key) ?? [];
          const inMonth = isSameMonth(day, month);
          const selected = Boolean(selectedDate && isSameDay(day, selectedDate));
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
                today ? "border-rodeo-ink border-[1.5px]" : "border-transparent",
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
        <p className="font-display text-rodeo-ink-soft mb-3 text-[15px] tracking-[0.14em] uppercase">
          {selectedDate
            ? `${format(selectedDate, "eee d 'de' MMMM", { locale: es })}${selectedIsEventDay ? " · día del evento" : ""}`
            : "Elige un día"}
        </p>
        {selectedTasks.length === 0 ? (
          <p className="text-rodeo-ink-soft text-sm">
            Nada previsto este día.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {selectedTasks.map((view) => (
              <SwipeableTaskRow
                key={view.task.id}
                blocked={view.task.status === "blocked"}
                onComplete={() => toggleDone(view.task.id)}
                onPostpone={() =>
                  updateDueDate(view.task.id, addDays(view.task.dueDate, 1))
                }
                onBlockedAttempt={() => toggleDone(view.task.id)}
              >
                <TaskCard
                  view={view}
                  onClick={() => selectTask(view.task.id)}
                  onToggleDone={() => toggleDone(view.task.id)}
                />
              </SwipeableTaskRow>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
