import { redirect } from "next/navigation";

import { ROUTES } from "@/lib/constants";

/** Prioridad: llevar a cada uno directamente a lo que le toca a él. */
export default function HomePage() {
  redirect(ROUTES.myTasks);
}
