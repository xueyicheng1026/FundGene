"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import {
  ApiError,
  analyzeNews,
  getNewsCatalog,
  getNewsAnalysis,
  getSessionUser,
  type NewsAnalysis,
  type NewsItem,
} from "@/lib/api";
import {
  formatNewsCategory,
  formatProductCopy,
  formatReferenceLabel,
  formatSourceLabel,
} from "@/lib/display-labels";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";

const interpretationFrames = [
  {
    label: "事实",
    title: "先确认发生了什么",
    detail: "把标题情绪拆成事实、来源、时间和涉及范围。",
  },
  {
    label: "路径",
    title: "再看影响路径",
    detail: "区分宏观、政策、行业和基金组合层面的影响链。",
  },
  {
    label: "不确定性",
    title: "最后标出不确定性",
    detail: "不把一条新闻直接翻译成买卖动作。",
  },
];

const visibleNewsLimit = 5;

const emptyImpactPathStages = [
  {
    label: "新闻事实",
    title: "选择一条真实资讯开始",
    detail: "这里会展示来源标题、摘要、发布时间和链接，不把空模板当成分析结果。",
  },
  {
    label: "市场路径",
    title: "再看它可能通过哪里传导",
    detail: "系统会把政策、宏观、行业和基金类型的影响链拆开。",
  },
  {
    label: "我的组合暴露",
    title: "检查它和我的持仓有什么关系",
    detail: "只提示需要核对的资产、行业或基金类型，不直接变成买卖动作。",
  },
  {
    label: "我的行为风险",
    title: "识别我可能被哪种情绪带走",
    detail: "追热点、恐慌、过度确认等行为风险会和不确定性一起展示。",
  },
  {
    label: "安全动作",
    title: "最后落到可执行但克制的下一步",
    detail: "安全动作优先是学习、复盘、核对组合或继续追问。",
  },
];

const portfolioExposurePattern =
  /组合|持仓|基金|权益|债|固收|货币|行业|主题|资产|久期|利率|汇率|海外|指数|仓位|配置|暴露/;
const behaviorRiskPattern =
  /情绪|追|恐慌|卖出|买入|满仓|清仓|冲动|确认|波动|短期|热点|亏损|回撤|贪婪|焦虑|纪律/;

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function isPlannedEndpointError(error: unknown): boolean {
  return (
    isApiError(error) &&
    (error.status === 404 || error.status === 405 || error.status === 501)
  );
}

function formatDate(value: string | null): string {
  if (!value) {
    return "待标注";
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

function buildImpactSummary(item: NewsItem): string {
  const areas = item.impactAreas.length > 0 ? item.impactAreas : item.tags;
  if (areas.length === 0) {
    return item.itemType === "policy" ? "政策影响路径" : "市场信息路径";
  }

  return areas.slice(0, 3).join(" / ");
}

function modelStatusLabel(analysis: NewsAnalysis): string {
  if (analysis.modelStatus === "enhanced") {
    return "已生成解读";
  }
  if (analysis.modelStatus === "fallback") {
    return "已显示基础解读";
  }
  if (analysis.modelStatus === "skipped") {
    return "暂用基础解读";
  }
  return "历史解读";
}

function modelStatusTone(analysis: NewsAnalysis): string {
  if (analysis.modelStatus === "enhanced") {
    return "border-[rgba(52,199,89,0.28)] bg-[rgba(52,199,89,0.1)] text-[color:var(--accent-moss)]";
  }
  return "border-[rgba(255,159,10,0.28)] bg-[rgba(255,159,10,0.1)] text-[color:var(--accent-clay)]";
}

function isExternalHttpUrl(value: string | null): value is string {
  return value !== null && /^https?:\/\//.test(value);
}

function formatBeginnerSummary(value: string | null | undefined): string {
  if (!value) {
    return "这条资讯还没有摘要，先从标题和来源判断是否需要解读。";
  }

  return formatProductCopy(value);
}

function NewsCard({
  item,
  active,
  disabled,
  onAnalyze,
}: {
  item: NewsItem;
  active: boolean;
  disabled: boolean;
  onAnalyze: (item: NewsItem) => void;
}) {
  return (
    <article
      className={`rounded-lg border p-4 transition duration-200 ${
        active
          ? "border-[rgba(0,113,227,0.28)] bg-[linear-gradient(135deg,rgba(0,113,227,0.09),rgba(255,255,255,0.94))] shadow-[0_18px_42px_rgba(0,113,227,0.1)]"
          : "border-[color:var(--line-soft)] bg-white/72"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="section-kicker">
            {formatNewsCategory(item.category)}
          </p>
          <h3 className="mt-2 text-xl font-semibold leading-tight">
            {item.title}
          </h3>
        </div>
        <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
          {formatDate(item.publishedAt)}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[color:var(--ink-soft)]">
        {formatBeginnerSummary(item.summary)}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--ink-soft)]">
        <span className="rounded-full border border-[rgba(0,113,227,0.16)] bg-[rgba(0,113,227,0.08)] px-3 py-1 text-[color:var(--accent-teal)]">
          {formatSourceLabel(item.source)}
        </span>
        <span className="rounded-full border border-[rgba(255,159,10,0.18)] bg-[rgba(255,159,10,0.08)] px-3 py-1 text-[color:var(--accent-gold)]">
          {buildImpactSummary(item)}
        </span>
        {item.relevanceScore !== null ? (
          <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1">
            相关度 {item.relevanceScore}
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          className="action-button"
          onClick={() => onAnalyze(item)}
          disabled={disabled}
        >
          生成解读
        </button>
        {isExternalHttpUrl(item.url) ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="action-button-secondary"
          >
            查看原文
          </a>
        ) : null}
      </div>
    </article>
  );
}

function splitInsightText(value: string): string[] {
  const parts = value.match(/[^。！？；]+[。！？；]?/g) ?? [value];
  return parts.map((part) => part.trim()).filter(Boolean);
}

function filterInsightItems(items: string[], pattern: RegExp): string[] {
  return items.filter((item) => pattern.test(item));
}

function InsightRows({
  items,
  emptyText,
}: {
  items: string[];
  emptyText: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm leading-7 text-[color:var(--ink-soft)]">{emptyText}</p>
    );
  }

  return (
    <div className="space-y-2.5">
      {items.map((item, index) => (
        <div
          key={`${index}-${item}`}
          className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 rounded-lg border border-[color:var(--line-soft)] bg-white/54 px-3 py-3"
        >
          <span className="grid size-6 place-items-center rounded-full bg-[color:var(--accent-teal)] text-xs font-bold text-white">
            {index + 1}
          </span>
          <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
            {formatProductCopy(item)}
          </p>
        </div>
      ))}
    </div>
  );
}

function AnalysisCanvas({ analysis }: { analysis: NewsAnalysis }) {
  const factItems = splitInsightText(analysis.factSummary);
  const riskItems = splitInsightText(analysis.riskNotice);
  const sourceItem = analysis.item;
  const exposureItems = filterInsightItems(
    [...analysis.impactPath, ...analysis.recommendedActions],
    portfolioExposurePattern,
  );
  const behaviorItems = filterInsightItems(
    [...analysis.uncertainty, ...riskItems, ...analysis.recommendedActions],
    behaviorRiskPattern,
  );

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[rgba(0,113,227,0.18)] bg-[linear-gradient(135deg,rgba(0,113,227,0.08),rgba(255,255,255,0.92))] p-4 shadow-[0_18px_44px_rgba(29,29,31,0.07)] backdrop-blur-2xl sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="section-kicker">真实资讯解读</p>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${modelStatusTone(analysis)}`}
          >
            {modelStatusLabel(analysis)}
          </span>
        </div>
        <h3 className="mt-3 text-2xl font-semibold leading-tight text-[color:var(--ink-strong)]">
          {sourceItem?.title ?? analysis.headline}
        </h3>
        {sourceItem ? (
          <div
            data-testid="news-selected-source"
            className="mt-4 rounded-lg border border-[color:var(--line-soft)] bg-white/66 p-4"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--ink-muted)]">
              <span>{formatSourceLabel(sourceItem.source)}</span>
              <span>{formatDate(sourceItem.publishedAt)}</span>
              {isExternalHttpUrl(sourceItem.url) ? (
                <a
                  href={sourceItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[color:var(--accent-blue)] hover:underline"
                >
                  查看原文
                </a>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
              {formatBeginnerSummary(sourceItem.summary)}
            </p>
          </div>
        ) : null}
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
          {analysis.factSummary}
        </p>
      </div>

      <div
        data-testid="news-analysis-process"
        className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-4"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-kicker">解读过程</p>
            <h4 className="mt-2 text-lg font-semibold text-[color:var(--ink-strong)]">
              从真实来源到安全解释
            </h4>
          </div>
          <span className="rounded-full border border-[color:var(--line-soft)] bg-white/80 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
            解读状态已记录
          </span>
        </div>
        <ol className="mt-4 grid gap-3 md:grid-cols-5">
          {analysis.agentProcess.map((step, index) => (
            <li
              key={step.key}
              className="rounded-lg border border-[color:var(--line-soft)] bg-white/66 p-3"
            >
              <div className="flex items-center gap-2">
                <span className="grid size-6 place-items-center rounded-full bg-[color:var(--accent-blue-soft)] text-xs font-bold text-[color:var(--accent-blue)]">
                  {index + 1}
                </span>
                <span className="text-xs font-semibold text-[color:var(--ink-muted)]">
                  {step.status === "completed" ? "完成" : step.status === "failed" ? "失败" : "需注意"}
                </span>
              </div>
              <p className="mt-3 text-sm font-semibold text-[color:var(--ink-strong)]">
                {formatProductCopy(step.label)}
              </p>
              <p className="mt-2 text-xs leading-5 text-[color:var(--ink-soft)]">
                {formatProductCopy(step.detail)}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        <div className="rounded-lg border border-[rgba(0,113,227,0.2)] bg-white/86 p-4 shadow-[0_12px_32px_rgba(0,113,227,0.075)]">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-[color:var(--accent-teal)] text-xs font-bold text-white">
              1
            </span>
            <p className="section-kicker">新闻事实</p>
          </div>
          <h4 className="mt-3 text-base font-semibold">发生了什么</h4>
          <div className="mt-4">
            <InsightRows items={factItems} emptyText="暂无事实摘要。" />
          </div>
        </div>

        <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/78 p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-[color:var(--accent-gold)] text-xs font-bold text-white">
              2
            </span>
            <p className="section-kicker">市场路径</p>
          </div>
          <h4 className="mt-3 text-base font-semibold">可能怎样传导</h4>
          <div className="mt-4">
            <InsightRows items={analysis.impactPath} emptyText="暂无市场影响路径。" />
          </div>
        </div>

        <div className="rounded-lg border border-[rgba(52,199,89,0.2)] bg-[rgba(52,199,89,0.055)] p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-[color:var(--accent-moss)] text-xs font-bold text-white">
              3
            </span>
            <p className="section-kicker">我的组合暴露</p>
          </div>
          <h4 className="mt-3 text-base font-semibold">和我有什么关系</h4>
          <div className="mt-4">
            <InsightRows
              items={exposureItems}
              emptyText="这次解读没有返回单独的组合暴露项。先核对你的基金类型、行业主题和集中度，再决定是否需要去组合页复盘。"
            />
          </div>
        </div>

        <div className="rounded-lg border border-[rgba(255,159,10,0.22)] bg-[rgba(255,159,10,0.06)] p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-[color:var(--accent-clay)] text-xs font-bold text-white">
              4
            </span>
            <p className="section-kicker">我的行为风险</p>
          </div>
          <h4 className="mt-3 text-base font-semibold">我可能怎么误判</h4>
          <div className="mt-4">
            <InsightRows
              items={behaviorItems.length > 0 ? behaviorItems : analysis.uncertainty}
              emptyText="暂无行为风险提示。"
            />
          </div>
        </div>

        <div className="rounded-lg border border-[rgba(0,113,227,0.18)] bg-white/86 p-4 shadow-[0_12px_32px_rgba(0,113,227,0.06)]">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-[color:var(--accent-teal)] text-xs font-bold text-white">
              5
            </span>
            <p className="section-kicker">安全动作</p>
          </div>
          <h4 className="mt-3 text-base font-semibold">下一步只做安全核对</h4>
          <div className="mt-4">
            <InsightRows
              items={analysis.recommendedActions}
              emptyText="可以把这条信息带到教练中继续追问：它影响的是知识理解、组合结构，还是行为纪律？"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[rgba(154,93,58,0.18)] bg-[rgba(154,93,58,0.07)] p-4">
        <p className="section-kicker">安全边界</p>
        <div className="mt-4">
          <InsightRows items={riskItems} emptyText="暂无风险提示。" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[...analysis.relatedLearning, ...analysis.citations].map((item) => (
          <span
            key={item}
            className="rounded-full border border-[color:var(--line-soft)] bg-white/70 px-3 py-1 text-xs text-[color:var(--ink-soft)]"
          >
            {formatReferenceLabel(item)}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyImpactPathMap() {
  return (
    <div className="grid gap-3 xl:grid-cols-5">
      {emptyImpactPathStages.map((item, index) => (
        <div
          key={item.label}
          className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 p-4"
        >
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-[rgba(0,113,227,0.11)] text-xs font-bold text-[color:var(--accent-teal)]">
              {index + 1}
            </span>
            <p className="section-kicker">{item.label}</p>
          </div>
          <h3 className="mt-3 text-base font-semibold text-[color:var(--ink-strong)]">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
            {item.detail}
          </p>
        </div>
      ))}
    </div>
  );
}

export function NewsWorkspace() {
  const searchParams = useSearchParams();
  const sourceAnalysisId = searchParams.get("source_id");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showAllItems, setShowAllItems] = useState(false);
  const analysisRef = useRef<HTMLDivElement | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  const newsQuery = useQuery({
    queryKey: ["news-catalog"],
    queryFn: () => getNewsCatalog({ refresh: true }),
    enabled: Boolean(sessionQuery.data),
    retry: false,
  });

  const sourceAnalysisQuery = useQuery({
    queryKey: ["news-analysis", sourceAnalysisId],
    queryFn: () => getNewsAnalysis(sourceAnalysisId ?? ""),
    enabled: Boolean(sessionQuery.data && sourceAnalysisId),
    retry: false,
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeNews,
    onSuccess: (result) => {
      setAnalysis(result);
      setSubmitError(null);
      window.setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        analysisRef.current?.focus();
      }, 80);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "解读失败，请稍后重试。");
    },
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在初始化新闻解读工作区...
      </div>
    );
  }

  if (isApiError(sessionQuery.error) && sessionQuery.error.status === 401) {
    return (
      <SectionBlock
        eyebrow="资讯解读"
        title="新闻解读需要先登录。"
        description="登录后，资讯解读会结合你的画像、组合报告和学习状态。"
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
        当前新闻工作区不可用：{sessionQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const catalog = newsQuery.data;
  const items = [...(catalog?.items ?? []), ...(catalog?.policyItems ?? [])];
  const visibleItems = showAllItems ? items : items.slice(0, visibleNewsLimit);
  const endpointPending = isPlannedEndpointError(newsQuery.error);
  const activeAnalysis = analysis ?? sourceAnalysisQuery.data ?? null;
  const activeItemId = selectedItemId ?? activeAnalysis?.itemId ?? null;

  function handleAnalyzeItem(item: NewsItem) {
    setSelectedItemId(item.id);
    setSubmitError(null);
    analyzeMutation.mutate({
      itemId: item.id,
      headline: item.title,
      body: item.summary,
    });
  }

  function handleAnalyzeDraft(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const normalizedHeadline = headline.trim();
    const normalizedBody = body.trim();
    if (normalizedHeadline.length < 4 || normalizedBody.length < 12) {
      setSubmitError("请至少填写一条标题和一段需要解读的新闻或政策内容。");
      return;
    }

    setSelectedItemId(null);
    analyzeMutation.mutate({
      headline: normalizedHeadline,
      body: normalizedBody,
    });
  }

  return (
    <div className="space-y-6">
      <section className="agent-hero overflow-hidden px-5 py-6 sm:px-6">
        <div className="max-w-4xl space-y-3">
          <p className="section-kicker">资讯解读</p>
          <h1 className="text-3xl font-semibold leading-tight text-[color:var(--ink-strong)] sm:text-4xl">
            把新闻拆成对你的影响路径，而不是追热点信号。
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
            首屏按“新闻事实、市场路径、我的组合暴露、我的行为风险、安全动作”串起来；这里不会把新闻标题翻译成交易指令。
          </p>
        </div>
      </section>

      {endpointPending ? (
        <SectionBlock
          eyebrow="资讯源"
          title="当前资讯源暂不可用。"
          description="你仍然可以粘贴新闻或政策内容，生成同样结构的解读。"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            {interpretationFrames.map((item) => (
              <div
                key={item.label}
                className="paper-panel-strong rounded-lg p-5"
              >
                <p className="section-kicker">{item.label}</p>
                <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </SectionBlock>
      ) : null}

      <SectionBlock
        eyebrow="影响路径图"
        title={activeAnalysis ? "这条资讯如何影响你，而不是让你追热点。" : "选择一条资讯后，再生成与你相关的解读。"}
      description="主链路固定为：真实来源 -> 事实拆分 -> 结构化解读 -> 安全边界 -> 可确认下一步。"
      >
        <div
          ref={analysisRef}
          tabIndex={-1}
          aria-live="polite"
          aria-atomic="true"
          className="scroll-mt-6 focus:outline-none"
        >
          {analyzeMutation.isPending ? (
            <div
              data-testid="news-analysis-pending"
              className="rounded-lg border border-[color:var(--line-soft)] bg-white/70 p-5"
            >
              <p className="section-kicker">正在解读</p>
              <ol className="mt-4 grid gap-3 md:grid-cols-4">
                {[
                  "读取来源标题和摘要",
                  "拆分新闻事实",
                  "生成结构化解读",
                  "检查安全边界并保存",
                ].map((step, index) => (
                  <li
                    key={step}
                    className="rounded-lg border border-[color:var(--line-soft)] bg-white/66 p-3 text-sm text-[color:var(--ink-soft)]"
                  >
                    <span className="mr-2 font-semibold text-[color:var(--accent-blue)]">
                      {index + 1}.
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ) : sourceAnalysisQuery.isLoading ? (
            <div
              data-testid="news-analysis-pending"
              className="rounded-lg border border-[color:var(--line-soft)] bg-white/70 px-5 py-4 text-sm leading-7 text-[color:var(--ink-soft)]"
            >
              正在读取 Today 引用的新闻解读...
            </div>
          ) : activeAnalysis ? (
            <AnalysisCanvas analysis={activeAnalysis} />
          ) : (
            <EmptyImpactPathMap />
          )}
        </div>
        {sourceAnalysisQuery.error ? (
          <div
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            role="alert"
          >
            Today 引用的历史解读读取失败。你可以从下面选择同一条资讯重新生成解读。
          </div>
        ) : null}
        {submitError ? (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            role="alert"
          >
            {submitError}
          </div>
        ) : null}
      </SectionBlock>

      <SectionBlock
        eyebrow="二级入口"
        title="需要新材料时，再从这里选择或粘贴。"
        description="资讯列表和手动表单保留原有能力，但只作为生成路径图的输入入口。"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
          <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/66 p-4 sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-kicker">资讯列表</p>
                <h3 className="mt-2 text-xl font-semibold">选择已有资讯</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
                  默认展示 {visibleNewsLimit} 条
                </span>
                <button
                  type="button"
                  className="action-button-secondary"
                  disabled={newsQuery.isFetching}
                  onClick={() => void newsQuery.refetch()}
                >
                  {newsQuery.isFetching ? "同步中" : "同步真实资讯"}
                </button>
              </div>
            </div>
            <div className="mt-4">
              {newsQuery.isLoading ? (
                <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/70 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
                  正在同步资讯列表...
                </div>
              ) : newsQuery.error && !endpointPending ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                  新闻列表加载失败：{newsQuery.error.message}
                </div>
              ) : items.length > 0 ? (
                <div className="grid gap-4">
                  {visibleItems.map((item) => (
                    <NewsCard
                      key={item.id}
                      item={item}
                      active={activeItemId === item.id}
                      disabled={analyzeMutation.isPending}
                      onAnalyze={handleAnalyzeItem}
                    />
                  ))}
                  {items.length > visibleNewsLimit ? (
                    <button
                      type="button"
                      className="action-button-secondary justify-self-start"
                      onClick={() => setShowAllItems((current) => !current)}
                    >
                      {showAllItems
                        ? `收起到前 ${visibleNewsLimit} 条`
                        : `展开全部 ${items.length} 条`}
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="paper-panel-strong rounded-lg px-5 py-5 text-sm leading-7 text-[color:var(--ink-soft)]">
                  当前没有可展示资讯。可以使用手动解读入口。
                </div>
              )}
            </div>
          </div>

          <form
            className="paper-panel-strong p-4 sm:p-5"
            onSubmit={handleAnalyzeDraft}
          >
            <p className="section-kicker">手动粘贴</p>
            <h3 className="mt-2 text-xl font-semibold">粘贴材料生成解读</h3>
            <label className="mt-5 block space-y-2 text-sm">
              <span className="font-medium">新闻或政策标题</span>
              <input
                className="field-input"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                placeholder="例如：某项长期资金入市政策发布"
              />
            </label>
            <label className="mt-4 block space-y-2 text-sm">
              <span className="font-medium">正文或摘要</span>
              <textarea
                className="field-input min-h-[152px]"
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="粘贴需要拆解的新闻摘要。系统应先解释事实，再解释影响路径和不确定性。"
              />
            </label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                className="action-button"
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? "正在生成..." : "生成解读"}
              </button>
              <button
                type="button"
                className="action-button-secondary"
                onClick={() => {
                  setHeadline("");
                  setBody("");
                  setSubmitError(null);
                }}
                disabled={analyzeMutation.isPending}
              >
                清空
              </button>
            </div>
          </form>
        </div>
      </SectionBlock>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="资讯源"
          value={
            newsQuery.isLoading
              ? "同步中"
              : endpointPending
                ? "暂不可用"
                : newsQuery.isSuccess
                  ? "已同步"
                  : "需检查"
          }
          detail="资讯源不可用时，仍可使用手动解读。"
          accent="moss"
        />
        <MetricCard
          label="资讯数量"
          value={`${items.length} 条`}
          detail={`默认先展示前 ${visibleNewsLimit} 条，避免资讯流压过解读结果。`}
          accent="gold"
        />
        <MetricCard
          label="解释原则"
          value="不追热点"
          detail="只做事实解读和影响路径，不输出追热点买卖建议。"
          accent="clay"
        />
        <MetricCard
          label="用户上下文"
          value={sessionQuery.data.displayName ?? "已登录"}
          detail={sessionQuery.data.primaryGoal ?? "解读会优先服务你的学习目标。"}
          accent="moss"
        />
      </div>
    </div>
  );
}
