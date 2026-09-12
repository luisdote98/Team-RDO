import { MemberAvatar } from "@/components/common/member-avatar";
import { logout } from "@/features/auth/actions/login";
import { getCurrentUser } from "@/lib/auth/session";

export async function SessionBadge() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <form action={logout}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-full border border-rodeo-line bg-card py-[5px] pr-2.5 pl-[5px] text-[13px] text-rodeo-ink-soft transition-colors hover:text-rodeo-ink"
        aria-label={`Cerrar sesión de ${user.name}`}
      >
        <MemberAvatar name={user.name} color={user.color} />
        Salir
      </button>
    </form>
  );
}
