"use client";

import { useParams } from "next/navigation";

import {
  BlockersPanel,
  type BlockerItem,
} from "@/features/dashboard/components/blockers-panel";
import { CategoryProgressList } from "@/features/dashboard/components/category-progress-list";
import { DependencyChain } from "@/features/dashboard/components/dependency-chain";
import { ReadinessPanel } from "@/features/dashboard/components/readiness-panel";
import { SummaryTiles } from "@/features/dashboard/components/summary-tiles";
import { useEventsStore } from "@/features/events/store/events-store";
import { useTaskStore } from "@/features/tasks/store/task-store";
import { PRIORITY_WEIGHTS, TASK_PRIORITY_META } from "@/lib/constants";
import {
  daysLate,
  findBlockers,
  isOverdue,
  progressByCategory,
  summarize,
  unblocks,
  waitingOn,
} from "@/lib/tasks";

export default function EventSummaryPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events } = useEventsStore();
  const { tasks, categories, viewById } = useTaskStore();

  const event = events.find((item) => item.id === eventId);
  const chains = (event?.chains ?? []).filter((chain) =>
    chain.taskIds.some((id) => {
      const task = tasks.find((t) => t.id === id);
      return task && task.status !== "completed";
    }),
  );

  if (!event || event.tasks.length === 0) {
    return (
      <div className="bg-[#f3efe6] rounded-2xl px-5 py-7 text-center">
        <p className="font-display text-[20px] tracking-[0.04em] uppercase">
          Evento vacío
        </p>
        <p className="text-rodeo-ink-soft mt-2 text-sm leading-normal">
          Todavía no hay tareas. Créalas con el botón +.
        </p>
      </div>
    );
  }

  const summary = summarize(tasks);
  const taskById = new Map(tasks.map((task) => [task.id, task]));

  const openTasks = tasks.filter((task) => task.status !== "completed");
  const overdueCount = openTasks.filter(isOverdue).length;
  const blockedCount = openTasks.filter((t) => t.status === "blocked").length;
  const inProgressCount = openTasks.filter(
    (t) => t.status === "in_progress",
  ).length;

  const blockerItems: BlockerItem[] = findBlockers(tasks, 8)
    .map((blocker) => ({
      task: blocker.task,
      freed: unblocks(blocker.task, tasks),
    }))
    .sort(
      (a, b) =>
        b.freed.length - a.freed.length ||
        PRIORITY_WEIGHTS[b.task.priority] - PRIORITY_WEIGHTS[a.task.priority] ||
        daysLate(b.task) - daysLate(a.task),
    )
    .slice(0, 3)
    .flatMap(({ task, freed }) => {
      const view = viewById.get(task.id);
      if (!view) return [];
      const late = isOverdue(task);
      const reasons = [
        TASK_PRIORITY_META[task.priority].label,
        late ? `${daysLate(task)} ${daysLate(task) === 1 ? "día" : "días"} tarde` : null,
        task.status === "blocked"
          ? `bloqueada por «${waitingOn(task, tasks)[0]}»`
          : null,
        freed.length > 0
          ? `arrastra ${freed.length} tarea${freed.length > 1 ? "s" : ""}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      return [{ view, reasons, overdue: late }];
    });

  const categoryRows = progressByCategory(
    tasks,
    categories.map((category) => category.id),
  ).flatMap((progress) => {
    if (progress.total === 0) return [];
    const category = categories.find((c) => c.id === progress.categoryId);
    return category
      ? [{ ...progress, name: category.name, color: category.color }]
      : [];
  });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4">
        <ReadinessPanel summary={summary} />
        <SummaryTiles
          eventId={eventId}
          overdue={overdueCount}
          blocked={blockedCount}
          inProgress={inProgressCount}
        />
      </div>

      {blockerItems.length > 0 && (
        <div>
          <h2 className="font-display mb-3 text-[20px] font-semibold tracking-[0.06em] uppercase">
            Qué frena el evento
          </h2>
          <BlockersPanel items={blockerItems} />
        </div>
      )}

      {categoryRows.length > 0 && (
        <div>
          <h2 className="font-display mb-3 text-[20px] font-semibold tracking-[0.06em] uppercase">
            Por área
          </h2>
          <CategoryProgressList rows={categoryRows} eventId={eventId} />
        </div>
      )}

      {chains.length > 0 && (
        <div className="flex flex-col gap-5">
          {chains.map((chain) => (
            <DependencyChain
              key={chain.id}
              note={chain.note}
              tasks={chain.taskIds.flatMap((id) => {
                const task = taskById.get(id);
                return task ? [task] : [];
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
