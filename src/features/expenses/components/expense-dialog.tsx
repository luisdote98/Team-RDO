"use client";

import { useState } from "react";

import { PillButton } from "@/components/common/pill-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  DemoCategory,
  DemoMember,
} from "@/features/events/data/demo-event";
import type { ExpenseInput } from "@/features/events/store/events-store";
import { today } from "@/lib/date";

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

export function ExpenseDialog({
  open,
  onOpenChange,
  people,
  categories,
  defaultPersonId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  people: DemoMember[];
  categories: DemoCategory[];
  defaultPersonId: string;
  onSave: (input: ExpenseInput) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-rodeo-bone mx-auto max-h-[88%] w-full max-w-4xl overflow-y-auto rounded-t-[22px] border-none p-0"
      >
        {/* key: cada apertura arranca el formulario limpio, sin useEffect. */}
        <ExpenseForm
          key={open ? "open" : "closed"}
          people={people}
          categories={categories}
          defaultPersonId={defaultPersonId}
          onCancel={() => onOpenChange(false)}
          onSave={(input) => {
            onSave(input);
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}

function ExpenseForm({
  people,
  categories,
  defaultPersonId,
  onCancel,
  onSave,
}: {
  people: DemoMember[];
  categories: DemoCategory[];
  defaultPersonId: string;
  onCancel: () => void;
  onSave: (input: ExpenseInput) => void;
}) {
  const [personId, setPersonId] = useState(defaultPersonId);
  const [amount, setAmount] = useState("");
  const [concept, setConcept] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [date, setDate] = useState(toInputDate(today()));

  const parsedAmount = Number(amount.replace(",", "."));
  const canSave = personId && concept.trim() && parsedAmount > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      personId,
      amount: parsedAmount,
      concept: concept.trim(),
      categoryId,
      date: new Date(`${date}T00:00:00`),
    });
  };

  return (
    <div className="px-5 pt-3.5 pb-7">
      <div
        className="mx-auto mb-1 h-1 w-10 rounded-full bg-[#d8cfbd]"
        aria-hidden="true"
      />
      <SheetTitle className="font-display mt-3 text-[26px] font-semibold tracking-[0.03em] uppercase">
        Nuevo gasto
      </SheetTitle>
      <SheetDescription className="text-rodeo-ink-soft mt-2 text-sm">
        Apunta lo que has pagado de tu bolsillo para este evento.
      </SheetDescription>

      <p className="rodeo-eyebrow mt-5 mb-2.5">Quién paga</p>
      <div className="flex gap-2">
        {people.map((person) => (
          <PillButton
            key={person.id}
            label={person.name}
            active={personId === person.id}
            style={{ backgroundColor: person.color, color: "#fff" }}
            onClick={() => setPersonId(person.id)}
          />
        ))}
      </div>

      <p className="rodeo-eyebrow mt-5 mb-2.5">Importe</p>
      <div className="border-rodeo-line flex items-center gap-2 rounded-[14px] border bg-white px-[15px]">
        <span className="text-rodeo-ink-soft text-base">€</span>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="decimal"
          placeholder="0"
          className="w-full bg-transparent py-[15px] text-base outline-none"
        />
      </div>

      <p className="rodeo-eyebrow mt-5 mb-2.5">Concepto</p>
      <input
        value={concept}
        onChange={(event) => setConcept(event.target.value)}
        placeholder="En qué se ha gastado"
        className="border-rodeo-line w-full rounded-[14px] border bg-white px-[15px] py-[15px] text-base"
      />

      <p className="rodeo-eyebrow mt-5 mb-2.5">Área (opcional)</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <PillButton
            key={category.id}
            label={category.name}
            active={categoryId === category.id}
            onClick={() =>
              setCategoryId((current) =>
                current === category.id ? undefined : category.id,
              )
            }
          />
        ))}
      </div>

      <p className="rodeo-eyebrow mt-5 mb-2.5">Fecha</p>
      <input
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        className="border-rodeo-line w-full rounded-[14px] border bg-white px-[15px] py-[15px] text-base"
      />

      <div className="mt-[26px] flex gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="bg-primary text-primary-foreground flex-1 rounded-[14px] py-[15px] text-base font-bold disabled:opacity-40"
        >
          Añadir gasto
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-rodeo-ink-soft rounded-[14px] border border-[#d8cfbd] px-5 py-[15px] text-base font-semibold"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
