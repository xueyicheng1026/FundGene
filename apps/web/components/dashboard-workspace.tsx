"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { type CSSProperties } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  GitBranch,
  Gauge,
  GraduationCap,
  Layers3,
  Newspaper,
  PlayCircle,
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

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "待录入";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
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
                {item.freshnessLabel} · 边界：{item.riskBoundary}
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

function AgentCheckTimeline({ brief }: { brief: DashboardDailyBrief | null }) {
  const steps = [
    "读取画像和行为线索",
    "检查组合、学习与训练状态",
    "筛选资讯影响路径",
    "生成安全下一步",
  ];

  return (
    <div className="rounded-2xl border border-[color:var(--line-soft)] bg-white/62 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="section-kicker">检查过程</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--ink-muted)]">
          <Clock3 aria-hidden="true" className="size-3.5" />
          {formatBriefTime(brief?.asOf)}
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {steps.map((item, index) => (
          <div
            key={item}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-3 text-xs font-semibold text-[color:var(--ink-soft)]"
          >
            <span className="grid size-7 place-items-center rounded-full bg-[rgba(0,113,227,0.1)] text-[color:var(--accent-teal)]">
              {index + 1}
            </span>
            <span className="rounded-lg bg-white/70 px-3 py-2">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactPathMap({
  brief,
  actionLabel,
}: {
  brief: DashboardDailyBrief | null;
  actionLabel: string;
}) {
  const inputs = (brief?.evidence ?? []).slice(0, 3);
  const fallbackInputs = [
    { label: "组合", text: "集中度和持仓结构" },
    { label: "资讯", text: "今日影响路径" },
    { label: "行为", text: "追涨和回撤线索" },
  ];
  const visibleInputs =
    inputs.length > 0
      ? inputs.map((item) => ({
          label: formatEvidenceSource(item.sourceType),
          text: item.claim,
        }))
      : fallbackInputs;

  return (
    <div className="mt-5 rounded-2xl border border-[rgba(0,113,227,0.16)] bg-white/68 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="section-kicker">今日影响路径</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
            从已检查信号收束到一个安全动作。
          </p>
        </div>
        <GitBranch aria-hidden="true" className="size-4 shrink-0 text-[color:var(--accent-teal)]" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 sm:hidden">
        {visibleInputs.map((item) => (
          <span
            key={`mobile-${item.label}-${item.text}`}
            className="rounded-full border border-[color:var(--line-soft)] bg-white/72 px-3 py-1 text-xs font-semibold text-[color:var(--ink-soft)]"
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
          安全动作
        </span>
      </div>

      <div className="mt-4 hidden gap-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,0.95fr)] sm:items-stretch">
        <div className="grid gap-2">
          {visibleInputs.map((item) => (
            <div
              key={`${item.label}-${item.text}`}
              className="rounded-xl border border-[color:var(--line-soft)] bg-white/72 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-[color:var(--ink-muted)]">
                  {item.label}
                </span>
                <span className="size-2 rounded-full bg-[color:var(--accent-teal)]" />
              </div>
              <p className="text-clamp-2 mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div className="hidden items-center text-[color:var(--ink-muted)] sm:flex">
          <ArrowRight aria-hidden="true" className="size-4" />
        </div>

        <div className="rounded-xl border border-[rgba(0,113,227,0.2)] bg-[rgba(0,113,227,0.07)] px-3 py-3">
          <p className="text-xs font-black text-[color:var(--accent-teal)]">今日判断</p>
          <p className="text-clamp-3 mt-2 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
            {brief?.headline ?? "先整理证据，再决定下一步。"}
          </p>
        </div>

        <div className="hidden items-center text-[color:var(--ink-muted)] sm:flex">
          <ArrowRight aria-hidden="true" className="size-4" />
        </div>

        <div className="rounded-xl border border-[rgba(52,199,89,0.22)] bg-[rgba(52,199,89,0.09)] px-3 py-3">
          <p className="text-xs font-black text-[#178a3b]">安全动作</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
            {actionLabel}
          </p>
          <p className="mt-1 hidden text-xs leading-5 text-[color:var(--ink-soft)] sm:block">
            只进入理解、检查或训练，不触发账户操作。
          </p>
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
  const portfolioDetail = portfolioStatus?.hasReport
    ? portfolioStatus.summary ?? "最近组合报告已生成。"
    : "还没有组合报告，先录入一份手动快照。";
  const simulationDetail = simulationStatus?.latestReviewSummary
    ? simulationStatus.latestReviewSummary
    : simulationStatus?.recommendedScenarioTitle
      ? `建议进入「${simulationStatus.recommendedScenarioTitle}」。`
      : "完成一次历史情境训练后，复盘会回流到这里。";
  const newsDetail = newsStatus?.hasAnalysis
    ? newsTitle ?? "最近资讯解读已经生成。"
    : "选择一条资讯或手动粘贴信息，生成事实、影响路径和不确定性。";
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
  const signalPanels = [
    {
      icon: GraduationCap,
      title: "学习信号",
      value: learningStatus
        ? `${learningStatus.completedCoursesCount}/${learningStatus.totalCourses}`
        : "待同步",
      detail: learningDetail,
      href: "/learning",
      score: learningStatus?.overallProgressPercentage ?? 0,
      scoreLabel: "主路径进度",
      tone: learningStatus ? "positive" : "warning",
    },
    {
      icon: BriefcaseBusiness,
      title: "组合信号",
      value: portfolioStatus?.hasReport
        ? formatCurrency(portfolioStatus.totalValue)
        : "待录入",
      detail: portfolioDetail,
      href: "/portfolio",
      score: portfolioStatus?.hasReport ? 100 : 24,
      scoreLabel: "报告可用度",
      tone: portfolioStatus?.hasReport ? "positive" : "warning",
    },
    {
      icon: PlayCircle,
      title: "训练信号",
      value: simulationStatus
        ? `${simulationStatus.completedSessionsCount} 次`
        : "待训练",
      detail: simulationDetail,
      href: "/simulation",
      score:
        simulationStatus && simulationStatus.completedSessionsCount > 0
          ? 100
          : 26,
      scoreLabel: "复盘回流",
      tone:
        simulationStatus && simulationStatus.completedSessionsCount > 0
          ? "positive"
          : "warning",
    },
    {
      icon: Newspaper,
      title: "资讯信号",
      value: newsStatus?.hasAnalysis ? "已有解读" : "待解读",
      detail: newsDetail,
      href: "/news",
      score: newsStatus?.hasAnalysis ? 100 : 28,
      scoreLabel: "影响路径",
      tone: newsStatus?.hasAnalysis ? "positive" : "warning",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <section className="agent-hero overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)]">
          <div className="flex flex-col px-5 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="accent">今日简报</StatusPill>
                <StatusPill tone={dailyBrief?.status === "ready" ? "positive" : "warning"}>
                  {dailyBrief ? formatBriefStatus(dailyBrief.status) : "同步中"}
                </StatusPill>
              </div>
              <p className="mt-8 text-xs font-black text-[color:var(--ink-muted)]">
                今日判断
              </p>
              <h3 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
                {dailyBrief?.headline ?? "今天先处理一件可解释、可回流的事。"}
              </h3>
              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                <div className="rounded-xl border border-[color:var(--line-soft)] bg-white/72 px-4 py-4">
                  <p className="section-kicker">为什么</p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
                    {dailyReason}
                  </p>
                </div>
                <div className="rounded-xl border border-[rgba(52,199,89,0.22)] bg-[rgba(52,199,89,0.08)] px-4 py-4">
                  <p className="section-kicker text-[#178a3b]">现在做什么</p>
                  <p className="mt-2 text-lg font-semibold leading-7 text-[color:var(--ink-strong)]">
                    {primaryActionLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                    {dailyBrief?.primaryAction.reason ?? legacyPrimaryAction}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/85 px-4 py-4 lg:col-span-2">
                  <p className="section-kicker text-amber-800">今天不要做什么</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-amber-900">
                    {dailyBrief?.doNotDo ?? "不要把通用信息理解成个人账户操作。"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <SignalCell
                icon={ShieldCheck}
                label="风险基线"
                value={formatRiskLevel(riskLevel)}
                detail="判断只解释风险承受，不替你下账户动作。"
                tone={riskLevel ? "positive" : "warning"}
              />
              <SignalCell
                icon={Target}
                label="行为焦点"
                value={displayBiasTags[0] ?? "待观察"}
                detail={displayBiasTags.length > 0 ? displayBiasTags.join("、") : "继续积累证据"}
                tone={biasTags.length > 0 ? "accent" : "warning"}
              />
              <SignalCell
                icon={Gauge}
                label="证据覆盖"
                value={`${sourceCoverageCount} 类`}
                detail="只展示当前可追溯来源。"
                tone="accent"
              />
            </div>
            <ImpactPathMap brief={dailyBrief} actionLabel={primaryActionLabel} />
          </div>

          <aside className="signal-strip flex flex-col gap-4 px-5 py-6 sm:px-6 xl:border-l xl:border-white/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="section-kicker">简报依据</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--ink-strong)]">
                  默认收起，只在你想核对时展开。
                </p>
              </div>
              <Radar aria-hidden="true" className="size-5 shrink-0 text-[color:var(--accent-teal)]" />
            </div>
            <details className="rounded-2xl border border-[color:var(--line-soft)] bg-white/68 p-4">
              <summary className="cursor-pointer text-sm font-bold text-[color:var(--accent-teal)]">
                展开已检查内容
              </summary>
              <div className="mt-4 grid gap-4">
                <SourceCoverageRadar brief={dailyBrief} />
                <EvidenceImpactList brief={dailyBrief} />
                <AgentCheckTimeline brief={dailyBrief} />
              </div>
            </details>
          </aside>

          <div className="border-t border-[color:var(--line-soft)] bg-white/72 px-5 py-4 sm:px-6 lg:px-8 xl:col-span-2">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex items-start gap-3">
                <span className="grid size-11 flex-none place-items-center rounded-xl bg-[color:var(--accent-teal)] text-white shadow-[0_10px_22px_rgba(0,113,227,0.18)]">
                  <BookOpenCheck aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="text-xs font-black text-[color:var(--ink-muted)]">
                    唯一行动区
                  </span>
                  <span className="mt-1 block text-lg font-semibold leading-6 text-[color:var(--ink-strong)]">
                    {primaryActionLabel}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-[color:var(--ink-soft)]">
                    {dailyBrief?.primaryAction.reason ?? legacyPrimaryAction}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-[color:var(--ink-muted)]">
                    {dailyBrief?.primaryAction.safetyNote ??
                      "下一步只用于理解、检查或训练，不触发账户操作。"}
                  </span>
                </span>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href={primaryActionHref} className="action-button">
                  执行安全下一步
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link
                  href={
                    dailyBrief
                      ? `/agent?from=today&focus=daily-brief&daily_brief_id=${encodeURIComponent(dailyBrief.briefId)}`
                      : "/agent"
                  }
                  className="action-button-secondary"
                >
                  让教练解释
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">今日信号面板</p>
            <h3 className="mt-2 text-xl font-semibold">把学习、组合、训练和资讯压缩成一览视图。</h3>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">
            这些入口仍可点击查看详情，但在 Today 页只作为今日判断的资料状态。
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {signalPanels.map(({ icon: Icon, title, value, detail, href, tone, score, scoreLabel }) => {
            if (title === "资讯信号" && newsStatus?.hasAnalysis) {
              return (
                <Link
                  key={title}
                  href={href}
                  className="group rounded-xl border border-[color:var(--line-soft)] bg-white/62 px-4 py-4 transition hover:-translate-y-0.5 hover:border-[rgba(0,113,227,0.28)] hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink-strong)]">
                      <Icon aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
                      {title}
                    </span>
                    <StatusPill tone={tone as "positive" | "warning" | "accent" | "neutral"}>
                      {value}
                    </StatusPill>
                  </div>
                  <div className="mt-4">
                    <MetricBar
                      value={score}
                      label={scoreLabel}
                      tone={tone as "positive" | "warning"}
                    />
                  </div>
                  <div className="mt-3 space-y-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                    <p>
                      <span className="font-black text-[color:var(--ink-muted)]">
                        新闻标题：
                      </span>
                      {newsTitle ?? "暂未返回标题"}
                    </p>
                    <p>
                      <span className="font-black text-[color:var(--ink-muted)]">
                        新闻概括：
                      </span>
                      {newsSummary ?? "原始摘要暂不可用。"}
                    </p>
                    <p>
                      <span className="font-black text-[color:var(--accent-teal)]">
                        简要解读：
                      </span>
                      {newsAgentInterpretation ?? "先看它通过什么路径影响组合，再决定是否追问。"}
                    </p>
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={title}
                href={href}
                className="group rounded-xl border border-[color:var(--line-soft)] bg-white/62 px-4 py-4 transition hover:-translate-y-0.5 hover:border-[rgba(0,113,227,0.28)] hover:bg-white"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-sm font-semibold text-[color:var(--ink-strong)]">
                    <Icon aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
                    {title}
                  </span>
                  <StatusPill tone={tone as "positive" | "warning" | "accent" | "neutral"}>
                    {value}
                  </StatusPill>
                </div>
                <div className="mt-4">
                  <MetricBar
                    value={score}
                    label={scoreLabel}
                    tone={tone as "positive" | "warning"}
                  />
                </div>
                <p className="text-clamp-3 mt-3 min-h-[3.75rem] text-xs leading-5 text-[color:var(--ink-soft)]">
                  {detail}
                </p>
              </Link>
            );
          })}
        </div>

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
