import { waitingOn, type TaskLike } from "@/lib/tasks";

export type TaskViewPerson = {
  id: string;
  name: string;
  color: string;
  bgColor: string;
};
export type TaskViewCategory = { id: string; name: string; color: string };

/** Tarea con sus relaciones ya resueltas, lista para pintar. */
export type TaskView = {
  task: TaskLike;
  category: TaskViewCategory;
  assignee: TaskViewPerson | null;
  /** Títulos de las tareas que la mantienen bloqueada. */
  waitingFor: string[];
};

export function toTaskViews(
  tasks: TaskLike[],
  categories: TaskViewCategory[],
  people: TaskViewPerson[],
): TaskView[] {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const personById = new Map(people.map((p) => [p.id, p]));

  const fallback: TaskViewCategory = {
    id: "none",
    name: "Sin categoría",
    color: "var(--muted-foreground)",
  };

  return tasks.map((task) => ({
    task,
    category: categoryById.get(task.categoryId) ?? fallback,
    assignee: personById.get(task.assigneeId) ?? null,
    waitingFor: waitingOn(task, tasks),
  }));
}
