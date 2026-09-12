import type { TaskSummary } from "@/lib/tasks";

export function ReadinessPanel({ summary }: { summary: TaskSummary }) {
  return (
    <div className="bg-card border-rodeo-card-line rounded-[18px] border p-[22px]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="rodeo-eyebrow">Preparación</p>
          <p className="font-display mt-1 text-[60px] leading-[0.9] font-semibold">
            {summary.readiness}
            <span className="text-[30px]">%</span>
          </p>
        </div>
        <p className="text-rodeo-ink-soft text-right text-[13px] leading-normal">
          {summary.completed} de {summary.total}
          <br />
          tareas hechas
        </p>
      </div>
      <div className="bg-rodeo-sand mt-[18px] h-3 overflow-hidden rounded-full">
        <div
          className="bg-rodeo-gold h-full rounded-full"
          style={{ width: `${summary.readiness}%` }}
        />
      </div>
      <p className="text-rodeo-ink-soft mt-3 text-[13px] leading-normal">
        Ponderado por prioridad: una crítica pesa 4 veces una baja. Por
        conteo simple sería {summary.rawCompletion}%.
      </p>
    </div>
  );
}
