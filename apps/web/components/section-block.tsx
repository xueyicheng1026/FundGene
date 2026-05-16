import { cn, StatusPill } from "./ui/primitives";

export function SectionBlock({
  eyebrow,
  title,
  description,
  className,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="grid max-w-6xl gap-3 lg:grid-cols-[minmax(0,0.85fr)_minmax(18rem,0.65fr)] lg:items-start">
        <div className="min-w-0">
          <StatusPill tone="accent">{eyebrow}</StatusPill>
          <h2 className="mt-3 max-w-3xl text-2xl font-black leading-tight tracking-normal text-white sm:text-3xl">
            {title}
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
