import Link from "next/link";

import { cn } from "@/components/ui/primitives";

const commandSurfaces = [
  {
    title: "今日",
    eyebrow: "今日简报",
    description: "打开后先看到今日判断、原因和安全下一步。",
    href: "/today",
    status: "主入口",
    weight: "home",
  },
  {
    title: "Agent",
    eyebrow: "Workspace",
    description: "布置任务，看 Agent 如何读取画像、检查组合、整理资讯并生成建议。",
    href: "/agent",
    status: "执行",
    weight: "agent",
  },
  {
    title: "自动任务",
    eyebrow: "授权",
    description: "控制每日简报、组合巡检、资讯观察和行为偏差观察的授权范围。",
    href: "/automations",
    status: "授权",
    weight: "automation",
  },
  {
    title: "我的资料",
    eyebrow: "Context",
    description: "管理画像、组合、行为证据、学习状态，以及需要确认的资料变化。",
    href: "/profile",
    status: "资料",
    weight: "profile",
  },
];

const agentSteps = [
  "读取授权资料",
  "形成今日判断",
  "展示证据和限制",
  "等待用户确认",
];

const rules = [
  "Agent 可以分析、总结、提醒和准备建议。",
  "关键画像和长期计划保存前必须确认。",
  "不连接券商，不执行交易，不承诺收益。",
];

export default function OverviewPage() {
  return (
    <div className="space-y-4">
      <section className="command-hero relative overflow-hidden px-4 py-4 sm:px-5 lg:px-6">
        <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="min-w-0">
            <p className="section-kicker">Agent Command Center</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-[color:var(--ink-strong)] sm:text-5xl xl:text-6xl">
              先让 Agent 看完，再由你确认下一步。
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">
              FundGene 把画像、持仓、资讯、学习和训练记录收束成一个每日简报。你不需要先翻模块，先看 Agent 已经整理出的判断。
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/today" className="action-button">
                查看今日简报
              </Link>
              <Link href="/agent" className="action-button-secondary">
                交给 Agent 分析
              </Link>
            </div>
          </div>

          <aside className="focus-card p-3">
            <p className="section-kicker">Agent 工作流</p>
            <div className="mt-3 space-y-2">
              {agentSteps.map((item, index) => (
                <div key={item} className="focus-step">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="overview-console grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-kicker">四个主入口</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight tracking-normal text-[color:var(--ink-strong)]">
                模块降级为工具，Agent 成为主角。
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[color:var(--ink-soft)]">
              组合、资讯、学习和训练仍然存在，但从今日简报、Agent 任务和资料中心进入。
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {commandSurfaces.map((surface, index) => (
              <Link
                key={surface.title}
                href={surface.href}
                className={cn(
                  "module-tile group relative overflow-hidden px-4 py-3.5",
                  surface.weight === "home" && "module-tile-primary",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-kicker">{surface.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-semibold leading-none tracking-normal text-[color:var(--ink-strong)]">
                      {surface.title}
                    </h3>
                  </div>
                  <span className="module-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 hidden min-h-20 text-sm leading-6 text-[color:var(--ink-soft)] sm:block">
                  {surface.description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[color:var(--line-soft)] pt-3">
                  <span className="text-xs font-semibold text-[color:var(--accent-teal)]">
                    Agent
                  </span>
                  <span className="rounded-full border border-[rgba(40,83,62,0.16)] bg-white/60 px-2.5 py-1 text-xs font-bold text-[color:var(--ink-soft)]">
                    {surface.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rule-panel p-4">
          <p className="section-kicker">自动化边界</p>
          <h2 className="mt-2 text-xl font-semibold leading-tight tracking-normal text-[color:var(--ink-strong)] sm:text-2xl">
            自动看完，提醒确认，不替你交易。
          </h2>
          <div className="mt-4 hidden space-y-2.5 sm:block">
            {rules.map((rule) => (
              <div key={rule} className="rule-row">
                {rule}
              </div>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
