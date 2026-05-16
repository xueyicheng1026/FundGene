"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MotionConfig, motion } from "motion/react";
import {
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PlayCircle,
  Search,
  type LucideIcon,
} from "lucide-react";

import { ApiError, getSessionUser, logoutAuthSession } from "@/lib/api";
import { navigationItems } from "@/lib/navigation";
import { cn, InlineNotice, Panel, StatusPill } from "./ui/primitives";

const navIcons: Record<string, LucideIcon> = {
  "/": Home,
  "/dashboard": LayoutDashboard,
  "/onboarding": ClipboardCheck,
  "/coach": Bot,
  "/learning": GraduationCap,
  "/portfolio": BriefcaseBusiness,
  "/simulation": PlayCircle,
  "/news": Newspaper,
};

function getWorkspaceItem(pathname: string) {
  return navigationItems.find((item) => {
    return item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
  });
}

function getWorkspaceTitle(pathname: string) {
  return getWorkspaceItem(pathname)?.title ?? "工作区";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isPublicOverview = pathname === "/";
  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    networkMode: "always",
    retry: false,
  });
  const logoutMutation = useMutation({
    mutationFn: logoutAuthSession,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["session-user"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["behavior-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["coach-session"] }),
        queryClient.invalidateQueries({ queryKey: ["simulation-scenarios"] }),
        queryClient.invalidateQueries({ queryKey: ["simulation-review"] }),
      ]);
      router.push("/start");
    },
  });

  if (!isPublicOverview && sessionQuery.isLoading) {
    return (
      <div className="figma-app-shell grid min-h-screen place-items-center px-4">
        <Panel className="w-full max-w-[520px] rounded-[30px] px-8 py-8">
          <StatusPill tone="accent">会话</StatusPill>
          <h1 className="mt-4 text-3xl font-black">正在验证登录会话</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            正在读取当前账号状态。
          </p>
        </Panel>
      </div>
    );
  }

  if (
    !isPublicOverview &&
    sessionQuery.error instanceof ApiError &&
    sessionQuery.error.status === 401
  ) {
    return (
      <div className="figma-app-shell grid min-h-screen place-items-center px-4">
        <Panel className="w-full max-w-[560px] rounded-[30px] px-8 py-8">
          <StatusPill tone="warning">需要登录</StatusPill>
          <h1 className="mt-4 text-3xl font-black">工作区需要先登录</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            登录后才能读取画像、问卷、学习进度和训练记录。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/start?next=${encodeURIComponent(pathname)}`}
              className="action-button"
            >
              去登录 / 注册
            </Link>
            <Link href="/" className="action-button-secondary">
              回到总览
            </Link>
          </div>
        </Panel>
      </div>
    );
  }

  if (!isPublicOverview && (sessionQuery.error || !sessionQuery.data)) {
    return (
      <div className="figma-app-shell grid min-h-screen place-items-center px-4">
        <InlineNotice tone="danger" className="w-full max-w-[640px]">
          无法初始化当前登录会话：{sessionQuery.error?.message ?? "未知错误"}
        </InlineNotice>
      </div>
    );
  }

  const sessionUser = sessionQuery.data ?? null;
  const workspaceTitle = getWorkspaceTitle(pathname);
  const workspaceItem = getWorkspaceItem(pathname);

  return (
    <MotionConfig reducedMotion="user">
      <div className="figma-app-shell relative mx-auto min-h-screen w-full max-w-[1728px] overflow-hidden px-6 pb-10 pt-9 sm:px-10 lg:px-[74px]">
        <div aria-hidden="true" className="figma-glow figma-glow-top" />
        <div aria-hidden="true" className="figma-glow figma-glow-low" />

        <motion.header
          className="relative z-20 grid gap-5 lg:grid-cols-[190px_minmax(260px,620px)_minmax(180px,1fr)] lg:items-center"
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/"
            className="text-[34px] font-black leading-none text-white"
            aria-label="回到 FundGene 总览"
          >
            <span className="text-[color:var(--accent-teal)]">F</span>undGene
          </Link>

          <div className="hidden h-[58px] items-center gap-5 rounded-full bg-[#27332f] px-6 text-sm font-medium text-[#c1cbc7] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] md:flex">
            <Search aria-hidden="true" className="size-5 text-[#c1cbc7]" />
            <span>搜索课程、组合报告、情境训练</span>
          </div>

          <div className="flex justify-start lg:justify-end">
            {sessionUser ? (
              <div className="flex h-[50px] min-w-[204px] items-center justify-between gap-4 rounded-full border border-[#3a5149] bg-[#26352f] px-4 text-white">
                <span className="truncate text-sm font-bold">
                  Hi, {sessionUser.displayName ?? "learner"}
                </span>
                <span className="grid size-[42px] flex-none place-items-center rounded-full bg-[#edf8f2] text-xs font-black text-[#12362e]">
                  FG
                </span>
              </div>
            ) : (
              <Link href="/start" className="action-button">
                登录 / 注册
              </Link>
            )}
          </div>
        </motion.header>

        <div className="relative z-10 mt-16 grid gap-10 lg:grid-cols-[56px_minmax(0,1fr)]">
          <motion.aside
            className="figma-module-rail lg:sticky lg:top-[150px]"
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav
              aria-label="FundGene 工作区导航"
              className="flex flex-row gap-3 overflow-x-auto lg:flex-col lg:gap-3 lg:overflow-visible"
            >
              {navigationItems.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = navIcons[item.href] ?? Compass;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={item.title}
                    className={cn(
                      "figma-nav-item",
                      active && "figma-nav-item-active",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" strokeWidth={2.25} />
                    <span className="sr-only">{item.title}</span>
                  </Link>
                );
              })}
              {sessionUser ? (
                <button
                  type="button"
                  className="figma-nav-item lg:mt-[15rem]"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  title="退出登录"
                >
                  {sessionUser.onboardingCompleted ? (
                    <CheckCircle2 aria-hidden="true" className="size-4" />
                  ) : (
                    <LogOut aria-hidden="true" className="size-4" />
                  )}
                  <span className="sr-only">退出登录</span>
                </button>
              ) : null}
            </nav>
          </motion.aside>

          <motion.main
            className="min-w-0"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-8">
              <p className="section-kicker">{workspaceItem?.eyebrow ?? "工作区"}</p>
              <h1 className="mt-2 text-[clamp(2.5rem,4vw,4rem)] font-black leading-none text-white">
                {workspaceTitle}
              </h1>
              <p className="mt-4 max-w-[700px] text-[17px] font-medium leading-7 text-[#aebbb6]">
                {workspaceItem?.description ?? "继续完成本次投资判断训练。"}
              </p>
            </div>
            <div className="figma-content-stage">{children}</div>
          </motion.main>
        </div>
      </div>
    </MotionConfig>
  );
}
