import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import type { TaskLike } from "@/lib/tasks";
import type { TaskPriority, TaskStatus } from "@/types/domain";
import type {
  EventChain,
  EventRecord,
  EventRule,
  Expense,
} from "@/features/events/data/demo-event";
import type { TaskTemplate } from "@/features/events/store/events-store";

/** `'2026-09-28'` (columna `date` de Postgres) → `Date` local a medianoche. */
function toLocalDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00`);
}

/**
 * Todos los eventos con sus tareas/normas/cadenas/gastos anidados, en la
 * misma forma que consumía el store cuando vivía en memoria — así los
 * componentes que ya leen `EventRecord` no necesitan cambios.
 */
export async function getEvents(): Promise<EventRecord[]> {
  const supabase = createServiceClient();

  const [
    { data: events },
    { data: tasks },
    { data: blockers },
    { data: rules },
    { data: chains },
    { data: chainTasks },
    { data: expenses },
  ] = await Promise.all([
    supabase.from("events").select("*").order("created_at"),
    supabase.from("tasks").select("*"),
    supabase.from("task_blockers").select("*"),
    supabase.from("event_rules").select("*"),
    supabase.from("event_chains").select("*"),
    supabase.from("chain_tasks").select("*").order("position"),
    supabase.from("expenses").select("*"),
  ]);

  const blockersByTask = new Map<string, string[]>();
  for (const row of blockers ?? []) {
    const list = blockersByTask.get(row.task_id) ?? [];
    list.push(row.blocks_on);
    blockersByTask.set(row.task_id, list);
  }

  const tasksByEvent = new Map<string, TaskLike[]>();
  for (const row of tasks ?? []) {
    const list = tasksByEvent.get(row.event_id) ?? [];
    list.push({
      id: row.id,
      title: row.title,
      categoryId: row.category_id,
      assigneeId: row.assignee_id,
      priority: row.priority as TaskPriority,
      status: row.status as TaskStatus,
      offsetDays: row.offset_days,
      dueDate: toLocalDate(row.due_date),
      isMilestone: row.is_milestone,
      blockedBy: blockersByTask.get(row.id),
      notes: row.notes ?? undefined,
    });
    tasksByEvent.set(row.event_id, list);
  }

  const rulesByEvent = new Map<string, EventRule[]>();
  for (const row of rules ?? []) {
    const list = rulesByEvent.get(row.event_id) ?? [];
    list.push({
      id: row.id,
      categoryId: row.category_id,
      title: row.title,
      detail: row.detail,
      pending: row.pending,
    });
    rulesByEvent.set(row.event_id, list);
  }

  const taskIdsByChain = new Map<string, string[]>();
  for (const row of chainTasks ?? []) {
    const list = taskIdsByChain.get(row.chain_id) ?? [];
    list.push(row.task_id);
    taskIdsByChain.set(row.chain_id, list);
  }

  const chainsByEvent = new Map<string, EventChain[]>();
  for (const row of chains ?? []) {
    const list = chainsByEvent.get(row.event_id) ?? [];
    list.push({
      id: row.id,
      note: row.note,
      taskIds: taskIdsByChain.get(row.id) ?? [],
    });
    chainsByEvent.set(row.event_id, list);
  }

  const expensesByEvent = new Map<string, Expense[]>();
  for (const row of expenses ?? []) {
    const list = expensesByEvent.get(row.event_id) ?? [];
    list.push({
      id: row.id,
      personId: row.person_id,
      amount: Number(row.amount),
      concept: row.concept,
      categoryId: row.category_id ?? undefined,
      date: toLocalDate(row.date),
    });
    expensesByEvent.set(row.event_id, list);
  }

  return (events ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    date: toLocalDate(row.date),
    venue: row.venue,
    city: row.city,
    capacity: row.capacity,
    format: row.format,
    archived: row.archived,
    tasks: tasksByEvent.get(row.id) ?? [],
    rules: rulesByEvent.get(row.id) ?? [],
    chains: chainsByEvent.get(row.id) ?? [],
    expenses: expensesByEvent.get(row.id) ?? [],
  }));
}

export async function getTaskTemplates(): Promise<TaskTemplate[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("task_templates").select("*");

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    assigneeId: row.assignee_id,
    priority: row.priority as TaskPriority,
    offsetDays: row.offset_days,
    isMilestone: row.is_milestone,
  }));
}
