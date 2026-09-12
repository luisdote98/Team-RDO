"use client";

import { addDays, differenceInCalendarDays } from "date-fns";
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
import { useTaskStore } from "@/features/tasks/store/task-store";
import { TASK_PRIORITY_META } from "@/lib/constants";
import { daysFromToday, today } from "@/lib/date";
import { TASK_PRIORITIES, type TaskPriority } from "@/types/domain";

type DueKey = "hoy" | "3dias" | "1semana" | "evento";

export function NewTaskDialog({
  eventId,
  eventName,
  eventDate,
  currentUserId,
}: {
  eventId: string;
  eventName: string;
  eventDate: Date;
  currentUserId: string;
}) {
  const { categories, people, addTask, isNewTaskOpen, setNewTaskOpen } =
    useTaskStore();

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [dueKey, setDueKey] = useState<DueKey>("3dias");

  const reset = () => {
    setTitle("");
    setAssigneeId(currentUserId);
    setPriority("high");
    setCategoryId(categories[0]?.id ?? "");
    setDueKey("3dias");
  };

  const dueOptions: { key: DueKey; label: string; date: Date }[] = [
    { key: "hoy", label: "Hoy", date: today() },
    { key: "3dias", label: "En 3 días", date: addDays(today(), 3) },
    { key: "1semana", label: "En 1 semana", date: addDays(today(), 7) },
    { key: "evento", label: "Día del evento", date: eventDate },
  ];

  const days = daysFromToday(eventDate);
  const countdown =
    days > 0 ? `T-${days}` : days === 0 ? "HOY" : `T+${Math.abs(days)}`;

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const dueDate = dueOptions.find((option) => option.key === dueKey)!.date;

    addTask({
      title: trimmed,
      categoryId,
      assigneeId,
      priority,
      dueDate,
      offsetDays: differenceInCalendarDays(dueDate, eventDate),
    });

    const assigneeName = people.find((p) => p.id === assigneeId)?.name ?? "";
    toast(`Tarea creada para ${assigneeName}.`);
    reset();
    setNewTaskOpen(false);
  };

  return (
    <Sheet
      open={isNewTaskOpen}
      onOpenChange={(open) => {
        setNewTaskOpen(open);
        if (!open) reset();
      }}
    >
      <SheetContent
        key={eventId}
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
            Nueva tarea
          </SheetTitle>
          <SheetDescription className="text-rodeo-ink-soft mt-2 text-sm">
            En {eventName} · {countdown}
          </SheetDescription>

          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Qué hay que hacer"
            autoFocus
            className="border-rodeo-line mt-[18px] h-auto rounded-[14px] bg-white px-[15px] py-[15px] text-base"
          />

          <p className="rodeo-eyebrow mt-5 mb-2.5">Responsable</p>
          <div className="flex gap-2">
            {people.map((person) => (
              <PillButton
                key={person.id}
                label={person.name}
                active={assigneeId === person.id}
                style={{ backgroundColor: person.color, color: "#fff" }}
                onClick={() => setAssigneeId(person.id)}
              />
            ))}
          </div>

          <p className="rodeo-eyebrow mt-5 mb-2.5">Prioridad</p>
          <div className="flex flex-wrap gap-2">
            {TASK_PRIORITIES.map((value) => (
              <PillButton
                key={value}
                label={TASK_PRIORITY_META[value].label}
                active={priority === value}
                style={{
                  backgroundColor: TASK_PRIORITY_META[value].color,
                  color: "#fff",
                }}
                onClick={() => setPriority(value)}
              />
            ))}
          </div>

          <p className="rodeo-eyebrow mt-5 mb-2.5">Área</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <PillButton
                key={category.id}
                label={category.name}
                active={categoryId === category.id}
                onClick={() => setCategoryId(category.id)}
              />
            ))}
          </div>

          <p className="rodeo-eyebrow mt-5 mb-2.5">Para cuándo</p>
          <div className="flex flex-wrap gap-2">
            {dueOptions.map((option) => (
              <PillButton
                key={option.key}
                label={option.label}
                active={dueKey === option.key}
                onClick={() => setDueKey(option.key)}
              />
            ))}
          </div>

          <div className="mt-[26px] flex gap-2.5">
            <button
              type="button"
              onClick={handleCreate}
              disabled={!title.trim()}
              className="bg-primary text-primary-foreground flex-1 rounded-[14px] py-[15px] text-base font-bold disabled:opacity-40"
            >
              Crear tarea
            </button>
            <button
              type="button"
              onClick={() => setNewTaskOpen(false)}
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
