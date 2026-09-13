import { redirect } from "next/navigation";

import { EventsListView } from "@/features/events/components/events-list-view";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Eventos",
};

export default async function EventsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return <EventsListView currentUserId={user.id} />;
}
