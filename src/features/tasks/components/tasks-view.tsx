"use client";

import { useSearchParams } from "next/navigation";

import {
  TaskBoard,
  type TaskFilterValue,
} from "@/features/tasks/components/task-board";

const VALID_FILTERS: readonly TaskFilterValue[] = [
  "todas",
  "atrasadas",
  "bloqueadas",
  "mias",
  "hechas",
];

export function TasksView({
  eventId,
  currentUserId,
}: {
  eventId: string;
  currentUserId: string;
}) {
  const searchParams = useSearchParams();

  const assignee = searchParams.get("assignee") ?? undefined;
  const category = searchParams.get("category") ?? undefined;

  const rawFilter = searchParams.get("filter");
  const filter = VALID_FILTERS.includes(rawFilter as TaskFilterValue)
    ? (rawFilter as TaskFilterValue)
    : undefined;

  return (
    <TaskBoard
      key={`${assignee ?? ""}-${category ?? ""}-${filter ?? ""}`}
      eventId={eventId}
      currentUserId={currentUserId}
      initialAssignee={assignee}
      initialCategory={category}
      initialFilter={filter}
    />
  );
}
