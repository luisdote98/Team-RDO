"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { EventRuleDialog } from "@/features/events/components/event-rule-dialog";
import { EventRules } from "@/features/events/components/event-rules";
import { demoCategories } from "@/features/events/data/demo-event";
import type { EventRule } from "@/features/events/data/demo-event";
import { useEventsStore } from "@/features/events/store/events-store";
import { ROUTES } from "@/lib/constants";

export default function EventRulesPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { events, addEventRule, updateEventRule } = useEventsStore();
  const event = events.find((item) => item.id === eventId);
  const rules = event?.rules ?? [];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<EventRule | null>(null);

  const openCreate = () => {
    setEditingRule(null);
    setSheetOpen(true);
  };

  const openEdit = (rule: EventRule) => {
    setEditingRule(rule);
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-rodeo-ink-soft text-sm leading-relaxed">
        Acuerdos propios de este evento, sacados de las tareas de producción.
      </p>

      <button
        type="button"
        onClick={openCreate}
        className="border-[#cdc2ae] bg-[#f3efe6] text-rodeo-ink min-h-11 w-full rounded-[14px] border border-dashed p-[15px] text-[15px] font-semibold"
      >
        + Nueva norma
      </button>

      {rules.length === 0 ? (
        <p className="text-rodeo-ink-soft text-sm">
          Todavía no hay normas específicas para este evento.
        </p>
      ) : (
        <EventRules
          rules={rules}
          categories={demoCategories}
          onSelect={openEdit}
        />
      )}

      <p className="text-rodeo-ink-soft text-[13px]">
        Reglas fijas de la promotora (reparto de gastos, roles, decisión por
        unanimidad) en{" "}
        <Link href={ROUTES.team} className="text-rodeo-gold-ink underline">
          Equipo → Normativa
        </Link>
        .
      </p>

      <EventRuleDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        categories={demoCategories}
        rule={editingRule}
        onSave={(input) => {
          if (editingRule) {
            updateEventRule(eventId, editingRule.id, input);
          } else {
            addEventRule(eventId, input);
          }
        }}
      />
    </div>
  );
}
