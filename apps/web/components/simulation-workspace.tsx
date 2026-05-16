"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ApiError,
  getBehaviorProfile,
  getSessionUser,
  getSimulationReview,
  getSimulationScenarios,
  startSimulationSession,
  submitSimulationAction,
  type BehaviorProfile,
  type SimulationFeedback,
  type SimulationScenario,
  type SimulationSession,
  type SimulationSessionActionChoice,
} from "@/lib/api";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";

function joinClasses(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function formatRiskLevel(level: BehaviorProfile["riskLevel"]): string {
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

function formatDifficulty(value: string | null): string {
  if (!value) {
    return "基础";
  }

  const normalized = value.toLowerCase();
  if (normalized === "starter" || normalized === "beginner" || normalized === "初级") {
    return "初级";
  }
  if (
    normalized === "intermediate" ||
    normalized === "medium" ||
    normalized === "中等"
  ) {
    return "中级";
  }
  if (normalized === "advanced" || normalized === "高级") {
    return "高级";
  }

  return value;
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "待生成";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDuration(value: number | null): string {
  if (value === null || value <= 0) {
    return "待定";
  }

  return `${value} min`;
}

function isSessionCompleted(session: SimulationSession | null): boolean {
  if (!session) {
    return false;
  }

  return session.status === "completed" || session.completedAt !== null;
}

function getProgressValue(session: SimulationSession | null): number {
  if (!session) {
    return 0;
  }

  if (!session.totalSteps || session.totalSteps <= 0) {
    return isSessionCompleted(session) ? 100 : 0;
  }

  const cappedStep = Math.min(session.currentStep, session.totalSteps);
  return Math.max(0, Math.min(100, Math.round((cappedStep / session.totalSteps) * 100)));
}

function buildScenarioBadge(scenario: SimulationScenario): string {
  if (scenario.marketPhase) {
    return scenario.marketPhase;
  }

  if (scenario.startingYear) {
    return `${scenario.startingYear} 情境`;
  }

  return "历史训练";
}

function DeskMetric({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "moss" | "gold" | "clay" | "ink";
}) {
  const toneMap = {
    moss: "from-[rgba(70,208,172,0.16)] via-[rgba(238,248,239,0.06)] to-transparent",
    gold: "from-[rgba(212,170,85,0.16)] via-[rgba(238,248,239,0.06)] to-transparent",
    clay: "from-[rgba(214,123,104,0.16)] via-[rgba(238,248,239,0.06)] to-transparent",
    ink: "from-[rgba(238,248,239,0.08)] via-[rgba(238,248,239,0.04)] to-transparent",
  } as const;

  return (
    <div className="relative overflow-hidden rounded-lg border border-[color:var(--line-soft)] bg-[linear-gradient(180deg,rgba(24,39,35,0.9),rgba(12,20,18,0.78))] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.2)]">
      <div
        className={joinClasses(
          "pointer-events-none absolute inset-0 bg-gradient-to-br",
          toneMap[tone],
        )}
      />
      <div className="relative">
        <p className="section-kicker">{label}</p>
        <p className="mt-2 font-serif text-2xl">{value}</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">{detail}</p>
      </div>
    </div>
  );
}

function ReviewColumn({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 p-4">
      <p className="section-kicker">{title}</p>
      <div className="mt-3 space-y-2 text-sm leading-6 text-[color:var(--ink-soft)]">
        {items.length > 0 ? items.map((item) => <div key={item}>{item}</div>) : emptyText}
      </div>
    </div>
  );
}

function ChoiceCard({
  choice,
  active,
  onSelect,
}: {
  choice: SimulationSessionActionChoice;
  active: boolean;
  onSelect: (choiceId: string) => void;
}) {
  return (
    <button
      type="button"
      className={joinClasses(
        "group w-full rounded-lg border px-4 py-3 text-left transition duration-200",
        active
          ? "border-[rgba(48,88,68,0.34)] bg-[linear-gradient(135deg,rgba(48,88,68,0.15),rgba(255,255,255,0.94))] shadow-[0_16px_32px_rgba(48,88,68,0.09)]"
          : "border-[color:var(--line-soft)] bg-white/78 hover:-translate-y-0.5 hover:border-[rgba(48,88,68,0.18)]",
      )}
      onClick={() => onSelect(choice.id)}
      aria-pressed={active}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="section-kicker">Action</p>
          <h3 className="mt-2 text-base font-semibold">{choice.label}</h3>
        </div>
        {choice.biasSignal ? (
          <span className="rounded-full border border-[rgba(48,88,68,0.15)] bg-[rgba(48,88,68,0.08)] px-3 py-1 text-[11px] text-[color:var(--accent-moss)]">
            {choice.biasSignal}
          </span>
        ) : null}
      </div>
      {choice.description ? (
        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
          {choice.description}
        </p>
      ) : null}
    </button>
  );
}

export function SimulationWorkspace() {
  const queryClient = useQueryClient();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<SimulationSession | null>(null);
  const [latestFeedback, setLatestFeedback] = useState<SimulationFeedback | null>(null);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const [draftRationale, setDraftRationale] = useState("");
  const [startError, setStartError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewRequested, setReviewRequested] = useState(false);

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

  const scenariosQuery = useQuery({
    queryKey: ["simulation-scenarios"],
    queryFn: getSimulationScenarios,
    enabled: isOnboarded,
    retry: false,
  });

  const scenarios = scenariosQuery.data?.scenarios ?? [];
  const resolvedScenarioId =
    selectedScenarioId && scenarios.some((item) => item.id === selectedScenarioId)
      ? selectedScenarioId
      : scenariosQuery.data?.recommendedScenarioId ?? scenarios[0]?.id ?? null;
  const selectedScenario =
    scenarios.find((item) => item.id === resolvedScenarioId) ?? null;

  const reviewQuery = useQuery({
    queryKey: ["simulation-review", activeSession?.id],
    queryFn: () => getSimulationReview(activeSession?.id ?? ""),
    enabled: Boolean(activeSession?.id && reviewRequested),
    retry: false,
  });

  const startMutation = useMutation({
    mutationFn: async (scenarioId: string) =>
      startSimulationSession({ scenarioId }),
    onSuccess: async (nextSession) => {
      setActiveSession(nextSession);
      setLatestFeedback(null);
      setSelectedActionId(null);
      setDraftRationale("");
      setReviewRequested(false);
      setStartError(null);
      if (nextSession.scenarioId) {
        setSelectedScenarioId(nextSession.scenarioId);
      }
      await queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] });
    },
    onError: (error) => {
      setStartError(error instanceof Error ? error.message : "无法启动情境，请稍后重试。");
    },
  });

  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!activeSession) {
        throw new Error("请先启动一个情境训练。");
      }

      if (!selectedActionId) {
        throw new Error("请先选择本轮要执行的动作。");
      }

      return submitSimulationAction({
        sessionId: activeSession.id,
        eventId: activeSession.activeEvent?.id ?? null,
        actionId: selectedActionId,
        rationale: draftRationale,
      });
    },
    onSuccess: async (result) => {
      setActionError(null);
      setActiveSession(result.session);
      setLatestFeedback(result.feedback);
      setSelectedActionId(null);
      setDraftRationale("");
      setReviewRequested(result.reviewReady);
      await queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] });
      if (result.reviewReady) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["behavior-profile"] }),
        ]);
      }
    },
    onError: (error) => {
      setActionError(error instanceof Error ? error.message : "无法提交当前动作。");
    },
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在初始化历史情境训练上下文...
      </div>
    );
  }

  if (isApiError(sessionQuery.error) && sessionQuery.error.status === 401) {
    return (
      <SectionBlock
        eyebrow="情境训练"
        title="历史情境训练需要先登录。"
        description="登录后才能保存场景选择、动作记录和最终复盘。"
      >
        <div className="paper-panel-strong rounded-lg px-5 py-6">
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
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        当前情境训练工作区不可用：{sessionQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const sessionUser = sessionQuery.data;

  if (!sessionUser.onboardingCompleted) {
    return (
      <SectionBlock
        eyebrow="情境训练"
        title="先完成建档，再进入历史情境训练。"
        description="情境训练会结合你的风险基线和行为偏差。"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            label="当前用户"
            value={sessionUser.displayName ?? "已登录用户"}
            detail={sessionUser.email ?? sessionUser.id}
            accent="moss"
          />
          <MetricCard
            label="训练前提"
            value="待完成"
            detail="先保存基础画像与问卷，再开始历史情境。"
            accent="gold"
          />
          <MetricCard
            label="训练方式"
            value="Explain first"
            detail="每一步都要求写下理由，再进入动作反馈和最终复盘。"
            accent="clay"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/onboarding" className="action-button">
            去完成建档
          </Link>
          <Link href="/dashboard" className="action-button-secondary">
            返回工作台
          </Link>
        </div>
      </SectionBlock>
    );
  }

  if (behaviorQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在同步行为画像与历史情境训练入口...
      </div>
    );
  }

  if (behaviorQuery.error || !behaviorQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        无法读取行为画像：{behaviorQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const behavior = behaviorQuery.data;
  const review = reviewQuery.data ?? null;
  const activeSessionCompleted = isSessionCompleted(activeSession);
  const activeEvent = activeSession?.activeEvent ?? null;
  const apiUnavailable =
    scenariosQuery.error instanceof ApiError &&
    (scenariosQuery.error.status === 404 ||
      scenariosQuery.error.status === 405 ||
      scenariosQuery.error.status === 501);
  const progressValue = getProgressValue(activeSession);

  function handleStartScenario() {
    if (!selectedScenario) {
      setStartError("请先从左侧选择一个情境。");
      return;
    }

    setStartError(null);
    setActionError(null);
    startMutation.mutate(selectedScenario.id);
  }

  function handleSubmitAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    actionMutation.mutate();
  }

  function handleRequestReview() {
    if (!activeSession?.id) {
      return;
    }

    setReviewRequested(true);
  }

  return (
    <div className="space-y-6">
      <section className="agent-hero overflow-hidden px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[40%] border-l border-white/10 bg-white/[0.04] xl:block" />
        <div className="relative grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="section-kicker">历史情境训练</p>
              <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-4xl">
                把“市场一震就想动手”的瞬间，变成一份可追溯的决策日志。
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-white/68">
                挑选历史场景，在关键节点写下动作和理由，再用结构化复盘看清自己的纪律与偏差。
                这里不模拟交易执行，只训练判断过程。
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-[color:var(--ink-soft)]">
              <span className="rounded-full border border-[rgba(48,88,68,0.16)] bg-white/62 px-4 py-2">
                风险等级：{formatRiskLevel(behavior.riskLevel)}
              </span>
              <span className="rounded-full border border-[rgba(48,88,68,0.16)] bg-white/62 px-4 py-2">
                当前偏差焦点：{behavior.biasTags[0] ?? "待继续观察"}
              </span>
              <span className="rounded-full border border-[rgba(48,88,68,0.16)] bg-white/62 px-4 py-2">
                {scenariosQuery.isSuccess
                  ? `可选场景 ${scenarios.length} 个`
                  : "场景同步中"}
              </span>
            </div>
          </div>

          <div className="grid gap-2.5 self-start xl:pl-4">
            {[
              {
                label: "01",
                title: "挑选场景",
                detail: "先理解背景，不让训练变成无上下文点按钮。",
              },
              {
                label: "02",
                title: "写下理由",
                detail: "动作之前先写判断依据，留下以后能复盘的证据。",
              },
              {
                label: "03",
                title: "接收反馈",
                detail: "每一步读取反馈，不把行为偏差藏在结果后面。",
              },
              {
                label: "04",
                title: "生成复盘",
                detail: "最后回看强项、盲点和下周训练动作。",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/38 bg-white/42 px-3.5 py-3"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(48,88,68,0.18)] bg-white/70 font-serif text-sm">
                    {item.label}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-4">
        <DeskMetric
          label="行为焦点"
          value={behavior.biasTags[0] ?? "待观察"}
          detail="训练优先围绕你最容易被情绪推着走的那一类场景展开。"
          tone="moss"
        />
        <DeskMetric
          label="推荐场景"
          value={selectedScenario?.title ?? "等待场景"}
          detail="当前会优先高亮推荐场景，但仍允许你主动切换。"
          tone="gold"
        />
        <DeskMetric
          label="训练状态"
          value={
            activeSession
              ? activeSessionCompleted
                ? "可生成复盘"
                : "进行中"
              : "未开始"
          }
          detail={
            activeSession
              ? `当前会话创建于 ${formatTimestamp(activeSession.startedAt)}`
              : "启动第一个情境后，这里会显示训练状态。"
          }
          tone="ink"
        />
        <DeskMetric
          label="训练链路"
          value="4 步"
          detail="选场景、启动训练、提交动作、生成复盘。"
          tone="clay"
        />
      </div>

      {scenariosQuery.isLoading ? (
        <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/70 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
          正在加载情境列表与训练入口...
        </div>
      ) : scenariosQuery.error ? (
        <SectionBlock
          eyebrow={apiUnavailable ? "情境源" : "情境错误"}
          title={
            apiUnavailable
              ? "当前情境源暂不可用。"
              : "无法读取历史情境列表。"
          }
          description={
            apiUnavailable
              ? "可以先回到学习、组合或教练；情境源恢复后再继续训练。"
              : `请求返回错误：${scenariosQuery.error.message}`
          }
        >
          <div className="grid gap-4 xl:grid-cols-[1fr_0.92fr]">
            <div className="rounded-lg border border-[color:var(--line-soft)] bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(245,236,220,0.94))] p-5">
              <p className="section-kicker">训练闭环</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                <div>1. 读取场景列表，建立选择与推荐逻辑。</div>
                <div>2. 启动一个训练会话。</div>
                <div>3. 在关键节点提交动作和理由。</div>
                <div>4. 生成最终复盘并回到工作台。</div>
              </div>
            </div>
            <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/78 p-5">
              <p className="section-kicker">现在可以做什么</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/coach" className="action-button">
                  先去教练
                </Link>
                <Link href="/dashboard" className="action-button-secondary">
                  回工作台
                </Link>
              </div>
              <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                情境源恢复后，可以继续完成完整训练。
              </p>
            </div>
          </div>
        </SectionBlock>
      ) : scenarios.length === 0 ? (
        <SectionBlock
          eyebrow="情境目录"
          title="场景目录还没有内容。"
          description="目前没有可训练的历史情境。可以先去学习或组合体检。"
        >
          <div className="flex flex-wrap gap-3">
            <Link href="/learning" className="action-button">
              先去学习
            </Link>
            <Link href="/portfolio" className="action-button-secondary">
              看组合
            </Link>
          </div>
        </SectionBlock>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <SectionBlock
              eyebrow="场景目录"
              title="先从场景池里挑一个值得练的历史节点。"
              description="左侧是可用情境；选择后，右侧会展开背景、训练目标和时间线预览。"
            >
              <div className="grid gap-4">
                {scenarios.map((scenario) => {
                  const active = scenario.id === selectedScenario?.id;
                  return (
                    <button
                      key={scenario.id}
                      type="button"
                      className={joinClasses(
                        "group rounded-lg border p-4 text-left transition duration-200",
                        active
                          ? "border-[rgba(48,88,68,0.34)] bg-[linear-gradient(135deg,rgba(48,88,68,0.12),rgba(255,255,255,0.98))] shadow-[0_18px_42px_rgba(48,88,68,0.09)]"
                          : "border-[color:var(--line-soft)] bg-white/72 hover:-translate-y-0.5 hover:border-[rgba(48,88,68,0.18)]",
                      )}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="section-kicker">{buildScenarioBadge(scenario)}</span>
                            {scenario.recommended ? (
                              <span className="rounded-full border border-[rgba(184,131,47,0.2)] bg-[rgba(184,131,47,0.1)] px-3 py-1 text-[11px] text-[color:var(--accent-gold)]">
                                推荐
                              </span>
                            ) : null}
                            {scenario.completed ? (
                              <span className="rounded-full border border-[rgba(48,88,68,0.18)] bg-[rgba(48,88,68,0.1)] px-3 py-1 text-[11px] text-[color:var(--accent-moss)]">
                                已完成
                              </span>
                            ) : null}
                          </div>
                          <h2 className="mt-3 text-2xl font-semibold">{scenario.title}</h2>
                        </div>
                        <div className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
                          {formatDifficulty(scenario.difficulty)}
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                        {scenario.synopsis}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--ink-soft)]">
                        {scenario.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1"
                          >
                            {tag}
                          </span>
                        ))}
                        {scenario.biasFocus.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-[rgba(154,93,58,0.16)] bg-[rgba(154,93,58,0.08)] px-3 py-1 text-[color:var(--accent-clay)]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-[rgba(255,255,255,0.72)] px-3 py-3 text-xs text-[color:var(--ink-soft)]">
                          预计时长
                          <p className="mt-1 text-sm font-semibold text-[color:var(--ink-strong)]">
                            {formatDuration(scenario.estimatedDurationMinutes)}
                          </p>
                        </div>
                        <div className="rounded-lg bg-[rgba(255,255,255,0.72)] px-3 py-3 text-xs text-[color:var(--ink-soft)]">
                          决策节点
                          <p className="mt-1 text-sm font-semibold text-[color:var(--ink-strong)]">
                            {scenario.decisionCount ?? "待定"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-[rgba(255,255,255,0.72)] px-3 py-3 text-xs text-[color:var(--ink-soft)]">
                          起始背景
                          <p className="mt-1 text-sm font-semibold text-[color:var(--ink-strong)]">
                            {scenario.startingYear ?? "历史样本"}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionBlock>

            <SectionBlock
              eyebrow="Scenario dossier"
              title={selectedScenario?.headline ?? selectedScenario?.title ?? "选择一个情境"}
              description={
                selectedScenario?.description ??
                "选择场景后，这里会展示背景、目标、时间线与启动入口。"
              }
              className="xl:sticky xl:top-6"
            >
              {selectedScenario ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-[rgba(36,49,39,0.1)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(239,227,204,0.95))] p-5 shadow-[0_18px_44px_rgba(70,58,39,0.08)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="section-kicker">{buildScenarioBadge(selectedScenario)}</p>
                        <h2 className="mt-3 font-serif text-3xl leading-tight">
                          {selectedScenario.title}
                        </h2>
                      </div>
                      <div className="rounded-full border border-[color:var(--line-soft)] bg-white/78 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
                        {formatDifficulty(selectedScenario.difficulty)}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                      {selectedScenario.setup ?? selectedScenario.synopsis}
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/74 px-4 py-4">
                        <p className="section-kicker">Training objective</p>
                        <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                          {selectedScenario.objective ??
                            "在波动背景里记录你的判断顺序，而不是只看最后对错。"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/74 px-4 py-4">
                        <p className="section-kicker">Bias focus</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(selectedScenario.biasFocus.length > 0
                            ? selectedScenario.biasFocus
                            : ["情绪反应", "风险纪律"]
                          ).map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-[rgba(154,93,58,0.16)] bg-[rgba(154,93,58,0.08)] px-3 py-1 text-xs text-[color:var(--accent-clay)]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-5">
                    <p className="section-kicker">Timeline preview</p>
                    <div className="mt-4 space-y-4">
                      {(selectedScenario.timelinePreview.length > 0
                        ? selectedScenario.timelinePreview
                        : ["启动情境后会显示关键节点。"]
                      ).map((item, index) => (
                        <div key={`${item}-${index}`} className="flex gap-4">
                          <div className="flex w-8 flex-none flex-col items-center">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(48,88,68,0.18)] bg-white/80 text-xs font-semibold">
                              {index + 1}
                            </span>
                            {index < selectedScenario.timelinePreview.length - 1 ? (
                              <span className="mt-2 h-full w-px bg-[rgba(36,49,39,0.12)]" />
                            ) : null}
                          </div>
                          <div className="pt-0.5 text-sm leading-7 text-[color:var(--ink-soft)]">
                            {item}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {scenariosQuery.data?.activeSessionId ? (
                    <div className="rounded-lg border border-[rgba(184,131,47,0.18)] bg-[rgba(184,131,47,0.08)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                      当前账号存在一个活跃训练，但此版本暂不支持恢复中途会话。请重新开始一个情境。
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="action-button"
                      onClick={handleStartScenario}
                      disabled={startMutation.isPending}
                    >
                      {startMutation.isPending ? "正在启动情境..." : "开始这个情境"}
                    </button>
                    <Link href="/coach" className="action-button-secondary">
                      先去教练预热
                    </Link>
                  </div>

                  {startError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {startError}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 px-5 py-6 text-sm leading-7 text-[color:var(--ink-soft)]">
                  当前没有可展开的场景详情。
                </div>
              )}
            </SectionBlock>
          </div>

          <SectionBlock
            eyebrow="Decision room"
            title={
              activeSession
                ? activeSessionCompleted
                  ? "本次训练已到复盘节点。"
                  : `正在进行：${activeSession.scenarioTitle ?? selectedScenario?.title ?? "历史情境"}`
                : "启动一个情境后，这里会进入训练会话。"
            }
            description={
              activeSession
                ? activeSessionCompleted
                  ? "动作已经提交完毕。接下来可以读取最终复盘，把这次训练回流到行为画像和工作台。"
                  : "当前事件、动作选项和即时反馈都来自同一条训练会话。"
                : "先从上方卡片选择一个场景并启动 session，再进入关键节点判断。"
            }
          >
            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="space-y-4">
                {activeSession && !activeSessionCompleted && activeEvent ? (
                  <>
                    <div className="rounded-lg border border-[rgba(36,49,39,0.1)] bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(241,232,214,0.96))] p-5 shadow-[0_18px_44px_rgba(70,58,39,0.08)]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="section-kicker">
                            第 {activeEvent.index} 步
                            {activeSession.totalSteps ? ` / ${activeSession.totalSteps}` : ""}
                          </p>
                          <h2 className="mt-3 text-2xl font-semibold">{activeEvent.title}</h2>
                        </div>
                        {activeEvent.dateLabel ? (
                          <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
                            {activeEvent.dateLabel}
                          </span>
                        ) : null}
                      </div>
                      {activeEvent.marketContext ? (
                        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                          {activeEvent.marketContext}
                        </p>
                      ) : null}
                      {activeEvent.prompt ? (
                        <div className="mt-5 rounded-lg border border-[color:var(--line-soft)] bg-white/72 px-4 py-4">
                          <p className="section-kicker">Decision prompt</p>
                          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                            {activeEvent.prompt}
                          </p>
                        </div>
                      ) : null}
                      {activeEvent.decisionFocus.length > 0 ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activeEvent.decisionFocus.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-[rgba(48,88,68,0.16)] bg-[rgba(48,88,68,0.08)] px-3 py-1 text-xs text-[color:var(--accent-moss)]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <form
                      className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-5"
                      onSubmit={handleSubmitAction}
                    >
                      <p className="section-kicker">Choose an action</p>
                      <div className="mt-4 grid gap-3">
                        {activeEvent.availableActions.length > 0 ? (
                          activeEvent.availableActions.map((choice) => (
                            <ChoiceCard
                              key={choice.id}
                              choice={choice}
                              active={selectedActionId === choice.id}
                              onSelect={setSelectedActionId}
                            />
                          ))
                        ) : (
                          <div className="rounded-lg border border-[color:var(--line-soft)] bg-[rgba(255,255,255,0.68)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                            当前事件尚未返回可提交的动作选项。
                          </div>
                        )}
                      </div>

                      <label className="mt-5 block space-y-2 text-sm">
                        <span className="font-medium">判断理由（推荐填写）</span>
                        <textarea
                          className="field-input min-h-[130px]"
                          value={draftRationale}
                          onChange={(event) => setDraftRationale(event.target.value)}
                          placeholder={
                            activeSession.reflectionPrompt ??
                            "例如：我为什么倾向先观望、加仓或减仓？这个判断是基于风险控制还是情绪反应？"
                          }
                        />
                      </label>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          type="submit"
                          className="action-button"
                          disabled={
                            actionMutation.isPending ||
                            activeEvent.availableActions.length === 0
                          }
                        >
                          {actionMutation.isPending ? "提交动作中..." : "提交本轮动作"}
                        </button>
                        <button
                          type="button"
                          className="action-button-secondary"
                          onClick={() => {
                            setSelectedActionId(null);
                            setDraftRationale("");
                            setActionError(null);
                          }}
                          disabled={actionMutation.isPending}
                        >
                          清空选择
                        </button>
                      </div>

                      {actionError ? (
                        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                          {actionError}
                        </div>
                      ) : null}
                    </form>
                  </>
                ) : (
                  <div className="rounded-lg border border-[color:var(--line-soft)] bg-[linear-gradient(145deg,rgba(255,255,255,0.84),rgba(245,236,220,0.94))] px-5 py-6 text-sm leading-7 text-[color:var(--ink-soft)]">
                    {activeSessionCompleted
                      ? "当前 session 已经没有新的动作节点。直接去右侧读取结构化复盘即可。"
                      : "还没有启动中的 session。先从上面的场景档案中点“开始这个情境”，这里才会展开真正的决策节点。"}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-[color:var(--line-soft)] bg-[#213127] p-5 text-[#f6eddc] shadow-[0_18px_48px_rgba(29,37,31,0.18)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-normal text-[#cfb06c]">
                        训练看板
                      </p>
                      <h2 className="mt-3 font-serif text-3xl">
                        {activeSession?.stageLabel ??
                          (activeSessionCompleted
                            ? "Review checkpoint"
                            : activeSession
                              ? "实时训练"
                              : "Waiting")}
                      </h2>
                    </div>
                    {activeSession ? (
                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-[#e8ddc8]">
                        {activeSessionCompleted ? "已完成" : "进行中"}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#cfb06c,#7fb08d)] transition-all duration-300"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#dccfb7]">
                    <span>进度 {progressValue}%</span>
                    {activeSession?.totalSteps ? (
                      <span>
                        {activeSession.currentStep}/{activeSession.totalSteps} 节点
                      </span>
                    ) : null}
                    {activeSession?.startedAt ? (
                      <span>开始于 {formatTimestamp(activeSession.startedAt)}</span>
                    ) : null}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-[#eadfcf]">
                    {activeSession?.openingBrief ??
                      "会话启动后，这里会显示摘要与阶段说明。"}
                  </p>
                </div>

                <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-5">
                  <p className="section-kicker">Instant feedback</p>
                  {latestFeedback ? (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
                        {latestFeedback.summary}
                      </p>
                      {latestFeedback.impact ? (
                        <div className="rounded-lg border border-[color:var(--line-soft)] bg-[rgba(255,255,255,0.72)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                          {latestFeedback.impact}
                        </div>
                      ) : null}
                      {latestFeedback.disciplineSignals.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {latestFeedback.disciplineSignals.map((item) => (
                            <span
                              key={item}
                              className="rounded-full border border-[rgba(48,88,68,0.16)] bg-[rgba(48,88,68,0.08)] px-3 py-1 text-xs text-[color:var(--accent-moss)]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {latestFeedback.nextPrompt ? (
                        <p className="text-sm leading-7 text-[color:var(--ink-soft)]">
                          下一步提示：{latestFeedback.nextPrompt}
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                      你每提交一次动作，这里都会渲染本轮反馈，而不是只在结尾告诉你结果。
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-5">
                  <p className="section-kicker">After this session</p>
                  <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                    <div>1. 读取最终复盘，确认这次训练暴露了哪些行为偏差。</div>
                    <div>2. 回到工作台，看下一步训练动作是否被刷新。</div>
                    <div>3. 去教练追问“为什么我会在这一类波动里犹豫或冲动”。</div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className={activeSessionCompleted ? "action-button" : "action-button-secondary"}
                      onClick={handleRequestReview}
                      disabled={!activeSessionCompleted || reviewQuery.isLoading}
                    >
                      {reviewQuery.isLoading ? "正在读取复盘..." : "查看最终复盘"}
                    </button>
                    <Link href="/dashboard" className="action-button-secondary">
                      回工作台
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>

          {(reviewRequested || review || reviewQuery.isError) && activeSession ? (
            <SectionBlock
              eyebrow="Final review"
              title="把一次动作链，收束成一份可以回看的行为复盘。"
              description="最终复盘不只说你做得对不对，而是把这次训练里的纪律、盲点和下一步动作重新组织出来。"
            >
              {reviewQuery.isLoading ? (
                <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 px-5 py-5 text-sm text-[color:var(--ink-soft)]">
                  正在读取最终复盘...
                </div>
              ) : reviewQuery.error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-5 text-sm text-red-700">
                  复盘读取失败：{reviewQuery.error.message}
                </div>
              ) : review ? (
                <div className="space-y-5">
                  <div className="rounded-lg border border-[rgba(36,49,39,0.1)] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(239,227,204,0.95))] p-6 shadow-[0_18px_44px_rgba(70,58,39,0.08)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="max-w-3xl">
                        <p className="section-kicker">
                          {review.scenarioTitle ?? activeSession.scenarioTitle ?? "情境复盘"}
                        </p>
                        <h2 className="mt-3 font-serif text-4xl leading-tight">
                          {review.scoreLabel ?? "训练复盘"}
                        </h2>
                        <p className="mt-4 text-sm leading-8 text-[color:var(--ink-soft)]">
                          {review.overallAssessment}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/78 px-4 py-4 text-sm text-[color:var(--ink-soft)]">
                        <p>完成时间</p>
                        <p className="mt-2 font-semibold text-[color:var(--ink-strong)]">
                          {formatTimestamp(review.completedAt)}
                        </p>
                      </div>
                    </div>

                    {review.outcomeSummary || review.finalDisposition ? (
                      <div className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/74 px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                          <p className="section-kicker">Outcome summary</p>
                          <p className="mt-3">
                            {review.outcomeSummary ?? "本次训练已形成结构化结果。"}
                          </p>
                        </div>
                        <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/74 px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                          <p className="section-kicker">Behavior readout</p>
                          <p className="mt-3">
                            {review.finalDisposition ??
                              "系统会把这次训练转成下一步的行为观察重点。"}
                          </p>
                        </div>
                      </div>
                    ) : null}

                    {review.biasSignals.length > 0 ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {review.biasSignals.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[rgba(154,93,58,0.16)] bg-[rgba(154,93,58,0.08)] px-3 py-1 text-xs text-[color:var(--accent-clay)]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <ReviewColumn
                      title="What went well"
                      items={review.strengths}
                      emptyText="暂无优势清单。"
                    />
                    <ReviewColumn
                      title="Watch next time"
                      items={review.improvementAreas}
                      emptyText="暂无待改进项。"
                    />
                    <ReviewColumn
                      title="下一步动作"
                      items={review.recommendedNextActions}
                      emptyText="暂无下一步动作。"
                    />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
                    <div className="rounded-lg border border-[color:var(--line-soft)] bg-[#213127] p-5 text-[#f6eddc]">
                      <p className="text-[11px] uppercase tracking-normal text-[#cfb06c]">
                        Reflection prompts
                      </p>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-[#eadfcf]">
                        {review.reflectionQuestions.length > 0
                          ? review.reflectionQuestions.map((item) => (
                              <div key={item}>{item}</div>
                            ))
                          : "暂无反思问题，可以回到教练继续追问这次训练。"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-5">
                      <p className="section-kicker">Continue the loop</p>
                      <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                        这份复盘的价值，在于把“我当时为什么那样选”重新转回可讨论、可学习、可安排下一步训练的产品主线。
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Link href="/dashboard" className="action-button">
                          去看工作台变化
                        </Link>
                        <Link href="/coach" className="action-button-secondary">
                          去教练继续追问
                        </Link>
                        <button
                          type="button"
                          className="action-button-secondary"
                          onClick={() => {
                            setActiveSession(null);
                            setLatestFeedback(null);
                            setSelectedActionId(null);
                            setDraftRationale("");
                            setReviewRequested(false);
                          }}
                        >
                          开始下一次训练
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 px-5 py-5 text-sm text-[color:var(--ink-soft)]">
                  当前 session 已完成，但复盘结果尚未可用。
                </div>
              )}
            </SectionBlock>
          ) : null}
        </>
      )}
    </div>
  );
}
