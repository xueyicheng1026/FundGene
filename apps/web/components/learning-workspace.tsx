"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { ApiError, getLearningPath, getSessionUser } from "@/lib/api";
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

export function LearningWorkspace() {
  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  const learningPathQuery = useQuery({
    queryKey: ["learning-path"],
    queryFn: getLearningPath,
    enabled: Boolean(sessionQuery.data?.profileId),
    retry: false,
  });

  if (sessionQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在初始化学习中心上下文...
      </div>
    );
  }

  if (isApiError(sessionQuery.error) && sessionQuery.error.status === 401) {
    return (
      <SectionBlock
        eyebrow="学习中心"
        title="学习中心需要先登录。"
        description="登录后才能同步学习路径、课程进度和后续推荐。"
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
        当前学习中心不可用：{sessionQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const sessionUser = sessionQuery.data;
  if (!sessionUser.profileId) {
    return (
      <SectionBlock
        eyebrow="学习中心"
        title="先建立基础画像，再进入个人学习路径。"
        description="基础资料会决定学习路径如何排序。"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <MetricCard
            label="当前用户"
            value={sessionUser.displayName ?? "已登录用户"}
            detail={sessionUser.email ?? sessionUser.id}
            accent="moss"
          />
          <MetricCard
            label="基础画像"
            value="待建立"
            detail="先保存基础资料，再进入学习路径。"
            accent="gold"
          />
          <MetricCard
            label="学习模式"
            value="路径优先"
            detail="先走一条主路径，避免被内容噪音打散。"
            accent="clay"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/onboarding" className="action-button">
            去建立基础画像
          </Link>
          <Link href="/coach" className="action-button-secondary">
            先去教练提问
          </Link>
        </div>
      </SectionBlock>
    );
  }

  if (learningPathQuery.isLoading) {
    return (
      <div className="rounded-lg border border-[color:var(--line-soft)] bg-white/60 px-5 py-4 text-sm text-[color:var(--ink-soft)]">
        正在同步学习路径与课程进度...
      </div>
    );
  }

  if (learningPathQuery.error || !learningPathQuery.data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        学习路径加载失败：{learningPathQuery.error?.message ?? "未知错误"}
      </div>
    );
  }

  const learningPath = learningPathQuery.data;

  return (
    <div className="space-y-6">
      <section className="agent-hero overflow-hidden px-5 py-6 sm:px-6">
        <div className="max-w-4xl">
          <p className="section-kicker">学习中心</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            先把基金判断语言补齐，再回到组合和教练里练。
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/68">
            课程进度会回流到工作台，影响下一步动作和 Coach 的解释顺序。
          </p>
        </div>
        <div className="mt-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <MetricCard
            label="主路径"
            value={learningPath.title}
            detail={learningPath.description}
            accent="moss"
          />
          <MetricCard
            label="总进度"
            value={`${learningPath.overallProgressPercentage}%`}
            detail="按小节完成度聚合。"
            accent="gold"
          />
          <MetricCard
            label="已完成课程"
            value={`${learningPath.completedCoursesCount}/${learningPath.totalCourses}`}
            detail="完成一节就推进一次路径。"
            accent="clay"
          />
          <MetricCard
            label="推荐下一门"
            value={learningPath.recommendedCourseTitle ?? "全部完成"}
            detail="当前推荐会同步影响工作台的下一步动作。"
            accent="moss"
          />
        </div>
        </div>
      </section>

      <SectionBlock
        eyebrow="课程目录"
        title="三门基础课先撑住新手的决策语言。"
        description="先学懂你为什么会犹豫、为什么会追热点、为什么一只基金不能代表一个组合，再回到教练和组合工作区练习。"
      >
        <div className="grid gap-4 xl:grid-cols-3">
          {learningPath.courses.map((course) => (
            <Link
              key={course.slug}
              href={`/learning/${course.slug}`}
              className="paper-panel-strong group p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-kicker">{formatCourseStatus(course.status)}</p>
                  <h2 className="mt-2 text-xl font-semibold">{course.title}</h2>
                </div>
                <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
                  {course.estimatedDurationMinutes} min
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                {course.focus}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                {course.description}
              </p>
              <div className="mt-5 overflow-hidden rounded-full bg-white/65">
                <div
                  className="h-2 rounded-full bg-[color:var(--accent-moss)] transition-all duration-300"
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[color:var(--ink-soft)]">
                <span>
                  {course.completedSectionCount}/{course.sectionCount} sections
                </span>
                <span>{course.progressPercentage}%</span>
              </div>
              <div className="mt-4 rounded-lg border border-[color:var(--line-soft)] bg-white/55 px-4 py-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                {course.nextSectionTitle
                  ? `下一节：${course.nextSectionTitle}`
                  : "本课程已全部完成，可以回到工作台看下一步动作。"}
              </div>
            </Link>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
}
