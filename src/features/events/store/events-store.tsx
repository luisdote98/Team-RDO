"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";

import * as persist from "@/features/events/actions/persistence";
import {
  createDefaultTasks,
  type EventRecord,
  type EventRule,
  type Expense,
} from "@/features/events/data/demo-event";
import { dueDateFor } from "@/lib/date";
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

/**
 * Tarea guardada por el usuario para que salga siempre en los eventos
 * nuevos, además de la checklist básica de fábrica.
 */
export type TaskTemplate = {
  id: string;
  title: string;
  categoryId: string;
  assigneeId: string;
  priority: TaskPriority;
  offsetDays: number;
  isMilestone?: boolean;
};
export type TaskTemplateInput = Omit<TaskTemplate, "id">;

function newId(prefix: string): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}`;
}

/** Si `action` falla, revierte el estado optimista a `previous` y avisa. */
function persistOrRevert(
  action: Promise<void>,
  revert: () => void,
  errorMessage: string,
) {
  action.catch((err) => {
    console.error(err);
    revert();
    toast.error(errorMessage);
  });
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
  deleteTask: (eventId: string, taskId: string) => void;
  addEventRule: (eventId: string, input: RuleInput) => void;
  updateEventRule: (eventId: string, ruleId: string, input: RuleInput) => void;
  addExpense: (eventId: string, input: ExpenseInput) => void;
  deleteExpense: (eventId: string, expenseId: string) => void;
  setEventArchived: (eventId: string, archived: boolean) => void;
  deleteEvent: (eventId: string) => void;
  addTaskTemplate: (input: TaskTemplateInput) => void;
};

const EventsStoreContext = createContext<EventsStoreValue | null>(null);

/**
 * Fuente de verdad de todos los eventos, hidratada desde Supabase al cargar
 * la página (ver src/app/layout.tsx). Cada mutador actualiza el estado local
 * al instante (UI optimista) y en paralelo guarda el cambio de verdad en la
 * base de datos vía features/events/actions/persistence; si el guardado
 * falla, revierte el cambio local y avisa con un toast.
 */
export function EventsStoreProvider({
  initialEvents,
  initialTaskTemplates,
  children,
}: {
  initialEvents: EventRecord[];
  initialTaskTemplates: TaskTemplate[];
  children: React.ReactNode;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [taskTemplates, setTaskTemplates] =
    useState<TaskTemplate[]>(initialTaskTemplates);

  const addEvent = useCallback(
    (input: NewEventInput) => {
      const id = newId("evento");

      const customTasks: TaskLike[] = taskTemplates.map((template) => ({
        id: `${template.id}-${id}`,
        title: template.title,
        categoryId: template.categoryId,
        assigneeId: template.assigneeId,
        priority: template.priority,
        status: "pending",
        offsetDays: template.offsetDays,
        dueDate: dueDateFor(input.date, template.offsetDays),
        isMilestone: template.isMilestone,
      }));

      const tasks = [...createDefaultTasks(id, input.date), ...customTasks];
      const record: EventRecord = {
        id,
        ...input,
        tasks,
        rules: [],
        chains: [],
        expenses: [],
      };

      setEvents((prev) => [...prev, record]);
      persistOrRevert(
        persist.createEvent({ id, ...input, tasks }),
        () => setEvents((prev) => prev.filter((e) => e.id !== id)),
        "No se pudo guardar el evento. Intenta de nuevo.",
      );

      return id;
    },
    [taskTemplates],
  );

  const addTaskTemplate = useCallback((input: TaskTemplateInput) => {
    const template = { id: newId("plantilla"), ...input };
    setTaskTemplates((prev) => [...prev, template]);
    persistOrRevert(
      persist.addTaskTemplate(template),
      () =>
        setTaskTemplates((prev) => prev.filter((t) => t.id !== template.id)),
      "No se pudo guardar la plantilla. Intenta de nuevo.",
    );
  }, []);

  const updateTaskStatus = useCallback(
    (eventId: string, taskId: string, status: TaskStatus) => {
      let previous: EventRecord[] = [];
      setEvents((prev) => {
        previous = prev;
        return prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, status } : task,
                ),
              },
        );
      });
      persistOrRevert(
        persist.updateTaskStatus(taskId, status),
        () => setEvents(previous),
        "No se pudo guardar el estado de la tarea.",
      );
    },
    [],
  );

  const updateTaskNotes = useCallback(
    (eventId: string, taskId: string, notes: string) => {
      let previous: EventRecord[] = [];
      setEvents((prev) => {
        previous = prev;
        return prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, notes } : task,
                ),
              },
        );
      });
      persistOrRevert(
        persist.updateTaskNotes(taskId, notes),
        () => setEvents(previous),
        "No se pudieron guardar las notas.",
      );
    },
    [],
  );

  const updateTaskAssignee = useCallback(
    (eventId: string, taskId: string, assigneeId: string) => {
      let previous: EventRecord[] = [];
      setEvents((prev) => {
        previous = prev;
        return prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, assigneeId } : task,
                ),
              },
        );
      });
      persistOrRevert(
        persist.updateTaskAssignee(taskId, assigneeId),
        () => setEvents(previous),
        "No se pudo guardar el responsable.",
      );
    },
    [],
  );

  const updateTaskDueDate = useCallback(
    (eventId: string, taskId: string, dueDate: Date) => {
      let previous: EventRecord[] = [];
      setEvents((prev) => {
        previous = prev;
        return prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                tasks: event.tasks.map((task) =>
                  task.id === taskId ? { ...task, dueDate } : task,
                ),
              },
        );
      });
      persistOrRevert(
        persist.updateTaskDueDate(taskId, dueDate),
        () => setEvents(previous),
        "No se pudo guardar la nueva fecha.",
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
    persistOrRevert(
      persist.addTask({ ...newTask, eventId }),
      () =>
        setEvents((prev) =>
          prev.map((event) =>
            event.id !== eventId
              ? event
              : {
                  ...event,
                  tasks: event.tasks.filter((task) => task.id !== id),
                },
          ),
        ),
      "No se pudo guardar la tarea. Intenta de nuevo.",
    );
  }, []);

  const deleteTask = useCallback((eventId: string, taskId: string) => {
    let previous: EventRecord[] = [];
    setEvents((prev) => {
      previous = prev;
      return prev.map((event) =>
        event.id !== eventId
          ? event
          : { ...event, tasks: event.tasks.filter((t) => t.id !== taskId) },
      );
    });
    persistOrRevert(
      persist.deleteTask(taskId),
      () => setEvents(previous),
      "No se pudo eliminar la tarea. Intenta de nuevo.",
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
    persistOrRevert(
      persist.addEventRule(eventId, rule),
      () =>
        setEvents((prev) =>
          prev.map((event) =>
            event.id !== eventId
              ? event
              : {
                  ...event,
                  rules: event.rules.filter((r) => r.id !== rule.id),
                },
          ),
        ),
      "No se pudo guardar la norma. Intenta de nuevo.",
    );
  }, []);

  const updateEventRule = useCallback(
    (eventId: string, ruleId: string, input: RuleInput) => {
      let previous: EventRecord[] = [];
      setEvents((prev) => {
        previous = prev;
        return prev.map((event) =>
          event.id !== eventId
            ? event
            : {
                ...event,
                rules: event.rules.map((rule) =>
                  rule.id === ruleId ? { ...rule, ...input } : rule,
                ),
              },
        );
      });
      persistOrRevert(
        persist.updateEventRule(ruleId, input),
        () => setEvents(previous),
        "No se pudo guardar la norma. Intenta de nuevo.",
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
    persistOrRevert(
      persist.addExpense(eventId, expense),
      () =>
        setEvents((prev) =>
          prev.map((event) =>
            event.id !== eventId
              ? event
              : {
                  ...event,
                  expenses: event.expenses.filter((e) => e.id !== expense.id),
                },
          ),
        ),
      "No se pudo guardar el gasto. Intenta de nuevo.",
    );
  }, []);

  const deleteExpense = useCallback((eventId: string, expenseId: string) => {
    let previous: EventRecord[] = [];
    setEvents((prev) => {
      previous = prev;
      return prev.map((event) =>
        event.id !== eventId
          ? event
          : {
              ...event,
              expenses: event.expenses.filter((e) => e.id !== expenseId),
            },
      );
    });
    persistOrRevert(
      persist.deleteExpense(expenseId),
      () => setEvents(previous),
      "No se pudo eliminar el gasto. Intenta de nuevo.",
    );
  }, []);

  const setEventArchived = useCallback((eventId: string, archived: boolean) => {
    let previous: EventRecord[] = [];
    setEvents((prev) => {
      previous = prev;
      return prev.map((event) =>
        event.id !== eventId ? event : { ...event, archived },
      );
    });
    persistOrRevert(
      persist.setEventArchived(eventId, archived),
      () => setEvents(previous),
      "No se pudo guardar el cambio. Intenta de nuevo.",
    );
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    let previous: EventRecord[] = [];
    setEvents((prev) => {
      previous = prev;
      return prev.filter((event) => event.id !== eventId);
    });
    persistOrRevert(
      persist.deleteEvent(eventId),
      () => setEvents(previous),
      "No se pudo eliminar el evento. Intenta de nuevo.",
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
      deleteTask,
      addEventRule,
      updateEventRule,
      addExpense,
      deleteExpense,
      setEventArchived,
      deleteEvent,
      addTaskTemplate,
    }),
    [
      events,
      addEvent,
      updateTaskStatus,
      updateTaskNotes,
      updateTaskAssignee,
      updateTaskDueDate,
      addTask,
      deleteTask,
      addEventRule,
      updateEventRule,
      addExpense,
      deleteExpense,
      setEventArchived,
      deleteEvent,
      addTaskTemplate,
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
