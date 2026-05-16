"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import {
  ApiError,
  analyzeNews,
  getNewsCatalog,
  getSessionUser,
  type NewsAnalysis,
  type NewsItem,
} from "@/lib/api";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";

const interpretationFrames = [
  {
    label: "Fact",
    title: "先确认发生了什么",
    detail: "把标题情绪拆成事实、来源、时间和涉及范围。",
  },
  {
    label: "Path",
    title: "再看影响路径",
    detail: "区分宏观、政策、行业和基金组合层面的影响链。",
  },
  {
    label: "Uncertainty",
    title: "最后标出不确定性",
    detail: "不把一条新闻直接翻译成买卖动作。",
  },
];

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

function isExternalHttpUrl(value: string | null): value is string {
  return value !== null && /^https?:\/\//.test(value);
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
          ? "border-[rgba(48,88,68,0.32)] bg-[linear-gradient(135deg,rgba(48,88,68,0.12),rgba(255,255,255,0.92))] shadow-[0_18px_42px_rgba(48,88,68,0.09)]"
          : "border-[color:var(--line-soft)] bg-white/72"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="section-kicker">
            {item.category ?? "Market signal"}
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
        {item.summary}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[color:var(--ink-soft)]">
        <span className="rounded-full border border-[rgba(48,88,68,0.14)] bg-[rgba(48,88,68,0.08)] px-3 py-1 text-[color:var(--accent-moss)]">
          {item.source ?? "未标注来源"}
        </span>
        <span className="rounded-full border border-[rgba(184,131,47,0.16)] bg-[rgba(184,131,47,0.08)] px-3 py-1 text-[color:var(--accent-gold)]">
          {buildImpactSummary(item)}
        </span>
        {item.relevanceScore !== null ? (
          <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1">
            relevance {item.relevanceScore}
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
            查看来源
          </a>
        ) : null}
      </div>
    </article>
  );
}

function AnalysisCanvas({ analysis }: { analysis: NewsAnalysis }) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border border-white/12 bg-[#203126] p-4 text-[#f7edda] shadow-[0_18px_42px_rgba(29,37,31,0.18)]">
        <div className="relative">
          <p className="text-[11px] tracking-normal text-[#cfb06c]">
            资讯解读
          </p>
          <h3 className="mt-2 font-serif text-2xl leading-tight">
            {analysis.headline}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[#eadfce]">
            {analysis.factSummary}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-4">
          <p className="section-kicker">影响路径</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
            {analysis.impactPath.length > 0
              ? analysis.impactPath.map((item) => <div key={item}>{item}</div>)
              : "暂无影响路径。"}
          </div>
        </div>
        <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-4">
          <p className="section-kicker">不确定性</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
            {analysis.uncertainty.length > 0
              ? analysis.uncertainty.map((item) => <div key={item}>{item}</div>)
              : "暂无不确定性清单。"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-lg border border-[rgba(154,93,58,0.18)] bg-[rgba(154,93,58,0.07)] p-4">
          <p className="section-kicker">风险提示</p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            {analysis.riskNotice}
          </p>
        </div>
        <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/76 p-4">
          <p className="section-kicker">下一步动作</p>
          <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--ink-soft)]">
            {analysis.recommendedActions.length > 0
              ? analysis.recommendedActions.map((item) => <div key={item}>{item}</div>)
              : "可以把这条信息带到教练中继续追问：它影响的是知识理解、组合结构，还是行为纪律？"}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[...analysis.relatedLearning, ...analysis.citations].map((item) => (
          <span
            key={item}
            className="rounded-full border border-[color:var(--line-soft)] bg-white/70 px-3 py-1 text-xs text-[color:var(--ink-soft)]"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function NewsWorkspace() {
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  const newsQuery = useQuery({
    queryKey: ["news-catalog"],
    queryFn: getNewsCatalog,
    enabled: Boolean(sessionQuery.data),
    retry: false,
  });

  const analyzeMutation = useMutation({
    mutationFn: analyzeNews,
    onSuccess: (result) => {
      setAnalysis(result);
      setSubmitError(null);
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
  const endpointPending = isPlannedEndpointError(newsQuery.error);

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
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            把新闻标题里的情绪噪音，拆成事实、路径和不确定性。
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-white/68">
            每条资讯都先拆事实，再拆影响路径和不确定性；这里不会把新闻标题翻译成交易指令。
          </p>
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-4">
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
          detail="同时兼容资讯条目与政策条目两类列表。"
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

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionBlock
          eyebrow="资讯台"
          title="选择一条资讯，生成结构化 readout。"
          description="优先看事实和影响路径，再决定是否回到学习、组合或教练继续追问。"
        >
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
              {items.map((item) => (
                <NewsCard
                  key={item.id}
                  item={item}
                  active={selectedItemId === item.id}
                  disabled={analyzeMutation.isPending}
                  onAnalyze={handleAnalyzeItem}
                />
              ))}
            </div>
          ) : (
            <div className="paper-panel-strong rounded-lg px-5 py-5 text-sm leading-7 text-[color:var(--ink-soft)]">
              当前没有可展示资讯。可以使用右侧手动解读入口。
            </div>
          )}
        </SectionBlock>

        <SectionBlock
          eyebrow="手动解读"
          title="粘贴一条新闻或政策内容。"
          description="适合临时材料、课堂案例或还没进入资讯列表的文本。"
        >
          <form
            className="paper-panel-strong p-4 sm:p-5"
            onSubmit={handleAnalyzeDraft}
          >
            <label className="space-y-2 text-sm">
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
                className="field-input min-h-[120px]"
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
                {analyzeMutation.isPending ? "正在解读..." : "提交解读"}
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

            {submitError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}
          </form>
        </SectionBlock>
      </div>

      <SectionBlock
        eyebrow="Structured readout"
        title="资讯解读画布"
        description="事实摘要、影响路径、不确定性、风险提示和下一步动作分区展示。"
      >
        {analysis ? (
          <AnalysisCanvas analysis={analysis} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {interpretationFrames.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-[color:var(--line-soft)] bg-white/72 p-5"
              >
                <p className="section-kicker">{item.label}</p>
                <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </SectionBlock>
    </div>
  );
}
