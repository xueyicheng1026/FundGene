"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  ApiError,
  getLearningCourse,
  getSessionUser,
  updateLearningProgress,
} from "@/lib/api";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function formatCourseStatus(status: string): string {
  if (status === "completed") {
    return "已完成";
  }
  if (status === "in_progress") {
    return "进行中";
  }
  return "待开始";
}

export function LearningCourseWorkspace() {
  const params = useParams<{ courseSlug: string }>();
  const courseSlug = typeof params.courseSlug === "string" ? params.courseSlug : "";
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  const courseQuery = useQuery({
    queryKey: ["learning-course", courseSlug],
    queryFn: () => getLearningCourse(courseSlug),
    enabled: Boolean(sessionQuery.data?.profileId && courseSlug),
    retry: false,
  });

  const progressMutation = useMutation({
    mutationFn: async (sectionSlug: string) =>
      updateLearningProgress({ courseSlug, sectionSlug }),
    onSuccess: async () => {
      setSubmitError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["learning-course", courseSlug] }),
        queryClient.invalidateQueries({ queryKey: ["learning-path"] }),
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
        正在初始化课程上下文...
      </div>
    );
  }

  if (isApiError(sessionQuery.error) && sessionQuery.error.status === 401) {
    return (
      <SectionBlock
        eyebrow="课程详情"
        title="课程详情需要先登录。"
        description="登录后才能同步课程进度和小节完成状态。"
      >
        <div className="paper-panel-strong rounded-lg px-5 py-6">
          <div className="flex flex-wrap gap-3">
            <Link href="/start" className="action-button">
              去登录 / 注册
            </Link>
            <Link href="/learning" className="action-button-secondary">
              返回学习中心
            </Link>
          </div>
        </div>
      </SectionBlock>
    );
  }

  if (sessionQuery.error || !sessionQuery.data || !sessionQuery.data.profileId) {
    return (
      <SectionBlock
        eyebrow="课程详情"
        title="先建立基础画像，再进入课程详情。"
        description="学习课程记录会直接绑定到产品用户，因此至少需要先在建档中保存基础资料。"
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/onboarding" className="action-button">
            去建立基础画像
          </Link>
          <Link href="/learning" className="action-button-secondary">
            返回学习中心
          </Link>
        </div>
      </SectionBlock>
    );
  }

  if (courseQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在同步课程详情与 section 完成状态...
      </div>
    );
  }

  if (courseQuery.error || !courseQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        课程详情加载失败：{courseQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const course = courseQuery.data;

  return (
    <div className="space-y-6">
      <SectionBlock
        eyebrow={course.pathTitle}
        title={course.title}
        description={course.description}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          <MetricCard
            label="课程状态"
            value={formatCourseStatus(course.status)}
            detail={course.focus}
            accent="moss"
          />
          <MetricCard
            label="课程进度"
            value={`${course.progressPercentage}%`}
            detail={`${course.completedSectionCount}/${course.sectionCount} sections completed`}
            accent="gold"
          />
          <MetricCard
            label="预计时长"
            value={`${course.estimatedDurationMinutes} min`}
            detail="先用可完成的小节推进，而不是堆叠大而空的内容。"
            accent="clay"
          />
          <MetricCard
            label="下一节"
            value={course.nextSectionTitle ?? "已全部完成"}
            detail="完成当前课后，工作台的学习动作也会一起刷新。"
            accent="moss"
          />
        </div>
      </SectionBlock>

      <SectionBlock
        eyebrow="Sections"
        title="逐节完成，逐节回写。"
        description="每个小节完成后，学习中心和工作台会一起更新。"
      >
        <div className="space-y-3">
          {course.sections.map((section) => (
            <div
              key={section.slug}
              className="paper-panel-strong p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="section-kicker">Section 0{section.position}</p>
                  <h2 className="mt-2 text-xl font-semibold">{section.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                    {section.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-[color:var(--ink-soft)]">
                    <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1">
                      {section.estimatedDurationMinutes} min
                    </span>
                    <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1">
                      {section.completed ? "已完成" : "待完成"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className={section.completed ? "action-button-secondary" : "action-button"}
                  onClick={() => progressMutation.mutate(section.slug)}
                  disabled={section.completed || progressMutation.isPending}
                >
                  {section.completed
                    ? "已记录完成"
                    : progressMutation.isPending
                      ? "提交中..."
                      : "标记为已完成"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {submitError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link href="/learning" className="action-button-secondary">
            返回学习中心
          </Link>
          <Link href="/dashboard" className="action-button">
            去看工作台更新
          </Link>
        </div>
      </SectionBlock>
    </div>
  );
}
