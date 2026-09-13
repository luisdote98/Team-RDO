"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const DISMISS_THRESHOLD = 120;

/**
 * Bottom sheet común a toda la app: asa para arrastrar, cierre deslizando
 * hacia abajo (pointer events, sin librería nueva) y una X pequeña arriba
 * como cierre alternativo al tap. El contenido (título, campos, botones)
 * lo pone cada pantalla como children.
 */
export function BottomSheet({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef<number | null>(null);

  const handlePointerDown = (event: React.PointerEvent) => {
    startY.current = event.clientY;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (startY.current === null) return;
    setDragY(Math.max(0, event.clientY - startY.current));
  };

  const finishDrag = () => {
    if (dragY > DISMISS_THRESHOLD) {
      onOpenChange(false);
    }
    setDragY(0);
    setDragging(false);
    startY.current = null;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className={cn(
          "bg-rodeo-bone mx-auto max-h-[88%] w-full max-w-4xl overflow-y-auto rounded-t-[22px] border-none p-0",
          className,
        )}
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? "none" : "transform 0.18s ease-out",
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
          className="sticky top-0 z-10 flex items-center justify-center bg-rodeo-bone pt-3.5 pb-2.5"
          style={{ touchAction: "none" }}
        >
          <span
            className="h-1 w-10 rounded-full bg-[#d8cfbd]"
            aria-hidden="true"
          />
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Cerrar"
          className="text-rodeo-ink-soft hover:bg-rodeo-chip absolute top-2.5 right-3 flex size-9 items-center justify-center rounded-full"
        >
          <X className="size-4" strokeWidth={2.5} />
        </button>
        {children}
      </SheetContent>
    </Sheet>
  );
}
