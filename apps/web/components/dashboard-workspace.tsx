"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Gauge,
  GraduationCap,
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
  type RiskLevel,
} from "@/lib/api";
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

function formatDate(value: string | null): string {
  if (!value) {
    return "待生成";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function LabeledProgressBar({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-normal text-[color:var(--ink-muted)]">
        <span>Learning progress</span>
        <span>{normalized}%</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="学习进度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalized}
      >
        <span className="progress-fill" style={{ width: `${normalized}%` }} />
      </div>
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
          <span className="mt-2 block text-sm leading-6 text-[color:var(--ink-soft)]">
            {detail}
          </span>
        </span>
      </div>
    </div>
  );
}

function ModuleRow({
  icon: Icon,
  title,
  status,
  detail,
  href,
  action,
  tone = "neutral",
}: {
  icon: LucideIcon;
  title: string;
  status: string;
  detail: string;
  href: string;
  action: string;
  tone?: "neutral" | "positive" | "warning" | "accent";
}) {
  return (
    <Link
      href={href}
      className="group grid gap-4 border-b border-[color:var(--line-soft)] py-4 transition-colors last:border-b-0 hover:bg-white/42 sm:grid-cols-[2.4rem_minmax(0,1fr)_auto]"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-[color:var(--surface-inverse)] text-[color:var(--ink-inverse)]">
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-black">{title}</span>
          <StatusPill tone={tone}>{status}</StatusPill>
        </span>
        <span className="mt-2 block text-sm leading-6 text-[color:var(--ink-soft)]">
          {detail}
        </span>
      </span>
      <span className="flex items-center gap-2 text-sm font-black text-[color:var(--accent-teal)]">
        {action}
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
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
  const user = sessionQuery.data;
  const riskLevel = dashboard.riskLevel ?? behavior.riskLevel;
  const biasTags =
    dashboard.biasTags.length > 0 ? dashboard.biasTags : behavior.biasTags;
  const learningStatus = dashboard.learningStatus;
  const portfolioStatus = dashboard.portfolioStatus;
  const simulationStatus = dashboard.simulationStatus;
  const newsStatus = dashboard.newsStatus;
  const latestCoachActivity = dashboard.latestCoachActivity;

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
    ? newsStatus.beginnerTranslation ??
      newsStatus.latestTitle ??
      "最近资讯解读已经生成。"
    : "选择一条资讯或手动粘贴信息，生成事实、影响路径和不确定性。";
  const coachDetail = latestCoachActivity
    ? latestCoachActivity.answerFocus
    : "完成第一条 coach 问答后，这里会显示最近主题和指导焦点。";
  const primaryAction =
    dashboard.nextActions[0] ??
    "先完成一次教练提问，系统会把回答回流到学习、组合和行为训练。";
  const primaryActionHref = !latestCoachActivity
    ? "/coach"
    : !portfolioStatus?.hasReport
      ? "/portfolio"
      : learningStatus && learningStatus.overallProgressPercentage < 100
        ? "/learning"
        : "/simulation";

  return (
    <div className="space-y-5">
      <section className="agent-hero overflow-hidden">
        <div className="grid gap-0 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <div className="px-5 py-6 sm:px-6 lg:px-7 lg:py-7">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="accent">Advisor orchestrator</StatusPill>
              <StatusPill tone={riskLevel ? "positive" : "warning"}>
                {formatRiskLevel(riskLevel)}
              </StatusPill>
            </div>
            <h3 className="mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-4xl">
              今天先处理一件事：{primaryAction}
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
              {user.displayName ?? "当前用户"} 的画像、学习、组合、情境和资讯状态会被
              agent 统一读取；工作台只保留行动优先级和证据入口。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={primaryActionHref} className="action-button">
                执行下一步
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/coach" className="action-button-secondary">
                进入 Agent 教练
              </Link>
            </div>
          </div>

          <div className="signal-strip px-5 py-5 sm:px-6 xl:border-l xl:border-white/10">
            <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
              <div>
                <p className="text-xs font-black text-teal-200/72">Learning</p>
                <p className="mt-1 text-2xl font-black text-white">
                  {learningStatus?.overallProgressPercentage ?? 0}%
                </p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  {learningDetail}
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-teal-200/72">Portfolio</p>
                <p className="mt-1 text-2xl font-black text-white">
                  {portfolioStatus?.hasReport
                    ? formatCurrency(portfolioStatus.totalValue)
                    : "待录入"}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  {portfolioDetail}
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-teal-200/72">Coach</p>
                <p className="mt-1 text-2xl font-black text-white">
                  {latestCoachActivity?.intent ?? "待提问"}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/55">
                  {coachDetail}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="workbench-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">User state</p>
              <h3 className="mt-2 text-2xl font-black">当前判断基线</h3>
            </div>
            <Radar aria-hidden="true" className="size-5 text-[color:var(--accent-teal)]" />
          </div>
          <div className="mt-5">
            <SignalCell
              icon={ShieldCheck}
              label="风险等级"
              value={formatRiskLevel(riskLevel)}
              detail="来自问卷和行为画像，只用于解释风险承受与训练方向。"
              tone={riskLevel ? "positive" : "warning"}
            />
            <SignalCell
              icon={Target}
              label="行为焦点"
              value={biasTags[0] ?? "待继续观察"}
              detail={
                biasTags.length > 0
                  ? `当前观测到：${biasTags.join("、")}。`
                  : "继续完成问卷、教练问答和情境训练后会逐步形成证据。"
              }
              tone={biasTags.length > 0 ? "accent" : "warning"}
            />
            <SignalCell
              icon={Gauge}
              label="下一步"
              value={`${dashboard.nextActions.length || 1} 条`}
              detail={primaryAction}
              tone="accent"
            />
          </div>
        </div>

        <div className="workbench-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-kicker">Agent route</p>
              <h3 className="mt-2 text-2xl font-black">今日任务流</h3>
            </div>
            <Bot aria-hidden="true" className="size-5 text-[color:var(--accent-teal)]" />
          </div>
          <div className="mt-4">
            <ModuleRow
              icon={GraduationCap}
              title="学习路径"
              status={
                learningStatus
                  ? `${learningStatus.completedCoursesCount}/${learningStatus.totalCourses}`
                  : "待同步"
              }
              detail={learningDetail}
              href="/learning"
              action="学习"
              tone={learningStatus ? "positive" : "warning"}
            />
            <ModuleRow
              icon={BriefcaseBusiness}
              title="组合体检"
              status={
                portfolioStatus?.hasReport
                  ? formatCurrency(portfolioStatus.totalValue)
                  : "待录入"
              }
              detail={portfolioDetail}
              href="/portfolio"
              action="体检"
              tone={portfolioStatus?.hasReport ? "positive" : "warning"}
            />
            <ModuleRow
              icon={PlayCircle}
              title="情境训练"
              status={
                simulationStatus
                  ? `${simulationStatus.completedSessionsCount} 次`
                  : "待训练"
              }
              detail={simulationDetail}
              href="/simulation"
              action="训练"
              tone={
                simulationStatus && simulationStatus.completedSessionsCount > 0
                  ? "positive"
                  : "warning"
              }
            />
            <ModuleRow
              icon={Newspaper}
              title="资讯解读"
              status={newsStatus?.hasAnalysis ? "已有解读" : "待解读"}
              detail={newsDetail}
              href="/news"
              action="解读"
              tone={newsStatus?.hasAnalysis ? "positive" : "warning"}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="workbench-panel p-5 sm:p-6">
          <p className="section-kicker">Action queue</p>
          <h3 className="mt-2 text-2xl font-black">Agent 推荐的下一步</h3>
          <div className="flow-line mt-5 space-y-4">
            {(dashboard.nextActions.length > 0
              ? dashboard.nextActions
              : [primaryAction]
            ).map((action, index) => (
              <div key={`${action}-${index}`} className="flow-node">
                <span className="flow-dot" />
                <div>
                  <p className="text-sm font-black">Step {index + 1}</p>
                  <p className="mt-1 text-sm leading-7 text-[color:var(--ink-soft)]">
                    {action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="workbench-panel p-5 sm:p-6">
          <p className="section-kicker">Latest evidence</p>
          <h3 className="mt-2 text-2xl font-black">最新回流信号</h3>
          <div className="mt-5 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black">学习进度</p>
                <span className="text-xs font-bold text-[color:var(--ink-muted)]">
                  {learningStatus?.overallProgressPercentage ?? 0}%
                </span>
              </div>
              <LabeledProgressBar
                value={learningStatus?.overallProgressPercentage ?? 0}
              />
            </div>
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">
                情境
              </span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {simulationStatus?.latestScenarioTitle ??
                  simulationStatus?.recommendedScenarioTitle ??
                  "待开始情境训练"}
                <br />
                <span className="text-xs text-[color:var(--ink-muted)]">
                  最近完成：{formatDate(simulationStatus?.latestCompletedAt ?? null)}
                </span>
              </span>
            </div>
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">
                资讯
              </span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {newsStatus?.latestTitle ?? "待生成资讯解读"}
                <br />
                <span className="text-xs text-[color:var(--ink-muted)]">
                  来源：{newsStatus?.sourceName ?? "未记录"}
                </span>
              </span>
            </div>
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">
                Coach
              </span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {latestCoachActivity
                  ? latestCoachActivity.answerFocus
                  : "完成第一条问答后，这里会显示最近主题和指导焦点。"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
