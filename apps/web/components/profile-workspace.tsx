"use client";

import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

import {
  acceptProfilePendingProposal,
  ApiError,
  getProfileContext,
  getProfilePendingProposals,
  rejectProfilePendingProposal,
  type ProfilePendingProposal,
  type RiskLevel,
} from "@/lib/api";
import { formatBiasTags, formatProductCopy } from "@/lib/display-labels";
import { SectionBlock } from "./section-block";
import {
  Button,
  ErrorState,
  LoadingState,
  Panel,
  ProgressBar,
  StatusPill,
} from "./ui/primitives";

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

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "待录入";
  }

  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "暂无记录";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function proposalOperationLabel(
  action: "accept" | "reject",
  proposal: ProfilePendingProposal | undefined,
) {
  if (!proposal) {
    return null;
  }
  return action === "accept" ? `正在确认 ${proposal.title}` : `正在拒绝 ${proposal.title}`;
}

export function ProfileWorkspace() {
  const queryClient = useQueryClient();
  const [operationError, setOperationError] = useState<string | null>(null);

  const contextQuery = useQuery({
    queryKey: ["profile-context"],
    queryFn: getProfileContext,
    retry: false,
  });

  const proposalsQuery = useQuery({
    queryKey: ["profile-pending-proposals"],
    queryFn: getProfilePendingProposals,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptProfilePendingProposal,
    onMutate: () => setOperationError(null),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile-context"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-pending-proposals"] }),
        queryClient.invalidateQueries({ queryKey: ["behavior-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard-state"] }),
      ]);
    },
    onError: (error) => {
      setOperationError(
        isApiError(error) ? error.message : "待确认资料暂时无法确认。",
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectProfilePendingProposal,
    onMutate: () => setOperationError(null),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile-context"] }),
        queryClient.invalidateQueries({ queryKey: ["profile-pending-proposals"] }),
      ]);
    },
    onError: (error) => {
      setOperationError(
        isApiError(error) ? error.message : "待确认资料暂时无法拒绝。",
      );
    },
  });

  const context = contextQuery.data;
  const proposals = proposalsQuery.data;
  const pendingProposals = proposals?.proposals ?? [];
  const readiness = context?.contextReadiness;
  const isLoading = contextQuery.isLoading || proposalsQuery.isLoading;
  const error = contextQuery.error ?? proposalsQuery.error;
  const activeAcceptTitle = proposalOperationLabel(
    "accept",
    pendingProposals.find(
      (proposal) => proposal.id === acceptMutation.variables?.proposalId,
    ),
  );
  const activeRejectTitle = proposalOperationLabel(
    "reject",
    pendingProposals.find(
      (proposal) => proposal.id === rejectMutation.variables?.proposalId,
    ),
  );

  return (
    <div className="space-y-8">
      <SectionBlock
        eyebrow="上下文中心"
        title="这些资料决定 FundGene 怎么判断“和我有关”。"
        description="我的资料不是普通设置页，而是个人上下文中心。关键状态改变会先进入待确认，不会被系统静默保存。"
      >
        {isLoading ? (
          <LoadingState>正在读取个人上下文...</LoadingState>
        ) : error ? (
          <ErrorState>
            {isApiError(error) && error.status === 401
              ? "请先登录后再查看资料中心。"
              : "资料中心暂时无法读取。"}
          </ErrorState>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.9fr)]">
            <Panel variant="strong" className="rounded-[26px] p-5 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end">
                <div>
                  <StatusPill tone="positive">可用个人资料</StatusPill>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight text-[color:var(--ink-strong)]">
                    {context?.displayName ?? "当前用户"} 的资料已经覆盖{" "}
                    {readiness?.readyCount ?? 0}/{readiness?.totalCount ?? 0}{" "}
                    个判断来源。
                  </h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
                    FundGene 会优先使用已授权、已确认的资料；行为证据和自动任务偏好仍需要你确认后才进入长期资料。
                  </p>
                  {operationError ? (
                    <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                      {operationError}
                    </p>
                  ) : null}
                  {activeAcceptTitle || activeRejectTitle ? (
                    <p className="mt-3 text-xs font-semibold text-[color:var(--ink-muted)]">
                      {activeAcceptTitle ?? activeRejectTitle}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-[22px] border border-[color:var(--line-soft)] bg-white/70 p-4">
                  <ProgressBar
                    value={
                      readiness && readiness.totalCount > 0
                        ? Math.round((readiness.readyCount / readiness.totalCount) * 100)
                        : 0
                    }
                    label="上下文完整度"
                  />
                  <p className="mt-3 text-xs leading-5 text-[color:var(--ink-soft)]">
                    完整度用于提示当前资料是否足够，不代表投资判断确定性。
                  </p>
                </div>
              </div>
            </Panel>

            <Panel className="rounded-[26px] p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-11 place-items-center rounded-2xl border border-[color:var(--line-soft)] bg-white/76">
                  <UserRoundCog
                    aria-hidden="true"
                    className="size-5 text-[color:var(--accent-teal)]"
                  />
                </span>
                <div>
                  <StatusPill
                    tone={(proposals?.pendingCount ?? 0) > 0 ? "warning" : "positive"}
                  >
                    待确认资料
                  </StatusPill>
                  <h2 className="mt-2 text-lg font-semibold text-[color:var(--ink-strong)]">
                    {(proposals?.pendingCount ?? 0) > 0
                      ? `${proposals?.pendingCount ?? 0} 条等待你决定`
                      : "暂无待确认项目"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                    已处理 {proposals?.resolvedCount ?? 0} 条。所有确认/拒绝都会经过后端安全规则。
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </SectionBlock>

      {context ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Panel className="rounded-[26px] p-5">
              <div className="flex items-center gap-3">
                <ClipboardCheck
                  aria-hidden="true"
                  className="size-5 text-[color:var(--accent-teal)]"
                />
                <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
                  风险画像
                </h2>
              </div>
              <dl className="mt-5 space-y-3 text-sm leading-6">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[color:var(--ink-muted)]">当前等级</dt>
                  <dd className="font-semibold text-[color:var(--ink-strong)]">
                    {formatRiskLevel(context.riskProfile.riskLevel)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[color:var(--ink-muted)]">风险分数</dt>
                  <dd className="font-semibold text-[color:var(--ink-strong)]">
                    {context.riskProfile.latestRiskScore ?? "待完成问卷"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--ink-muted)]">行为焦点</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {formatBiasTags(context.behaviorProfile.biasTags).map((tag) => (
                      <StatusPill key={tag} tone="accent">
                        {tag}
                      </StatusPill>
                    ))}
                    {context.behaviorProfile.biasTags.length === 0 ? (
                      <StatusPill tone="neutral">待观察</StatusPill>
                    ) : null}
                  </dd>
                </div>
              </dl>
              <Link href="/onboarding" className="action-button-secondary mt-5">
                更新画像
              </Link>
            </Panel>

            <Panel className="rounded-[26px] p-5">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness
                  aria-hidden="true"
                  className="size-5 text-[color:var(--accent-teal)]"
                />
                <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
                  组合上下文
                </h2>
              </div>
              <dl className="mt-5 space-y-3 text-sm leading-6">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[color:var(--ink-muted)]">最近快照</dt>
                  <dd className="font-semibold text-[color:var(--ink-strong)]">
                    {formatDate(context.portfolioContext.latestSnapshotDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[color:var(--ink-muted)]">总资产</dt>
                  <dd className="font-semibold text-[color:var(--ink-strong)]">
                    {formatCurrency(context.portfolioContext.totalValue)}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                {context.portfolioContext.summary ??
                  "录入组合后，FundGene 才能判断新闻和风险是否真正与你有关。"}
              </p>
              <Link
                href="/portfolio?from=profile"
                className="action-button-secondary mt-5"
              >
                查看组合
              </Link>
            </Panel>

            <Panel className="rounded-[26px] p-5">
              <div className="flex items-center gap-3">
                <BookOpenCheck
                  aria-hidden="true"
                  className="size-5 text-[color:var(--accent-teal)]"
                />
                <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
                  学习与训练
                </h2>
              </div>
              <dl className="mt-5 space-y-3 text-sm leading-6">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[color:var(--ink-muted)]">学习进度</dt>
                  <dd className="font-semibold text-[color:var(--ink-strong)]">
                    {context.learningContext.overallProgressPercentage}%
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[color:var(--ink-muted)]">推荐课程</dt>
                  <dd className="text-right font-semibold text-[color:var(--ink-strong)]">
                    {context.learningContext.recommendedCourseTitle
                      ? formatProductCopy(
                          context.learningContext.recommendedCourseTitle,
                        )
                      : "待生成"}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                {context.simulationContext.latestReviewSummary ??
                  "训练复盘会帮助 FundGene 判断你是否需要先练习纪律，而不是继续看更多信息。"}
              </p>
              <Link
                href="/learning?from=profile"
                className="action-button-secondary mt-5"
              >
                查看学习状态
              </Link>
            </Panel>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
            <Panel className="rounded-[26px] p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="size-5 text-[color:var(--accent-teal)]"
                />
                <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
                  待确认资料
                </h2>
              </div>

              {pendingProposals.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {pendingProposals.map((proposal) => {
                    const isAccepting =
                      acceptMutation.isPending &&
                      acceptMutation.variables?.proposalId === proposal.id;
                    const isRejecting =
                      rejectMutation.isPending &&
                      rejectMutation.variables?.proposalId === proposal.id;

                    return (
                      <article
                        key={proposal.id}
                        className="rounded-[22px] border border-[color:var(--line-soft)] bg-white/68 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <StatusPill tone="warning">
                              {proposal.writebackLabel}
                            </StatusPill>
                            <h3 className="mt-3 text-base font-semibold text-[color:var(--ink-strong)]">
                              {proposal.title}
                            </h3>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={isRejecting || isAccepting}
                              onClick={() =>
                                rejectMutation.mutate({
                                  proposalId: proposal.id,
                                  reason: "用户在资料中心选择暂不写入。",
                                })
                              }
                            >
                              {isRejecting ? "处理中" : "暂不写入"}
                            </Button>
                            <Button
                              type="button"
                              disabled={isAccepting || isRejecting}
                              onClick={() =>
                                acceptMutation.mutate({
                                  proposalId: proposal.id,
                                  reason: "用户在资料中心确认记录。",
                                })
                              }
                            >
                              {isAccepting ? "确认中" : "确认记录"}
                            </Button>
                          </div>
                        </div>
                        <dl className="mt-4 grid gap-3 text-sm leading-6 md:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-[color:var(--ink-muted)]">
                              来源
                            </dt>
                            <dd className="text-[color:var(--ink-soft)]">
                              {proposal.sourceLabel}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-[color:var(--ink-muted)]">
                              证据
                            </dt>
                            <dd className="text-[color:var(--ink-soft)]">
                              {proposal.evidenceSummary}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-[color:var(--ink-muted)]">
                              原因
                            </dt>
                            <dd className="text-[color:var(--ink-soft)]">
                              {proposal.reason}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-[color:var(--ink-muted)]">
                              安全边界
                            </dt>
                            <dd className="text-[color:var(--ink-soft)]">
                              {proposal.safetyNote}
                            </dd>
                          </div>
                        </dl>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-5 rounded-[22px] border border-[color:var(--line-soft)] bg-white/68 p-5">
                  <div className="flex items-center gap-3">
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-5 text-[color:var(--accent-teal)]"
                    />
                    <p className="text-sm font-semibold text-[color:var(--ink-strong)]">
                      当前没有等待确认的资料。
                    </p>
                  </div>
                </div>
              )}
            </Panel>

            <Panel className="rounded-[26px] p-5">
              <div className="flex items-center gap-3">
                <Clock3
                  aria-hidden="true"
                  className="size-5 text-[color:var(--accent-teal)]"
                />
                <h2 className="text-lg font-semibold text-[color:var(--ink-strong)]">
                  授权读取范围
                </h2>
              </div>
              <div className="mt-5 grid gap-2">
                {context.authorizationScope.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-[color:var(--line-soft)] bg-white/62 px-3 py-2 text-sm"
                  >
                    <span className="text-[color:var(--ink-soft)]">
                      {item.label}
                    </span>
                    <StatusPill tone={item.readable ? "positive" : "warning"}>
                      {item.readable ? "已可读取" : "待补齐"}
                    </StatusPill>
                  </div>
                ))}
              </div>
              <div className="mt-5 grid gap-2">
                <p className="text-sm font-semibold text-[color:var(--ink-muted)]">
                  自动任务授权
                </p>
                {context.automationAuthorizations.map((item) => (
                  <div
                    key={item.automationKey}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-[color:var(--line-soft)] bg-white/62 px-3 py-2 text-sm"
                  >
                    <span className="text-[color:var(--ink-soft)]">
                      {item.automationKey}
                    </span>
                    <StatusPill tone={item.enabled ? "positive" : "warning"}>
                      {item.enabled ? item.cadenceLabel : "未开启"}
                    </StatusPill>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-[color:var(--ink-muted)]">
                自动任务只能读取这里明确存在的资料。高影响保存仍需确认。
              </p>
            </Panel>
          </div>
        </>
      ) : null}
    </div>
  );
}
