"use client";

import { useState } from "react";

import { PillButton } from "@/components/common/pill-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type {
  DemoCategory,
  EventRule,
} from "@/features/events/data/demo-event";
import type { RuleInput } from "@/features/events/store/events-store";

export function EventRuleDialog({
  open,
  onOpenChange,
  categories,
  rule,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: DemoCategory[];
  /** Si se pasa, el sheet edita esta norma; si no, crea una nueva. */
  rule?: EventRule | null;
  onSave: (input: RuleInput) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-rodeo-bone mx-auto max-h-[88%] w-full max-w-4xl overflow-y-auto rounded-t-[22px] border-none p-0"
      >
        {/* key: cada norma (o "crear nueva") arranca con su propio estado,
            sin depender de un efecto para resincronizar el formulario. */}
        <EventRuleForm
          key={rule?.id ?? "new"}
          categories={categories}
          rule={rule}
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

function EventRuleForm({
  categories,
  rule,
  onCancel,
  onSave,
}: {
  categories: DemoCategory[];
  rule?: EventRule | null;
  onCancel: () => void;
  onSave: (input: RuleInput) => void;
}) {
  const [categoryId, setCategoryId] = useState(
    rule?.categoryId ?? categories[0]?.id ?? "",
  );
  const [title, setTitle] = useState(rule?.title ?? "");
  const [detail, setDetail] = useState(rule?.detail ?? "");
  const [pending, setPending] = useState(rule?.pending ?? false);

  const canSave = categoryId && title.trim() && detail.trim();

  const handleSave = () => {
    if (!canSave) return;
    onSave({ categoryId, title: title.trim(), detail: detail.trim(), pending });
  };

  return (
    <div className="px-5 pt-3.5 pb-7">
      <div
        className="mx-auto mb-1 h-1 w-10 rounded-full bg-[#d8cfbd]"
        aria-hidden="true"
      />
      <SheetTitle className="font-display mt-3 text-[26px] font-semibold tracking-[0.03em] uppercase">
        {rule ? "Editar norma" : "Nueva norma"}
      </SheetTitle>
      <SheetDescription className="text-rodeo-ink-soft mt-2 text-sm">
        Acuerdos propios de este evento, sacados de las tareas de producción.
      </SheetDescription>

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

      <p className="rodeo-eyebrow mt-5 mb-2.5">Título</p>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Título de la norma"
        className="border-rodeo-line w-full rounded-[14px] border bg-white px-[15px] py-[15px] text-base"
      />

      <p className="rodeo-eyebrow mt-5 mb-2.5">Detalle</p>
      <Textarea
        value={detail}
        onChange={(event) => setDetail(event.target.value)}
        placeholder="Explica el acuerdo con el detalle que haga falta"
        className="border-rodeo-line min-h-[92px] resize-y rounded-[14px] bg-white text-[15px]"
      />

      <div className="mt-5">
        <PillButton
          label="Por definir"
          active={pending}
          onClick={() => setPending((v) => !v)}
        />
      </div>

      <div className="mt-[26px] flex gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="bg-primary text-primary-foreground flex-1 rounded-[14px] py-[15px] text-base font-bold disabled:opacity-40"
        >
          {rule ? "Guardar cambios" : "Añadir norma"}
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
