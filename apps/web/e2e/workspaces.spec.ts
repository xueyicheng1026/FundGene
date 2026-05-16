import { expect, test } from "@playwright/test";

import { mockFundGeneApi } from "./fixtures";

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await mockFundGeneApi(page);
});

test("renders the primary workspace routes with mocked API state", async ({
  page,
}) => {
  const routes = [
    { path: "/dashboard", text: "今日任务流" },
    { path: "/portfolio", text: "最近一份组合体检报告" },
    { path: "/coach", text: "对话优先" },
    { path: "/onboarding", text: "建档进度" },
    { path: "/learning", text: "学习中心" },
    { path: "/simulation", text: "历史情境训练" },
    { path: "/news", text: "资讯解读" },
  ];

  for (const route of routes) {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    await expect(page.getByText(route.text).first()).toBeVisible({
      timeout: 15_000,
    });
  }
});

test("coach keeps internal trace details out of the user-facing answer", async ({
  page,
}) => {
  await page.goto("/coach", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("边界提醒").first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByText("继续追问").first()).toBeVisible();
  await expect(page.getByText("证据链路")).toHaveCount(0);
  await expect(page.getByText("Run ID: run_e2e")).toHaveCount(0);
  await expect(page.getByText("learning_knowledge_lookup")).toHaveCount(0);
});

test("dashboard command center shows simulation and news status", async ({
  page,
}) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("今日任务流")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("回撤纪律训练").first()).toBeVisible();
  await expect(page.getByText("最近复盘显示你能先检查计划").first()).toBeVisible();
  await expect(page.getByText("长期资金入市政策继续推进").first()).toBeVisible();
  await expect(page.getByText("这条政策更像长期市场结构信号").first()).toBeVisible();
});

test("news workspace can request a structured analysis", async ({ page }) => {
  await page.goto("/news", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "生成解读" }).first().click();

  await expect(page.getByText("资讯解读画布")).toBeVisible();
  await expect(page.getByText("政策信息强调长期资金入市")).toBeVisible();
  await expect(page.getByText("资讯解读不构成买卖建议")).toBeVisible();
});
