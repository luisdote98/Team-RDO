import { cn } from "@/lib/utils";

export type PromoterRosterRow = {
  id: string;
  name: string;
  role: string;
  color: string;
  bgColor: string;
  open: number;
  late: number;
};

export function PromoterRoster({ rows }: { rows: PromoterRosterRow[] }) {
  const maxLoad = Math.max(1, ...rows.map((row) => row.open));

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

          <div className="mt-4 flex items-center gap-3">
            <div className="bg-rodeo-sand h-2 flex-1 overflow-hidden rounded-full">
              <div
                className={cn(
                  "h-full rounded-full",
                  row.late > 0 ? "bg-rodeo-gold" : "bg-state-completed",
                )}
                style={{ width: `${Math.round((row.open / maxLoad) * 100)}%` }}
              />
            </div>
            <span className="text-rodeo-ink-soft shrink-0 text-[13px]">
              {row.open} abiertas{row.late > 0 ? ` · ${row.late} tarde` : ""}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
