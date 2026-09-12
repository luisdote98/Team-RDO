import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";
import { demoMembers } from "@/features/events/data/demo-event";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Iniciar sesión",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(ROUTES.myTasks);

  const { from } = await searchParams;

  return (
    <main className="flex min-h-svh flex-col justify-center bg-[#1b1712] px-8 py-12 text-[#faf7f0]">
      <div className="mx-auto w-full max-w-sm">
        <p className="font-display text-[40px] leading-none font-bold tracking-[0.14em] uppercase">
          RODEO
        </p>
        <p className="mt-2.5 text-[15px] leading-relaxed text-[#b9ae9c]">
          Producción de eventos. Entra para ver lo que te toca.
        </p>
        <div className="mt-9">
          <LoginForm
            members={demoMembers}
            redirectTo={from ?? ROUTES.myTasks}
          />
        </div>
      </div>
    </main>
  );
}
