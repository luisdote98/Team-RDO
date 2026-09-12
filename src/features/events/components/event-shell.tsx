"use client";

import Link from "next/link";

import { EventHeader } from "@/features/events/components/event-header";
import { EventNav } from "@/features/events/components/event-nav";
import { demoCategories, demoMembers } from "@/features/events/data/demo-event";
import { useEventsStore } from "@/features/events/store/events-store";
import { NewTaskDialog } from "@/features/tasks/components/new-task-dialog";
import { NewTaskFab } from "@/features/tasks/components/new-task-fab";
import { TaskDetailDialog } from "@/features/tasks/components/task-detail-dialog";
import { TaskStoreProvider } from "@/features/tasks/store/task-store";
import { ROUTES } from "@/lib/constants";

export function EventShell({
  eventId,
  currentUserId,
  sessionSlot,
  children,
}: {
  eventId: string;
  currentUserId: string;
  sessionSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { events } = useEventsStore();
  const event = events.find((item) => item.id === eventId);

  if (!event) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 px-5 py-24 text-center">
        <p className="rodeo-eyebrow">Evento no encontrado</p>
        <p className="text-sm text-muted-foreground">
          Este evento no existe en esta sesión del navegador — recuerda que los
          eventos creados aquí todavía no se guardan de verdad (fase 1
          pendiente) y desaparecen al recargar la página.
        </p>
        <Link href={ROUTES.events} className="text-rodeo-gold underline">
          Ver todos los eventos
        </Link>
      </div>
    );
  }

  return (
    <TaskStoreProvider
      eventId={eventId}
      categories={demoCategories}
      people={demoMembers}
    >
      <div className="mx-auto w-full max-w-4xl px-5 pt-[18px]">
        <EventHeader
          name={event.name}
          date={event.date}
          sessionSlot={sessionSlot}
        />
        <div className="mt-5">
          <EventNav eventId={eventId} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-5 pt-6 pb-[110px]">
        {children}
      </div>

      <TaskDetailDialog />
      <NewTaskDialog
        eventId={eventId}
        eventName={event.name}
        eventDate={event.date}
        currentUserId={currentUserId}
      />
      <NewTaskFab />
    </TaskStoreProvider>
  );
}
