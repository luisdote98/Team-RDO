"use client";

import { addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { PillButton } from "@/components/common/pill-button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEventsStore } from "@/features/events/store/events-store";
import { ROUTES } from "@/lib/constants";
import { today } from "@/lib/date";

const DATE_OPTIONS = [
  { label: "En 1 mes", days: 30 },
  { label: "En 2 meses", days: 60 },
  { label: "En 3 meses", days: 90 },
];

export function NewEventDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const { addEvent } = useEventsStore();

  const [name, setName] = useState("");
  const [days, setDays] = useState(DATE_OPTIONS[0].days);

  const reset = () => {
    setName("");
    setDays(DATE_OPTIONS[0].days);
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const id = addEvent({
      name: trimmed,
      date: addDays(today(), days),
      venue: "Por confirmar",
      city: "Por confirmar",
      capacity: 0,
      format: "Por definir",
    });

    toast("Evento creado, todavía sin tareas.");
    reset();
    onOpenChange(false);
    router.push(ROUTES.event(id));
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-rodeo-bone mx-auto max-h-[88%] w-full max-w-4xl overflow-y-auto rounded-t-[22px] border-none p-0"
      >
        <div className="px-5 pt-3.5 pb-7">
          <div
            className="mx-auto mb-1 h-1 w-10 rounded-full bg-[#d8cfbd]"
            aria-hidden="true"
          />
          <SheetTitle className="font-display mt-3 text-[26px] font-semibold tracking-[0.03em] uppercase">
            Nuevo evento
          </SheetTitle>
          <SheetDescription className="text-rodeo-ink-soft mt-2 text-sm leading-relaxed">
            Se crea vacío: después le añades tareas por área.
          </SheetDescription>

          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre del evento"
            autoFocus
            className="border-rodeo-line mt-[18px] h-auto rounded-[14px] bg-white px-[15px] py-[15px] text-base"
          />

          <p className="rodeo-eyebrow mt-5 mb-2.5">Cuándo</p>
          <div className="flex flex-wrap gap-2">
            {DATE_OPTIONS.map((option) => (
              <PillButton
                key={option.label}
                label={option.label}
                active={days === option.days}
                onClick={() => setDays(option.days)}
              />
            ))}
          </div>

          <div className="mt-[26px] flex gap-2.5">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!name.trim()}
              className="bg-primary text-primary-foreground flex-1 rounded-[14px] py-[15px] text-base font-bold disabled:opacity-40"
            >
              Crear evento
            </button>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-rodeo-ink-soft rounded-[14px] border border-[#d8cfbd] px-5 py-[15px] text-base font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
