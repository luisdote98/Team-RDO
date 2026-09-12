"use client";

import { addDays } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SwipeableTaskRow } from "@/features/tasks/components/swipeable-task-row";
import { TaskCard } from "@/features/tasks/components/task-card";
import { useTaskStore } from "@/features/tasks/store/task-store";
import { ROUTES } from "@/lib/constants";
import { groupByUrgency, isClosed, isOverdue, type TaskLike } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export type TaskFilterValue =
  | "todas"
  | "atrasadas"
  | "bloqueadas"
  | "mias"
  | "hechas";

const ALL_PEOPLE = "todas";

type TaskBoardProps = {
  eventId: string;
  currentUserId: string;
  initialAssignee?: string;
  initialCategory?: string;
  initialFilter?: TaskFilterValue;
};

export function TaskBoard({
  eventId,
  currentUserId,
  initialAssignee,
  initialCategory,
  initialFilter,
}: TaskBoardProps) {
  const { views, categories, people, toggleDone, selectTask, updateDueDate } =
    useTaskStore();
  const [filter, setFilter] = useState<TaskFilterValue>(
    initialFilter ?? "todas",
  );
  const [personId, setPersonId] = useState(initialAssignee ?? ALL_PEOPLE);

  const category = initialCategory
    ? categories.find((c) => c.id === initialCategory)
    : undefined;

  const scoped = useMemo(
    () =>
      views.filter(
        ({ task }) => !initialCategory || task.categoryId === initialCategory,
      ),
    [views, initialCategory],
  );

  const openTasks = scoped.filter(({ task }) => !isClosed(task));

  const filters: { key: TaskFilterValue; label: string }[] = [
    { key: "todas", label: `Todas ${openTasks.length}` },
    {
      key: "atrasadas",
      label: `Atrasadas ${openTasks.filter(({ task }) => isOverdue(task)).length}`,
    },
    {
      key: "bloqueadas",
      label: `Bloqueadas ${openTasks.filter(({ task }) => task.status === "blocked").length}`,
    },
    {
      key: "mias",
      label: `Mías ${openTasks.filter(({ task }) => task.assigneeId === currentUserId).length}`,
    },
    {
      key: "hechas",
      label: `Hechas ${scoped.filter(({ task }) => isClosed(task)).length}`,
    },
  ];

  const byFilter = useMemo(() => {
    switch (filter) {
      case "atrasadas":
        return scoped.filter(({ task }) => isOverdue(task));
      case "bloqueadas":
        return scoped.filter(({ task }) => task.status === "blocked");
      case "mias":
        return scoped.filter(({ task }) => task.assigneeId === currentUserId);
      case "hechas":
        return scoped.filter(({ task }) => isClosed(task));
      default:
        return scoped;
    }
  }, [scoped, filter, currentUserId]);

  const pool = useMemo(
    () =>
      personId === ALL_PEOPLE
        ? byFilter
        : byFilter.filter(({ task }) => task.assigneeId === personId),
    [byFilter, personId],
  );

  const rowByTask = useMemo(
    () => new Map<TaskLike, (typeof pool)[number]>(
      pool.map((row) => [row.task, row]),
    ),
    [pool],
  );

  const groups = useMemo(() => {
    if (filter === "hechas") {
      const done = pool.filter(({ task }) => isClosed(task));
      return done.length
        ? [
            {
              key: "done" as const,
              label: "Completadas",
              tasks: done.map((row) => row.task),
            },
          ]
        : [];
    }
    const urgency = groupByUrgency(pool.map((row) => row.task));
    return (["late", "week", "later"] as const)
      .map((key) => urgency.find((g) => g.key === key)!)
      .filter((group) => group.tasks.length > 0);
  }, [pool, filter]);

  const emptyLabel =
    scoped.length === 0
      ? "Este evento todavía no tiene tareas. Créalas con el botón +."
      : "Nada en este filtro.";

  return (
    <div className="flex flex-col">
      {category && (
        <Link
          href={ROUTES.eventTasks(eventId)}
          className="border-rodeo-line bg-card text-rodeo-ink-soft mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs"
        >
          Área: {category.name} ✕
        </Link>
      )}

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {filters.map((f) => (
          <FilterPill
            key={f.key}
            label={f.label}
            active={filter === f.key}
            activeClassName={
              f.key === "atrasadas"
                ? "bg-priority-critical text-primary-foreground"
                : undefined
            }
            onClick={() => setFilter(f.key)}
          />
        ))}
      </div>

      <div className="mt-2.5">
        <Select value={personId} onValueChange={setPersonId}>
          <SelectTrigger className="border-rodeo-line bg-card text-rodeo-ink-soft h-auto w-fit gap-1.5 rounded-full px-3.5 py-2 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_PEOPLE}>Todas las personas</SelectItem>
            {people.map((person) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col">
        {groups.map((group) => (
          <div key={group.key}>
            <div className="mt-6 mb-3 flex items-center gap-2.5">
              <span
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  group.key === "late" && "bg-[#a8552f]",
                  group.key === "week" && "bg-rodeo-gold",
                  group.key === "later" && "bg-[#a09585]",
                  group.key === "done" && "bg-state-completed",
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "font-display text-[15px] tracking-[0.14em] uppercase",
                  group.key === "late" && "text-priority-critical",
                  group.key === "week" && "text-rodeo-gold-ink",
                  group.key === "later" && "text-rodeo-ink-soft",
                  group.key === "done" && "text-state-completed",
                )}
              >
                {group.label} · {group.tasks.length}
              </span>
              <span className="bg-rodeo-line h-px flex-1" aria-hidden="true" />
            </div>
            <div className="flex flex-col gap-2.5">
              {group.tasks.map((task) => {
                const row = rowByTask.get(task)!;
                return (
                  <SwipeableTaskRow
                    key={task.id}
                    blocked={task.status === "blocked"}
                    onComplete={() => toggleDone(task.id)}
                    onPostpone={() =>
                      updateDueDate(task.id, addDays(task.dueDate, 1))
                    }
                    onBlockedAttempt={() => toggleDone(task.id)}
                  >
                    <TaskCard
                      view={row}
                      onClick={() => selectTask(task.id)}
                      onToggleDone={() => toggleDone(task.id)}
                    />
                  </SwipeableTaskRow>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <p className="text-rodeo-ink-soft mt-6 text-sm">{emptyLabel}</p>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  activeClassName,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClassName?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "min-h-11 shrink-0 rounded-full border px-3.5 py-2 text-sm transition-colors",
        active
          ? cn(
              "border-transparent font-semibold",
              activeClassName ?? "bg-primary text-primary-foreground",
            )
          : "border-rodeo-line bg-card text-rodeo-ink-soft font-normal",
      )}
    >
      {label}
    </button>
  );
}
