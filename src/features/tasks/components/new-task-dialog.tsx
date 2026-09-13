"use client";

import { differenceInCalendarDays } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

import { BottomSheet } from "@/components/common/bottom-sheet";
import { PillButton } from "@/components/common/pill-button";
import { Input } from "@/components/ui/input";
import { SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useEventsStore } from "@/features/events/store/events-store";
import { useTaskStore } from "@/features/tasks/store/task-store";
import { TASK_PRIORITY_META } from "@/lib/constants";
import { daysFromToday, toInputDate, today } from "@/lib/date";
import { TASK_PRIORITIES, type TaskPriority } from "@/types/domain";

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
  const { addTaskTemplate } = useEventsStore();

  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState(currentUserId);
  const [priority, setPriority] = useState<TaskPriority>("high");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [dueDate, setDueDate] = useState(toInputDate(today()));
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const reset = () => {
    setTitle("");
    setAssigneeId(currentUserId);
    setPriority("high");
    setCategoryId(categories[0]?.id ?? "");
    setDueDate(toInputDate(today()));
    setSaveAsTemplate(false);
  };

  const days = daysFromToday(eventDate);
  const countdown =
    days > 0 ? `T-${days}` : days === 0 ? "HOY" : `T+${Math.abs(days)}`;

  const handleCreate = () => {
    const trimmed = title.trim();
    if (!trimmed || !dueDate) return;
    const parsedDate = new Date(`${dueDate}T00:00:00`);
    const offsetDays = differenceInCalendarDays(parsedDate, eventDate);

    addTask({
      title: trimmed,
      categoryId,
      assigneeId,
      priority,
      dueDate: parsedDate,
      offsetDays,
    });

    if (saveAsTemplate) {
      addTaskTemplate({ title: trimmed, categoryId, assigneeId, priority, offsetDays });
    }

    const assigneeName = people.find((p) => p.id === assigneeId)?.name ?? "";
    toast(
      saveAsTemplate
        ? `Tarea creada para ${assigneeName} y guardada como predefinida.`
        : `Tarea creada para ${assigneeName}.`,
    );
    reset();
    setNewTaskOpen(false);
  };

  return (
    <BottomSheet
      open={isNewTaskOpen}
      onOpenChange={(open) => {
        setNewTaskOpen(open);
        if (!open) reset();
      }}
    >
      <div key={eventId} className="px-5 pt-1 pb-7">
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
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          className="border-rodeo-line w-full rounded-[14px] border bg-white px-[15px] py-[15px] text-base"
        />

        <p className="rodeo-eyebrow mt-5 mb-2.5">Repetir en eventos nuevos</p>
        <PillButton
          label="Guardar como predefinida"
          active={saveAsTemplate}
          onClick={() => setSaveAsTemplate((v) => !v)}
        />

        <div className="mt-[26px] flex gap-2.5">
          <button
            type="button"
            onClick={handleCreate}
            disabled={!title.trim() || !dueDate}
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
    </BottomSheet>
  );
}
