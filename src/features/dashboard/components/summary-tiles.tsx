import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SummaryTiles({
  eventId,
  overdue,
  blocked,
  inProgress,
}: {
  eventId: string;
  overdue: number;
  blocked: number;
  inProgress: number;
}) {
  const base = ROUTES.eventTasks(eventId);

  const tiles = [
    {
      href: `${base}?filter=atrasadas`,
      value: overdue,
      label: "Atrasadas",
      className: "bg-priority-critical-bg text-priority-critical",
    },
    {
      href: `${base}?filter=bloqueadas`,
      value: blocked,
      label: "Bloqueadas",
      className: "bg-rodeo-chip text-[#6b5a3e]",
    },
    {
      href: `${base}?filter=todas`,
      value: inProgress,
      label: "En curso",
      className: "bg-state-in-progress-bg text-state-in-progress",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {tiles.map((tile) => (
        <Link
          key={tile.label}
          href={tile.href}
          className={cn("rounded-[14px] p-3.5 transition-opacity hover:opacity-90", tile.className)}
        >
          <p className="font-display text-[30px] leading-none">{tile.value}</p>
          <p className="mt-1.5 text-xs font-semibold">{tile.label}</p>
        </Link>
      ))}
    </div>
  );
}
