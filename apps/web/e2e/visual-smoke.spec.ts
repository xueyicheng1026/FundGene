import { expect, test } from "@playwright/test";

import { mockFundGeneApi } from "./fixtures";

test.describe.configure({ mode: "serial" });

const visualRoutes = [
  { name: "overview", path: "/", marker: "核心模块矩阵" },
  {
    name: "start",
    path: "/start",
    marker: "账号入口",
    authenticated: false,
  },
  { name: "dashboard", path: "/dashboard", marker: "今日任务流" },
  { name: "onboarding", path: "/onboarding", marker: "建档进度" },
  { name: "coach", path: "/coach", marker: "对话优先" },
  { name: "learning", path: "/learning", marker: "三门基础课先撑住新手的决策语言" },
  {
    name: "course-detail",
    path: "/learning/risk-basics",
    marker: "逐节完成，逐节回写",
  },
  { name: "portfolio", path: "/portfolio", marker: "最近一份组合体检报告" },
  { name: "simulation", path: "/simulation", marker: "Scenario dossier" },
  { name: "news", path: "/news", marker: "选择一条资讯，生成结构化 readout" },
];

for (const route of visualRoutes) {
  test(`${route.name} visual smoke`, async ({ page }, testInfo) => {
    await mockFundGeneApi(page, {
      authenticated: route.authenticated !== false,
    });

    for (const viewport of [
      { label: "desktop", width: 1440, height: 980 },
      { label: "mobile", width: 390, height: 900 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await expect(page.getByText(route.marker).first()).toBeVisible({
        timeout: 15_000,
      });

      const hasHorizontalOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(hasHorizontalOverflow).toBe(false);

      await page.screenshot({
        fullPage: true,
        path: testInfo.outputPath(`${route.name}-${viewport.label}.png`),
      });
    }
  });
}
