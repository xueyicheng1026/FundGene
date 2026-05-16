"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ArrowRight,
  Bot,
  ListChecks,
  SendHorizontal,
  ShieldCheck,
} from "lucide-react";

import {
  ApiError,
  getAssistantSession,
  getBehaviorProfile,
  getDashboardState,
  getSessionUser,
  sendAssistantMessage,
  type AssistantConversationMessage,
  type AssistantConversationState,
  type AdvisorStructuredResponse,
  type RiskLevel,
} from "@/lib/api";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";
import { StatusBadge } from "./ui/primitives";

const starterPrompts = [
  "我刚开始买基金，怎么理解风险等级和回撤？",
  "如果我总想追涨，FundGene 应该怎么帮我拆解这个问题？",
  "我该怎么判断自己现在的基金配置是不是太集中？",
];

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

function formatBiasTag(tag: string): string {
  const labels: Record<string, string> = {
    performance_chasing_risk: "追涨倾向",
    panic_selling_risk: "恐慌卖出",
    concentration_risk: "配置集中",
    low_diversification_habit: "分散不足",
    short_horizon_pressure: "短期压力",
  };

  return labels[tag] ?? tag.replaceAll("_", " ");
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
      ? response.recommendedActions
      : ["把这次回答带回学习、组合或情境训练中继续验证。"];
  const followUps =
    response.followUpQuestions.length > 0
      ? response.followUpQuestions
      : ["我应该从哪一个产品工作区继续练习？"];

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
          {response.answer}
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-[color:var(--line-soft)] px-4 py-4 md:border-b-0 md:border-r">
          <div className="flex items-center gap-2">
            <ShieldCheck aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
            <p className="section-kicker">边界提醒</p>
          </div>
          <p className="mt-2 text-xs leading-6 text-[color:var(--ink-muted)]">
            {response.riskNotice}
          </p>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <ListChecks aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
            <p className="section-kicker">下一步</p>
          </div>
          <div className="mt-2 space-y-2">
            {actionItems.slice(0, 2).map((item, index) => (
              <p key={item} className="text-xs leading-6 text-[color:var(--ink-soft)]">
                <span className="font-black text-[color:var(--ink-strong)]">
                  {index + 1}.{" "}
                </span>
                {item}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[color:var(--line-soft)] px-4 py-4">
        <div className="flex items-center gap-2">
          <ArrowRight aria-hidden="true" className="size-4 text-[color:var(--accent-teal)]" />
          <p className="section-kicker">继续追问</p>
        </div>

        <div className="mt-3 grid gap-2">
          {followUps.slice(0, 2).map((item) => (
            <button
              key={item}
              type="button"
              className="group flex items-center justify-between gap-3 rounded-lg border border-[color:var(--line-soft)] bg-white/[0.04] px-3 py-2.5 text-left text-xs font-bold text-[color:var(--ink-soft)] transition-colors hover:bg-white/[0.08]"
              onClick={() => onPromptFill(item)}
            >
              <span>{item}</span>
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

export function CoachWorkspace() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const coachMutation = useMutation({
    mutationFn: async () => {
      const message = draft.trim();
      if (message.length < 4) {
        throw new Error("请先写下一个至少 4 个字符的问题。");
      }

      return sendAssistantMessage({
        message,
        sessionId: coachQuery.data?.session?.id ?? null,
      });
    },
    onSuccess: async (conversation) => {
      setDraft("");
      setSubmitError(null);
      queryClient.setQueryData(["coach-session"], conversation);
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "发送失败，请稍后重试。");
    },
  });

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
            <Link href="/dashboard" className="action-button-secondary">
              先看工作台
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
  const recentMessages = conversation.messages.slice(-8);
  const latestCoachActivity = dashboard?.latestCoachActivity ?? null;

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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    coachMutation.mutate();
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="workbench-panel coach-chat-panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[color:var(--line-soft)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="accent">对话优先</StatusBadge>
              <StatusBadge tone="positive">{formatRiskLevel(behavior.riskLevel)}</StatusBadge>
            </div>
            <h3 className="mt-3 text-2xl font-black leading-tight">
              先把问题问清楚，再给出边界和下一步。
            </h3>
          </div>
          <div className="text-xs leading-5 text-[color:var(--ink-muted)] sm:max-w-[15rem] sm:text-right">
            {latestCoachActivity
              ? `最近主题：${formatIntent(latestCoachActivity.intent ?? "learning")}`
              : "还没有历史回答，先从一个具体问题开始。"}
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {recentMessages.length > 0 ? (
            recentMessages.map((item, index) => (
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
                      <p className="text-xs font-black text-[color:var(--ink-muted)]">
                        FundGene Coach
                      </p>
                      <span className="text-xs text-[color:var(--ink-muted)]">
                        {formatTimestamp(item.createdAt)}
                      </span>
                    </div>
                    <StructuredAnswerCanvas
                      response={item.advisorResponse}
                      question={findPreviousUserQuestion(recentMessages, index)}
                      onPromptFill={handlePromptFill}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-black text-[color:var(--ink-muted)]">
                        {item.role === "user" ? "你" : "FundGene Coach"}
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
            ))
          ) : (
            <div className="grid h-full min-h-[20rem] place-items-center">
              <div className="max-w-2xl text-center">
                <Bot
                  aria-hidden="true"
                  className="mx-auto size-10 text-[color:var(--accent-teal)]"
                />
                <h3 className="mt-4 text-2xl font-black">今天想先问清楚什么？</h3>
                <div className="mt-5 grid gap-2 text-left">
                  {starterPrompts.map((prompt) => (
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
          className="coach-composer border-t border-[color:var(--line-soft)] px-4 py-4 sm:px-6"
          onSubmit={handleSubmit}
        >
          <label className="block">
            <span className="sr-only">今天最想问清楚什么？</span>
            <textarea
              className="field-input min-h-[96px] resize-none rounded-[22px] text-base leading-7"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="例如：我刚开始买基金，怎么理解风险等级和回撤？"
            />
          </label>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="action-button"
              disabled={coachMutation.isPending}
            >
              <SendHorizontal aria-hidden="true" className="size-4" />
              {coachMutation.isPending ? "生成中" : "发送"}
            </button>
            <button
              type="button"
              className="action-button-secondary"
              onClick={() => setDraft("")}
              disabled={coachMutation.isPending || draft.length === 0}
            >
              清空
            </button>
            <span className="text-xs leading-5 text-[color:var(--ink-muted)]">
              回答会自动保留风险边界，并把建议转成下一步动作。
            </span>
          </div>

          {submitError ? (
            <div className="mt-4 rounded-lg border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {submitError}
            </div>
          ) : null}
        </form>
      </section>

      <aside className="space-y-5">
        <section className="workbench-panel p-5">
          <p className="section-kicker">当前画像</p>
          <h3 className="mt-2 text-xl font-black">当前上下文</h3>
          <div className="mt-5 space-y-0">
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">
                用户
              </span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {sessionUser.displayName ?? "已登录用户"}
                <br />
                {sessionUser.primaryGoal ?? sessionUser.email ?? sessionUser.id}
              </span>
            </div>
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">
                风险
              </span>
              <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {formatRiskLevel(behavior.riskLevel)}
              </span>
            </div>
            <div className="ledger-row">
              <span className="text-xs font-black text-[color:var(--ink-muted)]">
                行为
              </span>
              <span className="flex flex-wrap justify-end gap-2 text-right">
                {behavior.biasTags.length > 0 ? (
                  behavior.biasTags.map((tag) => (
                    <span key={tag} className="mini-signal-chip">
                      {formatBiasTag(tag)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm leading-6 text-[color:var(--ink-soft)]">
                    待继续观察
                  </span>
                )}
              </span>
            </div>
          </div>
        </section>

        <section className="workbench-panel p-5">
          <p className="section-kicker">下一步队列</p>
          <h3 className="mt-2 text-xl font-black">把回答变成动作</h3>
          <div className="flow-line mt-5 space-y-4">
            {(dashboard.nextActions.length > 0
              ? dashboard.nextActions
              : ["先提出一个具体问题，系统会生成可回流的下一步。"]
            ).map((action, index) => (
              <div key={`${action}-${index}`} className="flow-node">
                <span className="flow-dot" />
                <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
                  <span className="font-black text-[color:var(--ink-strong)]">
                    {index + 1}.{" "}
                  </span>
                  {action}
                </p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
