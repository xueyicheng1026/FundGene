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
    { path: "/profile", text: "待确认资料" },
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

test("simulation exposes training guidance and keeps the submit action visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1365, height: 768 });
  await page.goto("/simulation", { waitUntil: "domcontentloaded" });

  const guideButton = page.getByRole("button", { name: "训练说明" });
  await expect(guideButton).toBeVisible({ timeout: 15_000 });
  await guideButton.click();
  await expect(page.getByRole("region", { name: "训练说明" })).toBeVisible();
  await expect(guideButton).toHaveAttribute("aria-expanded", "true");

  const submitButton = page.getByRole("button", { name: "提交决策并继续" });
  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeInViewport();
  await expect(submitButton).toBeDisabled();
  await expect(page.getByRole("radio", { checked: true })).toHaveCount(0);

  const taskScroll = page.getByTestId("simulation-task-scroll");
  await expect(taskScroll).toHaveCSS("overflow-y", "auto");
  const scrollMetrics = await taskScroll.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }));
  expect(scrollMetrics.clientHeight).toBeGreaterThan(120);
  expect(scrollMetrics.scrollHeight).toBeGreaterThanOrEqual(
    scrollMetrics.clientHeight,
  );
});

test("simulation opens the final review after a completed training action", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1365, height: 768 });
  await page.goto("/simulation", { waitUntil: "domcontentloaded" });

  await page
    .getByPlaceholder("请结合当前信息，说明你的判断依据和考虑。")
    .fill("我先保留仓位，等风险信息更清楚再决定。");
  await page.getByRole("radio").first().check();
  await page.getByRole("button", { name: "提交决策并继续" }).click();
  await expect(page.getByText("这次训练先记住一件事")).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("你在波动阶段选择先观察")).toBeVisible();
  await expect(page.getByText("暴露的触发点")).toBeVisible();
  await expect(page.getByText("performance_chasing_risk")).toHaveCount(0);

  await page.getByRole("link", { name: "去教练继续追问" }).click();
  await expect(page).toHaveURL(/\/agent\?/);
  await expect(page.locator("textarea")).toHaveValue(
    "请帮我复盘这次模拟训练里最容易失守的节点，并告诉我下次行动前要先检查什么。",
  );
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
  await expect(page.getByText("下一步").first()).toBeVisible();
  await expect(page.getByText("下一句可以问").first()).not.toBeVisible();
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

test("agent new session opens a blank task surface", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  await expect(page.getByText("今天想先问清楚什么？")).toHaveCount(0);
  await page.getByRole("button", { name: "新会话" }).click();
  await expect(page.getByText("今天想先问清楚什么？")).toBeVisible();
  await expect(page.getByRole("log").locator(".coach-message")).toHaveCount(0);
  await expect(page.locator("textarea")).toBeFocused();
});

test("agent history reloads a saved conversation and continues it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "展开任务参考" }).click();
  await page.getByRole("button", { name: /热门基金要不要追/ }).click();

  const messageLog = page.getByRole("log");
  await expect(
    messageLog.getByText("我总想追最近涨得多的基金，怎么办？", { exact: true }),
  ).toBeVisible();
  await expect(
    messageLog.getByText("那我看到热门基金连续上涨时应该怎么处理？", { exact: true }),
  ).toBeVisible();
  await expect(
    messageLog.getByText("先把它拆成三部分：事实是它为什么上涨").first(),
  ).toBeVisible();
  await expect(messageLog.locator(".coach-message")).toHaveCount(4);

  await page.locator("textarea").fill("继续这段历史对话。");
  await page.getByRole("button", { name: "发送" }).click();

  await expect(messageLog.getByText("继续这段历史对话。", { exact: true })).toBeVisible();
  await expect(
    messageLog.getByText("可以，我们接着用同一套三步检查来看这次冲动。").first(),
  ).toBeVisible();
  await expect(messageLog.locator(".coach-message")).toHaveCount(6);
});

test("agent compact desktop keeps reference and process panels mutually exclusive", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("agent-session-rail")).toHaveCount(0);
  await expect(page.getByTestId("agent-run-status")).toBeVisible();

  await page.getByRole("button", { name: "展开任务参考" }).click();
  await expect(page.getByTestId("agent-session-rail")).toBeVisible();
  await expect(page.getByTestId("agent-run-status")).toHaveCount(0);
  await page.waitForTimeout(250);

  const referenceBox = await page.getByTestId("agent-session-rail").boundingBox();
  const activeBox = await page.getByTestId("agent-active-session").boundingBox();
  const pageScrollHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const pageClientHeight = await page.evaluate(
    () => document.documentElement.clientHeight,
  );

  expect(referenceBox).not.toBeNull();
  expect(activeBox).not.toBeNull();
  expect(referenceBox!.width).toBeGreaterThan(230);
  expect(activeBox!.width).toBeGreaterThan(680);
  expect(pageScrollHeight).toBe(pageClientHeight);

  await page.getByRole("button", { name: "展开整理一览" }).click();
  await expect(page.getByTestId("agent-session-rail")).toHaveCount(0);
  await expect(page.getByTestId("agent-run-status")).toBeVisible();
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

test("agent support panels can collapse to expand the active session", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("agent-session-rail")).toBeVisible();
  await expect(page.getByTestId("agent-run-status")).toBeVisible();
  const activeBefore = await page.getByTestId("agent-active-session").boundingBox();

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
  expect(activeBefore!.width).toBeGreaterThan(500);
  expect(activeAfter!.width).toBeGreaterThan(activeBefore!.width);

  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath("agent-collapsed-support-panels-desktop.png"),
  });

  await page.setViewportSize({ width: 1600, height: 980 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  const wideActiveBefore = await page
    .getByTestId("agent-active-session")
    .boundingBox();
  await page.getByRole("button", { name: "收起任务参考" }).click();
  await page.getByRole("button", { name: "收起整理一览" }).click();
  await page.waitForTimeout(250);
  const wideActiveAfter = await page
    .getByTestId("agent-active-session")
    .boundingBox();

  expect(wideActiveBefore).not.toBeNull();
  expect(wideActiveAfter).not.toBeNull();
  expect(wideActiveAfter!.width).toBeGreaterThan(wideActiveBefore!.width);
});

test("agent page keeps long conversation inside the message log at MacBook width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1365, height: 768 });
  await page.goto("/agent", { waitUntil: "domcontentloaded" });

  const messageLog = page.getByRole("log");
  await expect(messageLog).toBeVisible({ timeout: 15_000 });
  await expect(messageLog).toHaveCSS("overflow-y", "auto");

  const logBox = await messageLog.boundingBox();
  expect(logBox).not.toBeNull();

  await messageLog.evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.mouse.move(logBox!.x + logBox!.width / 2, logBox!.y + 80);
  await page.mouse.wheel(0, 700);
  await page.waitForTimeout(150);

  const pageScrollY = await page.evaluate(() => window.scrollY);
  const logState = await messageLog.evaluate((element) => ({
    scrollTop: element.scrollTop,
    scrollHeight: element.scrollHeight,
    clientHeight: element.clientHeight,
  }));

  expect(pageScrollY).toBe(0);
  if (logState.scrollHeight > logState.clientHeight) {
    expect(logState.scrollTop).toBeGreaterThan(0);
  }

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
  await expect(page.getByText("今天不要做什么")).toHaveCount(0);
  await expect(page.getByText("今天只做这一步")).toBeVisible();
  await expect(page.getByLabel("今日判断依据")).toBeVisible();
  await expect(page.getByText("第一大持仓约 34%").first()).toBeVisible();
  await expect(page.getByText("已进入判断的资料")).toBeVisible();
  await expect(page.getByText("长期资金入市政策更像长期市场结构信号。")).toBeVisible();
  const coverageList = page.locator(".today-coverage-list");
  await expect(coverageList.getByText("画像")).toBeVisible();
  await expect(coverageList.getByText("组合")).toBeVisible();
  await expect(coverageList.getByText("资讯")).toBeVisible();
  await expect(page.getByText("今日信号面板")).toHaveCount(0);
  await expect(page.getByText("新闻标题：")).toHaveCount(0);
  await expect(page.getByText("新闻概括：")).toHaveCount(0);
  await expect(page.getByText("简要解读：")).toHaveCount(0);
  await expect(page.getByText("把这条政策先翻译成一句新手能执行的话")).toHaveCount(0);
  await expect(page.getByText("直接操作账户")).toHaveCount(0);
  await expect(page.getByRole("link", { name: /去完成下一步/ })).toHaveAttribute(
    "href",
    "/portfolio?from=today&focus=concentration",
  );
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
  await expect(
    page.locator(".automation-safety-card").getByText("FundGene 不会连接券商"),
  ).toBeVisible();

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

  await expect(page.getByText("上下文完整度").first()).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.getByText("资料更新时间")).toBeVisible();
  await expect(page.getByText("待确认资料").first()).toBeVisible();
  await expect(page.getByText("把“追热点倾向”加入待观察行为证据")).toBeVisible();

  await page.getByRole("button", { name: "确认记录" }).first().click();
  await expect(
    page.getByText("把“追热点倾向”加入待观察行为证据"),
  ).toHaveCount(0);
  await expect(page.getByText("已处理 1 条").first()).toBeVisible();
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
  const initialCatalogResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/api/news" && !url.search.includes("refresh=true");
  });
  await page.goto("/news", { waitUntil: "domcontentloaded" });
  await initialCatalogResponse;

  await page
    .getByRole("button", { name: "查看资讯：北向资金净流入超百亿元 科技板块获加仓" })
    .click();
  await expect(
    page
      .getByLabel("资讯解读画布")
      .getByRole("heading", { name: "北向资金净流入超百亿元 科技板块获加仓" }),
  ).toBeVisible();

  const refreshCatalogResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname === "/api/news" && url.search.includes("refresh=true");
  });
  await page.getByRole("button", { name: "同步真实资讯" }).click();
  await refreshCatalogResponse;

  await page.getByRole("button", { name: "生成解读" }).first().click();

  await expect(page.getByText("影响路径图").first()).toBeVisible();
  await expect(page.getByTestId("news-selected-source")).toBeVisible();
  await expect(page.getByTestId("news-analysis-process")).toBeVisible();
  await expect(page.getByText("已生成解读").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "重新解读" }).first()).toBeVisible();
  await expect(page.getByText("支持性的货币政策立场").first()).toBeVisible();
  await expect(page.getByText("资讯解读不构成买卖建议").first()).toBeVisible();
});

test("news agent link prefills the composer with source context", async ({ page }) => {
  await page.goto("/news", { waitUntil: "domcontentloaded" });

  await page.getByRole("link", { name: "让 Agent 结合我的组合解释" }).click();
  await expect(page).toHaveURL(/\/agent\?/);
  await expect(page.locator("textarea")).toHaveValue(
    "请结合我的组合，解释这条资讯可能影响什么、哪些地方不能当成买卖信号？",
  );
});
