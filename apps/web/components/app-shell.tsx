"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MotionConfig, motion } from "motion/react";
import {
  Bot,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PanelLeftClose,
  PanelLeftOpen,
  PlayCircle,
  Settings2,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";

import { ApiError, getSessionUser, logoutAuthSession } from "@/lib/api";
import { navigationItems } from "@/lib/navigation";
import { cn, InlineNotice, Panel, StatusPill } from "./ui/primitives";

const navIcons: Record<string, LucideIcon> = {
  "/": Home,
  "/today": LayoutDashboard,
  "/agent": Bot,
  "/automations": Settings2,
  "/profile": UserRoundCog,
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
  if (pathname === "/onboarding") {
    return "建档";
  }
  if (pathname === "/start") {
    return "开始";
  }
  return getWorkspaceItem(pathname)?.title ?? "工作区";
}

function getWorkspaceDescription(pathname: string) {
  if (pathname === "/onboarding") {
    return "一次只回答一个问题，完成后进入今日简报。";
  }
  if (pathname === "/start") {
    return "创建账号并开始建档。";
  }
  return getWorkspaceItem(pathname)?.description ?? "继续完成本次投资判断训练。";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const isPublicOverview = pathname === "/";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("fundgene-sidebar-collapsed") === "true";
  });
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

  useEffect(() => {
    window.localStorage.setItem(
      "fundgene-sidebar-collapsed",
      sidebarCollapsed ? "true" : "false",
    );
  }, [sidebarCollapsed]);

  if (!isPublicOverview && sessionQuery.isLoading) {
    return (
      <div className="figma-app-shell grid min-h-screen place-items-center px-4">
        <Panel className="w-full max-w-[520px] rounded-[30px] px-8 py-8">
          <StatusPill tone="accent">会话</StatusPill>
          <h1 className="mt-4 text-3xl font-semibold">正在验证登录会话</h1>
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
          <h1 className="mt-4 text-3xl font-semibold">工作区需要先登录</h1>
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
  const workspaceDescription = getWorkspaceDescription(pathname);
  const compactPageChrome = pathname === "/agent";
  const hideMobileSidebar = pathname === "/onboarding";

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn(
          "figma-app-shell app-shell-frame",
          sidebarCollapsed && "app-shell-frame-collapsed",
        )}
      >
          <motion.aside
            data-testid="workspace-sidebar"
            className={cn(
              "figma-module-rail app-shell-sidebar",
              sidebarCollapsed && "figma-module-rail-collapsed",
              hideMobileSidebar && "app-shell-sidebar-hidden-mobile",
            )}
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="app-sidebar-brand">
              <Link
                href="/"
                className="app-sidebar-home flex min-w-0 items-center gap-1 text-[24px] font-semibold leading-none text-[color:var(--ink-strong)]"
                aria-label="回到 FundGene 总览"
              >
                <span className="text-[color:var(--accent-teal)]">F</span>
                <span className={cn("truncate", sidebarCollapsed && "lg:sr-only")}>
                  undGene
                </span>
              </Link>
              <button
                type="button"
                className="icon-button"
                aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
                aria-pressed={sidebarCollapsed}
                title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
                onClick={() => setSidebarCollapsed((value) => !value)}
              >
                {sidebarCollapsed ? (
                  <PanelLeftOpen aria-hidden="true" className="size-4" />
                ) : (
                  <PanelLeftClose aria-hidden="true" className="size-4" />
                )}
              </button>
            </div>

            <nav
              aria-label="FundGene 工作区导航"
              className="flex flex-row gap-3 overflow-x-auto lg:flex-col lg:gap-1.5 lg:overflow-visible"
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
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "figma-nav-item",
                      active && "figma-nav-item-active",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-4" strokeWidth={2.25} />
                    <span
                      className={cn(
                        "figma-nav-label",
                        sidebarCollapsed && "lg:sr-only",
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                );
              })}
              {sessionUser ? (
                <button
                  type="button"
                  className="figma-nav-item app-logout-item lg:mt-3"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  title="退出登录"
                >
                  <LogOut aria-hidden="true" className="size-4" />
                  <span
                    className={cn(
                      "figma-nav-label",
                      sidebarCollapsed && "lg:sr-only",
                    )}
                  >
                    {logoutMutation.isPending ? "退出中" : "退出"}
                  </span>
                </button>
              ) : null}
            </nav>
          </motion.aside>

          <div className="app-main-column">
            <motion.header
              className="app-titlebar"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[color:var(--ink-strong)]">
                    {workspaceTitle}
                  </p>
                  <p className="hidden truncate text-xs font-medium text-[color:var(--ink-muted)] md:block">
                    {workspaceDescription}
                  </p>
                </div>
              </div>

              <div className="flex min-w-0 items-center justify-end gap-3">
                <div className="hidden h-9 max-w-[460px] items-center gap-2 rounded-full border border-[color:var(--line-soft)] bg-white/70 px-3 text-xs font-medium text-[color:var(--ink-soft)] shadow-sm backdrop-blur-2xl xl:flex">
                  <Compass aria-hidden="true" className="size-4 text-[color:var(--ink-muted)]" />
                  <span className="truncate">把问题交给 Agent，查看它如何整理依据</span>
                </div>
                {sessionUser ? (
                  <div className="flex h-9 min-w-0 items-center gap-2 rounded-full border border-[color:var(--line-soft)] bg-white/76 px-2.5 text-[color:var(--ink-strong)] shadow-sm backdrop-blur-2xl">
                    <span className="hidden max-w-[9rem] truncate text-xs font-bold sm:block">
                      {sessionUser.displayName ?? "学习者"}
                    </span>
                    <span className="grid size-7 flex-none place-items-center rounded-full bg-[color:var(--accent-teal)] text-[0.65rem] font-semibold text-white shadow-[0_8px_16px_rgba(0,113,227,0.18)]">
                      FG
                    </span>
                  </div>
                ) : (
                  <Link href="/start" className="action-button compact-action-button">
                    登录 / 注册
                  </Link>
                )}
              </div>
            </motion.header>

          <motion.main
            data-testid="workspace-main"
            className="min-w-0"
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.34, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {!compactPageChrome ? (
              <div className="mb-5">
                <p className="section-kicker">{workspaceItem?.eyebrow ?? "工作区"}</p>
                <h1 className="mt-1.5 text-[clamp(1.9rem,2.7vw,2.8rem)] font-semibold leading-tight text-[color:var(--ink-strong)]">
                  {workspaceTitle}
                </h1>
                <p className="mt-2 max-w-[700px] text-sm font-medium leading-6 text-[color:var(--ink-soft)] sm:text-[15px]">
                  {workspaceDescription}
                </p>
              </div>
            ) : null}
            <div className="figma-content-stage">{children}</div>
          </motion.main>
        </div>
        </div>
    </MotionConfig>
  );
}
