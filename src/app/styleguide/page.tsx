import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  APP_NAME,
  EVENT_STATUS_META,
  TASK_PRIORITY_META,
  TASK_STATUS_META,
} from "@/lib/constants";
import { EVENT_STATUSES, TASK_PRIORITIES, TASK_STATUSES } from "@/types/domain";

/** Referencia visual del sistema de diseño RODEO. */

const BRAND_SWATCHES = [
  { name: "black", value: "#0A0A0B" },
  { name: "surface", value: "#131316" },
  { name: "border", value: "#26262B" },
  { name: "sand", value: "#C9B89A" },
  { name: "gold", value: "#C8A96A" },
  { name: "gold-deep", value: "#8A6F3C" },
  { name: "bone", value: "#F2EDE3" },
];

export default function StyleGuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12">
      <p className="rodeo-eyebrow">Sistema de diseño</p>
      <h1 className="rodeo-display mt-3 text-5xl leading-none text-rodeo-bone sm:text-6xl">
        {APP_NAME}
      </h1>
      <div className="rodeo-rule mt-5" />
      <p className="mt-5 max-w-prose text-sm text-muted-foreground">
        Producción de eventos de RODEO. Negro, dorado envejecido y hueso;
        tipografía de cartel.
      </p>

      <Section title="Marca">
        <div className="flex flex-wrap gap-3">
          {BRAND_SWATCHES.map((swatch) => (
            <div key={swatch.name} className="w-24">
              <div
                className="h-14 w-full rounded-md border border-border"
                style={{ background: swatch.value }}
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {swatch.name}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Estados de tarea">
        <div className="flex flex-wrap gap-2">
          {TASK_STATUSES.map((status) => (
            <Badge
              key={status}
              variant="outline"
              className={TASK_STATUS_META[status].className}
            >
              {TASK_STATUS_META[status].label}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Prioridades">
        <div className="flex flex-wrap gap-2">
          {TASK_PRIORITIES.map((priority) => (
            <Badge
              key={priority}
              variant="outline"
              className={TASK_PRIORITY_META[priority].className}
            >
              {TASK_PRIORITY_META[priority].label}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Estados de evento">
        <div className="flex flex-wrap gap-2">
          {EVENT_STATUSES.map((status) => (
            <Badge
              key={status}
              variant="outline"
              className={EVENT_STATUS_META[status].className}
            >
              {EVENT_STATUS_META[status].label}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Componentes">
        <Card>
          <CardHeader>
            <p className="rodeo-eyebrow">05 · 10 · 2026</p>
            <CardTitle className="rodeo-display text-3xl">
              RODEO OPEN AIR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Preparación
                </span>
                <span className="font-display text-2xl text-rodeo-gold">
                  62%
                </span>
              </div>
              <Progress value={62} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Acción principal</Button>
              <Button size="sm" variant="secondary">
                Secundaria
              </Button>
              <Button size="sm" variant="outline">
                Contorno
              </Button>
              <Button size="sm" variant="ghost">
                Fantasma
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="rodeo-eyebrow mb-4">{title}</h2>
      {children}
    </section>
  );
}
