import { cn } from "@/lib/utils";

type MemberAvatarProps = {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "size-5 text-[11px]",
  md: "size-8 text-sm",
  lg: "size-10 text-base",
} as const;

export function MemberAvatar({
  name,
  color,
  size = "sm",
  className,
}: MemberAvatarProps) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full border font-display",
        SIZES[size],
        className,
      )}
      style={{
        color,
        borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
        backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
      }}
      aria-hidden="true"
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export function MemberTag({
  name,
  color,
  className,
}: Omit<MemberAvatarProps, "size">) {
  return (
    <span
      className={cn("flex items-center gap-1.5 text-xs font-medium", className)}
      style={{ color }}
    >
      <MemberAvatar name={name} color={color} />
      {name}
    </span>
  );
}
