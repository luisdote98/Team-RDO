import { addDays, differenceInCalendarDays, format } from "date-fns";
import { es } from "date-fns/locale";

/** Medianoche de hoy: base de todos los cálculos de retraso. */
export function today(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Fecha límite de una tarea a partir de la fecha del evento y su desfase.
 * `offsetDays` es negativo antes del evento (T-60 → -60) y positivo después.
 */
export function dueDateFor(eventDate: Date, offsetDays: number): Date {
  return addDays(eventDate, offsetDays);
}

/** Etiqueta de desfase tal y como se escribe en las plantillas: T-60, T-0, T+7. */
export function offsetLabel(offsetDays: number): string {
  if (offsetDays === 0) return "T-0";
  return offsetDays < 0 ? `T-${Math.abs(offsetDays)}` : `T+${offsetDays}`;
}

/** Días naturales entre hoy y una fecha. Negativo si ya pasó. */
export function daysFromToday(date: Date): number {
  return differenceInCalendarDays(date, today());
}

export function formatDate(date: Date): string {
  return format(date, "d MMM yyyy", { locale: es });
}

export function formatLongDate(date: Date): string {
  return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
}

export function formatDayMonth(date: Date): string {
  return format(date, "d MMM", { locale: es });
}

/** Etiqueta relativa para vencimientos próximos: "Hoy", "Mañana" o "vie 25 sep". */
export function relativeDueLabel(date: Date): string {
  const days = daysFromToday(date);
  if (days === 0) return "Hoy";
  if (days === 1) return "Mañana";
  return format(date, "eee d MMM", { locale: es });
}

/**
 * Fecha en formato yyyy-MM-dd para un `<input type="date">`, en la fecha
 * LOCAL del `Date` (no en UTC). `date.toISOString().slice(0, 10)` se
 * adelanta un día en cualquier huso horario por delante de UTC, como
 * España — por eso este helper usa los componentes locales.
 */
export function toInputDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
