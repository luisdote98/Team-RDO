type Rule = {
  title: string;
  detail: string;
};

const RULES: Rule[] = [
  {
    title: "Reparto de gastos",
    detail:
      "El gasto de cualquiera de los eventos se reparte por igual entre los tres responsables.",
  },
  {
    title: "Coordinación del trabajo",
    detail:
      "El trabajo de los responsables se coordina y organiza para que no haya desigualdad a la hora de ponerse manos a la obra.",
  },
  {
    title: "Decisiones por unanimidad",
    detail:
      "Las decisiones se toman por votación unánime. Queda prohibido cualquier movimiento que comprometa a la promotora sin que los tres estén de acuerdo e informados.",
  },
];

export function PromoterRules() {
  return (
    <div className="flex flex-col gap-2.5">
      {RULES.map((rule) => (
        <article
          key={rule.title}
          className="bg-card border-rodeo-card-line rounded-2xl border p-[18px]"
        >
          <h3 className="text-[16px] leading-snug font-semibold">
            {rule.title}
          </h3>
          <p className="text-rodeo-ink-soft mt-1.5 text-sm leading-relaxed">
            {rule.detail}
          </p>
        </article>
      ))}
    </div>
  );
}
