"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTransition, useState } from "react";

import {
  submitRiskQuestionnaire,
  upsertOnboardingProfile,
  type OnboardingProfileInput,
} from "@/lib/api";

const QUESTION_SET = [
  {
    id: "volatility_comfort",
    title: "面对基金净值波动时，你的舒适度更接近哪一档？",
    choices: [
      { label: "稍有波动就会不安，希望尽快回到稳定状态", score: 1 },
      { label: "能接受小幅波动，但不希望净值起伏太大", score: 2 },
      { label: "中等波动可以接受，只要长期逻辑还在", score: 3 },
      { label: "较大波动也能承受，愿意换取更高长期收益", score: 4 },
      { label: "波动不是问题，更在意长期回报空间", score: 5 },
    ],
  },
  {
    id: "drawdown_reaction",
    title: "如果持仓一个月回撤 12%，你最可能的动作是？",
    choices: [
      { label: "立刻卖出，先止损再说", score: 1 },
      { label: "减仓一部分，先把波动降下来", score: 2 },
      { label: "先停下来复盘，再决定要不要调整", score: 3 },
      { label: "维持计划，不因为单月回撤改策略", score: 4 },
      { label: "如果逻辑没变，甚至会考虑逢低补一点", score: 5 },
    ],
  },
  {
    id: "investment_horizon",
    title: "你打算给这笔基金投资多长的观察周期？",
    choices: [
      { label: "不到一年，主要先试试水", score: 1 },
      { label: "一到两年，看情况再说", score: 2 },
      { label: "两到三年，愿意做阶段性复盘", score: 3 },
      { label: "三到五年，按周期看策略执行", score: 4 },
      { label: "五年以上，用长期视角看复利", score: 5 },
    ],
  },
  {
    id: "panic_sell_impulse",
    title: "市场连续下跌时，你有多容易冒出“先卖掉再说”的念头？",
    choices: [
      { label: "几乎不会，我通常先看计划", score: 1 },
      { label: "偶尔会，但能很快压住", score: 2 },
      { label: "会犹豫，需要再看看", score: 3 },
      { label: "经常会，情绪影响比较明显", score: 4 },
      { label: "非常强烈，通常很难不动手", score: 5 },
    ],
  },
  {
    id: "chase_hot_funds",
    title: "看到朋友讨论热门基金或短期高收益榜单时，你有多想跟进？",
    choices: [
      { label: "几乎不会，先看是否适合自己的计划", score: 1 },
      { label: "会关注，但不急着上车", score: 2 },
      { label: "有时会心动，想再多比较一下", score: 3 },
      { label: "经常会想跟一笔，怕错过机会", score: 4 },
      { label: "很难忍住，通常会优先考虑追热点", score: 5 },
    ],
  },
  {
    id: "diversification_habit",
    title: "在选择基金时，你平时有多重视分散配置？",
    choices: [
      { label: "基本不考虑，哪只看起来强就买哪只", score: 1 },
      { label: "会听过分散，但执行不太稳定", score: 2 },
      { label: "知道需要分散，但还没形成固定方法", score: 3 },
      { label: "通常会控制单一主题或风格集中度", score: 4 },
      { label: "会主动从资产和风格两个层面做分散", score: 5 },
    ],
  },
];

const INITIAL_PROFILE: OnboardingProfileInput = {
  displayName: "",
  investingExperience: "beginner",
  monthlyContributionBand: "under_3000",
  primaryGoal: "先建立一套能长期坚持的基金投资习惯",
};

type QuestionnaireState = Record<string, number>;

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function OnboardingWorkflow() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireState>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const profileMutation = useMutation({
    mutationFn: (input: OnboardingProfileInput) => upsertOnboardingProfile(input),
    onSuccess: async () => {
      setProfileSaved(true);
      await queryClient.invalidateQueries({ queryKey: ["session-user"] });
    },
  });

  const questionnaireMutation = useMutation({
    mutationFn: async (answers: QuestionnaireState) => {
      await upsertOnboardingProfile(profile);
      return submitRiskQuestionnaire({ answers });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["session-user"] }),
        queryClient.invalidateQueries({ queryKey: ["behavior-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["coach-session"] }),
      ]);
      setIsCompleted(true);
      startTransition(() => {
        router.push("/dashboard");
      });
    },
  });

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const trimmedName = profile.displayName.trim();
    if (trimmedName.length < 2) {
      setSubmitError("请填写至少 2 个字符的称呼，用于工作台个性化提示。");
      return;
    }

    profileMutation.mutate({
      ...profile,
      displayName: trimmedName,
      primaryGoal: profile.primaryGoal.trim(),
    });
  }

  function handleQuestionnaireSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const answeredCount = Object.keys(questionnaire).length;
    if (answeredCount !== QUESTION_SET.length) {
      setSubmitError("请先完成全部问卷题目，再提交画像。");
      return;
    }

    questionnaireMutation.mutate(questionnaire);
  }

  const isSubmitting = profileMutation.isPending || questionnaireMutation.isPending;
  const answeredCount = Object.keys(questionnaire).length;
  const profileChecks = [
    profile.displayName.trim().length >= 2,
    profile.investingExperience.trim().length > 0,
    profile.monthlyContributionBand.trim().length > 0,
    profile.primaryGoal.trim().length >= 8,
  ];
  const profileCompletionCount = profileChecks.filter(Boolean).length;
  const totalProgressUnits = profileChecks.length + QUESTION_SET.length;
  const completedProgressUnits =
    (profileSaved ? profileChecks.length : profileCompletionCount) + answeredCount;
  const overallProgress = clampProgress(
    (completedProgressUnits / totalProgressUnits) * 100,
  );
  const currentStage = profileSaved
    ? answeredCount === QUESTION_SET.length
      ? "准备提交画像"
      : "继续完成风险与行为问卷"
    : "先保存基础画像";

  return (
    <div className="space-y-5">
      <div className="agent-hero overflow-hidden p-4 sm:p-5">
        <div className="relative grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="section-kicker">建档进度</p>
            <h3 className="mt-2 text-3xl font-black leading-tight">
              {overallProgress}%
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/68">
              {currentStage}
            </p>
          </div>
          <div className="space-y-4">
            <div className="h-3 overflow-hidden rounded-full bg-white/65">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--accent-moss),var(--accent-gold))] transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/64 px-4 py-3">
                <p className="section-kicker">基础画像</p>
                <p className="mt-2 text-sm font-semibold">
                  {profileSaved
                    ? "已保存"
                    : `${profileCompletionCount}/${profileChecks.length} 项就绪`}
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/64 px-4 py-3">
                <p className="section-kicker">风险问卷</p>
                <p className="mt-2 text-sm font-semibold">
                  {answeredCount}/{QUESTION_SET.length} 题完成
                </p>
              </div>
              <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/64 px-4 py-3">
                <p className="section-kicker">写回状态</p>
                <p className="mt-2 text-sm font-semibold">
                  {isCompleted ? "已进入工作台" : "等待提交"}
                </p>
              </div>
            </div>
            <p className="text-sm leading-7 text-white/68">
              你当前已在登录会话内。基础画像和问卷会影响工作台与后续教练解释。
            </p>
          </div>
        </div>
      </div>

      <form
        className="paper-panel-strong p-4 sm:p-5"
        onSubmit={handleProfileSubmit}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-kicker">第 1 步</p>
            <h3 className="mt-2 font-serif text-2xl">建立基础画像</h3>
          </div>
          <span className="rounded-full border border-[color:var(--line-soft)] bg-white/72 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
            {profileSaved ? "已保存" : `${profileCompletionCount}/4 项就绪`}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
          这一步会写入基础用户信息，作为工作台和后续推荐的上下文。
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">称呼</span>
            <input
              className="field-input"
              value={profile.displayName}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  displayName: event.target.value,
                }))
              }
              placeholder="例如：小陈"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">投资经验</span>
            <select
              className="field-input"
              value={profile.investingExperience}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  investingExperience: event.target.value,
                }))
              }
            >
              <option value="beginner">刚开始了解基金</option>
              <option value="starter">已经定投，但还没形成稳定策略</option>
              <option value="intermediate">有一些配置经验，想把方法做稳</option>
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">每月可投入金额</span>
            <select
              className="field-input"
              value={profile.monthlyContributionBand}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  monthlyContributionBand: event.target.value,
                }))
              }
            >
              <option value="under_3000">3000 元以内</option>
              <option value="3000_10000">3000 - 10000 元</option>
              <option value="above_10000">10000 元以上</option>
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">当前最重要的目标</span>
            <textarea
              className="field-input"
              rows={4}
              value={profile.primaryGoal}
              onChange={(event) =>
                setProfile((current) => ({
                  ...current,
                  primaryGoal: event.target.value,
                }))
              }
              placeholder="例如：建立长期定投习惯，先把风险控制和基金配置逻辑学明白。"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            className="action-button"
            disabled={isSubmitting}
          >
            {profileMutation.isPending ? "保存中..." : "保存基础画像"}
          </button>
          <Link href="/dashboard" className="action-button-secondary">
            先看工作台
          </Link>
        </div>

        {profileSaved ? (
          <p className="mt-4 text-sm text-[color:var(--accent-moss)]">
            基础画像已保存，下一步可以继续完成风险问卷。
          </p>
        ) : null}
      </form>

      <form
        className="paper-panel-strong p-4 sm:p-5"
        onSubmit={handleQuestionnaireSubmit}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-kicker">第 2 步</p>
            <h3 className="mt-2 font-serif text-2xl">风险与行为问卷</h3>
          </div>
          <span className="rounded-full border border-[color:var(--line-soft)] bg-white/72 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
            {answeredCount}/{QUESTION_SET.length} 题完成
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
          问卷完成后，工作台会展示风险等级、行为偏差提示和下一步动作。
        </p>

        <div className="mt-5 rounded-lg border border-[color:var(--line-soft)] bg-white/62 px-4 py-4">
          <div className="flex flex-wrap gap-2">
            {QUESTION_SET.map((question, index) => {
              const answered = questionnaire[question.id] !== undefined;
              return (
                <span
                  key={question.id}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    answered
                      ? "border-[rgba(48,88,68,0.22)] bg-[rgba(48,88,68,0.1)] text-[color:var(--accent-moss)]"
                      : "border-[color:var(--line-soft)] bg-white/70 text-[color:var(--ink-soft)]"
                  }`}
                >
                  Q{index + 1} {answered ? "已答" : "待答"}
                </span>
              );
            })}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/75">
            <div
              className="h-full rounded-full bg-[color:var(--accent-moss)] transition-all duration-300"
              style={{
                width: `${clampProgress((answeredCount / QUESTION_SET.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="mt-5 space-y-5">
          {QUESTION_SET.map((question, index) => (
            <fieldset key={question.id} className="space-y-3">
              <legend className="text-sm font-semibold leading-7">
                Q{index + 1}. {question.title}
              </legend>
              <div className="grid gap-2">
                {question.choices.map((choice) => {
                  const checked = questionnaire[question.id] === choice.score;
                  return (
                    <label
                      key={`${question.id}-${choice.score}`}
                      className={`choice-item ${checked ? "choice-item-active" : ""}`}
                    >
                      <input
                        type="radio"
                        name={question.id}
                        value={choice.score}
                        checked={checked}
                        onChange={() =>
                          setQuestionnaire((current) => ({
                            ...current,
                            [question.id]: choice.score,
                          }))
                        }
                      />
                      <span>{choice.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            className="action-button"
            disabled={isSubmitting}
          >
            {questionnaireMutation.isPending
              ? "提交中..."
              : "提交问卷并进入工作台"}
          </button>
        </div>
      </form>

      {submitError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      {profileMutation.error || questionnaireMutation.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(profileMutation.error ?? questionnaireMutation.error)?.message ??
            "提交失败，请稍后重试。"}
        </div>
      ) : null}

      {isCompleted ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          已完成建档，正在跳转到工作台...
        </div>
      ) : null}
    </div>
  );
}
