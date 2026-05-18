"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bot,
  History,
  ListChecks,
  PlusCircle,
  SendHorizontal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  ApiError,
  getAgentRunTrace,
  getAssistantSession,
  getBehaviorProfile,
  getDashboardState,
  getSessionUser,
  sendAssistantMessage,
  type AdvisorActionTarget,
  type AgentRunTrace,
  type AssistantConversationMessage,
  type AssistantConversationState,
  type AdvisorStructuredResponse,
  type DashboardCoachActivity,
  type DashboardDailyBrief,
  type DashboardState,
  type SafeNextAction,
} from "@/lib/api";
import { formatProductCopy, formatUserVisibleCopy } from "@/lib/display-labels";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";
import { cn, StatusBadge } from "./ui/primitives";

const starterPrompts = [
  "我刚开始买基金，怎么理解风险等级和回撤？",
  "如果我总想追涨，FundGene 应该怎么帮我拆解这个问题？",
  "我该怎么判断自己现在的基金配置是不是太集中？",
];

function formatIntent(intent: string): string {
  if (intent === "learning") {
    return "基金基础";
  }
  if (intent === "behavior") {
    return "行为偏差";
  }
  if (intent === "portfolio") {
    return "组合解释";
  }
  if (intent === "simulation") {
    return "情境演练";
  }
  if (intent === "news") {
    return "新闻解读";
  }
  return intent;
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "刚刚";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "刚刚";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function findPreviousUserQuestion(
  messages: AssistantConversationMessage[],
  currentIndex: number,
): string {
  for (let index = currentIndex - 1; index >= 0; index -= 1) {
    const item = messages[index];
    if (item.role === "user") {
      return item.content;
    }
  }

  return "本轮问题";
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function buildUserFollowUpPrompts(
  response: AdvisorStructuredResponse,
  question: string,
): string[] {
  const context = `${question} ${response.answer}`.toLowerCase();

  if (response.intent === "portfolio") {
    return [
      "帮我检查组合里最需要先看的风险。",
      "帮我判断我的持仓是不是太集中。",
    ];
  }

  if (response.intent === "behavior") {
    return [
      "帮我拆解我追涨时的触发点。",
      "帮我做一个本周可执行的行为复盘。",
    ];
  }

  if (response.intent === "simulation") {
    return [
      "帮我选择一个适合新手的情境训练。",
      "把这次训练复盘成下一次检查清单。",
    ];
  }

  if (response.intent === "news") {
    return [
      "把这条信息拆成事实、影响路径和不确定性。",
      "帮我判断它和我的基金类型有什么关系。",
    ];
  }

  if (context.includes("回撤") || context.includes("drawdown")) {
    return [
      "我想用一个数字例子理解回撤。",
      "帮我判断我能承受多大回撤。",
    ];
  }

  if (context.includes("风险等级") || context.includes("risk")) {
    return [
      "帮我把风险等级翻译成新手能懂的话。",
      "帮我判断这个风险等级和我的承受能力是否匹配。",
    ];
  }

  return [
    "帮我把这个概念讲成一个新手例子。",
    "我学完这个概念后下一步该练什么？",
  ];
}

function inferActionTarget(action: string): AdvisorActionTarget {
  const normalized = action.toLowerCase();
  if (normalized.includes("dashboard") || action.includes("工作台")) {
    return {
      label: "查看今日简报",
      href: "/today",
      intent: "dashboard",
      kind: "internal_link",
    };
  }
  if (
    normalized.includes("learning") ||
    action.includes("学习") ||
    action.includes("课程")
  ) {
    return {
      label: "进入学习中心",
      href: "/learning",
      intent: "learning",
      kind: "internal_link",
    };
  }
  if (
    normalized.includes("portfolio") ||
    action.includes("组合") ||
    action.includes("持仓")
  ) {
    return {
      label: "查看组合体检",
      href: "/portfolio",
      intent: "portfolio",
      kind: "internal_link",
    };
  }
  if (
    normalized.includes("simulation") ||
    action.includes("情境") ||
    action.includes("训练")
  ) {
    return {
      label: "开始情境训练",
      href: "/simulation",
      intent: "simulation",
      kind: "internal_link",
    };
  }
  if (
    normalized.includes("news") ||
    action.includes("资讯") ||
    action.includes("新闻") ||
    action.includes("政策")
  ) {
    return {
      label: "查看资讯解读",
      href: "/news",
      intent: "news",
      kind: "internal_link",
    };
  }
  return {
    label: "继续交给 Agent",
    href: "/agent",
    intent: "coach",
    kind: "internal_link",
  };
}

function getQueryValue(searchParams: URLSearchParams, keys: string[]): string | null {
  for (const key of keys) {
    const value = searchParams.get(key);
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function buildSafeActionHref(action: SafeNextAction): string {
  const routeAliases: Record<string, string> = {
    "/dashboard": "/today",
    "/coach": "/agent",
  };
  const rawRoute = action.targetRoute.startsWith("/") ? action.targetRoute : "/today";
  const route = routeAliases[rawRoute] ?? rawRoute;
  const params = new URLSearchParams();

  Object.entries(action.targetParams).forEach(([key, value]) => {
    if (value) {
      params.set(key, value === "dashboard" ? "today" : value);
    }
  });

  const query = params.toString();
  return query ? `${route}?${query}` : route;
}

function buildDailyBriefCoachPrompts(brief: DashboardDailyBrief | null): string[] {
  if (!brief) {
    return starterPrompts;
  }

  const prompts = [
    `请解释今天这个判断：${brief.headline}`,
    "请把今天的判断拆成事实、影响路径和不确定性。",
    `我执行“${brief.primaryAction.label}”前，应该先检查什么？`,
  ];

  return prompts.map((item) => formatProductCopy(item));
}

function formatWritebackLabel(action: SafeNextAction): string {
  const labels: Record<SafeNextAction["type"], string> = {
    ask_coach: "让教练继续拆解",
    inspect_portfolio: "进入组合体检",
    learn: "进入学习中心",
    read_news_context: "查看资讯影响",
    record_behavior: "记录为待确认线索",
    run_simulation: "开始情境训练",
  };

  return labels[action.type] ?? action.label;
}

type RunStepStatus = "done" | "active" | "waiting";

function getRunProgressSteps({
  trace,
  pending,
}: {
  trace: AgentRunTrace | undefined;
  pending: boolean;
}): Array<{ label: string; detail: string; status: RunStepStatus }> {
  const hasTrace = Boolean(trace);
  const isCompleted = trace?.run.runStatus === "completed";
  const hasSources = (trace?.toolCalls.length ?? 0) > 0 || (trace?.evidenceRefs.length ?? 0) > 0;

  return [
    {
      label: "理解任务意图",
      detail: pending || hasTrace ? "已把问题转成工作目标" : "等待你布置任务",
      status: pending || hasTrace ? "done" : "waiting",
    },
    {
      label: "读取授权上下文",
      detail: pending || hasTrace ? "画像、今日简报和最近对话已接入" : "新任务开始后读取",
      status: pending || hasTrace ? "done" : "waiting",
    },
    {
      label: "检查相关来源",
      detail: hasSources
        ? `已整理 ${trace?.evidenceRefs.length ?? 0} 条可解释依据`
        : pending
          ? "正在筛选组合、学习、资讯或训练线索"
          : "按任务需要读取",
      status: hasSources ? "done" : pending ? "active" : "waiting",
    },
    {
      label: "生成安全下一步",
      detail: isCompleted ? "已返回解释、边界和行动入口" : pending ? "正在组织回答" : "等待完成前置检查",
      status: isCompleted ? "done" : pending ? "active" : "waiting",
    },
  ];
}

function RunStatusDot({ status }: { status: RunStepStatus }) {
  return (
    <span
      className={
        status === "done"
          ? "mt-1 size-2.5 rounded-full bg-[color:var(--accent-teal)]"
          : status === "active"
            ? "mt-1 size-2.5 rounded-full bg-[#ffb340] shadow-[0_0_0_4px_rgba(255,179,64,0.15)]"
            : "mt-1 size-2.5 rounded-full border border-[color:var(--line-soft)] bg-white"
      }
    />
  );
}

function SessionRail({
  dailyBrief,
  conversation,
  latestActivity,
  pending,
  onNewTask,
  onPromptFill,
}: {
  dailyBrief: DashboardDailyBrief | null;
  conversation: AssistantConversationState;
  latestActivity: DashboardCoachActivity | null;
  pending: boolean;
  onNewTask: () => void;
  onPromptFill: (prompt: string) => void;
}) {
  const taskPrompts = buildDailyBriefCoachPrompts(dailyBrief);
  const currentTopic =
    conversation.session?.topic ?? latestActivity?.topic ?? "今日简报追问";
  const currentPreview =
    conversation.session?.lastQuestion ??
    latestActivity?.question ??
    dailyBrief?.headline ??
    "从一个具体问题开始";
  const recentQuestions = conversation.messages
    .filter((item) => item.role === "user")
    .slice(-3)
    .reverse();
  const historyItems = [
    {
      label: currentTopic,
      detail: currentPreview,
      meta: conversation.messages.length > 0 ? `${conversation.messages.length} 条消息` : "当前上下文",
      active: true,
    },
    {
      label: "今日简报追问",
      detail: dailyBrief?.headline ?? "让 Agent 先解释今天最重要的判断",
      meta: dailyBrief ? "可继续" : "待生成",
      active: false,
    },
    ...recentQuestions.map((item) => ({
      label: "历史提问",
      detail: item.content,
      meta: "继续问",
      active: false,
    })),
  ];

  return (
    <aside
      data-testid="agent-session-rail"
      className="workbench-panel order-2 grid w-full min-w-0 max-w-[calc(100vw-2rem)] grid-cols-[minmax(0,1fr)] gap-5 overflow-hidden p-4 2xl:sticky 2xl:top-5 2xl:order-none 2xl:max-h-[calc(100svh-6rem)] 2xl:max-w-none 2xl:overflow-y-auto"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="section-kicker">任务参考</p>
          <h2 className="mt-1 text-lg font-semibold">最近问题</h2>
          <p className="mt-1 text-xs leading-5 text-[color:var(--ink-muted)]">
            选择最近问题或模板，快速填入输入框继续。
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="新建任务"
          onClick={onNewTask}
          disabled={pending}
        >
          <PlusCircle aria-hidden="true" className="size-4" />
        </button>
      </div>

      <button
        type="button"
        className="min-h-[2.75rem] w-full min-w-0 rounded-full border border-[rgba(0,113,227,0.32)] px-4 text-center text-sm font-bold leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_14px_28px_rgba(0,113,227,0.18)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        style={{ background: "#0071e3", color: "#ffffff" }}
        onClick={onNewTask}
        disabled={pending}
      >
        新建任务
      </button>

      <div className="grid gap-2">
        {historyItems.map((item) => (
          <button
            key={`${item.label}-${item.meta}-${item.detail}`}
            type="button"
            className={
              item.active
                ? "rounded-lg border border-[rgba(0,113,227,0.24)] bg-[rgba(0,113,227,0.08)] px-3 py-3 text-left"
                : "rounded-lg border border-[color:var(--line-soft)] bg-white/62 px-3 py-3 text-left transition hover:border-[rgba(0,113,227,0.2)] hover:bg-white"
            }
            onClick={() => onPromptFill(item.detail)}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-semibold text-[color:var(--ink-strong)]">
                {item.label}
              </span>
              <span className="shrink-0 text-[0.68rem] font-bold text-[color:var(--accent-teal)]">
                {item.meta}
              </span>
            </span>
            <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[color:var(--ink-muted)]">
              {item.detail}
            </span>
          </button>
        ))}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <History aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
          <p className="section-kicker">任务模板</p>
        </div>
        <div className="flex min-w-0 max-w-full gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0">
          {taskPrompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="w-[13rem] max-w-[75vw] flex-none rounded-full border border-[color:var(--line-soft)] bg-white/72 px-3 py-2 text-left text-xs font-semibold leading-5 text-[color:var(--ink-soft)] transition hover:bg-white lg:w-auto lg:max-w-none lg:flex-auto lg:rounded-lg"
              onClick={() => onPromptFill(prompt)}
              disabled={pending}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function AgentRunStatusPanel({
  trace,
  loading,
  pending,
  dashboard,
  dailyBrief,
}: {
  trace: AgentRunTrace | undefined;
  loading: boolean;
  pending: boolean;
  dashboard: DashboardState;
  dailyBrief: DashboardDailyBrief | null;
}) {
  const steps = getRunProgressSteps({ trace, pending });
  const coverageItems = [
    {
      label: "每日简报",
      detail: dailyBrief ? "已形成今日判断" : "等待画像和资料补齐",
      active: Boolean(dailyBrief),
    },
    {
      label: "组合巡检",
      detail: dashboard.portfolioStatus?.hasReport ? "最近报告可用于追问" : "可从任务中发起",
      active: Boolean(dashboard.portfolioStatus?.hasReport),
    },
    {
      label: "学习/训练",
      detail: dashboard.learningStatus?.recommendedCourseTitle ?? dashboard.simulationStatus?.recommendedScenarioTitle ?? "可生成练习建议",
      active: Boolean(
        dashboard.learningStatus?.recommendedCourseTitle ||
          dashboard.simulationStatus?.recommendedScenarioTitle,
      ),
    },
  ];

  return (
    <aside
      data-testid="agent-run-status"
      className="workbench-panel order-3 grid w-full min-w-0 max-w-[calc(100vw-2rem)] grid-cols-[minmax(0,1fr)] gap-5 overflow-hidden p-4 2xl:sticky 2xl:top-5 2xl:order-none 2xl:max-h-[calc(100svh-6rem)] 2xl:max-w-none 2xl:overflow-y-auto"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <StatusBadge tone="accent">整理状态</StatusBadge>
            <StatusBadge tone={pending || loading ? "warning" : trace ? "positive" : "neutral"}>
              {pending ? "正在整理" : loading ? "同步中" : trace ? "已完成" : "等待问题"}
            </StatusBadge>
          </div>
        </div>
        <h2 className="mt-3 text-lg font-semibold">整理进度</h2>
        <p className="mt-1 text-xs leading-5 text-[color:var(--ink-muted)]">
          默认显示自然语言步骤；更细的执行依据放在分层入口里。
        </p>
      </div>

      <div className="flow-line space-y-4">
        {steps.map((step) => (
          <div key={step.label} className="grid grid-cols-[1rem_minmax(0,1fr)] gap-3">
            <RunStatusDot status={step.status} />
            <div>
              <p className="text-sm font-semibold text-[color:var(--ink-strong)]">
                {step.label}
              </p>
              <p className="mt-1 text-xs leading-5 text-[color:var(--ink-muted)]">
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-[color:var(--line-soft)] bg-white/62 p-3">
        <div className="flex items-center gap-2">
          <Activity aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
          <p className="section-kicker">自动检查</p>
        </div>
        <div className="mt-3 grid gap-2">
          {coverageItems.map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 px-3 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-[color:var(--ink-strong)]">
                  {item.label}
                </p>
                <span
                  className={
                    item.active
                      ? "size-2 rounded-full bg-[color:var(--accent-teal)]"
                      : "size-2 rounded-full bg-[color:var(--line-soft)]"
                  }
                />
              </div>
              <p className="mt-1 text-[0.7rem] leading-5 text-[color:var(--ink-muted)]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
        <Link
          href="/automations"
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[color:var(--accent-teal)]"
        >
          管理自动任务
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </section>

      <details className="rounded-lg border border-[color:var(--line-soft)] bg-white/62 p-3">
        <summary className="cursor-pointer text-xs font-bold tracking-[0.08em] text-[color:var(--accent-teal)]">
          查看整理依据
        </summary>
        <div className="mt-3 space-y-2 text-xs leading-5 text-[color:var(--ink-muted)]">
          <p>这里会说明本次回答参考了哪些方向，以及为什么没有变成账户操作建议。</p>
          <p>更完整的内部记录只保留给授权审计，不默认展示给新手用户。</p>
        </div>
      </details>
    </aside>
  );
}

function DailyBriefCoachHeader({
  brief,
  latestIntent,
  onPromptFill,
}: {
  brief: DashboardDailyBrief | null;
  latestIntent: string | null;
  onPromptFill: (prompt: string) => void;
}) {
  const prompts = buildDailyBriefCoachPrompts(brief);

  if (!brief) {
    return (
      <div className="border-b border-[color:var(--line-soft)] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="accent">教练工作台</StatusBadge>
              {latestIntent ? (
                <StatusBadge tone="positive">{formatIntent(latestIntent)}</StatusBadge>
              ) : null}
            </div>
            <h3 className="mt-3 text-2xl font-semibold leading-tight">
              布置一个任务，Agent 会先拆解再回答。
            </h3>
          </div>
          <div className="text-xs leading-5 text-[color:var(--ink-muted)] sm:max-w-[15rem] sm:text-right">
            {latestIntent
              ? `最近主题：${formatIntent(latestIntent)}`
              : "还没有历史回答，先从一个具体问题开始。"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-[color:var(--line-soft)] bg-white/72 px-5 py-3 sm:px-6">
      <details>
        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 text-sm font-semibold text-[color:var(--ink-strong)]">
          <span className="min-w-0 truncate">
            今日判断会作为本轮回答参考：{brief.headline}
          </span>
          <span className="shrink-0 text-xs font-bold text-[color:var(--accent-teal)]">
            为什么这么建议
          </span>
        </summary>
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
              {brief.beginnerExplanation}
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {prompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="rounded-lg border border-[rgba(0,113,227,0.16)] bg-[rgba(0,113,227,0.07)] px-3 py-2 text-left text-xs font-semibold leading-5 text-[color:var(--ink-soft)] transition hover:border-[rgba(0,113,227,0.28)] hover:bg-white"
                  onClick={() => onPromptFill(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/70 px-3 py-3">
            <p className="section-kicker">安全边界</p>
            <p className="mt-2 text-xs leading-5 text-[color:var(--ink-muted)]">
              {brief.doNotDo}
            </p>
            <Link
              href={buildSafeActionHref(brief.primaryAction)}
              className="mt-3 inline-flex text-xs font-bold text-[color:var(--accent-teal)]"
            >
              {formatWritebackLabel(brief.primaryAction)}
            </Link>
          </div>
        </div>
      </details>
    </div>
  );
}

function StructuredAnswerCanvas({
  response,
  question,
  onPromptFill,
}: {
  response: AdvisorStructuredResponse;
  question: string;
  onPromptFill: (prompt: string) => void;
}) {
  const actionItems =
    response.recommendedActions.length > 0
      ? response.recommendedActions.map((item) => formatProductCopy(item))
      : ["把这次回答带回学习、组合或情境训练中继续验证。"];
  const actionTargets = response.recommendedActionTargets;
  const followUps =
    buildUserFollowUpPrompts(response, question).map((item) =>
      formatProductCopy(item),
    );

  return (
    <div className="assistant-answer-card overflow-hidden">
      <div className="border-b border-[color:var(--line-soft)] px-4 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="accent">{formatIntent(response.intent)}</StatusBadge>
          <span className="text-xs font-bold text-[color:var(--ink-muted)]">
            针对：{question}
          </span>
        </div>
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
          {formatUserVisibleCopy(response.answer)}
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-[color:var(--line-soft)] px-4 py-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
            <p className="section-kicker">边界提醒</p>
          </div>
          <p className="mt-2 text-xs leading-6 text-[color:var(--ink-muted)]">
            {formatUserVisibleCopy(response.riskNotice)}
          </p>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <ListChecks aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
            <p className="section-kicker">下一步</p>
          </div>
          <div className="mt-3 space-y-2">
            {actionItems.slice(0, 2).map((item, index) => {
              const target = actionTargets[index] ?? inferActionTarget(item);
              return (
                <Link
                  key={`${item}-${index}`}
                  href={target.href}
                  className="coach-action-link group"
                >
                  <span className="grid min-w-0 gap-1">
                    <span className="text-xs leading-5 text-[color:var(--ink-soft)]">
                      <span className="font-semibold text-[color:var(--ink-strong)]">
                        {index + 1}.{" "}
                      </span>
                      {item}
                    </span>
                    <span className="text-[0.7rem] font-bold text-[color:var(--accent-teal)]">
                      {target.label}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 flex-none text-[color:var(--accent-teal)] transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--line-soft)] px-4 py-4">
        <div className="flex items-center gap-2">
          <ArrowRight aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
          <p className="section-kicker">下一句可以问</p>
        </div>

        <div className="mt-3 grid gap-2">
          {followUps.slice(0, 2).map((item) => (
            <button
              key={item}
              type="button"
              className="coach-followup-chip group"
              onClick={() => onPromptFill(item)}
            >
              <span className="grid min-w-0 gap-1">
                <span>{item}</span>
                <span className="text-[0.68rem] font-bold text-[color:var(--accent-teal)]">
                  填入输入框
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                className="size-4 flex-none text-[color:var(--accent-teal)] transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentWorkspaceTopbar({
  contextPanelCollapsed,
  runPanelCollapsed,
  onToggleContextPanel,
  onToggleRunPanel,
}: {
  contextPanelCollapsed: boolean;
  runPanelCollapsed: boolean;
  onToggleContextPanel: () => void;
  onToggleRunPanel: () => void;
}) {
  const layoutSummary =
    contextPanelCollapsed && runPanelCollapsed
      ? "专注模式"
    : contextPanelCollapsed
        ? "任务参考已收起"
        : runPanelCollapsed
          ? "整理依据已收起"
          : "完整工作区";

  return (
    <div
      data-testid="agent-workspace-topbar"
      className="agent-workspace-strip"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Bot aria-hidden="true" className="size-4 shrink-0 text-[color:var(--accent-teal)]" />
        <span className="truncate text-sm font-semibold text-[color:var(--ink-strong)]">
          教练工作区
        </span>
        <span className="hidden text-xs font-medium text-[color:var(--ink-muted)] sm:inline">
          {layoutSummary}
        </span>
      </div>
      <div className="agent-layout-text-controls" aria-label="教练工作区布局">
        <button
          type="button"
          className="agent-layout-text-button"
          aria-label={contextPanelCollapsed ? "展开任务参考" : "收起任务参考"}
          aria-pressed={contextPanelCollapsed}
          onClick={onToggleContextPanel}
        >
          {contextPanelCollapsed ? "显示参考" : "隐藏参考"}
        </button>
        <span aria-hidden="true" className="text-[color:var(--ink-muted)]">
          /
        </span>
        <button
          type="button"
          className="agent-layout-text-button"
          aria-label={runPanelCollapsed ? "展开整理一览" : "收起整理一览"}
          aria-pressed={runPanelCollapsed}
          onClick={onToggleRunPanel}
        >
          {runPanelCollapsed ? "显示依据" : "隐藏依据"}
        </button>
      </div>
    </div>
  );
}

export function CoachWorkspace() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [draft, setDraft] = useState(
    () => getQueryValue(searchParams, ["prompt", "q"]) ?? "",
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [contextPanelCollapsed, setContextPanelCollapsed] = useState(true);
  const [runPanelCollapsed, setRunPanelCollapsed] = useState(true);
  const messageScrollerRef = useRef<HTMLDivElement | null>(null);
  const composerTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  const isOnboarded = Boolean(sessionQuery.data?.onboardingCompleted);

  const behaviorQuery = useQuery({
    queryKey: ["behavior-profile"],
    queryFn: getBehaviorProfile,
    enabled: isOnboarded,
    retry: false,
  });

  const dashboardQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardState,
    enabled: isOnboarded,
    retry: false,
  });

  const coachQuery = useQuery({
    queryKey: ["coach-session"],
    queryFn: getAssistantSession,
    enabled: isOnboarded,
    retry: false,
  });
  const latestTraceRunId =
    coachQuery.data?.messages
      .slice()
      .reverse()
      .find((item) => item.role === "assistant" && item.agentRunId)?.agentRunId ??
    null;
  const traceQuery = useQuery({
    queryKey: ["agent-run-trace", latestTraceRunId],
    queryFn: () => getAgentRunTrace(latestTraceRunId ?? ""),
    enabled: Boolean(isOnboarded && latestTraceRunId),
    retry: false,
  });

  const coachMutation = useMutation({
    mutationFn: async (message: string) => {
      const trimmedMessage = message.trim();
      if (trimmedMessage.length < 4) {
        throw new Error("请先写下一个至少 4 个字符的问题。");
      }

      return sendAssistantMessage({
        message: trimmedMessage,
        sessionId: coachQuery.data?.session?.id ?? null,
        context: {
          fromRoute: getQueryValue(searchParams, ["from", "from_route"]),
          focus: getQueryValue(searchParams, ["focus"]),
          dailyBriefId:
            getQueryValue(searchParams, ["daily_brief_id", "dailyBriefId"]) ??
            dashboardQuery.data?.dailyBrief?.briefId ??
            null,
          sourceIds: {
            portfolio_analysis_id:
              getQueryValue(searchParams, ["portfolio_analysis_id"]) ?? "",
            portfolio_snapshot_id:
              getQueryValue(searchParams, ["portfolio_snapshot_id"]) ?? "",
            news_analysis_id: getQueryValue(searchParams, ["news_analysis_id"]) ?? "",
            news_item_id: getQueryValue(searchParams, ["news_item_id"]) ?? "",
            course_slug: getQueryValue(searchParams, ["course", "course_slug"]) ?? "",
            section_slug: getQueryValue(searchParams, ["section", "section_slug"]) ?? "",
            simulation_session_id:
              getQueryValue(searchParams, ["simulation_session_id"]) ?? "",
            scenario_id: getQueryValue(searchParams, ["scenario_id"]) ?? "",
          },
        },
      });
    },
    onSuccess: async (conversation, submittedMessage) => {
      setDraft((currentDraft) =>
        currentDraft.trim() === submittedMessage.trim() ? "" : currentDraft,
      );
      setPendingQuestion(null);
      setSubmitError(null);
      queryClient.setQueryData(["coach-session"], conversation);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error, submittedMessage) => {
      setPendingQuestion(null);
      setDraft((currentDraft) => currentDraft || submittedMessage);
      setSubmitError(error instanceof Error ? error.message : "发送失败，请稍后重试。");
    },
  });

  useEffect(() => {
    const scroller = messageScrollerRef.current;
    if (!scroller) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      scroller.scrollTo({
        top: scroller.scrollHeight,
        behavior: pendingQuestion ? "smooth" : "auto",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [coachQuery.data?.messages.length, pendingQuestion]);

  if (sessionQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在初始化教练会话上下文...
      </div>
    );
  }

  if (isApiError(sessionQuery.error) && sessionQuery.error.status === 401) {
    return (
      <div className="space-y-6">
        <SectionBlock
          eyebrow="教练"
          title="请先登录，再进入个人教练工作区。"
          description="登录后才能保存提问、回答和后续训练动作。"
        >
          <div className="paper-panel-strong rounded-lg px-5 py-6">
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/start" className="action-button">
                去登录 / 注册
              </Link>
              <Link href="/" className="action-button-secondary">
                回到总览
              </Link>
            </div>
          </div>
        </SectionBlock>
      </div>
    );
  }

  if (sessionQuery.error || !sessionQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        当前教练会话不可用：{sessionQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const sessionUser = sessionQuery.data;

  if (!sessionUser.onboardingCompleted) {
    return (
      <div className="space-y-8">
        <SectionBlock
          eyebrow="教练"
          title="先完成建档，再让教练围绕你的真实画像工作。"
          description="先完成基础资料和问卷，教练才能围绕你的风险等级和行为焦点解释问题。"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <MetricCard
              label="当前用户"
              value={sessionUser.displayName ?? "已登录用户"}
              detail={sessionUser.email ?? sessionUser.id}
              accent="moss"
            />
            <MetricCard
              label="建档"
              value="待完成"
              detail="请先补齐基础画像和风险问卷。"
              accent="gold"
            />
            <MetricCard
              label="当前目标"
              value={sessionUser.primaryGoal ?? "待填写"}
              detail="目标会影响教练如何解释你的问题。"
              accent="clay"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding" className="action-button">
              去完成建档
            </Link>
            <Link href="/today" className="action-button-secondary">
              先看今日
            </Link>
          </div>
        </SectionBlock>
      </div>
    );
  }

  if (behaviorQuery.isLoading || dashboardQuery.isLoading || coachQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在同步教练工作区、行为画像和最近交互...
      </div>
    );
  }

  if (behaviorQuery.error || dashboardQuery.error || coachQuery.error) {
    const error =
      behaviorQuery.error?.message ??
      dashboardQuery.error?.message ??
      coachQuery.error?.message ??
      "请求失败";
    return (
      <div className="space-y-4 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        <p>加载教练工作区失败：{error}</p>
        <p className="text-xs">请确认服务已运行，且当前登录会话有效。</p>
      </div>
    );
  }

  const behavior = behaviorQuery.data;
  const dashboard = dashboardQuery.data;
  const conversation: AssistantConversationState = coachQuery.data ?? {
    session: null,
    messages: [],
  };
  const visibleMessageLimit = 16;
  const visibleMessages = conversation.messages.slice(-visibleMessageLimit);
  const hiddenMessageCount = Math.max(
    conversation.messages.length - visibleMessages.length,
    0,
  );
  const visibleStartIndex = conversation.messages.length - visibleMessages.length;
  const latestCoachActivity = dashboard?.latestCoachActivity ?? null;
  const dailyBrief = dashboard?.dailyBrief ?? null;
  const latestIntent = latestCoachActivity?.intent ?? null;
  const dailyBriefPrompts = buildDailyBriefCoachPrompts(dailyBrief);
  const workspaceGridClassName = cn(
    "agent-workspace-grid grid max-w-full items-start gap-4 overflow-hidden 2xl:overflow-visible",
    !contextPanelCollapsed &&
      !runPanelCollapsed &&
      "agent-workspace-grid-three",
    contextPanelCollapsed &&
      !runPanelCollapsed &&
      "agent-workspace-grid-no-context",
    !contextPanelCollapsed &&
      runPanelCollapsed &&
      "agent-workspace-grid-no-overview",
    contextPanelCollapsed &&
      runPanelCollapsed &&
      "agent-workspace-grid-solo",
  );

  if (!behavior || !dashboard) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        暂无可展示的教练数据，请稍后重试。
      </div>
    );
  }

  function handlePromptFill(prompt: string) {
    setDraft(prompt);
    setSubmitError(null);
  }

  function handleNewTask() {
    setDraft("");
    setSubmitError(null);
    setPendingQuestion(null);
    window.requestAnimationFrame(() => {
      composerTextareaRef.current?.focus();
      composerTextareaRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    if (coachMutation.isPending) {
      return;
    }

    const message = draft.trim();
    if (message.length < 4) {
      setSubmitError("请先写下一个至少 4 个字符的问题。");
      return;
    }

    setPendingQuestion(message);
    setDraft("");
    coachMutation.mutate(message);
  }

  return (
    <div className="grid gap-4">
      <AgentWorkspaceTopbar
        contextPanelCollapsed={contextPanelCollapsed}
        runPanelCollapsed={runPanelCollapsed}
        onToggleContextPanel={() => setContextPanelCollapsed((value) => !value)}
        onToggleRunPanel={() => setRunPanelCollapsed((value) => !value)}
      />

      <div className={workspaceGridClassName}>
        {!contextPanelCollapsed ? (
          <SessionRail
            dailyBrief={dailyBrief}
            conversation={conversation}
            latestActivity={latestCoachActivity}
            pending={coachMutation.isPending}
            onNewTask={handleNewTask}
            onPromptFill={handlePromptFill}
          />
        ) : null}

        <section
          data-testid="agent-active-session"
          className="workbench-panel coach-chat-panel order-1 min-w-0 min-h-[42rem] max-w-[calc(100vw-2rem)] overflow-hidden 2xl:order-none 2xl:h-[calc(100svh-6rem)] 2xl:max-w-none"
        >
          <DailyBriefCoachHeader
            brief={dailyBrief}
            latestIntent={latestIntent}
            onPromptFill={handlePromptFill}
        />

        <div
          ref={messageScrollerRef}
          role="log"
          aria-live="polite"
          aria-busy={coachMutation.isPending}
          className="coach-message-log space-y-4 scroll-smooth px-4 py-5 sm:px-6"
        >
          {visibleMessages.length > 0 || pendingQuestion ? (
            <>
              {hiddenMessageCount > 0 ? (
                <div className="mx-auto w-fit rounded-full border border-[color:var(--line-soft)] bg-white/[0.04] px-3 py-1 text-xs font-bold text-[color:var(--ink-muted)]">
                  已显示最近 {visibleMessages.length} 条消息，历史对话已保存。
                </div>
              ) : null}

              {visibleMessages.map((item, index) => (
                <article
                  key={item.id}
                  className={
                    item.role === "user"
                      ? "coach-message coach-message-user"
                      : "coach-message coach-message-assistant"
                  }
                >
                  {item.role === "assistant" && item.advisorResponse ? (
                    <>
                      <div className="coach-assistant-meta">
                        <p className="text-xs font-semibold text-[color:var(--ink-muted)]">
                          FundGene 教练
                        </p>
                        <span className="text-xs text-[color:var(--ink-muted)]">
                          {formatTimestamp(item.createdAt)}
                        </span>
                      </div>
                      <StructuredAnswerCanvas
                        response={item.advisorResponse}
                        question={findPreviousUserQuestion(
                          conversation.messages,
                          visibleStartIndex + index,
                        )}
                        onPromptFill={handlePromptFill}
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold text-[color:var(--ink-muted)]">
                          {item.role === "user" ? "你" : "FundGene 教练"}
                        </p>
                        <span className="text-xs text-[color:var(--ink-muted)]">
                          {formatTimestamp(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--ink-soft)]">
                        {item.content}
                      </p>
                    </>
                  )}
                </article>
              ))}

              {pendingQuestion ? (
                <>
                  <article className="coach-message coach-message-user">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-[color:var(--ink-muted)]">
                        你
                      </p>
                      <span className="text-xs text-[color:var(--ink-muted)]">
                        正在发送
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--ink-soft)]">
                      {pendingQuestion}
                    </p>
                  </article>

                  <article
                    className="coach-message coach-message-assistant"
                    aria-label="FundGene 教练正在生成回答"
                  >
                    <div className="coach-assistant-meta">
                      <p className="text-xs font-semibold text-[color:var(--ink-muted)]">
                        FundGene 教练
                      </p>
                      <span className="text-xs text-[color:var(--ink-muted)]">
                        正在生成
                      </span>
                    </div>
                    <div className="assistant-answer-card px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="size-2.5 rounded-full bg-[color:var(--accent-teal)] shadow-[0_0_18px_rgba(70,208,172,0.55)] motion-safe:animate-pulse"
                        />
                        <p className="text-sm font-bold text-[color:var(--ink-soft)]">
                          正在结合你的画像和这轮问题组织回答...
                        </p>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-[color:var(--ink-muted)]">
                        完成后会显示解释、风险边界和下一步动作。
                      </p>
                    </div>
                  </article>
                </>
              ) : null}
            </>
          ) : (
            <div className="grid h-full min-h-[20rem] place-items-center">
              <div className="max-w-2xl text-center">
                <Bot
                  aria-hidden="true"
                  className="mx-auto size-10 text-[color:var(--accent-teal)]"
                />
                <h3 className="mt-4 text-2xl font-semibold">今天想先问清楚什么？</h3>
                <div className="mt-5 grid gap-2 text-left">
                  {dailyBriefPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-[color:var(--line-soft)] bg-white/[0.04] px-3 py-3 text-left text-sm font-bold text-[color:var(--ink-soft)] transition-colors hover:bg-white/[0.08]"
                      onClick={() => handlePromptFill(prompt)}
                      disabled={coachMutation.isPending}
                    >
                      <span>{prompt}</span>
                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 flex-none text-[color:var(--accent-teal)] transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <form
          className="coach-composer shrink-0 border-t border-[color:var(--line-soft)] px-4 py-3 sm:px-6"
          onSubmit={handleSubmit}
        >
          {visibleMessages.length > 0 ? (
            <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1">
              <span className="shrink-0 text-xs font-semibold text-[color:var(--ink-muted)]">
                接着问
              </span>
              {dailyBriefPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="shrink-0 rounded-full border border-[color:var(--line-soft)] bg-white/70 px-3 py-1 text-xs font-semibold text-[color:var(--ink-soft)] transition-colors hover:bg-white"
                  onClick={() => handlePromptFill(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <label className="block rounded-[20px] border border-[rgba(0,113,227,0.16)] bg-white/82 p-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
            <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--accent-teal)]">
              <Sparkles aria-hidden="true" className="size-3.5" />
              任务输入
            </span>
            <textarea
              ref={composerTextareaRef}
              className="min-h-[72px] w-full resize-y border-0 bg-transparent text-base leading-7 text-[color:var(--ink-strong)] outline-none placeholder:text-[color:var(--ink-muted)]"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                dailyBrief
                  ? `例如：请解释今天这个判断：${dailyBrief.headline}`
                  : "例如：我刚开始买基金，怎么理解风险等级和回撤？"
              }
            />
          </label>

          <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="action-button min-w-[7.5rem] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={coachMutation.isPending}
              >
                <SendHorizontal aria-hidden="true" className="size-4" />
                {coachMutation.isPending ? "生成中" : "发送"}
              </button>
              <button
                type="button"
                className="action-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setDraft("")}
                disabled={draft.length === 0}
              >
                清空
              </button>
            </div>
            <span className="text-xs leading-5 text-[color:var(--ink-muted)] sm:max-w-[21rem] sm:text-right">
              {coachMutation.isPending
                ? "正在生成上一条回答；你可以先整理下一句。"
                : "回答会自动保留风险边界，并把建议转成下一步动作。"}
            </span>
          </div>

          {submitError ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          ) : null}
        </form>
        </section>

        {!runPanelCollapsed ? (
          <AgentRunStatusPanel
            trace={traceQuery.data}
            loading={traceQuery.isLoading}
            pending={coachMutation.isPending}
            dashboard={dashboard}
            dailyBrief={dailyBrief}
          />
        ) : null}
      </div>
    </div>
  );
}
