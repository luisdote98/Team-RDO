"use client";

import { useParams } from "next/navigation";

import { useTaskStore } from "@/features/tasks/store/task-store";
import { MemberWorkload } from "@/features/team/components/member-workload";
import { ROUTES } from "@/lib/constants";
import { isOverdue } from "@/lib/tasks";

/** Resumen corto del rol de cada socio, solo para esta tarjeta (3.11). */
const ROLE_SUMMARY: Record<string, string> = {
  luis: "Sonido, DJ y cartelería",
  oliver: "Booking, villa, seguridad y barra",
  guille: "Entradas, invitados y contenido",
};

export default function EventTeamPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { tasks, people } = useTaskStore();

  const rows = people.map((member) => {
    const mine = tasks.filter((task) => task.assigneeId === member.id);
    const done = mine.filter((task) => task.status === "completed").length;
    return {
      id: member.id,
      name: member.name,
      role: ROLE_SUMMARY[member.id] ?? member.role,
      color: member.color,
      bgColor: member.bgColor,
      done,
      open: mine.length - done,
      overdue: mine.filter(isOverdue).length,
    };
  });

  return (
    <MemberWorkload
      rows={rows}
      href={(memberId) => `${ROUTES.eventTasks(eventId)}?assignee=${memberId}`}
    />
  );
}
