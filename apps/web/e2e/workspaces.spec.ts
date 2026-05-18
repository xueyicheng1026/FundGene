import { expect, test } from "@playwright/test";

import { mockFundGeneApi } from "./fixtures";

test.describe.configure({ mode: "serial" });
test.setTimeout(60_000);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.removeItem("fundgene-sidebar-collapsed");
  });
  await mockFundGeneApi(page);
});

test("renders the primary workspace routes with mocked API state", async ({
  page,
}) => {
  const routes = [
    { path: "/today", text: "今日简报" },
    { path: "/agent", text: "教练工作区" },
    { path: "/automations", text: "自动任务" },
    { path: "/profile", text: "上下文中心" },
    { path: "/portfolio", text: "组合画像结论" },
    { path: "/onboarding", text: "开始建档" },
    { path: "/learning", text: "今日训练任务" },
    { path: "/simulation", text: "训练任务单" },
    { path: "/news", text: "影响路径图" },
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
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("边界提醒").first()).toBeVisible({
    timeout: 20_000,
  });
  await expect(page.getByRole("link", { name: /进入学习中心/ })).toHaveAttribute(
    "href",
    "/learning",
  );
  await expect(page.getByText("下一句可以问").first()).toBeVisible();
  await expect(page.getByText("我想用一个数字例子理解回撤。")).toBeVisible();
  await expect(page.getByText("证据链路")).toHaveCount(0);
  await expect(page.getByText("Run ID: run_e2e")).toHaveCount(0);
  await expect(page.getByText("learning_knowledge_lookup")).toHaveCount(0);
  await expect(page.getByText("portfolio_snapshots")).toHaveCount(0);
  await expect(page.getByText("Session rail")).toHaveCount(0);
  await expect(page.getByText("Run status")).toHaveCount(0);
});

test("agent mobile keeps the active task surface before supporting panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  const activeSessionBox = await page
    .getByTestId("agent-active-session")
    .boundingBox();

  expect(activeSessionBox).not.toBeNull();
  await expect(page.getByTestId("agent-session-rail")).toHaveCount(0);
  await expect(page.getByTestId("agent-run-status")).toHaveCount(0);
});

test("workspace sidebar collapses and lets the main surface expand", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  const sidebarBefore = await page.getByTestId("workspace-sidebar").boundingBox();
  const mainBefore = await page.getByTestId("workspace-main").boundingBox();

  await page.getByRole("button", { name: "收起侧边栏" }).click();
  await expect(page.getByRole("button", { name: "展开侧边栏" })).toBeVisible();
  await page.waitForTimeout(250);

  const sidebarAfter = await page.getByTestId("workspace-sidebar").boundingBox();
  const mainAfter = await page.getByTestId("workspace-main").boundingBox();

  expect(sidebarBefore).not.toBeNull();
  expect(mainBefore).not.toBeNull();
  expect(sidebarAfter).not.toBeNull();
  expect(mainAfter).not.toBeNull();
  expect(sidebarAfter!.width).toBeLessThan(sidebarBefore!.width);
  expect(mainAfter!.width).toBeGreaterThan(mainBefore!.width);

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("agent-collapsed-sidebar-desktop.png"),
  });
});

test("agent support panels collapse without squeezing the active session", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  const activeBefore = await page.getByTestId("agent-active-session").boundingBox();

  await page.getByRole("button", { name: "展开任务参考" }).click();
  await page.getByRole("button", { name: "展开整理一览" }).click();
  await expect(page.getByTestId("agent-session-rail")).toBeVisible();
  await expect(page.getByTestId("agent-run-status")).toBeVisible();
  await page.getByRole("button", { name: "收起任务参考" }).click();
  await page.getByRole("button", { name: "收起整理一览" }).click();
  await expect(page.getByRole("button", { name: "展开任务参考" })).toHaveText(
    "显示参考",
  );
  await expect(page.getByRole("button", { name: "展开整理一览" })).toHaveText(
    "显示依据",
  );
  await page.waitForTimeout(250);

  const activeAfter = await page.getByTestId("agent-active-session").boundingBox();

  expect(activeBefore).not.toBeNull();
  expect(activeAfter).not.toBeNull();
  await expect(page.getByTestId("agent-session-rail")).toHaveCount(0);
  await expect(page.getByTestId("agent-run-status")).toHaveCount(0);
  expect(activeBefore!.width).toBeGreaterThan(900);
  expect(activeAfter!.width).toBeGreaterThanOrEqual(activeBefore!.width);

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("agent-collapsed-support-panels-desktop.png"),
  });

  await page.setViewportSize({ width: 1600, height: 980 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  const wideActiveBefore = await page
    .getByTestId("agent-active-session")
    .boundingBox();
  await page.getByRole("button", { name: "展开任务参考" }).click();
  await page.getByRole("button", { name: "展开整理一览" }).click();
  await page.waitForTimeout(250);
  const wideActiveAfter = await page
    .getByTestId("agent-active-session")
    .boundingBox();

  expect(wideActiveBefore).not.toBeNull();
  expect(wideActiveAfter).not.toBeNull();
  expect(wideActiveAfter!.width).toBeLessThan(wideActiveBefore!.width);
});

test("agent page keeps wheel scrolling on the page at MacBook width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1365, height: 768 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  const messageLog = page.getByRole("log");
  await expect(messageLog).toBeVisible({ timeout: 15_000 });
  await expect(messageLog).toHaveCSS("overflow-y", "visible");

  const logBox = await messageLog.boundingBox();
  expect(logBox).not.toBeNull();

  await page.mouse.move(logBox!.x + logBox!.width / 2, logBox!.y + 80);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(150);

  const pageScrollY = await page.evaluate(() => window.scrollY);
  const logScrollTop = await messageLog.evaluate((element) => element.scrollTop);

  expect(pageScrollY).toBeGreaterThan(100);
  expect(logScrollTop).toBe(0);

  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("log")).toHaveCSS("overflow-y", "auto");
});

test("dashboard daily brief shows evidence, safe action, and module status", async ({
  page,
}) => {
  await page.goto("/today", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("今日简报", { exact: true }).first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(
    page.getByRole("heading", {
      name: "今天先检查组合集中度，不急着响应单条新闻。",
    }),
  ).toBeVisible();
  await expect(page.getByText("为什么")).toBeVisible();
  await expect(page.getByText("今天不要做什么")).toBeVisible();
  await expect(page.getByText("今日信号面板")).toBeVisible();
  await expect(page.getByText("第一大持仓约 34%").first()).toBeVisible();
  await expect(page.getByText("新闻标题：")).toBeVisible();
  await expect(page.getByText("长期资金入市政策继续推进").first()).toBeVisible();
  await expect(page.getByText("新闻概括：")).toBeVisible();
  await expect(
    page.getByText("政策强调长期资金和资本市场稳定，但具体节奏仍需观察。"),
  ).toBeVisible();
  await expect(page.getByText("简要解读：")).toBeVisible();
  await expect(page.getByText("把这条政策先翻译成一句新手能执行的话")).toHaveCount(0);
  await expect(page.getByText("不要把今日简报理解成直接操作账户的指令。").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /执行安全下一步/ })).toHaveAttribute(
    "href",
    "/portfolio?from=today&focus=concentration",
  );
  await expect(page.getByText("回撤纪律训练").first()).toBeVisible();
  await expect(page.getByText("最近复盘显示你能先检查计划").first()).toBeVisible();
  await expect(page.getByText("长期资金入市政策继续推进").first()).toBeVisible();
  await expect(page.getByText("这条政策更像长期市场结构信号").first()).toBeVisible();
  await expect(page.getByText("run_e2e")).toHaveCount(0);
});

test("automations page exposes controllable safe automation settings", async ({
  page,
}) => {
  await page.goto("/automations", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("自动任务").first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("已开启").first()).toBeVisible();
  await expect(page.getByText("运行队列")).toBeVisible();
  await expect(page.getByText("不会连接券商")).toBeVisible();

  const weeklySwitch = page.getByRole("switch").nth(1);
  await expect(weeklySwitch).toHaveAttribute("aria-checked", "false");
  await weeklySwitch.click();
  await expect(weeklySwitch).toHaveAttribute("aria-checked", "true");
  await expect(page.getByText("每周组合巡检").first()).toBeVisible();

  await page.getByTestId("automation-run-button-daily_brief").click();
  await expect(page.getByTestId("automation-run-timeline-daily_brief")).toBeVisible();
  await expect(page.getByText("检查过程").first()).toBeVisible();
  await expect(page.getByText("读取授权上下文").first()).toBeVisible();
});

test("profile page keeps context and writebacks confirmable", async ({
  page,
}) => {
  await page.goto("/profile", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("上下文中心").first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("可用个人资料")).toBeVisible();
  await expect(page.getByText("待确认资料").first()).toBeVisible();
  await expect(page.getByText("把“追热点倾向”加入待观察行为证据")).toBeVisible();

  await page.getByRole("button", { name: "确认记录" }).first().click();
  await expect(
    page.getByText("把“追热点倾向”加入待观察行为证据"),
  ).toHaveCount(0);
  await expect(page.getByText("已处理 1 条")).toBeVisible();
});

test("portfolio catches duplicate fund codes before saving", async ({ page }) => {
  await page.goto("/portfolio", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "用示例覆盖当前输入" }).click();
  await page.getByRole("button", { name: "添加一行持仓" }).click();
  await page.locator('input[name="holdings.3.fundCode"]').fill("161725");
  await page.locator('input[name="holdings.3.fundName"]').fill("重复白酒基金");
  await page.locator('input[name="holdings.3.marketValue"]').fill("5000");
  await page.getByRole("button", { name: "检查草稿权重" }).click();

  await expect(page.getByText("基金代码 161725 已重复").first()).toBeVisible();
  await expect(page.getByText("请先合并或删除重复基金代码").first()).toBeVisible();
});

test("portfolio reviews a draft before saving a snapshot", async ({ page }) => {
  await page.goto("/portfolio", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "用示例覆盖当前输入" }).click();
  await expect(page.getByText("草稿总资产").first()).toBeVisible();
  await expect(page.getByText("¥52,000").first()).toBeVisible();

  await page.getByRole("button", { name: "检查草稿权重" }).click();
  await expect(page.getByText("草稿已检查").first()).toBeVisible();

  await page.getByRole("button", { name: "确认并保存快照" }).click();
  await expect(page.getByText("已生成 2026/4/26 的组合报告").first()).toBeVisible();
});

test("news workspace can request a structured analysis", async ({ page }) => {
  await page.goto("/news", { waitUntil: "domcontentloaded" });

  await page
    .locator("article")
    .first()
    .getByRole("button", { name: "生成解读" })
    .click();

  await expect(page.getByText("影响路径图").first()).toBeVisible();
  await expect(page.getByTestId("news-selected-source")).toBeVisible();
  await expect(page.getByTestId("news-analysis-process")).toBeVisible();
  await expect(page.getByText("已生成解读").first()).toBeVisible();
  await expect(page.getByText("政策信息强调长期资金入市").first()).toBeVisible();
  await expect(page.getByText("资讯解读不构成买卖建议").first()).toBeVisible();
});
