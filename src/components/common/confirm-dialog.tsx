"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Aviso de seguridad antes de una acción importante (eliminar una tarea,
 * marcarla hecha). Nada se aplica hasta que el usuario toca el botón de
 * confirmar.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Eliminar",
  variant = "danger",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  /** "danger" (rojo, por defecto) para borrar; "default" (verde) para confirmar algo positivo como completar. */
  variant?: "danger" | "default";
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[320px] rounded-[18px] border-none bg-rodeo-bone p-5 text-center"
      >
        <DialogTitle className="font-display text-[18px] font-semibold">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm leading-relaxed text-rodeo-ink-soft">
          {description}
        </DialogDescription>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="min-h-11 flex-1 rounded-[12px] border border-[#d8cfbd] text-sm font-semibold text-rodeo-ink-soft"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className={cn(
              "min-h-11 flex-1 rounded-[12px] text-sm font-bold text-white",
              variant === "danger"
                ? "bg-priority-critical"
                : "bg-state-completed",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
