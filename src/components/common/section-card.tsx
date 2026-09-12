import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[18px] border border-rodeo-card-line bg-card p-4 sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="rodeo-eyebrow">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
