"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type {
  EventRecord,
  EventRule,
  Expense,
} from "@/features/events/data/demo-event";
import type { TaskLike } from "@/lib/tasks";
import type { TaskPriority, TaskStatus } from "@/types/domain";

export type NewEventInput = {
  name: string;
  date: Date;
  venue: string;
  city: string;
  capacity: number;
  format: string;
};

export type NewTaskInput = {
  title: string;
  categoryId: string;
  assigneeId: string;
  priority: TaskPriority;
  dueDate: Date;
  offsetDays: number;
};

export type RuleInput = Omit<EventRule, "id">;
export type ExpenseInput = Omit<Expense, "id">;

/** Genera un id local; en la fase 1 lo sustituye la clave primaria de Postgres. */
function newId(prefix: string): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}`;
}

type EventsStoreValue = {
  events: EventRecord[];
  addEvent: (input: NewEventInput) => string;
  updateTaskStatus: (
    eventId: string,
    taskId: string,
    status: TaskStatus,
  ) => void;
  updateTaskNotes: (eventId: string, taskId: string, notes: string) => void;
  updateTaskAssignee: (
    eventId: string,
    taskId: string,
    assigneeId: string,
  ) => void;
  updateTaskDueDate: (eventId: string, taskId: string, dueDate: Date) => void;
  addTask: (eventId: string, input: NewTaskInput) => void;
  addEventRule: (eventId: string, input: RuleInput) => void;
  updateEventRule: (eventId: string, ruleId: string, input: RuleInput) => void;
  addExpense: (eventId: string, input: ExpenseInput) => void;
  deleteExpense: (eventId: string, expenseId: string) => void;
  setEventArchived: (eventId: string, archived: boolean) => void;
};

const EventsStoreContext = createContext<EventsStoreValue | null>(null);

/**
 * Fuente de verdad de TODOS los eventos en esta sesión del navegador.
 *
 * PROTOTIPO: vive en memoria de React. Un evento creado aquí (o una tarea
 * añadida a uno) desaparece al recargar la página — todavía no hay Supabase
 * conectado (fase 1). Ningún dato se guarda en localStorage.
 */
export function EventsStoreProvider({
  initialEvents,
  children,
}: {
  initialEvents: EventRecord[];
  children: React.ReactNode;
}) {
  const [events, setEvents] = useState(initialEvents);

  const addEvent = useCallback((input: NewEventInput) => {
    const id = newId("evento");

    setEvents((prev) => [
      ...prev,
      { id, ...input, tasks: [], rules: [], chains: [], expenses: [] },
    ]);
    return id;
  }, []);

  const updateTaskStatus = useCallback(
    (eventId: string, taskId: string, status: TaskStatus) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, status } : task,
                ),
              },
        ),
      );
    },
    [],
  );

  const updateTaskNotes = useCallback(
    (eventId: string, taskId: string, notes: string) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, notes } : task,
                ),
              },
        ),
      );
    },
    [],
  );

  const updateTaskAssignee = useCallback(
    (eventId: string, taskId: string, assigneeId: string) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, assigneeId } : task,
                ),
              },
        ),
      );
    },
    [],
  );

  const updateTaskDueDate = useCallback(
    (eventId: string, taskId: string, dueDate: Date) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, dueDate } : task,
                ),
              },
        ),
      );
    },
    [],
  );

  const addTask = useCallback((eventId: string, input: NewTaskInput) => {
    const id = newId("tarea");

    const newTask: TaskLike = {
      id,
      title: input.title,
      categoryId: input.categoryId,
      assigneeId: input.assigneeId,
      priority: input.priority,
      status: "pending",
      offsetDays: input.offsetDays,
      dueDate: input.dueDate,
    };

    setEvents((prev) =>
      prev.map((event) =>
        event.id !== eventId
          ? event
          : { ...event, tasks: [...event.tasks, newTask] },
      ),
    );
  }, []);

  const addEventRule = useCallback((eventId: string, input: RuleInput) => {
    const rule: EventRule = { id: newId("norma"), ...input };
    setEvents((prev) =>
      prev.map((event) =>
        event.id !== eventId
          ? event
          : { ...event, rules: [...event.rules, rule] },
      ),
    );
  }, []);

  const updateEventRule = useCallback(
    (eventId: string, ruleId: string, input: RuleInput) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                rules: event.rules.map((rule) =>
                  rule.id === ruleId ? { ...rule, ...input } : rule,
                ),
              },
        ),
      );
    },
    [],
  );

  const addExpense = useCallback((eventId: string, input: ExpenseInput) => {
    const expense: Expense = { id: newId("gasto"), ...input };
    setEvents((prev) =>
      prev.map((event) =>
        event.id !== eventId
          ? event
          : { ...event, expenses: [...event.expenses, expense] },
      ),
    );
  }, []);

  const deleteExpense = useCallback(
    (eventId: string, expenseId: string) => {
      setEvents((prev) =>
        prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                expenses: event.expenses.filter((e) => e.id !== expenseId),
              },
        ),
      );
    },
    [],
  );

  const setEventArchived = useCallback((eventId: string, archived: boolean) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id !== eventId ? event : { ...event, archived },
      ),
    );
  }, []);

  const value = useMemo<EventsStoreValue>(
    () => ({
      events,
      addEvent,
      updateTaskStatus,
      updateTaskNotes,
      updateTaskAssignee,
      updateTaskDueDate,
      addTask,
      addEventRule,
      updateEventRule,
      addExpense,
      deleteExpense,
      setEventArchived,
    }),
    [
      events,
      addEvent,
      updateTaskStatus,
      updateTaskNotes,
      updateTaskAssignee,
      updateTaskDueDate,
      addTask,
      addEventRule,
      updateEventRule,
      addExpense,
      deleteExpense,
      setEventArchived,
    ],
  );

  return (
    <EventsStoreContext.Provider value={value}>
      {children}
    </EventsStoreContext.Provider>
  );
}

export function useEventsStore(): EventsStoreValue {
  const ctx = useContext(EventsStoreContext);
  if (!ctx) {
    throw new Error(
      "useEventsStore debe usarse dentro de <EventsStoreProvider>",
    );
  }
  return ctx;
}
