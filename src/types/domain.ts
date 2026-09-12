/**
 * Tipos de dominio de RODEO Manager.
 *
 * Son la fuente de verdad en TypeScript de los enums que existen en Postgres.
 * A partir de la fase 1 se contrastan con `types/database.types.ts` (generado
 * por la CLI de Supabase) para que un cambio en la BD rompa la compilación.
 */

export const TASK_STATUSES = [
  "pending",
  "in_progress",
  "waiting",
  "blocked",
  "completed",
  "cancelled",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["critical", "high", "normal", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const USER_ROLES = ["admin", "member"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const EVENT_STATUSES = [
  "draft",
  "planning",
  "active",
  "completed",
  "cancelled",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_MEMBER_ROLES = ["lead", "member"] as const;
export type EventMemberRole = (typeof EVENT_MEMBER_ROLES)[number];

export const ACTIVITY_ACTIONS = [
  "event_created",
  "event_updated",
  "task_created",
  "task_updated",
  "task_status_changed",
  "task_assigned",
  "task_completed",
  "comment_added",
  "attachment_added",
  "task_deleted",
] as const;
export type ActivityAction = (typeof ACTIVITY_ACTIONS)[number];

/** Estados que cuentan como "tarea cerrada" en cualquier cálculo de progreso. */
export const CLOSED_TASK_STATUSES: readonly TaskStatus[] = [
  "completed",
  "cancelled",
];

/** Estados en los que la tarea sigue requiriendo trabajo del equipo. */
export const OPEN_TASK_STATUSES: readonly TaskStatus[] = [
  "pending",
  "in_progress",
  "waiting",
  "blocked",
];
