"use client";

import { Archive, ArchiveRestore, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { NewEventDialog } from "@/features/events/components/new-event-dialog";
import type { EventRecord } from "@/features/events/data/demo-event";
import { useEventsStore } from "@/features/events/store/events-store";
import { daysFromToday, formatLongDate } from "@/lib/date";
import { applyBlocking, isClosed, isOverdue, summarize } from "@/lib/tasks";
import { cn } from "@/lib/utils";

/** Solo Luis puede eliminar eventos por completo (no solo archivarlos). */
const EVENT_DELETE_PERSON_ID = "luis";

export function EventsListView({ currentUserId }: { currentUserId: string }) {
  const { events, setEventArchived, deleteEvent } = useEventsStore();
  const [newEventOpen, setNewEventOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [eventPendingDelete, setEventPendingDelete] =
    useState<EventRecord | null>(null);
  const canDeleteEvents = currentUserId === EVENT_DELETE_PERSON_ID;

  const activeEvents = events.filter((event) => !event.archived);
  const archivedEvents = events.filter((event) => event.archived);

  const openTasksTotal = activeEvents.reduce(
    (sum, event) => sum + event.tasks.filter((t) => !isClosed(t)).length,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pt-[18px] pb-[110px]">
      <span className="font-display text-[17px] font-bold tracking-[0.16em] uppercase">
        RODEO
      </span>
      <h1 className="mt-[22px] font-display text-[36px] leading-none font-semibold tracking-[0.02em] uppercase">
        Eventos
      </h1>
      <p className="mt-[9px] text-[15px] leading-normal text-rodeo-ink-soft">
        {activeEvents.length} evento{activeEvents.length === 1 ? "" : "s"} en
        producción · {openTasksTotal} tareas abiertas.
      </p>

      <button
        type="button"
        onClick={() => setNewEventOpen(true)}
        className="mt-[18px] w-full rounded-[14px] border border-dashed border-[#cdc2ae] bg-[#f3efe6] p-[15px] text-[15px] font-semibold text-rodeo-ink"
      >
        + Nuevo evento
      </button>

      {activeEvents.length === 0 ? (
        <p className="mt-6 text-sm text-rodeo-ink-soft">
          Todavía no hay eventos activos. Créalo con &ldquo;+ Nuevo
          evento&rdquo;.
        </p>
      ) : (
        <div className="mt-[18px] flex flex-col gap-3">
          {activeEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onArchive={() => setEventArchived(event.id, true)}
              onDelete={
                canDeleteEvents ? () => setEventPendingDelete(event) : undefined
              }
            />
          ))}
        </div>
      )}

      {archivedEvents.length > 0 && (
        <div className="mt-[26px] rounded-2xl bg-[#f3efe6] p-[18px]">
          <p className="rodeo-eyebrow">Archivados · {archivedEvents.length}</p>
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="mt-2.5 min-h-11 rounded-[10px] border border-rodeo-line bg-card px-3.5 py-2 text-sm text-rodeo-ink"
          >
            {showArchived ? "Ocultar archivados" : "Ver archivados"}
          </button>
          {showArchived && (
            <div className="mt-3.5 flex flex-col">
              {archivedEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 border-t border-rodeo-line py-2.5"
                >
                  <Link href={`/events/${event.id}`} className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-rodeo-ink-soft">
                      {event.name}
                    </p>
                    <p className="text-xs text-rodeo-ink-soft">
                      {formatLongDate(event.date)}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEventArchived(event.id, false)}
                    aria-label={`Restaurar ${event.name}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-rodeo-line bg-white px-3 py-1.5 text-xs font-semibold text-rodeo-ink-soft"
                  >
                    <ArchiveRestore className="size-3.5" />
                    Restaurar
                  </button>
                  {canDeleteEvents && (
                    <button
                      type="button"
                      onClick={() => setEventPendingDelete(event)}
                      aria-label={`Eliminar ${event.name} para siempre`}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-transparent text-priority-critical"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <NewEventDialog open={newEventOpen} onOpenChange={setNewEventOpen} />

      <ConfirmDialog
        open={Boolean(eventPendingDelete)}
        onOpenChange={(open) => {
          if (!open) setEventPendingDelete(null);
        }}
        title="Eliminar evento para siempre"
        description={
          eventPendingDelete
            ? `¿Seguro que quieres eliminar «${eventPendingDelete.name}»? Se borrarán también todas sus tareas, reglas y gastos. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar para siempre"
        onConfirm={() => {
          if (!eventPendingDelete) return;
          deleteEvent(eventPendingDelete.id);
          toast("Evento eliminado.");
        }}
      />
    </main>
  );
}

function EventCard({
  event,
  onArchive,
  onDelete,
}: {
  event: EventRecord;
  onArchive: () => void;
  onDelete?: () => void;
}) {
  const tasks = applyBlocking(event.tasks);
  const summary = summarize(tasks);
  const late = tasks.filter(isOverdue).length;
  const days = daysFromToday(event.date);
  const countdown =
    days > 0 ? `T-${days}` : days === 0 ? "HOY" : `T+${Math.abs(days)}`;

  return (
    <article className="rounded-[18px] border border-rodeo-card-line bg-card p-5 shadow-[0_1px_2px_rgba(27,23,18,0.04)]">
      <Link href={`/events/${event.id}`} className="block">
        <div className="flex items-start justify-between gap-3.5">
          <div className="min-w-0">
            <h2 className="truncate font-display text-[24px] leading-[1.05] font-semibold tracking-[0.02em] uppercase">
              {event.name}
            </h2>
            <p className="mt-1.5 text-sm text-rodeo-ink-soft">
              {formatLongDate(event.date)}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-[11px] py-1 font-display text-sm tracking-[0.08em]",
              days <= 21
                ? "bg-primary text-primary-foreground"
                : "bg-rodeo-sand text-rodeo-ink-soft",
            )}
          >
            {countdown}
          </span>
        </div>

        <div className="mt-[18px] flex items-center gap-3">
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-rodeo-sand">
            <div
              className={cn(
                "h-full rounded-full",
                late > 0 ? "bg-rodeo-gold" : "bg-state-completed",
              )}
              style={{ width: `${summary.readiness}%` }}
            />
          </div>
          <span className="font-display text-[20px]">{summary.readiness}%</span>
        </div>

        <p className="mt-2.5 text-[13px] leading-normal text-rodeo-ink-soft">
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

      <div className="mt-3 flex items-center justify-end gap-4">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar ${event.name} para siempre`}
            className="flex min-h-11 items-center gap-1.5 text-xs font-semibold text-priority-critical"
          >
            <Trash2 className="size-3.5" />
            Eliminar
          </button>
        )}
        <button
          type="button"
          onClick={onArchive}
          aria-label={`Archivar ${event.name}`}
          className="flex min-h-11 items-center gap-1.5 text-xs font-semibold text-rodeo-ink-soft hover:text-rodeo-ink"
        >
          <Archive className="size-3.5" />
          Archivar
        </button>
      </div>
    </article>
  );
}
