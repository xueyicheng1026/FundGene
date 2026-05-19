"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { type CSSProperties } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  GitBranch,
  Gauge,
  Layers3,
  Radar,
  ShieldCheck,
  Target,
  type LucideIcon,
} from "lucide-react";

import {
  ApiError,
  getBehaviorProfile,
  getDashboardState,
  getSessionUser,
  type DashboardDailyBrief,
  type DashboardEvidenceSource,
  type SafeNextAction,
  type RiskLevel,
} from "@/lib/api";
import { formatBiasTags, formatProductCopy } from "@/lib/display-labels";
import { SectionBlock } from "./section-block";
import { InlineNotice, StatusPill } from "./ui/primitives";

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function formatRiskLevel(level: RiskLevel): string {
  if (level === "conservative") {
    return "稳健";
  }
  if (level === "balanced") {
    return "平衡";
  }
  if (level === "growth") {
    return "进取";
  }
  return "待评估";
}

function buildSafeActionHref(action: SafeNextAction): string {
  const routeAliases: Record<string, string> = {
    "/dashboard": "/today",
    "/coach": "/agent",
  };
  const allowedRoutes = new Set([
    "/today",
    "/agent",
    "/onboarding",
    "/learning",
    "/portfolio",
    "/simulation",
    "/news",
  ]);
  const requestedRoute = routeAliases[action.targetRoute] ?? action.targetRoute;
  const route = allowedRoutes.has(requestedRoute) ? requestedRoute : "/today";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(action.targetParams)) {
    if (value) {
      params.set(key, value === "dashboard" ? "today" : value);
    }
  }
  const query = params.toString();
  return query ? `${route}?${query}` : route;
}

function formatBriefStatus(status: DashboardDailyBrief["status"]): string {
  const labels = {
    ready: "已生成",
    starter: "起步简报",
    missing_profile: "缺画像",
    missing_portfolio: "缺组合",
    fallback: "安全兜底",
  };
  return labels[status];
}

function formatSupportLevel(level: "strong" | "medium" | "weak"): string {
  if (level === "strong") {
    return "强证据";
  }
  if (level === "medium") {
    return "中等证据";
  }
  return "弱证据";
}

function formatEvidenceSource(source: DashboardEvidenceSource): string {
  const labels = {
    profile: "画像",
    portfolio: "组合",
    news_policy: "新闻/政策",
    learning: "学习",
    simulation: "情境",
    behavior: "行为",
    coach_history: "教练记录",
  };
  return labels[source];
}

function stripInternalNewsPrompt(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return value
    .replace(/^把这条(?:政策|新闻)先翻译成一句新手能执行的话：/, "")
    .trim();
}

function formatBeginnerNewsSummary(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  return formatProductCopy(value);
}

function buildDailyReason(brief: DashboardDailyBrief | null): string {
  if (!brief) {
    return "资料还在同步，FundGene 会先等画像、组合或资讯足够后再生成个人化判断。";
  }

  const firstEvidence = brief.evidence[0]?.beginnerTranslation;
  return firstEvidence ?? brief.beginnerExplanation;
}

const sourceCoverageOrder: Array<{
  key: DashboardEvidenceSource;
  label: string;
}> = [
  { key: "profile", label: "画像" },
  { key: "portfolio", label: "组合" },
  { key: "news_policy", label: "资讯" },
  { key: "learning", label: "学习" },
  { key: "simulation", label: "训练" },
  { key: "behavior", label: "行为" },
  { key: "coach_history", label: "追问" },
];

function normalizePercent(value: number): number {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0));
}

function formatBriefTime(value: string | null | undefined): string {
  if (!value) {
    return "等待生成";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "已生成";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function MetricBar({
  value,
  label,
  tone = "accent",
}: {
  value: number;
  label?: string;
  tone?: "accent" | "positive" | "warning";
}) {
  const normalized = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const fill =
    tone === "positive"
      ? "linear-gradient(90deg, #34c759, #30d158)"
      : tone === "warning"
        ? "linear-gradient(90deg, #ff9f0a, #ffd60a)"
        : "linear-gradient(90deg, #0071e3, #32ade6)";

  return (
    <div className="space-y-2">
      {label ? (
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[color:var(--ink-muted)]">
          <span>{label}</span>
          <span>{normalizePercent(normalized)}%</span>
        </div>
      ) : null}
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label ?? "状态进度"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
      >
        <span
          className="progress-fill"
          style={{ width: `${normalized}%`, background: fill }}
        />
      </div>
    </div>
  );
}

function SourceCoverageRadar({ brief }: { brief: DashboardDailyBrief | null }) {
  const coveredCount = brief
    ? sourceCoverageOrder.filter((item) => brief.sourceCoverage[item.key]).length
    : 0;
  const totalCount = sourceCoverageOrder.length;
  const percent = Math.round((coveredCount / totalCount) * 100);
  const ringStyle = {
    "--coverage-angle": `${percent * 3.6}deg`,
  } as CSSProperties;

  return (
    <div className="rounded-2xl border border-[rgba(0,113,227,0.16)] bg-white/78 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="section-kicker">今日信号雷达</p>
          <p className="mt-1 text-sm font-semibold text-[color:var(--ink-strong)]">
            已检查 {coveredCount}/{totalCount} 类资料
          </p>
        </div>
        <div
          className="grid size-20 shrink-0 place-items-center rounded-full"
          style={{
            background:
              "conic-gradient(#0071e3 var(--coverage-angle), rgba(118,118,128,0.16) 0)",
            ...ringStyle,
          }}
          role="img"
          aria-label={`今日信号覆盖 ${coveredCount} 类，共 ${totalCount} 类`}
        >
          <span className="grid size-[4.1rem] place-items-center rounded-full bg-white text-lg font-black text-[color:var(--ink-strong)]">
            {percent}%
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sourceCoverageOrder.map((item) => {
          const isCovered = brief?.sourceCoverage[item.key] ?? false;

          return (
            <div
              key={item.key}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-[color:var(--line-soft)] bg-white/62 px-2.5 py-2 text-xs font-semibold text-[color:var(--ink-soft)]"
            >
              <span
                className={
                  isCovered
                    ? "grid size-5 shrink-0 place-items-center rounded-full bg-[rgba(52,199,89,0.16)] text-[#178a3b]"
                    : "grid size-5 shrink-0 place-items-center rounded-full bg-[rgba(118,118,128,0.14)] text-[color:var(--ink-muted)]"
                }
              >
                <CheckCircle2 aria-hidden="true" className="size-3" />
              </span>
              <span className="truncate">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EvidenceImpactList({ brief }: { brief: DashboardDailyBrief | null }) {
  const evidence = brief?.evidence ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="section-kicker">证据影响条</p>
        <BarChart3 aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
      </div>
      {evidence.length > 0 ? (
        evidence.map((item, index) => {
          const supportPercent =
            item.supportLevel === "strong" ? 100 : item.supportLevel === "medium" ? 68 : 38;
          const tone = item.supportLevel === "strong" ? "positive" : "accent";

          return (
            <article
              key={item.id}
              className="rounded-xl border border-[color:var(--line-soft)] bg-white/72 px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black text-[color:var(--ink-muted)]">
                  0{index + 1}
                </span>
                <StatusPill tone="neutral">
                  {formatEvidenceSource(item.sourceType)}
                </StatusPill>
                <StatusPill tone={item.supportLevel === "strong" ? "positive" : "accent"}>
                  {formatSupportLevel(item.supportLevel)}
                </StatusPill>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
                {item.claim}
              </p>
              <MetricBar value={supportPercent} tone={tone} label="支撑强度" />
              <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                {item.beginnerTranslation}
              </p>
              <p className="mt-2 text-[0.7rem] font-semibold leading-5 text-[color:var(--ink-muted)]">
                {item.freshnessLabel} · 提醒：{item.riskBoundary}
              </p>
            </article>
          );
        })
      ) : (
        <div className="rounded-xl border border-[color:var(--line-soft)] bg-white/66 px-4 py-3 text-sm leading-6 text-[color:var(--ink-soft)]">
          证据还在同步。简报不会在缺少上下文时伪造个人判断。
        </div>
      )}
    </div>
  );
}

function AgentCheckTimeline({
  brief,
  compact = false,
}: {
  brief: DashboardDailyBrief | null;
  compact?: boolean;
}) {
  const steps = [
    {
      label: "读取你的资料",
      detail: "只读取你已经允许 FundGene 使用的资料。",
    },
    {
      label: "看组合结构",
      detail: "先看持仓分布、主题重复和现金比例。",
    },
    {
      label: "整理资讯影响",
      detail: "把新闻翻译成可能影响的风险来源。",
    },
    {
      label: "准备下一步",
      detail: "给出需要你确认的查看、记录或训练入口。",
    },
  ];

  return (
    <div
      className={
        compact
          ? "command-process-panel"
          : "rounded-2xl border border-[color:var(--line-soft)] bg-white/62 p-4"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="section-kicker">{compact ? "本轮检查" : "检查过程"}</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--ink-muted)]">
          <Clock3 aria-hidden="true" className="size-3.5" />
          {formatBriefTime(brief?.asOf)}
        </span>
      </div>
      {compact ? (
        <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
          教练已经完成本轮检查，可以继续查看原因或去完成下一步。
        </p>
      ) : null}
      <div className={compact ? "mt-5 grid gap-4" : "mt-4 grid gap-2"}>
        {steps.map((item, index) => (
          <div
            key={item.label}
            className={
              compact
                ? "command-process-step"
                : "grid grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-3 text-xs font-semibold text-[color:var(--ink-soft)]"
            }
          >
            <span
              className={
                compact
                  ? "command-process-dot"
                  : "grid size-7 place-items-center rounded-full bg-[rgba(0,113,227,0.1)] text-[color:var(--accent-teal)]"
              }
            >
              {compact && index < 3 ? (
                <CheckCircle2 aria-hidden="true" className="size-3.5" />
              ) : (
                index + 1
              )}
            </span>
            <span className={compact ? "min-w-0" : "rounded-lg bg-white/70 px-3 py-2"}>
              <span className="block text-sm font-semibold text-[color:var(--ink-strong)]">
                {item.label}
              </span>
              {compact ? (
                <span className="mt-1 block text-xs leading-5 text-[color:var(--ink-soft)]">
                  {item.detail}
                </span>
              ) : null}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceToActionMap({
  brief,
  actionLabel,
  actionHref,
}: {
  brief: DashboardDailyBrief | null;
  actionLabel: string;
  actionHref: string;
}) {
  const inputs = (brief?.evidence ?? []).slice(0, 4);
  const fallbackInputs = [
    { label: "画像信号", text: "风险等级和长期目标" },
    { label: "组合信号", text: "集中度和持仓结构" },
    { label: "资讯信号", text: "今日影响路径" },
    { label: "行为信号", text: "追涨和回撤线索" },
  ];
  const visibleInputs =
    inputs.length > 0
      ? inputs.map((item) => ({
          label: `${formatEvidenceSource(item.sourceType)}信号`,
          text: item.beginnerTranslation || item.claim,
          support: item.supportLevel,
        }))
      : fallbackInputs;

  return (
    <div className="command-map mt-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">证据到行动地图</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
            从已检查信号收束到一个判断，再进入一个安全动作。
          </p>
        </div>
        <GitBranch aria-hidden="true" className="size-4 shrink-0 text-[color:var(--accent-teal)]" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 md:hidden">
        {visibleInputs.map((item) => (
          <span
            key={`mobile-${item.label}-${item.text}`}
            className="rounded-full border border-[color:var(--line-soft)] bg-white/78 px-3 py-1 text-xs font-semibold text-[color:var(--ink-soft)]"
          >
            {item.label}
          </span>
        ))}
        <ArrowRight aria-hidden="true" className="size-4 text-[color:var(--ink-muted)]" />
        <span className="rounded-full bg-[rgba(0,113,227,0.1)] px-3 py-1 text-xs font-black text-[color:var(--accent-teal)]">
          今日判断
        </span>
        <ArrowRight aria-hidden="true" className="size-4 text-[color:var(--ink-muted)]" />
        <span className="rounded-full bg-[rgba(52,199,89,0.14)] px-3 py-1 text-xs font-black text-[#178a3b]">
          下一步
        </span>
      </div>

      <div className="mt-5 hidden gap-3 md:grid md:grid-cols-[minmax(0,1.15fr)_4rem_minmax(0,0.82fr)_4rem_minmax(0,0.78fr)] md:items-center">
        <div className="grid gap-2 sm:grid-cols-2">
          {visibleInputs.map((item) => (
            <div
              key={`${item.label}-${item.text}`}
              className="command-map-node"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-[color:var(--ink-muted)]">
                  {item.label}
                </span>
                <span
                  className={
                    "size-2 rounded-full " +
                    ("support" in item && item.support === "strong"
                      ? "bg-[color:var(--success)]"
                      : "bg-[color:var(--accent-gold)]")
                  }
                />
              </div>
              <p className="text-clamp-2 mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="command-map-connector">
          <span />
          <ArrowRight aria-hidden="true" className="size-4" />
        </div>

        <div className="command-map-decision">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-[color:var(--accent-blue)] text-white">
              <Target aria-hidden="true" className="size-4" />
            </span>
            <p className="text-xs font-black text-[color:var(--accent-teal)]">今日判断</p>
          </div>
          <p className="mt-4 text-base font-semibold leading-7 text-[color:var(--ink-strong)]">
            {brief?.headline ?? "先整理证据，再决定下一步。"}
          </p>
          <Link
            href="/agent?from=today&focus=daily-brief"
            className="mt-4 inline-flex text-xs font-black text-[color:var(--accent-teal)]"
          >
            查看详细原因
            <ArrowRight aria-hidden="true" className="ml-1 size-3.5" />
          </Link>
        </div>

        <div className="command-map-connector">
          <span />
          <ArrowRight aria-hidden="true" className="size-4" />
        </div>

        <div className="command-map-action">
          <p className="text-xs font-black text-[#178a3b]">下一步</p>
          <p className="mt-3 text-base font-semibold leading-7 text-[color:var(--ink-strong)]">
            {actionLabel}
          </p>
          <p className="mt-3 text-xs leading-5 text-[color:var(--ink-soft)]">
            打开对应页面，所有资料变化都会先请你确认。
          </p>
          <Link href={actionHref} className="action-button mt-4 w-full">
            去完成下一步
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CoverageMatrix({ brief }: { brief: DashboardDailyBrief | null }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2">
      {sourceCoverageOrder.map((item) => {
        const isCovered = brief?.sourceCoverage[item.key] ?? false;

        return (
          <div
            key={item.key}
            className={
              isCovered
                ? "rounded-xl border border-[rgba(0,113,227,0.18)] bg-[rgba(0,113,227,0.08)] px-3 py-2"
                : "rounded-xl border border-[color:var(--line-soft)] bg-[rgba(118,118,128,0.08)] px-3 py-2"
            }
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[color:var(--ink-strong)]">
                {item.label}
              </span>
              <span
                className={
                  isCovered
                    ? "text-xs font-black text-[color:var(--accent-teal)]"
                    : "text-xs font-black text-[color:var(--ink-muted)]"
                }
              >
                {isCovered ? "已检查" : "待补"}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
              {isCovered ? "进入今日判断" : "不参与本次判断"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function SignalCell({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "neutral" | "positive" | "warning" | "accent";
}) {
  return (
    <div className="border-b border-[color:var(--line-soft)] py-4 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 flex-none place-items-center rounded-xl border border-[color:var(--line-soft)] bg-white/72">
          <Icon aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-[color:var(--ink-muted)]">
              {label}
            </span>
            <StatusPill tone={tone}>{value}</StatusPill>
          </span>
          <span className="text-clamp-2 mt-2 hidden text-sm leading-6 text-[color:var(--ink-soft)] sm:block">
            {detail}
          </span>
        </span>
      </div>
    </div>
  );
}

export function DashboardWorkspace() {
  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardState,
    enabled: Boolean(sessionQuery.data?.onboardingCompleted),
    retry: false,
  });

  const behaviorQuery = useQuery({
    queryKey: ["behavior-profile"],
    queryFn: getBehaviorProfile,
    enabled: Boolean(sessionQuery.data?.onboardingCompleted),
    retry: false,
  });

  if (sessionQuery.isLoading) {
    return (
      <InlineNotice>正在初始化当前用户工作台上下文...</InlineNotice>
    );
  }

  if (isApiError(sessionQuery.error) && sessionQuery.error.status === 401) {
    return (
      <SectionBlock
        eyebrow="工作台"
        title="当前会话未登录，暂时无法读取个人工作台。"
        description="登录后才能看到画像、问卷与下一步动作。"
      >
        <div className="surface-panel-strong rounded-lg px-5 py-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/start" className="action-button">
              去登录 / 注册
            </Link>
            <Link href="/" className="action-button-secondary">
              回到总览
            </Link>
          </div>
        </div>
      </SectionBlock>
    );
  }

  if (sessionQuery.error || !sessionQuery.data) {
    return (
      <InlineNotice tone="danger">
        当前会话不可用：{sessionQuery.error?.message ?? "未知错误"}
      </InlineNotice>
    );
  }

  if (!sessionQuery.data.onboardingCompleted) {
    return (
      <SectionBlock
        eyebrow="工作台"
        title="当前登录用户尚未完成建档。"
        description="工作台不会伪造风险画像。请先补齐基础资料和风险问卷。"
      >
        <div className="surface-panel-strong rounded-lg px-5 py-6">
          <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
            当前账号：{sessionQuery.data.email ?? sessionQuery.data.id}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/onboarding" className="action-button">
              去完成建档
            </Link>
            <Link href="/" className="action-button-secondary">
              回到总览
            </Link>
          </div>
        </div>
      </SectionBlock>
    );
  }

  if (dashboardQuery.isLoading || behaviorQuery.isLoading) {
    return <InlineNotice>正在同步工作台、用户信息和行为画像...</InlineNotice>;
  }

  if (dashboardQuery.error || behaviorQuery.error) {
    const error =
      dashboardQuery.error?.message ??
      behaviorQuery.error?.message ??
      "请求失败";
    return (
      <InlineNotice tone="danger">
        加载状态失败：{error}。请确认服务已运行。
      </InlineNotice>
    );
  }

  if (!dashboardQuery.data || !behaviorQuery.data) {
    return <InlineNotice>暂无可展示的工作台数据，请稍后重试。</InlineNotice>;
  }

  const dashboard = dashboardQuery.data;
  const behavior = behaviorQuery.data;
  const riskLevel = dashboard.riskLevel ?? behavior.riskLevel;
  const biasTags =
    dashboard.biasTags.length > 0 ? dashboard.biasTags : behavior.biasTags;
  const displayBiasTags = formatBiasTags(biasTags);
  const learningStatus = dashboard.learningStatus;
  const portfolioStatus = dashboard.portfolioStatus;
  const simulationStatus = dashboard.simulationStatus;
  const newsStatus = dashboard.newsStatus;
  const newsTitle = newsStatus?.latestTitle ?? null;
  const newsSummary = formatBeginnerNewsSummary(newsStatus?.latestSummary);
  const newsAgentInterpretation = stripInternalNewsPrompt(
    newsStatus?.beginnerTranslation,
  );
  const latestCoachActivity = dashboard.latestCoachActivity;
  const dailyBrief = dashboard.dailyBrief;
  const sourceCoverageCount = dailyBrief
    ? Object.values(dailyBrief.sourceCoverage).filter(Boolean).length
    : 0;

  const learningDetail = learningStatus
    ? learningStatus.recommendedCourseTitle
      ? `推荐继续：《${learningStatus.recommendedCourseTitle}》。`
      : "主路径已完成，可以回到教练或情境训练。"
    : "学习状态暂不可用。";
  const simulationDetail = simulationStatus?.latestReviewSummary
    ? simulationStatus.latestReviewSummary
    : simulationStatus?.recommendedScenarioTitle
      ? `建议进入「${simulationStatus.recommendedScenarioTitle}」。`
      : "完成一次历史情境训练后，复盘会回流到这里。";
  const legacyPrimaryAction = formatProductCopy(
    dashboard.nextActions[0] ??
      "先完成一次教练提问，系统会把回答回流到学习、组合和行为训练。",
  );
  const primaryActionLabel =
    dailyBrief?.primaryAction.label ?? legacyPrimaryAction;
  const primaryActionHref = dailyBrief?.primaryAction
    ? buildSafeActionHref(dailyBrief.primaryAction)
    : legacyPrimaryAction.includes("情境")
    ? "/simulation"
    : legacyPrimaryAction.includes("组合")
      ? "/portfolio"
      : legacyPrimaryAction.includes("资讯") ||
          legacyPrimaryAction.includes("新闻") ||
          legacyPrimaryAction.includes("政策")
          ? "/news"
          : legacyPrimaryAction.includes("学习")
            ? "/learning"
            : legacyPrimaryAction.includes("建档")
              ? "/onboarding"
              : legacyPrimaryAction.includes("教练")
                ? "/agent"
                : !latestCoachActivity
                  ? "/agent"
                  : !portfolioStatus?.hasReport
                    ? "/portfolio"
                    : learningStatus && learningStatus.overallProgressPercentage < 100
                      ? "/learning"
                      : "/simulation";
  const dailyReason = buildDailyReason(dailyBrief);
  return (
    <div className="today-command-dashboard">
      <section className="agent-hero command-center-hero overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.39fr)]">
          <div className="command-center-main flex flex-col px-5 py-6 sm:px-6 lg:px-7">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone="accent">今日简报</StatusPill>
                    <StatusPill tone={dailyBrief?.status === "ready" ? "positive" : "warning"}>
                      {dailyBrief ? formatBriefStatus(dailyBrief.status) : "同步中"}
                    </StatusPill>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-[color:var(--ink-muted)]">
                    {formatBriefTime(dailyBrief?.asOf)} · 已为你检查 {sourceCoverageCount} 类资料
                  </p>
                </div>
                <Link
                  href={
                    dailyBrief
                      ? `/agent?from=today&focus=daily-brief&daily_brief_id=${encodeURIComponent(dailyBrief.briefId)}`
                      : "/agent"
                  }
                  className="action-button command-hero-explain"
                >
                  让教练解释
                </Link>
              </div>
              <p className="mt-5 text-xs font-black text-[color:var(--ink-muted)]">
                今日判断
              </p>
              <h3 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-[2.65rem]">
                {dailyBrief?.headline ?? "今天先处理一件可解释、可回流的事。"}
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--ink-soft)]">
                {dailyBrief?.beginnerExplanation ??
                  "FundGene 会把今日资料先压缩成一个可解释判断，再给出一个不会越界的下一步。"}
              </p>
              <div className="mt-4">
                <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/72 px-4 py-4">
                  <p className="section-kicker">为什么</p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
                    {dailyReason}
                  </p>
                </div>
              </div>
              <EvidenceToActionMap
                brief={dailyBrief}
                actionLabel={primaryActionLabel}
                actionHref={primaryActionHref}
              />
              <div className="mt-3 rounded-2xl border border-[rgba(52,199,89,0.22)] bg-[rgba(52,199,89,0.08)] px-4 py-3 md:hidden">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                  <p className="section-kicker text-[#178a3b]">现在做什么</p>
                  <p className="mt-2 text-lg font-semibold leading-7 text-[color:var(--ink-strong)]">
                    {primaryActionLabel}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[color:var(--ink-soft)]">
                    {dailyBrief?.primaryAction.reason ?? legacyPrimaryAction}
                  </p>
                  </div>
                  <Link href={primaryActionHref} className="action-button shrink-0">
                    去完成下一步
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="command-micro-strip mt-3 grid gap-2 sm:grid-cols-3">
              <SignalCell icon={ShieldCheck} label="风险基线" value={formatRiskLevel(riskLevel)} detail="判断只解释风险承受。" tone={riskLevel ? "positive" : "warning"} />
              <SignalCell icon={Target} label="行为焦点" value={displayBiasTags[0] ?? "待观察"} detail={displayBiasTags.length > 0 ? displayBiasTags.join("、") : "继续积累证据"} tone={biasTags.length > 0 ? "accent" : "warning"} />
              <SignalCell icon={Gauge} label="证据覆盖" value={`${sourceCoverageCount} 类`} detail="只展示可追溯来源。" tone="accent" />
            </div>
          </div>

          <aside className="signal-strip command-side-panel flex flex-col gap-4 px-5 py-6 sm:px-6 xl:border-l xl:border-[color:var(--line-soft)]">
            <AgentCheckTimeline brief={dailyBrief} compact />
            <div className="command-inline-signal rounded-2xl border border-[color:var(--line-soft)] bg-white/72 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="section-kicker">今日信号面板</p>
                <StatusPill tone="accent">
                  {learningStatus?.recommendedCourseTitle ? "推荐学习" : "继续训练"}
                </StatusPill>
              </div>
              <p className="mt-2 text-xs font-semibold leading-5 text-[color:var(--ink-strong)]">
                {dailyBrief?.evidence[0]?.claim ??
                  portfolioStatus?.summary ??
                  "组合资料待补，先不推导账户影响。"}
              </p>
              <p className="mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                {learningDetail} {simulationStatus?.latestScenarioTitle ?? "回撤纪律训练"}：
                {simulationDetail}
              </p>
              <p className="text-clamp-2 mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                <span className="font-black text-[color:var(--ink-muted)]">新闻标题：</span>
                {newsTitle ?? "暂未返回标题"}{" "}
                <span className="font-black text-[color:var(--ink-muted)]">新闻概括：</span>
                {newsSummary ?? "原始摘要暂不可用。"}{" "}
                <span className="font-black text-[color:var(--accent-teal)]">简要解读：</span>
                {newsAgentInterpretation ?? "先看它通过什么路径影响组合，再决定是否追问。"}
              </p>
            </div>
            <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/72 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="section-kicker">关键证据</p>
                <BarChart3 aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
              </div>
              <div className="mt-3 grid gap-2">
                {(dailyBrief?.evidence ?? []).slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-[color:var(--line-soft)] bg-white/76 px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill tone="neutral">
                        {formatEvidenceSource(item.sourceType)}
                      </StatusPill>
                      <StatusPill tone={item.supportLevel === "strong" ? "positive" : "accent"}>
                        {formatSupportLevel(item.supportLevel)}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
                      {item.claim}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <details className="rounded-2xl border border-[color:var(--line-soft)] bg-white/72 p-4">
              <summary className="cursor-pointer text-sm font-bold text-[color:var(--accent-teal)]">
                展开已检查内容
              </summary>
              <div className="mt-4 grid gap-4">
                <SourceCoverageRadar brief={dailyBrief} />
                <EvidenceImpactList brief={dailyBrief} />
              </div>
            </details>
            <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/72 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="section-kicker">今日覆盖范围</p>
                <Radar aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
              </div>
              <CoverageMatrix brief={dailyBrief} />
            </div>
          </aside>

          <div className="command-support-grid border-t border-[color:var(--line-soft)] bg-white/68 p-4 xl:col-span-2">
            <Link href="/automations" className="command-support-card">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink-strong)]">
                  <Clock3 aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
                  自动任务授权状态
                </span>
                <StatusPill tone="positive">今日简报已授权</StatusPill>
              </div>
              <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                每天自动读取画像、组合、资讯和训练状态，只生成分析和待确认建议。
              </p>
            </Link>
            <Link href="/profile" className="command-support-card">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink-strong)]">
                  <ClipboardCheck aria-hidden="true" className="size-4 text-[color:var(--accent-gold)]" />
                  待确认资料
                </span>
                <StatusPill tone={biasTags.length > 0 ? "warning" : "neutral"}>
                  {biasTags.length > 0 ? "需要你决定" : "暂无待处理"}
                </StatusPill>
              </div>
              <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                行为证据和长期画像变化会先进入待确认，不会被系统静默保存。
              </p>
            </Link>
            <Link href="/learning" className="command-support-card">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink-strong)]">
                  <BookOpenCheck aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
                  移动端信号详情
                </span>
                <StatusPill tone="accent">
                  {learningStatus?.recommendedCourseTitle ? "推荐学习" : "继续训练"}
                </StatusPill>
              </div>
              <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                {learningDetail} {simulationStatus?.latestScenarioTitle ?? "回撤纪律训练"}：
                {simulationDetail}
              </p>
              <p className="text-clamp-2 mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                <span className="font-black text-[color:var(--ink-muted)]">标题：</span>
                {newsTitle ?? "暂未返回标题"}{" "}
                <span className="font-black text-[color:var(--ink-muted)]">概括：</span>
                {newsSummary ? `${newsSummary.slice(0, 14)}...` : "原始摘要暂不可用。"}{" "}
                <span className="font-black text-[color:var(--accent-teal)]">解读：</span>
                {newsAgentInterpretation ?? "先看它通过什么路径影响组合，再决定是否追问。"}
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="today-mobile-detail space-y-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-xl border border-[color:var(--line-soft)] bg-white/72 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Layers3 aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
              <p className="text-sm font-semibold">今日状态总览</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
              {sourceCoverageCount} 类信号已进入今日判断；如果某一类为空，系统会把它当作待补资料，而不是编造结论。
            </p>
            <CoverageMatrix brief={dailyBrief} />
          </div>
          <div className="grid gap-2 rounded-xl border border-[color:var(--line-soft)] bg-white/72 p-4 shadow-sm sm:grid-cols-3">
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">情境</span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {simulationStatus?.latestScenarioTitle ??
                  simulationStatus?.recommendedScenarioTitle ??
                  "待训练"}
              </span>
            </div>
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">资讯</span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {newsStatus?.latestTitle ?? "待解读"}
              </span>
            </div>
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">教练</span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {latestCoachActivity ? latestCoachActivity.answerFocus : "待提问"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
