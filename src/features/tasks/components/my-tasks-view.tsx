"use client";

import { addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { demoCategories, demoMembers } from "@/features/events/data/demo-event";
import { useEventsStore } from "@/features/events/store/events-store";
import { SwipeableTaskRow } from "@/features/tasks/components/swipeable-task-row";
import { TaskCard } from "@/features/tasks/components/task-card";
import { toTaskViews, type TaskView } from "@/features/tasks/types";
import { ROUTES } from "@/lib/constants";
import { daysFromToday } from "@/lib/date";
import {
  applyBlocking,
  groupByUrgency,
  toggleDoneResult,
  type TaskLike,
  type UrgencyGroupKey,
} from "@/lib/tasks";
import { cn } from "@/lib/utils";

const TEAM = "equipo";

type Row = { eventId: string; eventName: string; view: TaskView };

const URGENCY_STYLES: Record<
  Extract<UrgencyGroupKey, "late" | "week" | "later">,
  { dot: string; label: string }
> = {
  late: { dot: "bg-[#a8552f]", label: "text-priority-critical" },
  week: { dot: "bg-rodeo-gold", label: "text-rodeo-gold-ink" },
  later: { dot: "bg-[#a09585]", label: "text-rodeo-ink-soft" },
};

export function MyTasksView({
  userId,
  userName,
  sessionSlot,
}: {
  userId: string;
  userName: string;
  sessionSlot?: React.ReactNode;
}) {
  const router = useRouter();
  const { events, updateTaskStatus, updateTaskDueDate } = useEventsStore();
  const [personId, setPersonId] = useState(userId);
  const [showDone, setShowDone] = useState(false);

  const allRows = useMemo(() => {
    const rows: Row[] = [];
    for (const event of events) {
      const tasks = applyBlocking(event.tasks);
      const views = toTaskViews(tasks, demoCategories, demoMembers);
      for (const view of views) {
        rows.push({ eventId: event.id, eventName: event.name, view });
      }
    }
    return rows;
  }, [events]);

  const rows = useMemo(
    () =>
      personId === TEAM
        ? allRows
        : allRows.filter((row) => row.view.task.assigneeId === personId),
    [allRows, personId],
  );

  const rowByTask = useMemo(
    () => new Map<TaskLike, Row>(rows.map((row) => [row.view.task, row])),
    [rows],
  );

  const urgencyGroups = useMemo(
    () => groupByUrgency(rows.map((row) => row.view.task)),
    [rows],
  );

  const lateCount =
    urgencyGroups.find((g) => g.key === "late")?.tasks.length ?? 0;
  const weekCount =
    urgencyGroups.find((g) => g.key === "week")?.tasks.length ?? 0;
  const doneTasks = urgencyGroups.find((g) => g.key === "done")?.tasks ?? [];
  const openCount = rows.length - doneTasks.length;

  const nextEvent = useMemo(
    () =>
      events
        .map((event) => ({ event, days: daysFromToday(event.date) }))
        .filter((entry) => entry.days >= 0)
        .sort((a, b) => a.days - b.days)[0],
    [events],
  );

  const heading =
    personId === userId
      ? `Hola, ${userName}`
      : personId === TEAM
        ? "Todo el equipo"
        : `Tareas de ${demoMembers.find((m) => m.id === personId)?.name ?? ""}`;

  const subtitle =
    (lateCount > 0
      ? `${lateCount} atrasada${lateCount > 1 ? "s" : ""}`
      : "Nada atrasado") +
    ` y ${weekCount} esta semana.` +
    (nextEvent ? ` ${nextEvent.event.name} en ${nextEvent.days} días.` : "");

  const personTabs = [
    { id: userId, label: "Yo" },
    ...demoMembers
      .filter((m) => m.id !== userId)
      .map((m) => ({ id: m.id, label: m.name })),
    { id: TEAM, label: "Equipo" },
  ];

  const handleToggleDone = (eventId: string, taskId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;
    const tasks = applyBlocking(event.tasks);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const result = toggleDoneResult(task, tasks);
    if (result.action !== "blocked") {
      updateTaskStatus(eventId, taskId, result.nextStatus);
    }
    toast(result.message);
  };

  const goToRow = (row: Row) =>
    router.push(
      `${ROUTES.eventTasks(row.eventId)}?assignee=${row.view.task.assigneeId}`,
    );

  return (
    <main className="mx-auto w-full max-w-4xl pb-[110px]">
      <div className="flex items-center justify-between gap-3 px-5 pt-[18px]">
        <span className="font-display text-[17px] font-bold tracking-[0.16em] uppercase">
          RODEO
        </span>
        {sessionSlot}
      </div>

      <div className="px-5 pt-[22px]">
        <h1 className="font-display text-[36px] leading-none font-semibold tracking-[0.02em] uppercase">
          {heading}
        </h1>
        <p className="mt-[9px] text-[15px] leading-normal text-rodeo-ink-soft">
          {subtitle}
        </p>
      </div>

      <div
        className="mx-5 mt-5 flex gap-1 rounded-xl bg-rodeo-sand p-1"
        role="group"
        aria-label="Ver tareas por persona"
      >
        {personTabs.map((tab) => {
          const active = personId === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPersonId(tab.id)}
              aria-pressed={active}
              className={cn(
                "min-h-11 flex-1 rounded-[9px] px-2 py-[9px] text-sm transition-colors",
                active
                  ? "bg-card font-semibold text-rodeo-ink shadow-[0_1px_2px_rgba(27,23,18,0.08)]"
                  : "font-normal text-rodeo-ink-soft",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-col">
        {(["late", "week", "later"] as const).map((key) => {
          const group = urgencyGroups.find((g) => g.key === key);
          if (!group || group.tasks.length === 0) return null;
          const style = URGENCY_STYLES[key];
          return (
            <div key={key}>
              <div className="mt-6 mb-3 flex items-center gap-2.5 px-5">
                <span
                  className={cn("size-2 shrink-0 rounded-full", style.dot)}
                  aria-hidden="true"
                />
                <span
                  className={cn(
                    "font-display text-[15px] tracking-[0.14em] uppercase",
                    style.label,
                  )}
                >
                  {group.label} · {group.tasks.length}
                </span>
                <span
                  className="h-px flex-1 bg-rodeo-line"
                  aria-hidden="true"
                />
              </div>
              <div className="flex flex-col gap-2.5 px-5">
                {group.tasks.map((task) => {
                  const row = rowByTask.get(task)!;
                  return (
                    <SwipeableTaskRow
                      key={`${row.eventId}-${task.id}`}
                      blocked={task.status === "blocked"}
                      onComplete={() => handleToggleDone(row.eventId, task.id)}
                      onPostpone={() =>
                        updateTaskDueDate(
                          row.eventId,
                          task.id,
                          addDays(task.dueDate, 1),
                        )
                      }
                      onBlockedAttempt={() =>
                        handleToggleDone(row.eventId, task.id)
                      }
                    >
                      <TaskCard
                        view={row.view}
                        eventName={row.eventName}
                        onClick={() => goToRow(row)}
                        onToggleDone={() =>
                          handleToggleDone(row.eventId, task.id)
                        }
                      />
                    </SwipeableTaskRow>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {openCount === 0 && (
        <div className="mx-5 mt-6 rounded-2xl bg-state-completed-bg px-5 py-7 text-center">
          <p className="font-display text-[22px] tracking-[0.04em] text-state-completed uppercase">
            Nada pendiente
          </p>
          <p className="mt-2 text-sm text-[#41604d]">
            Todo lo asignado está completado.
          </p>
        </div>
      )}

      <div className="mx-5 mt-[26px] rounded-2xl bg-[#f3efe6] p-[18px]">
        <p className="rodeo-eyebrow">Hechas · {doneTasks.length}</p>
        <button
          type="button"
          onClick={() => setShowDone((v) => !v)}
          className="mt-2.5 min-h-11 rounded-[10px] border border-rodeo-line bg-card px-3.5 py-2 text-sm text-rodeo-ink"
        >
          {showDone ? "Ocultar completadas" : "Ver completadas"}
        </button>
        {showDone && (
          <div className="mt-3.5 flex flex-col">
            {doneTasks.map((task) => {
              const row = rowByTask.get(task)!;
              return (
                <div
                  key={`${row.eventId}-${task.id}`}
                  onClick={() => goToRow(row)}
                  className="flex cursor-pointer items-center gap-3 border-t border-rodeo-line py-2.5"
                >
                  <DoneCircle
                    title={task.title}
                    onToggle={() => handleToggleDone(row.eventId, task.id)}
                  />
                  <span className="flex-1 text-sm leading-normal text-rodeo-ink-soft line-through">
                    {task.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

/** Círculo verde de las filas compactas de "Hechas": tocarlo reabre la tarea. */
function DoneCircle({
  title,
  onToggle,
}: {
  title: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      aria-label={`Reabrir «${title}»`}
      className="relative flex size-[22px] shrink-0 items-center justify-center rounded-full border-2 border-state-completed bg-state-completed before:absolute before:-inset-[8.5px] before:content-['']"
    >
      <span className="text-[11px] leading-none text-white">✓</span>
    </button>
  );
}
