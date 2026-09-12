"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTaskStore } from "@/features/tasks/store/task-store";
import { ROUTES } from "@/lib/constants";
import { isClosed } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export function EventNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const { tasks } = useTaskStore();
  const openCount = tasks.filter((task) => !isClosed(task)).length;

  const tabs = [
    { href: ROUTES.event(eventId), label: "Resumen" },
    { href: ROUTES.eventTasks(eventId), label: `Tareas ${openCount}` },
    { href: ROUTES.eventCalendar(eventId), label: "Calendario" },
    { href: ROUTES.eventTeam(eventId), label: "Equipo" },
    { href: ROUTES.eventRules(eventId), label: "Normas" },
    { href: ROUTES.eventExpenses(eventId), label: "Gastos" },
  ];

  return (
    <nav
      className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5"
      aria-label="Secciones del evento"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "min-h-11 shrink-0 rounded-full px-3.5 py-2 font-display text-sm tracking-[0.08em] uppercase transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-rodeo-ink-soft hover:text-rodeo-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
