"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BellRing,
  CalendarClock,
  Clock3,
  Newspaper,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import {
  ApiError,
  getAutomationsState,
  runAutomationNow,
  updateAutomationSetting,
  type AutomationItem,
  type AutomationKey,
  type AutomationListState,
  type AutomationRunResult,
} from "@/lib/api";
import { SectionBlock } from "./section-block";
import {
  Button,
  ErrorState,
  LoadingState,
  Panel,
  StatusPill,
} from "./ui/primitives";

const automationIcons: Record<AutomationKey, LucideIcon> = {
  daily_brief: CalendarClock,
  weekly_portfolio: ShieldCheck,
  news_watch: Newspaper,
  behavior_observation: BellRing,
};

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "等待首次生成";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getBriefCoverageCount(state: AutomationListState | undefined): number {
  const coverage = state?.dailyBriefSummary?.sourceCoverage;
  if (!coverage) {
    return 0;
  }

  return Object.values(coverage).filter(Boolean).length;
}

function statusTone(item: AutomationItem): "positive" | "warning" | "neutral" {
  if (item.status === "ready") {
    return "positive";
  }
  if (item.status === "disabled") {
    return "warning";
  }
  return "neutral";
}

function statusLabel(item: AutomationItem): string {
  if (item.status === "ready") {
    return "可运行";
  }
  if (item.status === "disabled") {
    return "待授权";
  }
  if (item.status === "needs_profile") {
    return "需补齐资料";
  }
  return "暂不可用";
}

const pendingRunSteps: AutomationRunResult["steps"] = [
  {
    key: "submit_run",
    label: "接收运行请求",
    status: "completed",
    detail: "已收到这次手动检查请求。",
  },
  {
    key: "read_context",
    label: "读取授权上下文",
    status: "running",
    detail: "正在读取画像、组合、新闻、学习和训练状态。",
  },
  {
    key: "build_brief",
    label: "整理判断和安全边界",
    status: "queued",
    detail: "接下来会生成可解释结论，不生成交易动作。",
  },
  {
    key: "prepare_writeback",
    label: "准备待确认建议",
    status: "queued",
    detail: "需要保存到长期资料的内容会先进入待确认区。",
  },
  {
    key: "notify_user",
    label: "保存通知和检查记录",
    status: "queued",
    detail: "完成后会在本页留下通知和结果。",
  },
];

function runStepLabel(status: AutomationRunResult["steps"][number]["status"]): string {
  if (status === "running") {
    return "进行中";
  }
  if (status === "queued") {
    return "等待";
  }
  if (status === "failed") {
    return "失败";
  }
  return "完成";
}

function getPayloadText(payload: AutomationRunResult["outputPayload"], key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function getPrimaryActionLabel(payload: AutomationRunResult["outputPayload"]): string | null {
  const value = payload.primary_action;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const label = (value as Record<string, unknown>).label;
  return typeof label === "string" && label.trim() ? label : null;
}

function AutomationRunPanel({
  result,
  pending,
}: {
  result: AutomationRunResult | null;
  pending: boolean;
}) {
  const steps = pending ? pendingRunSteps : (result?.steps ?? []);
  if (!pending && !result) {
    return null;
  }
  const headline = result ? getPayloadText(result.outputPayload, "headline") : null;
  const safety = result ? getPayloadText(result.outputPayload, "safety_boundary") : null;
  const primaryAction = result ? getPrimaryActionLabel(result.outputPayload) : null;

  return (
    <div
      data-testid={`automation-run-timeline-${result?.automationKey ?? "pending"}`}
      className="mt-5 rounded-[20px] border border-[rgba(0,113,227,0.18)] bg-[rgba(0,113,227,0.06)] p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-kicker">检查过程</p>
          <h3 className="mt-2 text-base font-semibold text-[color:var(--ink-strong)]">
            {pending ? "正在执行本轮自动任务" : result?.summary ?? "本轮自动任务已完成"}
          </h3>
        </div>
        <StatusPill tone={result?.status === "failed" ? "warning" : "positive"}>
          {pending ? "运行中" : result?.status === "failed" ? "失败" : "已完成"}
        </StatusPill>
      </div>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => (
          <li
            key={step.key}
            data-testid="automation-run-step"
            className="grid grid-cols-[1.7rem_minmax(0,1fr)] gap-3 rounded-[16px] border border-[color:var(--line-soft)] bg-white/68 p-3"
          >
            <span className="grid size-7 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] text-xs font-bold text-[color:var(--accent-blue)]">
              {index + 1}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[color:var(--ink-strong)]">
                  {step.label}
                </p>
                <span className="text-xs font-semibold text-[color:var(--ink-muted)]">
                  {runStepLabel(step.status)}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                {step.detail}
              </p>
            </div>
          </li>
        ))}
      </ol>
      {result ? (
        <div
          data-testid={`automation-run-result-${result.automationKey}`}
          className="mt-4 grid gap-2 rounded-[16px] border border-[color:var(--line-soft)] bg-white/70 p-3 text-xs leading-5 text-[color:var(--ink-soft)]"
        >
          {headline ? <p>本轮判断：{headline}</p> : null}
          {primaryAction ? <p>安全下一步：{primaryAction}</p> : null}
          <p>待确认建议：{result.createdPendingProposalIds.length} 条</p>
          {safety ? <p>安全边界：{safety}</p> : null}
          {result.errorMessage ? (
            <p className="font-semibold text-red-700">错误：{result.errorMessage}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AutomationsWorkspace() {
  const queryClient = useQueryClient();
  const [operationError, setOperationError] = useState<string | null>(null);
  const [runResults, setRunResults] = useState<
    Partial<Record<AutomationKey, AutomationRunResult>>
  >({});

  const automationsQuery = useQuery({
    queryKey: ["automations-state"],
    queryFn: getAutomationsState,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: updateAutomationSetting,
    onMutate: () => setOperationError(null),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["automations-state"] });
      await queryClient.invalidateQueries({ queryKey: ["profile-context"] });
    },
    onError: (error) => {
      setOperationError(
        isApiError(error) ? error.message : "自动任务设置更新失败。",
      );
    },
  });

  const runMutation = useMutation({
    mutationFn: runAutomationNow,
    onMutate: (automationKey) => {
      setOperationError(null);
      setRunResults((current) => {
        const next = { ...current };
        delete next[automationKey];
        return next;
      });
    },
    onSuccess: async (result) => {
      setRunResults((current) => ({
        ...current,
        [result.automationKey]: result,
      }));
      await queryClient.invalidateQueries({ queryKey: ["automations-state"] });
      await queryClient.invalidateQueries({ queryKey: ["profile-context"] });
      await queryClient.invalidateQueries({
        queryKey: ["profile-pending-proposals"],
      });
    },
    onError: (error) => {
      setOperationError(
        isApiError(error) ? error.message : "自动任务暂时无法运行。",
      );
    },
  });

  const state = automationsQuery.data;
  const isLoading = automationsQuery.isLoading;
  const error = automationsQuery.error;
  const dailyBrief = state?.dailyBriefSummary ?? null;

  const toggleAutomation = (item: AutomationItem) => {
    updateMutation.mutate({
      automationKey: item.key,
      enabled: !item.enabled,
    });
  };

  const updateCadence = (item: AutomationItem, cadenceKey: string) => {
    updateMutation.mutate({
      automationKey: item.key,
      cadenceKey,
    });
  };

  return (
    <div className="space-y-8">
      <SectionBlock
        eyebrow="自动任务"
        title="FundGene 可以定期替你检查，但关键变化由你确认。"
        description="这里管理可以自动读取什么、生成什么、多久运行一次，以及哪些结果必须等你确认后才会保存。"
      >
        {isLoading ? (
          <LoadingState>正在读取自动任务授权...</LoadingState>
        ) : error ? (
          <ErrorState>
            {isApiError(error) && error.status === 401
              ? "请先登录后再管理自动任务。"
              : "自动任务状态暂时无法读取。"}
          </ErrorState>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(20rem,0.85fr)]">
            <Panel variant="strong" className="rounded-[26px] p-5 sm:p-6">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
                <div>
                  <StatusPill tone="positive">默认今日简报</StatusPill>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight text-[color:var(--ink-strong)]">
                    {dailyBrief?.headline ?? "每日简报会先替你完成第一轮判断。"}
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
                    {dailyBrief?.beginnerExplanation ??
                      "当资料足够时，系统会把组合、资讯、行为和学习状态压缩成一个安全下一步。"}
                  </p>
                  {operationError ? (
                    <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                      {operationError}
                    </p>
                  ) : null}
                </div>
                <div className="grid gap-3 rounded-[22px] border border-[color:var(--line-soft)] bg-white/70 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-muted)]">
                      已开启
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-[color:var(--ink-strong)]">
                      {state?.activeCount ?? 0}/{state?.totalCount ?? 0}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[color:var(--ink-soft)]">
                    <span>上次简报</span>
                    <span className="text-right font-semibold text-[color:var(--ink-muted)]">
                      {formatDateTime(dailyBrief?.asOf ?? null)}
                    </span>
                    <span>覆盖来源</span>
                    <span className="text-right font-semibold text-[color:var(--ink-muted)]">
                      {getBriefCoverageCount(state)}/7
                    </span>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel className="rounded-[26px] p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl border border-[color:var(--line-soft)] bg-white/78">
                  <Clock3
                    aria-hidden="true"
                    className="size-5 text-[color:var(--accent-teal)]"
                  />
                </span>
                <div>
                  <StatusPill tone="accent">运行队列</StatusPill>
                  <h2 className="mt-2 text-lg font-semibold text-[color:var(--ink-strong)]">
                    下一次会检查什么
                  </h2>
                </div>
              </div>
              <ol className="mt-5 space-y-3 text-sm">
                {(state?.nextQueue ?? []).map((item, index) => (
                  <li
                    key={item.automationKey}
                    className="flex gap-3 rounded-[18px] border border-[color:var(--line-soft)] bg-white/62 p-3"
                  >
                    <span className="mt-0.5 grid size-6 flex-none place-items-center rounded-full bg-[color:var(--accent-blue-soft)] text-xs font-semibold text-[color:var(--accent-blue)]">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[color:var(--ink-strong)]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                        {formatDateTime(item.nextRunAt)}，{item.cadenceLabel}
                        ，只生成分析和待确认建议。
                      </p>
                    </div>
                  </li>
                ))}
                {state?.nextQueue.length === 0 ? (
                  <li className="rounded-[18px] border border-[color:var(--line-soft)] bg-white/62 p-3 text-sm text-[color:var(--ink-soft)]">
                    暂无已授权的下一次自动任务。
                  </li>
                ) : null}
              </ol>
              <div className="mt-6 border-t border-[color:var(--line-soft)] pt-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[color:var(--ink-strong)]">
                    最近通知
                  </p>
                  <StatusPill tone="neutral">
                    {state?.recentNotifications.length ?? 0}
                  </StatusPill>
                </div>
                <div className="mt-3 space-y-3">
                  {(state?.recentNotifications ?? []).map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-[18px] border border-[color:var(--line-soft)] bg-white/62 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 text-sm font-semibold text-[color:var(--ink-strong)]">
                          {notification.title}
                        </p>
                        <span className="flex-none text-xs text-[color:var(--ink-muted)]">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-[color:var(--ink-soft)]">
                        {notification.message}
                      </p>
                      {notification.actionRoute && notification.actionLabel ? (
                        <Link
                          href={notification.actionRoute}
                          className="mt-3 inline-flex text-xs font-semibold text-[color:var(--accent-blue)] hover:underline"
                        >
                          {notification.actionLabel}
                        </Link>
                      ) : null}
                    </div>
                  ))}
                  {state?.recentNotifications.length === 0 ? (
                    <p className="rounded-[18px] border border-[color:var(--line-soft)] bg-white/62 p-3 text-xs leading-5 text-[color:var(--ink-soft)]">
                      自动任务完成后会在这里留下通知和确认入口。
                    </p>
                  ) : null}
                </div>
              </div>
            </Panel>
          </div>
        )}
      </SectionBlock>

      {state ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {state.automations.map((item) => {
            const Icon = automationIcons[item.key];
            const isUpdating =
              updateMutation.isPending &&
              updateMutation.variables?.automationKey === item.key;
            const isRunning =
              runMutation.isPending && runMutation.variables === item.key;

            return (
              <Panel
                key={item.key}
                className="rounded-[26px] p-5"
                variant={item.enabled ? "strong" : "default"}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-11 flex-none place-items-center rounded-2xl border border-[color:var(--line-soft)] bg-white/76">
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-[color:var(--accent-teal)]"
                    />
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.enabled}
                    disabled={isUpdating}
                    onClick={() => toggleAutomation(item)}
                    className="inline-flex min-w-[6.8rem] items-center justify-between gap-2 rounded-full border border-[color:var(--line-soft)] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[color:var(--ink-muted)] shadow-[var(--shadow-soft)] transition hover:border-[color:var(--accent-blue)] disabled:cursor-wait disabled:opacity-65 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--accent-blue)]"
                  >
                    <span>{item.enabled ? "已开启" : "未开启"}</span>
                    <span
                      aria-hidden="true"
                      className={`h-4 w-7 rounded-full p-0.5 transition ${
                        item.enabled
                          ? "bg-[color:var(--accent-blue)]"
                          : "bg-[color:var(--line-soft)]"
                      }`}
                    >
                      <span
                        className={`block size-3 rounded-full bg-white transition ${
                          item.enabled ? "translate-x-3" : ""
                        }`}
                      />
                    </span>
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
                    {item.title}
                  </h2>
                  <StatusPill tone={statusTone(item)}>{statusLabel(item)}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                  {item.summary}
                </p>
                {item.disabledReason ? (
                  <p className="mt-3 rounded-2xl border border-[color:var(--line-soft)] bg-white/68 px-3 py-2 text-xs font-semibold text-[color:var(--ink-muted)]">
                    {item.disabledReason}
                  </p>
                ) : null}

                <label className="mt-5 grid gap-2 text-sm font-semibold text-[color:var(--ink-muted)]">
                  运行频率
                  <select
                    value={item.cadenceKey}
                    onChange={(event) => updateCadence(item, event.target.value)}
                    disabled={!item.enabled || isUpdating}
                    className="field-input disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {item.cadenceOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-5 grid gap-3 text-sm leading-6 md:grid-cols-2">
                  <div>
                    <p className="font-semibold text-[color:var(--ink-muted)]">
                      会读取
                    </p>
                    <ul className="mt-2 space-y-1 text-[color:var(--ink-soft)]">
                      {item.readScope.map((entry) => (
                        <li key={entry}>- {entry}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-[color:var(--ink-muted)]">
                      会生成
                    </p>
                    <ul className="mt-2 space-y-1 text-[color:var(--ink-soft)]">
                      {item.outputScope.map((entry) => (
                        <li key={entry}>- {entry}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 rounded-[20px] border border-[color:var(--line-soft)] bg-white/64 p-4 text-sm leading-6 text-[color:var(--ink-soft)]">
                  <p>
                    <span className="font-semibold text-[color:var(--ink-muted)]">
                      确认边界：
                    </span>
                    {item.confirmationBoundary}
                  </p>
                  <p>
                    <span className="font-semibold text-[color:var(--ink-muted)]">
                      安全边界：
                    </span>
                    {item.safetyBoundary}
                  </p>
                  {item.lastRun ? (
                    <p>
                      <span className="font-semibold text-[color:var(--ink-muted)]">
                        最近运行：
                      </span>
                      {item.lastRun.summary ?? "已记录运行结果。"}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs leading-5 text-[color:var(--ink-muted)]">
                    下一次：{formatDateTime(item.nextRunAt)}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    data-testid={`automation-run-button-${item.key}`}
                    disabled={!item.canRunNow || isRunning}
                    onClick={() => runMutation.mutate(item.key)}
                  >
                    {isRunning ? "运行中" : "立即运行"}
                  </Button>
                </div>
                <AutomationRunPanel
                  pending={isRunning}
                  result={runResults[item.key] ?? null}
                />
              </Panel>
            );
          })}
        </div>
      ) : null}

      <Panel className="rounded-[26px] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <StatusPill tone="accent">安全边界</StatusPill>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
              自动任务只负责读取、分析、提醒和准备待确认建议。FundGene 不会连接券商、不执行买卖、不生成仓位指令，也不会在你未确认前改写关键画像。
            </p>
          </div>
          <Link href="/profile" className="action-button-secondary self-start">
            查看授权记录
          </Link>
        </div>
      </Panel>
    </div>
  );
}
