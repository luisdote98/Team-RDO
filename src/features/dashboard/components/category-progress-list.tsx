import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import type { CategoryProgress } from "@/lib/tasks";

export type CategoryProgressRow = CategoryProgress & {
  name: string;
  color: string;
};

export function CategoryProgressList({
  rows,
  eventId,
}: {
  rows: CategoryProgressRow[];
  eventId: string;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((row) => (
        <Link
          key={row.categoryId}
          href={`${ROUTES.eventTasks(eventId)}?category=${row.categoryId}`}
          className="block"
        >
          <div className="mb-1.5 flex items-baseline justify-between text-sm">
            <span>
              {row.name}
              {row.overdue > 0 && (
                <span className="text-priority-critical">
                  {" "}
                  · {row.overdue} atrasada{row.overdue > 1 ? "s" : ""}
                </span>
              )}
            </span>
            <span className="text-rodeo-ink-soft">
              {row.completed}/{row.total}
            </span>
          </div>
          <div className="bg-rodeo-sand h-1.5 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full"
              style={{ width: `${row.percent}%`, backgroundColor: row.color }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
