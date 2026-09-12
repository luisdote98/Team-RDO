import type {
  DemoCategory,
  EventRule,
} from "@/features/events/data/demo-event";

export function EventRules({
  rules,
  categories,
  onSelect,
}: {
  rules: EventRule[];
  categories: DemoCategory[];
  /** Si se pasa, cada norma se puede tocar para editarla. */
  onSelect?: (rule: EventRule) => void;
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-2.5">
      {rules.map((rule) => {
        const category = categoryById.get(rule.categoryId);
        return (
          <article
            key={rule.id}
            onClick={onSelect ? () => onSelect(rule) : undefined}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onKeyDown={
              onSelect
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onSelect(rule);
                    }
                  }
                : undefined
            }
            className="bg-card border-rodeo-card-line rounded-2xl border p-[18px]"
            style={onSelect ? { cursor: "pointer" } : undefined}
          >
            {category && (
              <p className="text-rodeo-gold-ink font-display text-xs tracking-[0.16em] uppercase">
                {category.name}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] leading-snug font-semibold">
                {rule.title}
              </h3>
              {rule.pending && (
                <span className="border-state-waiting/40 bg-state-waiting/10 text-state-waiting rounded-sm border px-1.5 py-px text-[11px] tracking-wide uppercase">
                  Por definir
                </span>
              )}
            </div>
            <p className="text-rodeo-ink-soft mt-1.5 text-sm leading-relaxed">
              {rule.detail}
            </p>
          </article>
        );
      })}
    </div>
  );
}
