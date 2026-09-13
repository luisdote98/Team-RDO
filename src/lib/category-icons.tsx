import {
  Camera,
  Disc3,
  GlassWater,
  Home,
  Megaphone,
  Mic2,
  ShieldCheck,
  Sparkles,
  Tag,
  Ticket,
  Users,
  Volume2,
  type LucideIcon,
} from "lucide-react";

/** Icono representativo de cada área del evento, para la tarjeta de tarea. */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  booking: Mic2,
  entradas: Ticket,
  seguridad: ShieldCheck,
  villa: Home,
  sonido: Volume2,
  dj: Disc3,
  barra: GlassWater,
  invitados: Users,
  contenido: Camera,
  decoracion: Sparkles,
  carteleria: Megaphone,
};

export function iconForCategory(categoryId: string): LucideIcon {
  return CATEGORY_ICONS[categoryId] ?? Tag;
}
