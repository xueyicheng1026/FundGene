"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useEffect, useState } from "react";
import { ArrowRight, BarChart3, LockKeyhole, Search, ShieldCheck, UserPlus } from "lucide-react";

import {
  ApiError,
  getSessionUser,
  loginAuthAccount,
  registerAuthAccount,
  type SessionUser,
} from "@/lib/api";
import { InlineNotice, StatusPill } from "./ui/primitives";

type AuthMode = "sign-in" | "sign-up";

function resolveNextPath(nextPath: string | null, session: SessionUser): string {
  if (!session.onboardingCompleted) {
    return "/onboarding";
  }

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/dashboard";
  }

  return nextPath;
}

export function AuthEntry() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sessionQuery = useQuery({
    queryKey: ["session-user"],
    queryFn: getSessionUser,
    retry: false,
  });

  useEffect(() => {
    if (!sessionQuery.data) {
      return;
    }
    const nextPath = searchParams.get("next");
    startTransition(() => {
      router.replace(resolveNextPath(nextPath, sessionQuery.data));
    });
  }, [router, searchParams, sessionQuery.data]);

  const authMutation = useMutation({
    mutationFn: async () => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        throw new Error("请输入邮箱地址。");
      }
      if (password.length < 8) {
        throw new Error("密码至少需要 8 位。");
      }

      if (mode === "sign-up") {
        if (password !== confirmPassword) {
          throw new Error("两次输入的密码不一致。");
        }
        await registerAuthAccount({ email: trimmedEmail, password });
      } else {
        await loginAuthAccount({ email: trimmedEmail, password });
      }
      const session = await getSessionUser();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["session-user"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["behavior-profile"] }),
        queryClient.invalidateQueries({ queryKey: ["coach-session"] }),
      ]);
      return session;
    },
    onSuccess: (session) => {
      const nextPath = searchParams.get("next");
      startTransition(() => {
        router.push(resolveNextPath(nextPath, session));
      });
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "请求失败，请稍后重试。");
    },
  });

  if (sessionQuery.isLoading) {
    return <InlineNotice>正在检查登录状态...</InlineNotice>;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    authMutation.mutate();
  }

  return (
    <div className="min-h-[calc(100vh-3rem)]">
      <header className="grid gap-5 lg:grid-cols-[190px_minmax(260px,620px)_minmax(180px,1fr)] lg:items-center">
        <Link
          href="/"
          className="text-[34px] font-black leading-none text-white"
          aria-label="回到 FundGene 总览"
        >
          <span className="text-[color:var(--accent-teal)]">F</span>undGene
        </Link>
        <div className="hidden h-[58px] items-center gap-5 rounded-full bg-[#27332f] px-6 text-sm font-medium text-[#c1cbc7] md:flex">
          <Search aria-hidden="true" className="size-5" />
          <span>搜索课程、组合报告、情境训练</span>
        </div>
        <div className="flex justify-start lg:justify-end">
          <div className="flex h-[50px] min-w-[204px] items-center justify-between gap-4 rounded-full border border-[#3a5149] bg-[#26352f] px-4 text-white">
            <span className="truncate text-sm font-bold">Hi, learner</span>
            <span className="grid size-[42px] flex-none place-items-center rounded-full bg-[#edf8f2] text-xs font-black text-[#12362e]">
              FG
            </span>
          </div>
        </div>
      </header>

      <main className="mt-16 grid gap-10 lg:grid-cols-[56px_minmax(0,1fr)]">
        <aside className="figma-module-rail hidden lg:block">
          <nav aria-label="入口页模块预览" className="flex flex-col gap-3">
            {[BarChart3, LockKeyhole, ShieldCheck, UserPlus].map((Icon, index) => (
              <span
                key={index}
                className={index === 0 ? "figma-nav-item figma-nav-item-active" : "figma-nav-item"}
              >
                <Icon aria-hidden="true" className="size-4" />
              </span>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-7">
            <h1 className="text-[clamp(2.5rem,4vw,4rem)] font-black leading-none text-white">
              建立安全画像
            </h1>
            <p className="mt-4 max-w-[700px] text-[17px] font-medium leading-7 text-[#aebbb6]">
              登录或注册后，进入个人化学习、AI 教练和组合解释。
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-[minmax(0,760px)_minmax(310px,420px)] xl:items-stretch">
            <section className="agent-hero min-h-[560px] overflow-hidden px-7 py-8 sm:px-11 sm:py-11">
              <p className="section-kicker">BEGINNER-FIRST FUND COACH</p>
              <h2 className="mt-6 max-w-[680px] text-[clamp(2.35rem,3.7vw,3.55rem)] font-black leading-[1.08] text-white">
                把基金投资
                <br />
                变成可训练的判断能力
              </h2>
              <p className="mt-6 max-w-[560px] text-lg font-medium leading-8 text-[#c8d5d0]">
                FundGene 解释风险、识别行为偏差、复盘历史情境，但不做交易执行和收益承诺。
              </p>
              <div className="mt-12 flex flex-wrap gap-4">
                <button
                  type="button"
                  className="action-button min-w-[150px]"
                  onClick={() => setMode("sign-up")}
                  disabled={authMutation.isPending}
                >
                  创建账号
                </button>
                <button
                  type="button"
                  className="action-button-secondary min-w-[172px]"
                  onClick={() => setMode("sign-in")}
                  disabled={authMutation.isPending}
                >
                  已有账号登录
                </button>
              </div>
              <div className="mt-12 hidden h-[180px] items-end gap-6 pl-[38%] md:flex">
                {[
                  ["学习", 90, true],
                  ["提问", 170, false],
                  ["画像", 120, true],
                  ["情境", 208, true],
                  ["资讯", 146, true],
                  ["复盘", 232, true],
                ].map(([label, height, muted]) => (
                  <div key={String(label)} className="grid justify-items-center gap-4">
                    <span
                      className={
                        muted
                          ? "w-[52px] rounded-[18px] bg-[#2f6c60] opacity-80"
                          : "w-[52px] rounded-[18px] bg-[color:var(--accent-teal)]"
                      }
                      style={{ height: Number(height) }}
                    />
                    <span className="text-xs font-bold text-[#c9d5d0]">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="surface-panel-strong min-h-[560px] px-6 py-8 sm:px-9 sm:py-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-3xl font-black tracking-normal text-white">
                  账号入口
                </h2>
                <StatusPill tone="accent">
                  {mode === "sign-in" ? "登录" : "注册"}
                </StatusPill>
              </div>

              <div className="mt-7 flex rounded-full border border-[color:var(--line-soft)] bg-[#26352f] p-1">
                <button
                  type="button"
                  className={mode === "sign-in" ? "action-button flex-1 px-4" : "action-button-secondary flex-1 px-4"}
                  onClick={() => setMode("sign-in")}
                  disabled={authMutation.isPending}
                >
                  登录
                </button>
                <button
                  type="button"
                  className={mode === "sign-up" ? "action-button flex-1 px-4" : "action-button-secondary flex-1 px-4"}
                  onClick={() => setMode("sign-up")}
                  disabled={authMutation.isPending}
                >
                  注册
                </button>
              </div>

              <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
          <label className="space-y-2 text-sm">
            <span className="font-semibold">邮箱</span>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-semibold">密码</span>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="至少 8 位"
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
            />
          </label>

          {mode === "sign-up" ? (
            <label className="space-y-2 text-sm">
              <span className="font-semibold">确认密码</span>
              <input
                type="password"
                className="field-input"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="再次输入密码"
                autoComplete="new-password"
              />
            </label>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="submit"
              className="action-button"
              disabled={authMutation.isPending}
            >
              {authMutation.isPending
                ? "处理中..."
                : mode === "sign-in"
                  ? "登录并进入工作台"
                  : "注册并进入工作台"}
              <ArrowRight aria-hidden="true" className="ml-2 size-4" />
            </button>
            <Link href="/" className="action-button-secondary">
              回到总览
            </Link>
          </div>

          {submitError ? <InlineNotice tone="danger">{submitError}</InlineNotice> : null}

          {sessionQuery.error instanceof ApiError &&
          sessionQuery.error.status !== 401 ? (
            <InlineNotice tone="danger">
              当前认证服务不可用：{sessionQuery.error.message}
            </InlineNotice>
          ) : null}
              </form>

              <div className="mt-7 grid gap-3 border-t border-[color:var(--line-soft)] pt-5 text-sm leading-6 text-[color:var(--ink-soft)]">
                <div className="flex items-start gap-3">
                  <UserPlus
                    aria-hidden="true"
                    className="mt-1 size-4 flex-none text-[color:var(--accent-moss)]"
                  />
                  <p>新账号会先进入建档流程，完成画像后进入工作台。</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
