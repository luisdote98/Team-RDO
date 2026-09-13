"use server";

import { createServiceClient } from "@/lib/supabase/service";
import type { TaskLike } from "@/lib/tasks";
import type { TaskStatus } from "@/types/domain";
import type {
  ExpenseInput,
  RuleInput,
  TaskTemplate,
} from "@/features/events/store/events-store";

/**
 * Persistencia para el store de eventos: cada función aquí es el reflejo en
 * Supabase de un mutador de `events-store.tsx`. El store sigue calculando
 * los datos (ids, fechas, tareas por defecto) exactamente igual que antes;
 * estas funciones solo los guardan. Si una falla, el store revierte su
 * estado optimista y avisa con un toast — ver events-store.tsx.
 */

async function insertTasks(eventId: string, tasks: TaskLike[]) {
  if (tasks.length === 0) return;
  const supabase = createServiceClient();

  const { error } = await supabase.from("tasks").insert(
    tasks.map((task) => ({
      id: task.id,
      event_id: eventId,
      title: task.title,
      category_id: task.categoryId,
      assignee_id: task.assigneeId,
      priority: task.priority,
      status: task.status,
      offset_days: task.offsetDays,
      due_date: task.dueDate,
      is_milestone: task.isMilestone ?? false,
      notes: task.notes ?? null,
    })),
  );
  if (error) throw error;

  const blockerRows = tasks.flatMap((task) =>
    (task.blockedBy ?? []).map((blocksOn) => ({
      task_id: task.id,
      blocks_on: blocksOn,
    })),
  );
  if (blockerRows.length > 0) {
    const { error: blockerError } = await supabase
      .from("task_blockers")
      .insert(blockerRows);
    if (blockerError) throw blockerError;
  }
}

export async function createEvent(event: {
  id: string;
  name: string;
  date: Date;
  venue: string;
  city: string;
  capacity: number;
  format: string;
  tasks: TaskLike[];
}) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("events").insert({
    id: event.id,
    name: event.name,
    date: event.date,
    venue: event.venue,
    city: event.city,
    capacity: event.capacity,
    format: event.format,
  });
  if (error) throw error;

  await insertTasks(event.id, event.tasks);
}

export async function setEventArchived(eventId: string, archived: boolean) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("events")
    .update({ archived })
    .eq("id", eventId);
  if (error) throw error;
}

export async function addTask(task: TaskLike & { eventId: string }) {
  await insertTasks(task.eventId, [task]);
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);
  if (error) throw error;
}

export async function updateTaskNotes(taskId: string, notes: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tasks")
    .update({ notes })
    .eq("id", taskId);
  if (error) throw error;
}

export async function updateTaskAssignee(taskId: string, assigneeId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tasks")
    .update({ assignee_id: assigneeId })
    .eq("id", taskId);
  if (error) throw error;
}

export async function updateTaskDueDate(taskId: string, dueDate: Date) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("tasks")
    .update({ due_date: dueDate })
    .eq("id", taskId);
  if (error) throw error;
}

export async function deleteTask(taskId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
}

export async function addEventRule(
  eventId: string,
  rule: { id: string } & RuleInput,
) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("event_rules").insert({
    id: rule.id,
    event_id: eventId,
    category_id: rule.categoryId,
    title: rule.title,
    detail: rule.detail,
    pending: rule.pending ?? false,
  });
  if (error) throw error;
}

export async function updateEventRule(ruleId: string, input: RuleInput) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("event_rules")
    .update({
      category_id: input.categoryId,
      title: input.title,
      detail: input.detail,
      pending: input.pending ?? false,
    })
    .eq("id", ruleId);
  if (error) throw error;
}

export async function addExpense(
  eventId: string,
  expense: { id: string } & ExpenseInput,
) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("expenses").insert({
    id: expense.id,
    event_id: eventId,
    person_id: expense.personId,
    amount: expense.amount,
    concept: expense.concept,
    category_id: expense.categoryId ?? null,
    date: expense.date,
  });
  if (error) throw error;
}

export async function deleteExpense(expenseId: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId);
  if (error) throw error;
}

export async function addTaskTemplate(template: TaskTemplate) {
  const supabase = createServiceClient();
  const { error } = await supabase.from("task_templates").insert({
    id: template.id,
    title: template.title,
    category_id: template.categoryId,
    assignee_id: template.assigneeId,
    priority: template.priority,
    offset_days: template.offsetDays,
    is_milestone: template.isMilestone ?? false,
  });
  if (error) throw error;
}
