"use client";

import { Check } from "lucide-react";
import { useRef, useState, useSyncExternalStore } from "react";

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

const THRESHOLD = 96;
const COMMIT_RATIO = 0.45;

/**
 * Envuelve una fila de tarea con arrastre horizontal (3.5): a la izquierda
 * completa, a la derecha aplaza un día. El tap normal (sin desplazamiento)
 * no se ve afectado, así que el círculo de la fila sigue funcionando igual.
 */
export function SwipeableTaskRow({
  blocked,
  onComplete,
  onPostpone,
  onBlockedAttempt,
  children,
}: {
  blocked: boolean;
  onComplete: () => void;
  onPostpone: () => void;
  onBlockedAttempt: () => void;
  children: React.ReactNode;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"none" | "horizontal" | "vertical">("none");
  const attemptedBlocked = useRef(false);

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    start.current = { x: event.clientX, y: event.clientY };
    axis.current = "none";
    attemptedBlocked.current = false;
    setDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!start.current) return;
    const deltaX = event.clientX - start.current.x;
    const deltaY = event.clientY - start.current.y;

    if (axis.current === "none") {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      axis.current =
        Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
      if (axis.current === "horizontal") {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    }
    if (axis.current === "vertical") return;

    if (blocked) {
      if (Math.abs(deltaX) > 8) attemptedBlocked.current = true;
      setDragX(Math.max(-24, Math.min(24, deltaX * 0.3)));
      return;
    }

    setDragX(Math.max(-THRESHOLD, Math.min(THRESHOLD, deltaX)));
  };

  const finish = () => {
    if (axis.current === "horizontal") {
      if (blocked) {
        if (attemptedBlocked.current) onBlockedAttempt();
      } else if (dragX <= -THRESHOLD * COMMIT_RATIO) {
        onComplete();
      } else if (dragX >= THRESHOLD * COMMIT_RATIO) {
        onPostpone();
      }
    }
    setDragX(0);
    setDragging(false);
    start.current = null;
    axis.current = "none";
  };

  return (
    <div className="relative">
      {dragX < 0 && (
        <div
          className="bg-state-completed absolute inset-0 flex items-center justify-end rounded-[14px] px-5"
          aria-hidden="true"
        >
          <span className="flex items-center gap-1.5 text-sm font-bold text-white">
            <Check className="size-4" strokeWidth={3} />
            Hecho
          </span>
        </div>
      )}
      {dragX > 0 && (
        <div
          className="bg-rodeo-sand absolute inset-0 flex items-center rounded-[14px] px-5"
          aria-hidden="true"
        >
          <span className="text-rodeo-ink-soft text-sm font-semibold">
            Aplazar
          </span>
        </div>
      )}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        style={{
          touchAction: "pan-y",
          transform: dragX ? `translateX(${dragX}px)` : undefined,
          transition:
            dragging || reducedMotion ? "none" : "transform 0.18s ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
