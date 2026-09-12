"use client";

import { Check, Lock, TriangleAlert } from "lucide-react";

import { useTaskStore } from "@/features/tasks/store/task-store";
import { offsetLabel } from "@/lib/date";
import { isOverdue, type TaskLike } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export function DependencyChain({
  tasks,
  note,
}: {
  tasks: TaskLike[];
  note: string;
}) {
  const { selectTask } = useTaskStore();

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {tasks.map((task) => {
          const done = task.status === "completed";
          const blocked = task.status === "blocked";
          const late = isOverdue(task);

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => selectTask(task.id)}
              className={cn(
                "border-rodeo-card-line bg-card flex min-w-[152px] flex-1 items-start gap-2 rounded-[12px] border px-3 py-2.5 text-left",
                late && "border-priority-critical/40 bg-priority-critical-bg",
                blocked && !late && "bg-rodeo-chip border-rodeo-line",
              )}
            >
              {done && (
                <Check
                  className="text-state-completed mt-0.5 size-3.5 shrink-0"
                  strokeWidth={3}
                />
              )}
              {late && !done && (
                <TriangleAlert
                  className="text-priority-critical mt-0.5 size-3.5 shrink-0"
                  strokeWidth={2.5}
                />
              )}
              {blocked && !done && !late && (
                <Lock
                  className="text-rodeo-ink-soft mt-0.5 size-3.5 shrink-0"
                  strokeWidth={2.5}
                />
              )}
              <div className="min-w-0">
                <p className="font-display text-rodeo-ink-soft text-[10px] tracking-[0.16em]">
                  {offsetLabel(task.offsetDays)}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[13px] leading-snug",
                    done && "text-state-completed",
                    late && "text-priority-critical",
                    blocked && !late && "text-rodeo-ink-soft",
                  )}
                >
                  {task.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-rodeo-ink-soft mt-2.5 text-[13px]">{note}</p>
    </div>
  );
}
