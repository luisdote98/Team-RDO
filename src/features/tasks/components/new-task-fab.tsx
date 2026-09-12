"use client";

import { Plus } from "lucide-react";

import { useTaskStore } from "@/features/tasks/store/task-store";

/** Botón flotante constante: crear una tarea desde cualquier pantalla del evento. */
export function NewTaskFab() {
  const { setNewTaskOpen } = useTaskStore();

  return (
    <button
      type="button"
      onClick={() => setNewTaskOpen(true)}
      aria-label="Nueva tarea"
      className="fixed right-5 bottom-[98px] z-20 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(27,23,18,0.32)] transition-transform hover:scale-105 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-95"
    >
      <Plus className="size-7" strokeWidth={2.5} />
    </button>
  );
}
