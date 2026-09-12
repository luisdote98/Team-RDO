import Link from "next/link";

import { ROUTES } from "@/lib/constants";
import { daysFromToday, formatLongDate } from "@/lib/date";

export function EventHeader({
  name,
  date,
  sessionSlot,
}: {
  name: string;
  date: Date;
  sessionSlot?: React.ReactNode;
}) {
  const days = daysFromToday(date);
  const countdown =
    days > 0 ? `T-${days}` : days === 0 ? "HOY" : `T+${Math.abs(days)}`;

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Link href={ROUTES.events} className="text-rodeo-gold-ink text-sm">
          ‹ Eventos
        </Link>
        <h1 className="font-display mt-3 text-[30px] leading-none font-semibold tracking-[0.02em] uppercase">
          {name}
        </h1>
        <div className="mt-2.5 flex items-center gap-2.5">
          <span className="text-rodeo-ink-soft text-sm">
            {formatLongDate(date)}
          </span>
          <span className="bg-primary text-primary-foreground font-display rounded-full px-2.5 py-0.5 text-[13px] tracking-[0.1em]">
            {countdown}
          </span>
        </div>
      </div>
      {sessionSlot}
    </div>
  );
}
