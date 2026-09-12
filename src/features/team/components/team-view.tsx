"use client";

import { demoMembers } from "@/features/events/data/demo-event";
import { useEventsStore } from "@/features/events/store/events-store";
import { PromoterRoster } from "@/features/team/components/promoter-roster";
import { PromoterRules } from "@/features/team/components/promoter-rules";
import { isClosed, isOverdue } from "@/lib/tasks";

export function TeamView() {
  const { events } = useEventsStore();
  const allTasks = events.flatMap((event) => event.tasks);

  const rows = demoMembers.map((member) => {
    const open = allTasks.filter(
      (task) => task.assigneeId === member.id && !isClosed(task),
    );
    return {
      id: member.id,
      name: member.name,
      role: member.role,
      color: member.color,
      bgColor: member.bgColor,
      open: open.length,
      late: open.filter(isOverdue).length,
    };
  });

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pt-[18px] pb-[110px]">
      <span className="font-display text-[17px] font-bold tracking-[0.16em] uppercase">
        RODEO
      </span>
      <h1 className="font-display mt-[22px] text-[36px] leading-none font-semibold tracking-[0.02em] uppercase">
        Equipo
      </h1>
      <p className="text-rodeo-ink-soft mt-[9px] text-[15px] leading-normal">
        Los tres socios de la promotora y la carga de trabajo de todos los
        eventos.
      </p>

      <div className="mt-6">
        <PromoterRoster rows={rows} />
      </div>

      <h2 className="font-display mt-8 mb-3 text-[20px] font-semibold tracking-[0.06em] uppercase">
        Normativa de la promotora
      </h2>
      <PromoterRules />
    </main>
  );
}
