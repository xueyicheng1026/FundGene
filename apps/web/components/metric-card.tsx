import { cn, StatusPill } from "./ui/primitives";

const toneMap = {
  moss: "border-l-[color:var(--accent-teal)]",
  gold: "border-l-[color:var(--accent-gold)]",
  clay: "border-l-[color:var(--accent-clay)]",
} as const;

type Accent = keyof typeof toneMap;

export function MetricCard({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: Accent;
}) {
  return (
    <div
      className={cn(
        "metric-card group relative overflow-hidden rounded-[30px] border-l-2 border-y border-r border-[color:var(--line-soft)] bg-[linear-gradient(180deg,rgba(36,53,47,0.92),rgba(18,29,25,0.84))] p-4 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--line-strong)] hover:shadow-[0_22px_46px_rgba(0,0,0,0.24)]",
        toneMap[accent],
      )}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--accent-teal),transparent)] opacity-45" />
      <div className="relative flex h-full min-h-[6.8rem] flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <StatusPill tone={accent === "gold" ? "warning" : "positive"}>
            {label}
          </StatusPill>
          <span className="mt-1 size-2 rounded-full bg-[color:var(--accent-teal)] shadow-[0_0_18px_rgba(42,166,154,0.72)]" />
        </div>
        <div>
          <p className="text-2xl font-black leading-tight tracking-normal text-[color:var(--ink-strong)] sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 max-w-[22rem] text-xs leading-5 text-[color:var(--ink-soft)] sm:text-sm">
            {detail}
          </p>
        </div>
      </div>
    </div>
  );
}
