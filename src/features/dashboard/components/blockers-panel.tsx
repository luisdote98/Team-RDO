"use client";

import { useTaskStore } from "@/features/tasks/store/task-store";
import type { TaskView } from "@/features/tasks/types";
import { cn } from "@/lib/utils";

export type BlockerItem = {
  view: TaskView;
  reasons: string;
  overdue: boolean;
};

export function BlockersPanel({ items }: { items: BlockerItem[] }) {
  const { selectTask } = useTaskStore();

  return (
    <div className="flex flex-col gap-2.5">
      {items.map(({ view, reasons, overdue }) => {
        const { task, category, assignee } = view;
        return (
          <article
            key={task.id}
            onClick={() => selectTask(task.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectTask(task.id);
              }
            }}
            className={cn(
              "border-rodeo-card-line bg-card cursor-pointer rounded-[14px] border border-l-4 p-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              overdue ? "border-l-[#a8552f]" : "border-l-rodeo-gold",
            )}
          >
            <p className="text-[16px] leading-[1.35] font-semibold">
              {task.title}
            </p>
            <p className="text-priority-critical mt-2 text-[13px] leading-normal">
              {reasons}
            </p>
            <p className="text-rodeo-ink-soft mt-2 text-[13px]">
              {assignee?.name ?? "Sin responsable"} · {category.name}
            </p>
          </article>
        );
      })}
    </div>
  );
}
