"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as echarts from "echarts";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  ApiError,
  createPortfolioSnapshot,
  getLatestPortfolioReport,
  getPortfolioHistory,
  getSessionUser,
  type PortfolioHolding,
  type PortfolioHoldingInput,
  type PortfolioReport,
} from "@/lib/api";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";

const fundTypeOptions = [
  { value: "equity", label: "权益基金" },
  { value: "mixed", label: "混合基金" },
  { value: "bond", label: "债券基金" },
  { value: "money_market", label: "货币基金" },
  { value: "international", label: "海外 / QDII" },
  { value: "commodity", label: "商品 / 黄金" },
];

const allocationPalette = [
  "#46d0ac",
  "#7fb7e6",
  "#d4aa55",
  "#a7a0ff",
  "#d67b68",
  "#70d5a3",
  "#b7c8c0",
];

type HoldingDraft = {
  id: string;
  fundCode: string;
  fundName: string;
  fundType: string;
  marketValue: string;
};

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function createEmptyHolding(id: string): HoldingDraft {
  return {
    id,
    fundCode: "",
    fundName: "",
    fundType: "equity",
    marketValue: "",
  };
}

function formatCurrency(value: number | null): string {
  if (value === null) {
    return "待生成";
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

function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

function getFundTypeLabel(value: string): string {
  return (
    fundTypeOptions.find((option) => option.value === value)?.label ??
    value
      .split("_")
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function buildAllocationBreakdown(report: PortfolioReport) {
  const buckets = new Map<string, number>();
  if (report.cashValue > 0 && report.totalValue > 0) {
    buckets.set("现金", (report.cashValue / report.totalValue) * 100);
  }

  for (const holding of report.holdings) {
    const label = getFundTypeLabel(holding.fundType);
    buckets.set(label, (buckets.get(label) ?? 0) + holding.weight);
  }

  return Array.from(buckets.entries())
    .map(([label, value], index) => ({
      label,
      value: clampPercent(value),
      color: allocationPalette[index % allocationPalette.length],
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

function getLargestHolding(report: PortfolioReport): PortfolioHolding | null {
  return report.holdings.reduce<PortfolioHolding | null>((largest, holding) => {
    if (!largest || holding.weight > largest.weight) {
      return holding;
    }

    return largest;
  }, null);
}

function getReportPosture(report: PortfolioReport): string {
  const largest = getLargestHolding(report);
  if (largest && largest.weight >= 40) {
    return "集中度偏高";
  }

  const cashRatio =
    report.totalValue > 0 ? (report.cashValue / report.totalValue) * 100 : 0;
  if (cashRatio >= 30) {
    return "现金留白较多";
  }

  if (report.holdings.length >= 4) {
    return "结构较分散";
  }

  return "待继续观察";
}

function AllocationVisual({ report }: { report: PortfolioReport }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const segments = useMemo(() => buildAllocationBreakdown(report), [report]);
  const largest = getLargestHolding(report);
  const cashRatio =
    report.totalValue > 0 ? clampPercent((report.cashValue / report.totalValue) * 100) : 0;

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current, undefined, {
      renderer: "canvas",
    });

    chart.setOption({
      color: segments.map((segment) => segment.color),
      tooltip: {
        trigger: "item",
        formatter: "{b}: {d}%",
      },
      series: [
        {
          name: "资产配置",
          type: "pie",
          radius: ["58%", "78%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: "#111c19",
            borderWidth: 2,
          },
          label: {
            color: "#b7c8c0",
            formatter: "{b}\n{d}%",
            lineHeight: 18,
          },
          labelLine: {
            length: 12,
            length2: 8,
          },
          data: segments.map((segment) => ({
            name: segment.label,
            value: segment.value,
          })),
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [segments]);

  return (
    <div className="rounded-lg border border-[color:var(--line-soft)] bg-[linear-gradient(145deg,rgba(24,39,35,0.9),rgba(12,20,18,0.82))] p-4 shadow-[0_14px_32px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
        <div className="chart-shell relative mx-auto h-[280px] w-full max-w-[360px] flex-none p-2">
          <div
            ref={chartRef}
            className="h-full w-full"
            role="img"
            aria-label={`组合配置分布：${segments
              .map((item) => `${item.label} ${formatPercent(item.value)}`)
              .join("，")}`}
          />
          <div className="pointer-events-none absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[color:var(--line-soft)] bg-[color:var(--surface)] text-center shadow-[0_8px_20px_rgba(0,0,0,0.24)]">
            <span className="px-2 text-sm font-semibold leading-tight text-[color:var(--ink-strong)]">
              {getReportPosture(report)}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/[0.05] px-4 py-4">
              <p className="section-kicker">Total</p>
              <p className="mt-2 text-lg font-semibold">
                {formatCurrency(report.totalValue)}
              </p>
            </div>
            <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/[0.05] px-4 py-4">
              <p className="section-kicker">Cash</p>
              <p className="mt-2 text-lg font-semibold">{formatPercent(cashRatio)}</p>
            </div>
            <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/[0.05] px-4 py-4">
              <p className="section-kicker">Top holding</p>
              <p className="mt-2 text-lg font-semibold">
                {largest ? formatPercent(largest.weight) : "待生成"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {segments.map((segment) => (
              <div key={segment.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="font-medium">{segment.label}</span>
                  </div>
                  <span className="text-[color:var(--ink-soft)]">
                    {formatPercent(segment.value)}
                  </span>
                </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/70">
                <div
                    className="h-full rounded-full"
                    style={{
                      width: `${segment.value}%`,
                      backgroundColor: segment.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportSignalCard({
  title,
  items,
  emptyText,
  tone,
}: {
  title: string;
  items: string[];
  emptyText: string;
  tone: "moss" | "gold" | "clay" | "ink";
}) {
  const toneClass = {
    moss: "border-[rgba(48,88,68,0.16)] bg-[linear-gradient(145deg,rgba(48,88,68,0.08),rgba(255,255,255,0.82))]",
    gold: "border-[rgba(184,131,47,0.18)] bg-[linear-gradient(145deg,rgba(184,131,47,0.08),rgba(255,255,255,0.82))]",
    clay: "border-[rgba(154,93,58,0.18)] bg-[linear-gradient(145deg,rgba(154,93,58,0.08),rgba(255,255,255,0.82))]",
    ink: "border-[rgba(29,37,31,0.12)] bg-[linear-gradient(145deg,rgba(29,37,31,0.06),rgba(255,255,255,0.82))]",
  } as const;

  return (
    <div className={`rounded-lg border p-4 ${toneClass[tone]}`}>
      <p className="section-kicker">{title}</p>
      <div className="mt-3 space-y-2.5 text-sm leading-6 text-[color:var(--ink-soft)]">
        {items.length > 0
          ? items.map((item, index) => (
              <div key={`${title}-${item}`} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-white/78 text-xs font-semibold text-[color:var(--accent-moss)]">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))
          : emptyText}
      </div>
    </div>
  );
}

function HoldingWeightRows({ holdings }: { holdings: PortfolioHolding[] }) {
  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 px-5 py-5 text-sm text-[color:var(--ink-soft)]">
        暂无持仓明细。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[...holdings]
        .sort((a, b) => b.weight - a.weight)
        .map((holding, index) => (
          <div
            key={`${holding.fundCode}-${holding.fundName}`}
            className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 px-4 py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="section-kicker">Holding 0{index + 1}</p>
                <h3 className="mt-2 text-base font-semibold">
                  {holding.fundName}
                </h3>
                <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
                  {holding.fundCode} · {getFundTypeLabel(holding.fundType)}
                </p>
              </div>
              <div className="text-sm font-semibold">
                {formatCurrency(holding.marketValue)}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[rgba(36,49,39,0.08)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-moss),var(--accent-gold))]"
                  style={{ width: `${clampPercent(holding.weight)}%` }}
                />
              </div>
              <span className="w-14 text-right text-sm text-[color:var(--ink-soft)]">
                {formatPercent(holding.weight)}
              </span>
            </div>
          </div>
        ))}
    </div>
  );
}

export function PortfolioWorkspace() {
  const queryClient = useQueryClient();
  const [snapshotDate, setSnapshotDate] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [cashValue, setCashValue] = useState("0");
  const [holdings, setHoldings] = useState<HoldingDraft[]>([
    createEmptyHolding("holding-1"),
  ]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  const latestReportQuery = useQuery({
    queryKey: ["portfolio-latest"],
    queryFn: getLatestPortfolioReport,
    enabled: Boolean(sessionQuery.data?.profileId),
    retry: false,
  });

  const historyQuery = useQuery({
    queryKey: ["portfolio-history"],
    queryFn: getPortfolioHistory,
    enabled: Boolean(sessionQuery.data?.profileId),
    retry: false,
  });

  const snapshotMutation = useMutation({
    mutationFn: async (payload: {
      snapshotDate: string;
      cashValue: number;
      holdings: PortfolioHoldingInput[];
    }) => createPortfolioSnapshot(payload),
    onSuccess: async () => {
      setSubmitError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portfolio-latest"] }),
        queryClient.invalidateQueries({ queryKey: ["portfolio-history"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
      ]);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "提交失败，请稍后重试。");
    },
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在初始化组合分析上下文...
      </div>
    );
  }

  if (isApiError(sessionQuery.error) && sessionQuery.error.status === 401) {
    return (
      <SectionBlock
        eyebrow="组合分析"
        title="组合分析需要先登录。"
        description="登录后才能保存组合快照、分析报告和历史记录。"
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
        当前组合工作区不可用：{sessionQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const sessionUser = sessionQuery.data;
  if (!sessionUser.profileId) {
    return (
      <SectionBlock
        eyebrow="组合分析"
        title="先建立基础画像，再录入第一份持仓快照。"
        description="组合分析要跟你的目标、经验和后续教练上下文连起来，因此至少要先在建档中保存基础资料。"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            label="当前用户"
            value={sessionUser.displayName ?? "已登录用户"}
            detail={sessionUser.email ?? sessionUser.id}
            accent="moss"
          />
          <MetricCard
            label="组合输入"
            value="待解锁"
            detail="先建立画像，再把第一份快照作为后续分析基线。"
            accent="gold"
          />
          <MetricCard
            label="Guardrail"
            value="No trading"
            detail="这里解释风险和结构，不生成交易执行指令。"
            accent="clay"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/onboarding" className="action-button">
            去建立基础画像
          </Link>
          <Link href="/learning" className="action-button-secondary">
            先去学习
          </Link>
        </div>
      </SectionBlock>
    );
  }

  if (latestReportQuery.isLoading || historyQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在同步最近组合报告和历史快照...
      </div>
    );
  }

  if (latestReportQuery.error || historyQuery.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        组合数据加载失败：
        {latestReportQuery.error?.message ??
          historyQuery.error?.message ??
          "未知错误"}
      </div>
    );
  }

  const latestReport = latestReportQuery.data?.report ?? null;
  const historyItems = historyQuery.data?.items ?? [];

  function handleHoldingChange(
    targetId: string,
    field: keyof Omit<HoldingDraft, "id">,
    value: string,
  ) {
    setHoldings((current) =>
      current.map((holding) =>
        holding.id === targetId ? { ...holding, [field]: value } : holding,
      ),
    );
  }

  function handleAddHolding() {
    setHoldings((current) => [
      ...current,
      createEmptyHolding(`holding-${current.length + 1}`),
    ]);
  }

  function handleRemoveHolding(targetId: string) {
    setHoldings((current) => {
      if (current.length === 1) {
        return current;
      }
      return current.filter((holding) => holding.id !== targetId);
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const normalizedCashValue = Number(cashValue);
    if (!Number.isFinite(normalizedCashValue) || normalizedCashValue < 0) {
      setSubmitError("请填写有效的现金金额。");
      return;
    }

    const normalizedHoldings = holdings.map((holding) => ({
      fundCode: holding.fundCode.trim(),
      fundName: holding.fundName.trim(),
      fundType: holding.fundType,
      marketValue: Number(holding.marketValue),
    }));
    const hasInvalidHolding = normalizedHoldings.some(
      (holding) =>
        holding.fundCode.length === 0 ||
        holding.fundName.length === 0 ||
        !Number.isFinite(holding.marketValue) ||
        holding.marketValue <= 0,
    );

    if (hasInvalidHolding) {
      setSubmitError("请为每一行持仓填写基金代码、基金名称和大于 0 的持仓金额。");
      return;
    }

    snapshotMutation.mutate({
      snapshotDate,
      cashValue: normalizedCashValue,
      holdings: normalizedHoldings,
    });
  }

  return (
    <div className="space-y-6">
      <SectionBlock
        eyebrow="组合分析"
        title="先解释持仓结构，再讨论配置原则。"
        description="手动录入快照后，系统会生成结构化报告，并在工作台和教练中继续引用。"
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <MetricCard
            label="最近报告"
            value={latestReport ? "已生成" : "待录入"}
            detail="每次提交都会生成一份新的持仓快照和分析记录。"
            accent="moss"
          />
          <MetricCard
            label="最近估值"
            value={formatCurrency(latestReport?.totalValue ?? null)}
            detail="总资产按现金加持仓快照估算，不接实时行情。"
            accent="gold"
          />
          <MetricCard
            label="最近快照"
            value={formatDate(latestReport?.snapshotDate ?? null)}
            detail="后续教练会优先参考最近一份组合报告。"
            accent="clay"
          />
          <MetricCard
            label="历史记录"
            value={`${historyItems.length} 份`}
            detail="每次录入都保留历史，不用最新状态覆盖一切。"
            accent="moss"
          />
        </div>
      </SectionBlock>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionBlock
          eyebrow="Manual snapshot"
          title="录入第一份或下一份持仓快照。"
          description="这里记录组合状态，不生成交易指令。"
        >
          <form
            className="paper-panel-strong p-4 sm:p-5"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">快照日期</span>
                <input
                  className="field-input"
                  type="date"
                  value={snapshotDate}
                  onChange={(event) => setSnapshotDate(event.target.value)}
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium">现金金额</span>
                <input
                  className="field-input"
                  inputMode="decimal"
                  value={cashValue}
                  onChange={(event) => setCashValue(event.target.value)}
                  placeholder="0"
                />
              </label>
            </div>

            <div className="mt-4 space-y-3">
              {holdings.map((holding, index) => (
                <div
                  key={holding.id}
                  className="rounded-lg border border-[color:var(--line-soft)] bg-white/55 p-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="section-kicker">Holding 0{index + 1}</p>
                    <button
                      type="button"
                      className="action-button-secondary"
                      onClick={() => handleRemoveHolding(holding.id)}
                      disabled={holdings.length === 1 || snapshotMutation.isPending}
                    >
                      删除
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                      <span className="font-medium">基金代码</span>
                      <input
                        className="field-input"
                        value={holding.fundCode}
                        onChange={(event) =>
                          handleHoldingChange(holding.id, "fundCode", event.target.value)
                        }
                        placeholder="例如：161725"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium">基金名称</span>
                      <input
                        className="field-input"
                        value={holding.fundName}
                        onChange={(event) =>
                          handleHoldingChange(holding.id, "fundName", event.target.value)
                        }
                        placeholder="例如：招商中证白酒指数"
                      />
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium">基金类型</span>
                      <select
                        className="field-input"
                        value={holding.fundType}
                        onChange={(event) =>
                          handleHoldingChange(holding.id, "fundType", event.target.value)
                        }
                      >
                        {fundTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2 text-sm">
                      <span className="font-medium">持仓金额</span>
                      <input
                        className="field-input"
                        inputMode="decimal"
                        value={holding.marketValue}
                        onChange={(event) =>
                          handleHoldingChange(holding.id, "marketValue", event.target.value)
                        }
                        placeholder="例如：12000"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="action-button-secondary"
                onClick={handleAddHolding}
                disabled={snapshotMutation.isPending}
              >
                添加一行持仓
              </button>
              <button
                type="submit"
                className="action-button"
                disabled={snapshotMutation.isPending}
              >
                {snapshotMutation.isPending ? "正在生成报告..." : "生成组合报告"}
              </button>
            </div>

            {submitError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}
          </form>
        </SectionBlock>

        <SectionBlock
          eyebrow="Latest report"
          title={latestReport ? "最近一份组合体检报告" : "还没有组合报告"}
          description="报告分为配置分布、持仓权重、风险暴露和下一步动作。"
        >
          {latestReport ? (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#213127] p-4 text-[#f6eddc] shadow-[0_18px_42px_rgba(29,37,31,0.18)]">
                <div className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <p className="text-[11px] uppercase tracking-normal text-[#cfb06c]">
                        Snapshot {formatDate(latestReport.snapshotDate)}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl leading-tight">
                        {getReportPosture(latestReport)}
                      </h3>
                    </div>
                    <div className="rounded-lg border border-white/15 bg-white/8 px-4 py-3 text-sm text-[#eadfce]">
                      <p>报告生成</p>
                      <p className="mt-1 font-semibold">
                        {formatDate(latestReport.generatedAt)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#eadfce]">
                    {latestReport.summary}
                  </p>
                </div>
              </div>

              <AllocationVisual report={latestReport} />

              <div className="grid gap-4 lg:grid-cols-2">
                <ReportSignalCard
                  title="Risk exposure"
                  items={latestReport.riskExposure}
                  emptyText="暂无风险暴露说明。"
                  tone="moss"
                />
                <ReportSignalCard
                  title="Concentration flags"
                  items={latestReport.concentrationFlags}
                  emptyText="暂无集中度提示。"
                  tone="clay"
                />
                <ReportSignalCard
                  title="Allocation balance"
                  items={latestReport.allocationBalance}
                  emptyText="暂无配置平衡说明。"
                  tone="gold"
                />
                <ReportSignalCard
                  title="Recommended actions"
                  items={latestReport.recommendedNextActions}
                  emptyText="暂无下一步动作。"
                  tone="ink"
                />
              </div>

              <div className="rounded-lg border border-[color:var(--line-soft)] bg-[linear-gradient(145deg,rgba(255,255,255,0.82),rgba(246,236,218,0.94))] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="section-kicker">Holding weights</p>
                    <h3 className="mt-2 text-xl font-semibold">
                      每一只基金在组合里承担多少波动。
                    </h3>
                  </div>
                  <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
                    {latestReport.holdings.length} 只基金
                  </span>
                </div>
                <div className="mt-5">
                  <HoldingWeightRows holdings={latestReport.holdings} />
                </div>
              </div>
            </div>
          ) : (
            <div className="paper-panel-strong rounded-lg px-5 py-5 text-sm leading-7 text-[color:var(--ink-soft)]">
              先录入第一份持仓快照。生成后，这里会显示最新报告，工作台也会同步看到组合体检状态。
            </div>
          )}
        </SectionBlock>
      </div>

      <SectionBlock
        eyebrow="History"
        title="历史快照"
        description="每次录入都会保留一份历史，便于对照结构变化。"
      >
        <div className="space-y-3">
          {historyItems.length > 0 ? (
            historyItems.map((item) => (
              <div
                key={item.snapshotId}
                className="paper-panel-strong rounded-lg px-5 py-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="section-kicker">{formatDate(item.snapshotDate)}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">
                      {item.summary}
                    </p>
                  </div>
                  <div className="text-sm text-[color:var(--ink-soft)]">
                    {formatCurrency(item.totalValue)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="paper-panel-strong rounded-lg px-5 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
              还没有历史快照。第一份报告生成后，这里会开始积累可回看的组合记录。
            </div>
          )}
        </div>
      </SectionBlock>
    </div>
  );
}
