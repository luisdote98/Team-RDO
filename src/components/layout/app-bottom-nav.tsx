"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const DESTINATIONS = [
  { href: ROUTES.myTasks, label: "Mis tareas" },
  { href: ROUTES.events, label: "Eventos" },
  { href: ROUTES.team, label: "Equipo" },
];

/**
 * Barra de navegación fija, tres destinos globales. Sustituye a app-top-nav.
 * `/events/[eventId]/*` marca "Eventos" como activo.
 */
export function AppBottomNav() {
  const pathname = usePathname();

  if (pathname === ROUTES.login) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-rodeo-line bg-[rgba(250,247,240,0.97)] pt-[10px] pb-[calc(22px+env(safe-area-inset-bottom))] backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-around">
        {DESTINATIONS.map((item) => {
          const active =
            item.href === ROUTES.events
              ? pathname.startsWith("/events")
              : pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 min-w-11 items-center justify-center px-3 font-display text-[14px] tracking-[0.1em] uppercase transition-colors",
                active ? "text-rodeo-ink" : "text-rodeo-ink-soft",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
