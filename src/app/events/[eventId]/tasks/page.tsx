import { redirect } from "next/navigation";
import { Suspense } from "react";

import { TasksView } from "@/features/tasks/components/tasks-view";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export default async function EventTasksPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return (
    <Suspense fallback={null}>
      <TasksView eventId={eventId} currentUserId={user.id} />
    </Suspense>
  );
}
