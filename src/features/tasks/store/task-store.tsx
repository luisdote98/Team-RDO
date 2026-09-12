"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import type {
  DemoCategory,
  DemoMember,
} from "@/features/events/data/demo-event";
import { useEventsStore } from "@/features/events/store/events-store";
import { toTaskViews, type TaskView } from "@/features/tasks/types";
import { applyBlocking, toggleDoneResult, type TaskLike } from "@/lib/tasks";
import type { TaskPriority, TaskStatus } from "@/types/domain";

export type NewTaskInput = {
  title: string;
  categoryId: string;
  assigneeId: string;
  priority: TaskPriority;
  dueDate: Date;
  offsetDays: number;
};

type TaskStoreValue = {
  tasks: TaskLike[];
  views: TaskView[];
  viewById: Map<string, TaskView>;
  categories: DemoCategory[];
  people: DemoMember[];
  updateStatus: (taskId: string, status: TaskStatus) => void;
  updateNotes: (taskId: string, notes: string) => void;
  updateAssignee: (taskId: string, assigneeId: string) => void;
  updateDueDate: (taskId: string, dueDate: Date) => void;
  /**
   * Centraliza la regla de completar/reabrir: si la tarea está bloqueada no
   * hace nada (y avisa por qué); si está completada la reabre; si no, la
   * completa. Lanza el toast correspondiente en los tres casos.
   */
  toggleDone: (taskId: string) => void;
  addTask: (input: NewTaskInput) => void;
  selectedTaskId: string | null;
  selectTask: (taskId: string | null) => void;
  isNewTaskOpen: boolean;
  setNewTaskOpen: (open: boolean) => void;
};

const TaskStoreContext = createContext<TaskStoreValue | null>(null);

/**
 * Vista de un evento concreto sobre el store global de eventos.
 *
 * No guarda tareas por su cuenta: lee y escribe siempre en
 * <EventsStoreProvider>, así que "Mis tareas" (que cruza varios eventos) y
 * esta vista por evento ven siempre los mismos datos.
 */
export function TaskStoreProvider({
  eventId,
  categories,
  people,
  children,
}: {
  eventId: string;
  categories: DemoCategory[];
  people: DemoMember[];
  children: React.ReactNode;
}) {
  const {
    events,
    updateTaskStatus,
    updateTaskNotes,
    updateTaskAssignee,
    updateTaskDueDate,
    addTask: globalAddTask,
  } = useEventsStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskOpen, setNewTaskOpen] = useState(false);

  const rawTasks = useMemo(
    () => events.find((event) => event.id === eventId)?.tasks ?? [],
    [events, eventId],
  );

  const tasks = useMemo(() => applyBlocking(rawTasks), [rawTasks]);
  const views = useMemo(
    () => toTaskViews(tasks, categories, people),
    [tasks, categories, people],
  );
  const viewById = useMemo(
    () => new Map(views.map((view) => [view.task.id, view])),
    [views],
  );

  const toggleDone = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const result = toggleDoneResult(task, tasks);
      if (result.action !== "blocked") {
        updateTaskStatus(eventId, taskId, result.nextStatus);
      }
      toast(result.message);
    },
    [tasks, eventId, updateTaskStatus],
  );

  const value = useMemo<TaskStoreValue>(
    () => ({
      tasks,
      views,
      viewById,
      categories,
      people,
      updateStatus: (taskId, status) =>
        updateTaskStatus(eventId, taskId, status),
      updateNotes: (taskId, notes) => updateTaskNotes(eventId, taskId, notes),
      updateAssignee: (taskId, assigneeId) =>
        updateTaskAssignee(eventId, taskId, assigneeId),
      updateDueDate: (taskId, dueDate) =>
        updateTaskDueDate(eventId, taskId, dueDate),
      toggleDone,
      addTask: (input) => globalAddTask(eventId, input),
      selectedTaskId,
      selectTask: setSelectedTaskId,
      isNewTaskOpen,
      setNewTaskOpen,
    }),
    [
      tasks,
      views,
      viewById,
      categories,
      people,
      eventId,
      updateTaskStatus,
      updateTaskNotes,
      updateTaskAssignee,
      updateTaskDueDate,
      toggleDone,
      globalAddTask,
      selectedTaskId,
      isNewTaskOpen,
    ],
  );

  return (
    <TaskStoreContext.Provider value={value}>
      {children}
    </TaskStoreContext.Provider>
  );
}

export function useTaskStore(): TaskStoreValue {
  const ctx = useContext(TaskStoreContext);
  if (!ctx) {
    throw new Error("useTaskStore debe usarse dentro de <TaskStoreProvider>");
  }
  return ctx;
}
