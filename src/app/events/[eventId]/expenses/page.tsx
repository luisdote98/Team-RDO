import { redirect } from "next/navigation";

import { EventExpensesView } from "@/features/expenses/components/event-expenses-view";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export default async function EventExpensesPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return <EventExpensesView eventId={eventId} currentUserId={user.id} />;
}
