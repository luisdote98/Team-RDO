import Link from "next/link";

import { cn } from "@/lib/utils";

export type MemberWorkloadRow = {
  id: string;
  name: string;
  role: string;
  color: string;
  bgColor: string;
  open: number;
  done: number;
  overdue: number;
};

export function MemberWorkload({
  rows,
  href,
}: {
  rows: MemberWorkloadRow[];
  href: (memberId: string) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <article
          key={row.id}
          className="border-rodeo-card-line bg-card rounded-[18px] border p-5"
        >
          <div className="flex items-center gap-3">
            <span
              className="font-display grid size-11 shrink-0 place-items-center rounded-full text-xl"
              style={{ backgroundColor: row.bgColor, color: row.color }}
              aria-hidden="true"
            >
              {row.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h3 className="font-display truncate text-[22px] leading-tight font-semibold uppercase">
                {row.name}
              </h3>
              <p className="text-rodeo-ink-soft text-[13px] leading-snug">
                {row.role}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-6">
            <Stat value={row.open} label="Abiertas" />
            <Stat
              value={row.overdue}
              label="Atrasadas"
              tone="text-priority-critical"
            />
            <Stat value={row.done} label="Hechas" tone="text-state-completed" />
          </div>

          <Link
            href={href(row.id)}
            className="border-rodeo-line text-rodeo-ink mt-4 inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-semibold"
          >
            Ver sus tareas
          </Link>
        </article>
      ))}
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone?: string;
}) {
  return (
    <div>
      <p className={cn("font-display text-[24px] leading-none", tone)}>
        {value}
      </p>
      <p className="text-rodeo-ink-soft mt-1 text-[11px] tracking-wide uppercase">
        {label}
      </p>
    </div>
  );
}
