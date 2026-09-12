"use client";

import Link from "next/link";
import { useState } from "react";

import { NewEventDialog } from "@/features/events/components/new-event-dialog";
import { useEventsStore } from "@/features/events/store/events-store";
import { daysFromToday, formatLongDate } from "@/lib/date";
import { applyBlocking, isClosed, isOverdue, summarize } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export function EventsListView() {
  const { events } = useEventsStore();
  const [newEventOpen, setNewEventOpen] = useState(false);

  const openTasksTotal = events.reduce(
    (sum, event) => sum + event.tasks.filter((t) => !isClosed(t)).length,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pt-[18px] pb-[110px]">
      <span className="font-display text-[17px] font-bold tracking-[0.16em] uppercase">
        RODEO
      </span>
      <h1 className="font-display mt-[22px] text-[36px] leading-none font-semibold tracking-[0.02em] uppercase">
        Eventos
      </h1>
      <p className="text-rodeo-ink-soft mt-[9px] text-[15px] leading-normal">
        {events.length} evento{events.length === 1 ? "" : "s"} en producción ·{" "}
        {openTasksTotal} tareas abiertas.
      </p>

      <button
        type="button"
        onClick={() => setNewEventOpen(true)}
        className="border-[#cdc2ae] bg-[#f3efe6] text-rodeo-ink mt-[18px] w-full rounded-[14px] border border-dashed p-[15px] text-[15px] font-semibold"
      >
        + Nuevo evento
      </button>

      {events.length === 0 ? (
        <p className="text-rodeo-ink-soft mt-6 text-sm">
          Todavía no hay eventos. Créalo con &ldquo;+ Nuevo evento&rdquo;.
        </p>
      ) : (
        <div className="mt-[18px] flex flex-col gap-3">
          {events.map((event) => {
            const tasks = applyBlocking(event.tasks);
            const summary = summarize(tasks);
            const late = tasks.filter(isOverdue).length;
            const days = daysFromToday(event.date);
            const countdown =
              days > 0
                ? `T-${days}`
                : days === 0
                  ? "HOY"
                  : `T+${Math.abs(days)}`;

            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="border-rodeo-card-line bg-card rounded-[18px] border p-5 shadow-[0_1px_2px_rgba(27,23,18,0.04)]"
              >
                <div className="flex items-start justify-between gap-3.5">
                  <div className="min-w-0">
                    <h2 className="font-display truncate text-[24px] leading-[1.05] font-semibold tracking-[0.02em] uppercase">
                      {event.name}
                    </h2>
                    <p className="text-rodeo-ink-soft mt-1.5 text-sm">
                      {formatLongDate(event.date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "font-display shrink-0 rounded-full px-[11px] py-1 text-sm tracking-[0.08em]",
                      days <= 21
                        ? "bg-primary text-primary-foreground"
                        : "bg-rodeo-sand text-rodeo-ink-soft",
                    )}
                  >
                    {countdown}
                  </span>
                </div>

                <div className="mt-[18px] flex items-center gap-3">
                  <div className="bg-rodeo-sand h-2.5 flex-1 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        late > 0 ? "bg-rodeo-gold" : "bg-state-completed",
                      )}
                      style={{ width: `${summary.readiness}%` }}
                    />
                  </div>
                  <span className="font-display text-[20px]">
                    {summary.readiness}%
                  </span>
                </div>

                <p className="text-rodeo-ink-soft mt-2.5 text-[13px] leading-normal">
                  {summary.total === 0 ? (
                    "Sin tareas todavía"
                  ) : (
                    <>
                      {summary.completed} de {summary.total} hechas
                      {late > 0 ? (
                        <span className="text-priority-critical">
                          {" "}
                          · {late} atrasada{late > 1 ? "s" : ""}
                        </span>
                      ) : (
                        " · al día"
                      )}
                    </>
                  )}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <NewEventDialog open={newEventOpen} onOpenChange={setNewEventOpen} />
    </main>
  );
}
