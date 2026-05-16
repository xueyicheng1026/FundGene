import Link from "next/link";

import { cn } from "@/components/ui/primitives";

const moduleTracks = [
  {
    title: "建档",
    eyebrow: "风险基线",
    description: "完成资料与风险问卷，建立个人风险基线。",
    href: "/onboarding",
    status: "必做",
    weight: "主线",
  },
  {
    title: "工作台",
    eyebrow: "状态汇总",
    description: "收束风险、学习、组合和训练的下一步动作。",
    href: "/dashboard",
    status: "常驻",
    weight: "主线",
  },
  {
    title: "教练",
    eyebrow: "解释问答",
    description: "把问题变成可追踪、可引用的结构化回答。",
    href: "/coach",
    status: "可用",
    weight: "主线",
  },
  {
    title: "学习",
    eyebrow: "课程路径",
    description: "补齐基金、风险和配置的基础语言。",
    href: "/learning",
    status: "可用",
    weight: "支撑",
  },
  {
    title: "组合",
    eyebrow: "持仓体检",
    description: "录入快照，读取集中度、暴露和行动建议。",
    href: "/portfolio",
    status: "可用",
    weight: "主线",
  },
  {
    title: "情境",
    eyebrow: "历史训练",
    description: "在历史节点提交动作，并生成行为复盘。",
    href: "/simulation",
    status: "可用",
    weight: "训练",
  },
  {
    title: "资讯",
    eyebrow: "事实解读",
    description: "把政策和新闻拆成事实、路径与不确定性。",
    href: "/news",
    status: "可用",
    weight: "支撑",
  },
];

const focusMetrics = [
  {
    label: "主路径",
    value: "建档 -> 工作台",
    detail: "先建立风险基线，再进入教练、学习和体检。",
  },
  {
    label: "产品边界",
    value: "不做交易",
    detail: "只做学习、判断支持和复盘训练。",
  },
  {
    label: "记录方式",
    value: "可回看",
    detail: "问答、报告、训练和解读都保留结构化记录。",
  },
];

const priorityQueue = [
  "补齐基础画像和风险问卷。",
  "查看工作台的下一步动作。",
  "用组合体检或教练问答完成一次复盘。",
];

const rules = [
  "新手优先：默认服务第一次认真做基金决策的人。",
  "解释优先：先拆风险、证据和限制，再给下一步。",
  "边界优先：不承诺收益，不生成交易执行动作。",
];

export default function OverviewPage() {
  return (
    <div className="space-y-4">
      <section className="command-hero relative overflow-hidden px-4 py-4 sm:px-5 lg:px-6">
        <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="min-w-0">
            <p className="section-kicker">基金判断训练台</p>
            <h1 className="mt-2 max-w-4xl text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl xl:text-6xl">
              FundGene 工作总控
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">
              画像、教练、学习、组合体检、历史训练和资讯解读都从这里进入。默认顺序是先理解风险，再做可复盘的判断训练。
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <Link href="/dashboard" className="action-button">
                进入工作台
              </Link>
              <Link href="/portfolio" className="action-button-secondary">
                查看组合体检
              </Link>
            </div>
          </div>

          <aside className="focus-card p-3">
            <p className="section-kicker text-teal-200/80">今日主线</p>
            <div className="mt-3 space-y-2">
              {priorityQueue.map((item, index) => (
                <div key={item} className="focus-step">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        {focusMetrics.map((metric) => (
          <div key={metric.label} className="dense-stat px-4 py-3">
            <p className="section-kicker">{metric.label}</p>
            <p className="mt-2 text-2xl font-black leading-none tracking-normal text-white">
              {metric.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
              {metric.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="overview-console grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-kicker">核心模块矩阵</p>
              <h2 className="mt-2 text-3xl font-black leading-tight tracking-normal text-white">
                主线入口与训练模块
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[color:var(--ink-soft)]">
              建档和工作台是主线入口；教练、学习、组合、情境和资讯负责把每一次判断变成可解释记录。
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {moduleTracks.map((track, index) => (
              <Link
                key={track.title}
                href={track.href}
                className={cn(
                  "module-tile group relative overflow-hidden px-4 py-3.5",
                  track.weight === "主线" && "module-tile-primary",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="section-kicker">{track.eyebrow}</p>
                    <h3 className="mt-2 text-2xl font-black leading-none tracking-normal text-white">
                      {track.title}
                    </h3>
                  </div>
                  <span className="module-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="mt-3 min-h-11 text-sm leading-6 text-[color:var(--ink-soft)]">
                  {track.description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[color:var(--line-soft)] pt-3">
                  <span className="text-xs font-black text-[color:var(--accent-moss)]">
                    {track.weight}
                  </span>
                  <span className="rounded-full border border-[rgba(40,83,62,0.16)] bg-white/60 px-2.5 py-1 text-xs font-bold text-[color:var(--ink-soft)]">
                    {track.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rule-panel p-4">
          <p className="section-kicker">运行边界</p>
          <h2 className="mt-2 text-2xl font-black leading-tight tracking-normal text-white">
            每个建议都必须能解释、能回看、能停止。
          </h2>
          <div className="mt-4 space-y-2.5">
            {rules.map((rule) => (
              <div key={rule} className="rule-row">
                {rule}
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-[rgba(40,83,62,0.14)] bg-white/55 px-4 py-3">
            <p className="section-kicker">建议顺序</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
              第一次使用先完成建档；已有画像后进入工作台，根据下一步动作选择教练、组合或训练。
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
