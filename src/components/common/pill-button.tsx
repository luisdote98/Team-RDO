import { cn } from "@/lib/utils";

/** Píldora de selección genérica: estado/responsable/prioridad/área/fecha. */
export function PillButton({
  label,
  active,
  onClick,
  disabled,
  activeClassName,
  style,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  activeClassName?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      style={active ? style : undefined}
      className={cn(
        "min-h-11 shrink-0 rounded-full border px-3.5 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? cn(
              "border-transparent font-semibold text-primary-foreground",
              activeClassName ?? "bg-primary",
            )
          : "border-rodeo-line bg-card font-normal text-rodeo-ink-soft",
      )}
    >
      {label}
    </button>
  );
}
