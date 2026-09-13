"use client";

import { addDays } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { BottomSheet } from "@/components/common/bottom-sheet";
import { Input } from "@/components/ui/input";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useEventsStore } from "@/features/events/store/events-store";
import { ROUTES } from "@/lib/constants";
import { today } from "@/lib/date";

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

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
  const [date, setDate] = useState(toInputDate(addDays(today(), 30)));

  const reset = () => {
    setName("");
    setDate(toInputDate(addDays(today(), 30)));
  };

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed || !date) return;

    const id = addEvent({
      name: trimmed,
      date: new Date(`${date}T00:00:00`),
      venue: "Por confirmar",
      city: "Por confirmar",
      capacity: 0,
      format: "Por definir",
    });

    toast("Evento creado con la checklist básica.");
    reset();
    onOpenChange(false);
    router.push(ROUTES.event(id));
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <div className="px-5 pt-1 pb-7">
        <SheetTitle className="font-display mt-3 text-[26px] font-semibold tracking-[0.03em] uppercase">
          Nuevo evento
        </SheetTitle>
        <SheetDescription className="text-rodeo-ink-soft mt-2 text-sm leading-relaxed">
          Empieza con una checklist básica por área; la ajustas después.
        </SheetDescription>

        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre del evento"
          autoFocus
          className="border-rodeo-line mt-[18px] h-auto rounded-[14px] bg-white px-[15px] py-[15px] text-base"
        />

        <p className="rodeo-eyebrow mt-5 mb-2.5">Cuándo</p>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="border-rodeo-line w-full rounded-[14px] border bg-white px-[15px] py-[15px] text-base"
        />

        <div className="mt-[26px] flex gap-2.5">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!name.trim() || !date}
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
    </BottomSheet>
  );
}
