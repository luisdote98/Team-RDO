import { redirect } from "next/navigation";

import { SessionBadge } from "@/features/auth/components/session-badge";
import { MyTasksView } from "@/features/tasks/components/my-tasks-view";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export const metadata = {
  title: "Mis tareas",
};

export default async function MyTasksPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return (
    <MyTasksView
      userId={user.id}
      userName={user.name}
      sessionSlot={<SessionBadge />}
    />
  );
}
