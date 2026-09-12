"use client";

import { useState } from "react";

import { ExpenseDialog } from "@/features/expenses/components/expense-dialog";
import {
  demoCategories,
  demoMembers,
} from "@/features/events/data/demo-event";
import { useEventsStore } from "@/features/events/store/events-store";
import { formatDayMonth } from "@/lib/date";

const formatEuro = (value: number) =>
  value.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export function EventExpensesView({
  eventId,
  currentUserId,
}: {
  eventId: string;
  currentUserId: string;
}) {
  const { events, addExpense, deleteExpense } = useEventsStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const event = events.find((e) => e.id === eventId);
  const expenses = event?.expenses ?? [];

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byPerson = demoMembers.map((member) => ({
    ...member,
    total: expenses
      .filter((e) => e.personId === member.id)
      .reduce((sum, e) => sum + e.amount, 0),
  }));

  const sorted = [...expenses].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );
  const categoryById = new Map(demoCategories.map((c) => [c.id, c]));
  const memberById = new Map(demoMembers.map((m) => [m.id, m]));

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-card border-rodeo-card-line rounded-[18px] border p-[22px]">
        <p className="rodeo-eyebrow">Gastado en total</p>
        <p className="font-display mt-1 text-[48px] leading-[0.9] font-semibold">
          {formatEuro(total)}
        </p>

        <div className="mt-5 grid grid-cols-3 gap-2.5">
          {byPerson.map((member) => (
            <div
              key={member.id}
              className="rounded-[14px] p-3"
              style={{ backgroundColor: member.bgColor }}
            >
              <p className="truncate text-sm font-semibold" style={{ color: member.color }}>
                {member.name}
              </p>
              <p
                className="font-display mt-1 text-[20px]"
                style={{ color: member.color }}
              >
                {formatEuro(member.total)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="border-[#cdc2ae] bg-[#f3efe6] text-rodeo-ink min-h-11 w-full rounded-[14px] border border-dashed p-[15px] text-[15px] font-semibold"
      >
        + Nuevo gasto
      </button>

      {sorted.length === 0 ? (
        <p className="text-rodeo-ink-soft text-sm">
          Todavía no hay gastos registrados en este evento.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((expense) => {
            const member = memberById.get(expense.personId);
            const category = expense.categoryId
              ? categoryById.get(expense.categoryId)
              : undefined;
            return (
              <article
                key={expense.id}
                className="bg-card border-rodeo-card-line flex items-start justify-between gap-3 rounded-[14px] border p-4"
              >
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug font-semibold">
                    {expense.concept}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-[7px] px-[9px] py-[3px] text-xs font-semibold"
                      style={{
                        backgroundColor: member?.bgColor,
                        color: member?.color,
                      }}
                    >
                      {member?.name ?? "?"}
                    </span>
                    {category && (
                      <span className="bg-rodeo-chip text-rodeo-ink-soft rounded-[7px] px-[9px] py-[3px] text-xs font-medium">
                        {category.name}
                      </span>
                    )}
                    <span className="text-rodeo-ink-soft text-xs">
                      {formatDayMonth(expense.date)}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <p className="font-display text-[18px]">
                    {formatEuro(expense.amount)}
                  </p>
                  <button
                    type="button"
                    onClick={() => deleteExpense(eventId, expense.id)}
                    aria-label={`Eliminar gasto «${expense.concept}»`}
                    className="text-rodeo-ink-soft flex size-11 shrink-0 items-center justify-center rounded-full text-lg hover:bg-rodeo-chip"
                  >
                    ×
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ExpenseDialog
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        people={demoMembers}
        categories={demoCategories}
        defaultPersonId={currentUserId}
        onSave={(input) => addExpense(eventId, input)}
      />
    </div>
  );
}
