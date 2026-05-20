"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
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
  type TodayEvidenceTone = "positive" | "accent" | "warning";
  const evidenceHighlights =
    dailyBrief?.evidence.slice(0, 3).map((item) => ({
      id: item.id,
      label: formatEvidenceSource(item.sourceType),
      title: item.claim,
      detail: item.beginnerTranslation,
      tone: (item.supportLevel === "strong" ? "positive" : "accent") as TodayEvidenceTone,
    })) ?? [];
  const fallbackEvidenceHighlights = [
    {
      id: "portfolio-fallback",
      label: "组合",
      title: portfolioStatus?.summary ?? "先录入一份组合快照。",
      detail: portfolioStatus?.hasReport
        ? "组合结构会决定资讯和训练是否真的和你有关。"
        : "缺少组合时，今日判断只能给学习和建档建议。",
      tone: (portfolioStatus?.hasReport ? "positive" : "warning") as TodayEvidenceTone,
    },
    {
      id: "news-fallback",
      label: "资讯",
      title: newsTitle ?? "暂未选择今日资讯。",
      detail: newsAgentInterpretation ?? "资讯需要先拆成事实、影响路径和不确定性。",
      tone: (newsStatus?.hasAnalysis ? "accent" : "warning") as TodayEvidenceTone,
    },
    {
      id: "learning-fallback",
      label: "学习",
      title: learningStatus?.recommendedCourseTitle ?? "继续补齐基金基础。",
      detail: learningDetail,
      tone: (learningStatus?.overallProgressPercentage ? "positive" : "accent") as TodayEvidenceTone,
    },
  ] as const;
  const todayEvidenceCards = [
    ...evidenceHighlights,
    ...fallbackEvidenceHighlights.filter(
      (fallback) => !evidenceHighlights.some((item) => item.label === fallback.label),
    ),
  ].slice(0, 3);
  const coveredSignals = sourceCoverageOrder.filter(
    (item) => dailyBrief?.sourceCoverage[item.key],
  );

  return (
    <div className="today-command-dashboard">
      <section className="agent-hero command-center-hero today-cockpit overflow-hidden">
        <div className="today-cockpit-grid">
          <div className="today-cockpit-main">
            <div className="today-brief-header">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone="accent">今日简报</StatusPill>
                  <StatusPill tone={dailyBrief?.status === "ready" ? "positive" : "warning"}>
                    {dailyBrief ? formatBriefStatus(dailyBrief.status) : "同步中"}
                  </StatusPill>
                </div>
                <p className="mt-3 text-xs font-semibold text-[color:var(--ink-muted)]">
                  {formatBriefTime(dailyBrief?.asOf)} · 已检查 {sourceCoverageCount} 类资料
                </p>
              </div>
              <Link
                href={
                  dailyBrief
                    ? `/agent?from=today&focus=daily-brief&daily_brief_id=${encodeURIComponent(dailyBrief.briefId)}`
                    : "/agent"
                }
                className="action-button today-explain-button"
              >
                让教练解释
              </Link>
            </div>

            <div className="today-judgement-block">
              <p className="section-kicker">今日判断</p>
              <h3>{dailyBrief?.headline ?? "今天先处理一件可解释、可回流的事。"}</h3>
              <p>
                {dailyBrief?.beginnerExplanation ??
                  "FundGene 会把今日资料先压缩成一个可解释判断，再给出一个不会越界的下一步。"}
              </p>
            </div>

            <div className="today-action-panel">
              <div>
                <p className="section-kicker text-[#178a3b]">今天只做这一步</p>
                <h4>{primaryActionLabel}</h4>
                <p>{dailyBrief?.primaryAction.reason ?? legacyPrimaryAction}</p>
              </div>
              <Link href={primaryActionHref} className="action-button">
                去完成下一步
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="today-why-panel">
              <div>
                <p className="section-kicker">为什么先做它</p>
                <p>{dailyReason}</p>
              </div>
              <div className="today-safety-note">
                <ShieldCheck aria-hidden="true" className="size-4" />
                <span>{dailyBrief?.doNotDo ?? "今天的判断只用于理解和检查，不会替你买卖或下单。"}</span>
              </div>
            </div>

            <div className="today-evidence-grid" aria-label="今日判断依据">
              {todayEvidenceCards.map((item, index) => (
                <article key={item.id} className="today-evidence-card">
                  <div className="flex items-center justify-between gap-3">
                    <span className="today-evidence-index">{index + 1}</span>
                    <StatusPill tone={item.tone}>{item.label}</StatusPill>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.detail}</p>
                </article>
              ))}
            </div>

            <div className="today-quick-strip">
              <SignalCell
                icon={ShieldCheck}
                label="风险基线"
                value={formatRiskLevel(riskLevel)}
                detail="只解释风险承受，不给账户指令。"
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
                label="资料覆盖"
                value={`${sourceCoverageCount} 类`}
                detail="只展示可追溯来源。"
                tone="accent"
              />
            </div>
          </div>

          <aside className="today-cockpit-side">
            <AgentCheckTimeline brief={dailyBrief} compact />
            <div className="today-side-card">
              <div className="flex items-center justify-between gap-3">
                <p className="section-kicker">已进入判断的资料</p>
                <Radar aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
              </div>
              <div className="today-coverage-list">
                {(coveredSignals.length > 0 ? coveredSignals : sourceCoverageOrder.slice(0, 4)).map((item) => (
                  <span key={item.key}>
                    <CheckCircle2 aria-hidden="true" className="size-3.5" />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="today-side-card">
              <div className="flex items-center justify-between gap-3">
                <p className="section-kicker">可继续追问</p>
                <StatusPill tone="accent">
                  {learningStatus?.recommendedCourseTitle ? "推荐学习" : "继续训练"}
                </StatusPill>
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--ink-strong)]">
                {newsTitle ?? portfolioStatus?.summary ?? "先补齐组合和资讯，再做个人化解释。"}
              </p>
              <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                {newsAgentInterpretation ?? learningDetail}
              </p>
              <div className="mt-4 grid gap-2">
                <Link href="/news" className="coach-sidebar-action-link">
                  查看资讯影响
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link href="/learning" className="coach-sidebar-action-link">
                  继续学习训练
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </div>
          </aside>
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
