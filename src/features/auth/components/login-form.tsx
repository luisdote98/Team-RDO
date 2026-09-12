"use client";

import { useActionState, useMemo, useState } from "react";

import { login, type LoginState } from "@/features/auth/actions/login";
import type { DemoMember } from "@/features/events/data/demo-event";

const initialState: LoginState = { error: null };

export function LoginForm({
  members,
  redirectTo,
}: {
  members: DemoMember[];
  redirectTo: string;
}) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const personId = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    return members.find((m) => m.name.toLowerCase() === trimmed)?.id ?? "";
  }, [members, name]);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="personId" value={personId} />

      <label className="flex flex-col gap-1.5 text-[13px] tracking-[0.1em] text-[#b9ae9c] uppercase">
        Nombre
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          className="rounded-xl border border-[#3d372f] bg-[#262119] p-3.5 text-base normal-case tracking-normal text-[#faf7f0]"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-[13px] tracking-[0.1em] text-[#b9ae9c] uppercase">
        Contraseña
        <input
          type="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="rounded-xl border border-[#3d372f] bg-[#262119] p-3.5 text-base normal-case tracking-normal text-[#faf7f0]"
        />
      </label>

      {state.error && (
        <p className="text-sm text-[#e0a08a]">
          Nombre o contraseña incorrectos.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-rodeo-gold text-rodeo-ink mt-2 rounded-xl p-4 text-base font-bold disabled:opacity-60"
      >
        {pending ? "Entrando..." : "Entrar"}
      </button>

      <p className="mt-1 text-[13px] leading-relaxed text-[#b9ae9c]">
        Prueba Luis / dote, Oliver / oliver2026 o Guille / guille2026.
      </p>
    </form>
  );
}
