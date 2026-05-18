"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Target,
} from "lucide-react";

import {
  ApiError,
  getLearningPath,
  getSessionUser,
  type LearningCourseSummary,
} from "@/lib/api";
import { formatProductCopy } from "@/lib/display-labels";
import { MetricCard } from "./metric-card";
import { SectionBlock } from "./section-block";
import { ProgressBar, StatusPill } from "./ui/primitives";

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

function getActiveTrainingCourse(
  courses: LearningCourseSummary[],
): LearningCourseSummary | null {
  return courses.find((course) => course.status !== "completed") ?? null;
}

function getTrainingObjective(course: LearningCourseSummary | null): string {
  if (!course) {
    return "把今天的学习沉淀成一次复盘问题。";
  }

  return `用「${formatProductCopy(course.title)}」补齐一个基金判断动作。`;
}

function getTrainingReason(course: LearningCourseSummary | null): string {
  if (!course) {
    return "基础训练已经完成，下一步不是继续堆课程，而是带着真实组合或新闻问题回到教练区校准。";
  }

  return `现在学这部分，是为了先理解 ${formatProductCopy(course.focus)}，再回到组合、模拟或教练对话里做判断。`;
}

function getTrainingApplication(course: LearningCourseSummary | null): string {
  if (!course) {
    return "打开工作台，选择一个真实场景，把今天学到的判断语言用在一次复盘里。";
  }

  if (course.nextSectionTitle) {
    return `完成「${formatProductCopy(course.nextSectionTitle)}」后，用一句话说明它会怎样改变你看基金信息的顺序。`;
  }

  return "完成课程后，回到工作台看新的安全下一步，或带一个反思问题问教练。";
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
  const activeTrainingCourse = getActiveTrainingCourse(learningPath.courses);
  const recommendedCourse = activeTrainingCourse ?? learningPath.courses[0] ?? null;

  return (
    <div className="space-y-6">
      <section className="agent-hero overflow-hidden px-5 py-6 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.42fr)] xl:items-stretch">
          <div className="max-w-4xl">
            <p className="section-kicker">今日训练任务</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[color:var(--ink-strong)] sm:text-4xl">
              {getTrainingObjective(activeTrainingCourse)}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--ink-soft)]">
              {getTrainingReason(activeTrainingCourse)}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {recommendedCourse ? (
                <Link
                  href={`/learning/${recommendedCourse.slug}`}
                  className="action-button"
                >
                  <BookOpenCheck aria-hidden="true" className="size-4" />
                  {activeTrainingCourse ? "开始今日训练" : "复盘训练材料"}
                </Link>
              ) : null}
              <Link href="/coach" className="action-button-secondary">
                带着问题问教练
              </Link>
            </div>
            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              <div className="workbench-panel-flat p-4">
                <div className="flex items-center gap-2">
                  <Target
                    aria-hidden="true"
                    className="size-4 text-[color:var(--accent-teal)]"
                  />
                  <p className="text-sm font-semibold text-[color:var(--ink-strong)]">
                    训练目标
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                  {getTrainingObjective(activeTrainingCourse)}
                </p>
              </div>
              <div className="workbench-panel-flat p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList
                    aria-hidden="true"
                    className="size-4 text-[color:var(--accent-teal)]"
                  />
                  <p className="text-sm font-semibold text-[color:var(--ink-strong)]">
                    训练材料
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                  {recommendedCourse
                    ? formatProductCopy(recommendedCourse.title)
                    : "已完成全部基础材料"}
                </p>
              </div>
              <div className="workbench-panel-flat p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4 text-[color:var(--accent-teal)]"
                  />
                  <p className="text-sm font-semibold text-[color:var(--ink-strong)]">
                    应用动作
                  </p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                  {getTrainingApplication(activeTrainingCourse)}
                </p>
              </div>
            </div>
          </div>

          <div className="workbench-panel-flat flex flex-col justify-between px-4 py-4">
            <div>
              <p className="section-kicker">任务进度</p>
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--ink-strong)]">
                {recommendedCourse?.title ??
                  (learningPath.recommendedCourseTitle
                    ? formatProductCopy(learningPath.recommendedCourseTitle)
                    : "全部完成")}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                {recommendedCourse?.nextSectionTitle
                  ? `下一节：${formatProductCopy(recommendedCourse.nextSectionTitle)}`
                  : "完成后回工作台看下一步训练动作。"}
              </p>
            </div>
            <ProgressBar
              className="mt-5"
              value={learningPath.overallProgressPercentage}
              label="基础训练总进度"
            />
            <a
              href="#learning-course-list"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--accent-teal)]"
            >
              查看全部训练材料
              <ArrowRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <SectionBlock
        eyebrow="训练材料"
        title="课程只是今天任务的材料，不是终点。"
        description="每门课都要落到一个可执行的判断动作：看懂风险语言、识别行为冲动、或把组合问题讲清楚。"
        className="scroll-mt-6"
      >
        <div id="learning-course-list" className="grid gap-4 xl:grid-cols-3">
          {learningPath.courses.map((course) => (
            <Link
              key={course.slug}
              href={`/learning/${course.slug}`}
              className="paper-panel-strong group p-4 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="section-kicker">训练材料</span>
                    <StatusPill
                      tone={course.status === "completed" ? "positive" : "accent"}
                    >
                      {formatCourseStatus(course.status)}
                    </StatusPill>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold">{course.title}</h2>
                </div>
                <span className="rounded-full border border-[color:var(--line-soft)] bg-white/75 px-3 py-1 text-xs text-[color:var(--ink-soft)]">
                  {course.estimatedDurationMinutes} 分钟
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                {course.focus}
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
                {course.description}
              </p>
              <div
                className="mt-5 overflow-hidden rounded-full bg-white/65"
                role="progressbar"
                aria-label={`${course.title} 课程进度`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={course.progressPercentage}
              >
                <div
                  className="h-2 rounded-full bg-[linear-gradient(90deg,var(--accent-teal),var(--accent-cyan))] transition-all duration-300"
                  style={{ width: `${course.progressPercentage}%` }}
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[color:var(--ink-soft)]">
                <span>
                  {course.completedSectionCount}/{course.sectionCount} 小节
                </span>
                <span>{course.progressPercentage}%</span>
              </div>
              <div className="mt-4 rounded-lg border border-[color:var(--line-soft)] bg-white/55 px-4 py-3 text-sm leading-6 text-[color:var(--ink-soft)]">
                <span className="block font-semibold text-[color:var(--ink-strong)]">
                  {course.nextSectionTitle ? "当前任务材料" : "材料状态"}
                </span>
                <span className="mt-1 block">
                  {course.nextSectionTitle
                    ? formatProductCopy(course.nextSectionTitle)
                    : "本课程已全部完成，可以回到工作台看下一步动作。"}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[color:var(--accent-teal)]">
                进入训练材料
                <span aria-hidden="true">→</span>
              </div>
            </Link>
          ))}
        </div>
      </SectionBlock>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="主路径"
          value={formatProductCopy(learningPath.title)}
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
          value={
            learningPath.recommendedCourseTitle
              ? formatProductCopy(learningPath.recommendedCourseTitle)
              : "全部完成"
          }
          detail="当前推荐会同步影响工作台的下一步动作。"
          accent="moss"
        />
      </div>
    </div>
  );
}
