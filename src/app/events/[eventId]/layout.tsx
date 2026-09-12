import { redirect } from "next/navigation";

import { SessionBadge } from "@/features/auth/components/session-badge";
import { EventShell } from "@/features/events/components/event-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Evento",
};

export default async function EventLayout({
  params,
  children,
}: {
  params: Promise<{ eventId: string }>;
  children: React.ReactNode;
}) {
  const { eventId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return (
    <EventShell
      eventId={eventId}
      currentUserId={user.id}
      sessionSlot={<SessionBadge />}
    >
      {children}
    </EventShell>
  );
}
