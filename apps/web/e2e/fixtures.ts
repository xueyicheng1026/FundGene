import type { Page, Route } from "@playwright/test";

const sessionUser = {
  id: "user_e2e",
  email: "qa@fundgene.test",
  profile_id: "profile_e2e",
  onboarding_completed: true,
  display_name: "QA 用户",
  investing_experience: "beginner",
  monthly_contribution_band: "under_3000",
  primary_goal: "建立长期基金投资纪律",
};

const behaviorProfile = {
  user_id: "user_e2e",
  risk_level: "balanced",
  bias_tags: ["追热点倾向", "回撤焦虑"],
  evidence: ["问卷显示在热门基金讨论中容易冲动跟进。"],
  updated_at: "2026-04-26T08:00:00Z",
};

const dashboardState = {
  user_id: "user_e2e",
  onboarding_completed: true,
  risk_level: "balanced",
  bias_tags: ["追热点倾向"],
  latest_risk_score: 18,
  daily_brief: {
    brief_id: "daily-brief:e2e:ready",
    as_of: "2026-04-26T09:30:00Z",
    status: "ready",
    priority_level: "attention",
    headline: "今天先检查组合集中度，不急着响应单条新闻。",
    beginner_explanation:
      "你的画像、组合报告和最近新闻已经能形成一个共同判断：先看风险来源，再决定要学习或追问什么。",
    evidence: [
      {
        id: "evidence:portfolio:e2e",
        source_type: "portfolio",
        source_id: "snapshot_e2e",
        claim: "第一大持仓约 34%，需要继续观察集中度。",
        beginner_translation: "单一主题波动更容易影响你的账户感受和判断节奏。",
        support_level: "strong",
        freshness_label: "2026-04-26 快照",
        risk_boundary: "不能推出任何账户操作。",
      },
      {
        id: "evidence:news:e2e",
        source_type: "news_policy",
        source_id: "analysis_e2e",
        claim: "长期资金入市政策更像长期市场结构信号。",
        beginner_translation: "这类新闻适合先理解影响路径，不适合直接当作行动理由。",
        support_level: "medium",
        freshness_label: "最近新闻分析",
        risk_boundary: "新闻相关性不是交易信号。",
      },
      {
        id: "evidence:behavior:e2e",
        source_type: "behavior",
        source_id: "user_e2e",
        claim: "当前行为焦点包含追热点倾向。",
        beginner_translation: "看到热门信息时，教练会提醒你先检查证据和边界。",
        support_level: "medium",
        freshness_label: "最新行为画像",
        risk_boundary: "单个标签不是固定定性。",
      },
    ],
    primary_action: {
      id: "inspect-portfolio-concentration",
      type: "inspect_portfolio",
      label: "检查组合集中度",
      reason: "先看第一大持仓和主题重复，避免被单条新闻带走。",
      target_route: "/portfolio",
      target_params: { from: "dashboard", focus: "concentration" },
      expected_writeback: "portfolio_snapshots/portfolio_analyses",
      safety_note: "组合体检用于解释风险来源，不输出账户操作指令。",
    },
    secondary_actions: [
      {
        id: "ask-coach-brief",
        type: "ask_coach",
        label: "让教练解释这条判断",
        reason: "如果证据还不清楚，先追问为什么和你有关。",
        target_route: "/coach",
        target_params: {
          from: "dashboard",
          focus: "daily-brief",
          daily_brief_id: "daily-brief:e2e:ready",
        },
        expected_writeback: "chat_messages/agent_runs",
        safety_note: "追问用于理解证据和边界，不会触发账户操作。",
      },
    ],
    do_not_do: "不要把今日简报理解成直接操作账户的指令。",
    source_coverage: {
      profile: true,
      portfolio: true,
      news_policy: true,
      learning: true,
      simulation: true,
      behavior: true,
      coach_history: true,
    },
    trace_id: "run_e2e",
  },
  next_actions: [
    "完成一节风险与回撤基础课。",
    "录入一份组合快照并查看集中度。",
  ],
  summary_cards: [
    {
      label: "风险等级",
      value: "balanced",
      detail: "来自最新问卷结果。",
    },
    {
      label: "行为焦点",
      value: "追热点倾向",
      detail: "教练会优先解释冲动跟进风险。",
    },
    {
      label: "组合体检",
      value: "已生成",
      detail: "最近组合报告已回流工作台。",
    },
  ],
  learning_status: {
    overall_progress_percentage: 34,
    completed_courses_count: 1,
    total_courses: 3,
    recommended_course_slug: "risk-basics",
    recommended_course_title: "风险和回撤基础",
  },
  portfolio_status: {
    has_report: true,
    latest_snapshot_id: "snapshot_e2e",
    latest_snapshot_date: "2026-04-26",
    total_value: 52000,
    summary: "组合覆盖权益、债券和现金，但第一大持仓需要继续观察。",
  },
  simulation_status: {
    completed_sessions_count: 1,
    recommended_scenario_slug: "drawdown-discipline",
    recommended_scenario_title: "回撤纪律训练",
    latest_session_id: "sim_session_e2e",
    latest_scenario_slug: "drawdown-discipline",
    latest_scenario_title: "回撤纪律训练",
    latest_review_summary: "最近复盘显示你能先检查计划，再决定是否调整。",
    latest_completed_at: "2026-04-26T09:20:00Z",
  },
  news_status: {
    has_analysis: true,
    latest_analysis_id: "analysis_e2e",
    latest_item_id: "news_e2e",
    latest_item_type: "news",
    latest_title: "长期资金入市政策继续推进",
    source_name: "FundGene fixture",
    latest_summary: "政策强调长期资金和资本市场稳定，但具体节奏仍需观察。",
    beginner_translation: "这条政策更像长期市场结构信号，不是立即买入指令。",
    recommended_action: "先回看自己的权益基金比例。",
    generated_at: "2026-04-26T08:20:00Z",
  },
  latest_coach_activity: {
    session_id: "session_e2e",
    topic: "风险和回撤",
    intent: "learning",
    question: "基金回撤是什么意思？",
    answer_focus: "先解释回撤，再连接风险承受能力。",
    recommended_action: "继续学习风险基础课程。",
    updated_at: "2026-04-26T08:30:00Z",
  },
};

const assistantSession = {
  session: {
    id: "session_e2e",
    topic: "风险和回撤",
    context_type: "advisor",
    latest_intent: "learning",
    last_question: "基金回撤是什么意思？",
    last_answer_preview: "回撤是从阶段高点到低点的下跌幅度。",
    last_recommended_action: "继续学习风险基础课程。",
    created_at: "2026-04-26T08:00:00Z",
    updated_at: "2026-04-26T08:30:00Z",
  },
  messages: [
    {
      id: "msg_user",
      role: "user",
      content: "基金回撤是什么意思？",
      message_type: "text",
      created_at: "2026-04-26T08:29:00Z",
      agent_run_id: null,
      advisor_response: null,
    },
    {
      id: "msg_assistant",
      role: "assistant",
      content: "回撤是从阶段高点到低点的下跌幅度。",
      message_type: "advisor_response",
      created_at: "2026-04-26T08:30:00Z",
      agent_run_id: "run_e2e",
      advisor_response: {
        answer:
          "回撤可以理解为基金净值从阶段高点跌到低点的幅度。它不是亏损承诺，而是衡量波动压力的一种方式。",
        intent: "learning",
        citations: ["learning_risk_basics"],
        risk_notice: "基金投资存在波动风险，解释回撤不等于承诺收益或规避亏损。",
        recommended_actions: ["先完成风险基础课程。", "把组合最大持仓拿来检查波动来源。"],
        recommended_action_targets: [
          {
            label: "进入学习中心",
            href: "/learning",
            intent: "learning",
            kind: "internal_link",
          },
          {
            label: "查看组合体检",
            href: "/portfolio",
            intent: "portfolio",
            kind: "internal_link",
          },
        ],
        follow_up_questions: ["我该怎样判断自己能承受多大回撤？"],
      },
    },
  ],
};

const agentRunTrace = {
  run: {
    id: "run_e2e",
    intent: "learning",
    runStatus: "completed",
    policyStatus: "passed",
    orchestratorVersion: "advisor-runtime-v2-e2e",
    startedAt: "2026-04-26T08:29:58Z",
    completedAt: "2026-04-26T08:30:00Z",
    latencyMs: 1280,
  },
  contextSnapshot: {
    riskLevel: "balanced",
    biasTags: ["追热点倾向"],
    latestPortfolioSummary: "组合覆盖权益、债券和现金。",
  },
  steps: [
    {
      id: "step_intake",
      stepName: "意图识别",
      sequence: 1,
      status: "completed",
      latencyMs: 120,
      inputPayload: { message: "基金回撤是什么意思？" },
      outputPayload: { intent: "learning" },
      error: null,
    },
    {
      id: "step_answer",
      stepName: "结构化回答",
      sequence: 2,
      status: "completed",
      latencyMs: 970,
      inputPayload: { intent: "learning" },
      outputPayload: { answerShape: "advisor_response" },
      error: null,
    },
  ],
  toolCalls: [
    {
      id: "tool_learning",
      stepId: "step_answer",
      toolName: "learning_knowledge_lookup",
      permissionLevel: "read",
      status: "completed",
      latencyMs: 85,
      inputPayload: { topic: "drawdown" },
      outputPayload: { citations: ["learning_risk_basics"] },
      error: null,
    },
  ],
  evidenceRefs: [
    {
      id: "evidence_learning",
      stepId: "step_answer",
      workerName: "learning",
      sourceType: "course",
      sourceId: "learning_risk_basics",
      sourceVersion: "v1",
      quoteOrSummary: "风险基础课程解释了回撤和波动压力。",
      claim: "回撤用于衡量阶段性波动压力。",
      supportSummary: "回答引用学习资料解释术语，不给出收益承诺。",
    },
  ],
  stateUpdateProposals: [
    {
      target: "learning_path",
      action: "recommend_course",
      courseSlug: "risk-basics",
    },
  ],
};

const portfolioReport = {
  snapshot_id: "snapshot_e2e",
  snapshot_date: "2026-04-26",
  total_value: 52000,
  cash_value: 6000,
  summary:
    "这份快照总资产约为 52000 元，权益暴露适中，第一大持仓约 34%。",
  risk_exposure: ["组合里既有成长暴露，也保留了一定缓冲。"],
  concentration_flags: ["第一大持仓超过 25%，建议检查单一主题风险。"],
  allocation_balance: ["组合覆盖多个类型，但仍要检查主题是否重复。"],
  recommended_next_actions: ["先检查第一大持仓是否过重。"],
  holdings: [
    {
      fund_code: "161725",
      fund_name: "招商中证白酒指数",
      fund_type: "equity",
      market_value: 18000,
      weight: 34.6,
    },
    {
      fund_code: "110027",
      fund_name: "易方达安心债券",
      fund_type: "bond",
      market_value: 16000,
      weight: 30.8,
    },
    {
      fund_code: "000071",
      fund_name: "华夏恒生 ETF 联接",
      fund_type: "international",
      market_value: 12000,
      weight: 23.1,
    },
  ],
  generated_at: "2026-04-26T09:00:00Z",
};

const learningPath = {
  path_slug: "beginner-core-path",
  title: "新手基金主路径",
  description: "先建立风险、基金和配置的基础语言。",
  overall_progress_percentage: 34,
  completed_courses_count: 1,
  total_courses: 3,
  recommended_course_slug: "risk-basics",
  recommended_course_title: "风险和回撤基础",
  courses: [
    {
      slug: "risk-basics",
      title: "风险和回撤基础",
      focus: "理解波动、回撤和风险承受能力。",
      description: "帮助新手把短期下跌和长期计划分开。",
      estimated_duration_minutes: 18,
      section_count: 3,
      completed_section_count: 1,
      progress_percentage: 33,
      status: "in_progress",
      next_section_slug: "drawdown",
      next_section_title: "如何理解回撤",
    },
  ],
};

const simulationCatalog = {
  scenarios: [
    {
      id: "scenario_e2e",
      slug: "drawdown-discipline",
      title: "回撤纪律训练",
      synopsis: "在连续下跌中练习先复盘再行动。",
      market_phase: "震荡回撤",
      difficulty: "beginner",
      estimated_duration_minutes: 12,
      decision_count: 2,
      starting_year: 2018,
      headline: "当市场连续下跌时，先稳住判断顺序。",
      description: "这个场景训练回撤中的行动纪律。",
      setup: "市场连续调整，热门主题基金明显回撤。",
      objective: "记录你是否能先检查计划而不是马上卖出。",
      bias_focus: ["恐慌卖出"],
      tags: ["回撤", "纪律"],
      timeline_preview: ["第一轮下跌", "反弹诱惑"],
      recommended: true,
      completed: false,
    },
  ],
  recommended_scenario_id: "scenario_e2e",
  active_session_id: null,
};

const newsCatalog = {
  items: [
    {
      id: "news_e2e",
      title: "长期资金入市政策继续推进",
      source: "FundGene fixture",
      category: "policy",
      summary: "政策强调长期资金和资本市场稳定，但具体节奏仍需观察。",
      url: "https://example.com/news",
      published_at: "2026-04-26T07:00:00Z",
      impact_areas: ["宏观政策", "权益基金"],
      tags: ["政策", "长期资金"],
      relevance_score: 0.82,
    },
  ],
  policy_items: [],
  generated_at: "2026-04-26T08:00:00Z",
};

function buildAutomationState() {
  return {
    user_id: "user_e2e",
    updated_at: "2026-04-26T09:30:00Z",
    active_count: 1,
    total_count: 4,
    automations: [
      {
        key: "daily_brief",
        title: "每日简报",
        summary: "每天自动整理画像、组合、资讯和训练状态，生成 Today 的第一条判断。",
        enabled: true,
        default_enabled: true,
        cadence_key: "daily_0830",
        cadence_label: "每天 08:30",
        cadence_options: [
          { key: "daily_0830", label: "每天 08:30" },
          { key: "daily_1200", label: "每天 12:00" },
          { key: "workday_0830", label: "工作日 08:30" },
        ],
        read_scope: ["风险画像", "最近组合报告", "资讯/政策分析", "学习与训练状态"],
        output_scope: ["今日判断", "最多三条证据", "安全下一步", "今天不要做什么"],
        confirmation_boundary: "画像、计划或长期偏好写回前必须确认。",
        safety_boundary: "不会生成买卖、清仓、满仓或收益确定语言。",
        status: "ready",
        disabled_reason: null,
        last_run: null,
        next_run_at: "2026-04-27T00:30:00Z",
        can_run_now: true,
      },
      {
        key: "weekly_portfolio",
        title: "每周组合巡检",
        summary: "每周检查集中度、现金比例和资产暴露，把问题变成可追问的任务。",
        enabled: false,
        default_enabled: false,
        cadence_key: "weekly_monday_0900",
        cadence_label: "每周一 09:00",
        cadence_options: [
          { key: "weekly_monday_0900", label: "每周一 09:00" },
          { key: "weekly_friday_1800", label: "每周五 18:00" },
        ],
        read_scope: ["最近组合快照", "持仓权重", "现金比例", "风险问卷"],
        output_scope: ["集中度提醒", "组合健康摘要", "建议追问任务"],
        confirmation_boundary: "只准备检查建议，不自动改组合和计划。",
        safety_boundary: "只解释风险来源，不输出账户操作指令。",
        status: "disabled",
        disabled_reason: null,
        last_run: null,
        next_run_at: null,
        can_run_now: false,
      },
      {
        key: "news_watch",
        title: "资讯影响观察",
        summary: "只观察和你的画像、持仓、风险敏感点有关的资讯，不堆新闻列表。",
        enabled: false,
        default_enabled: false,
        cadence_key: "workday_1600",
        cadence_label: "工作日 16:00",
        cadence_options: [
          { key: "workday_1600", label: "工作日 16:00" },
          { key: "daily_1800", label: "每天 18:00" },
        ],
        read_scope: ["新闻/政策项", "持仓类型", "风险敏感点", "最近简报证据"],
        output_scope: ["影响路径", "不确定性", "是否值得追问"],
        confirmation_boundary: "加入长期观察或偏好前必须确认。",
        safety_boundary: "新闻相关性不是交易信号。",
        status: "disabled",
        disabled_reason: null,
        last_run: null,
        next_run_at: null,
        can_run_now: false,
      },
      {
        key: "behavior_observation",
        title: "行为偏差观察",
        summary: "从对话和训练理由里发现追热点、回撤焦虑等信号，但只生成待确认证据。",
        enabled: false,
        default_enabled: false,
        cadence_key: "weekly_friday_1800",
        cadence_label: "每周五 18:00",
        cadence_options: [
          { key: "weekly_friday_1800", label: "每周五 18:00" },
          { key: "weekly_monday_0900", label: "每周一 09:00" },
        ],
        read_scope: ["用户提问", "模拟理由", "已确认行为证据", "训练复盘"],
        output_scope: ["待确认行为证据", "训练建议", "冲动约束提醒"],
        confirmation_boundary: "弱证据只进入待确认，不直接改长期画像。",
        safety_boundary: "一次行为不会被写成永久标签。",
        status: "disabled",
        disabled_reason: null,
        last_run: null,
        next_run_at: null,
        can_run_now: false,
      },
    ],
    next_queue: [
      {
        automation_key: "daily_brief",
        title: "每日简报",
        next_run_at: "2026-04-27T00:30:00Z",
        cadence_label: "每天 08:30",
      },
    ],
    daily_brief_summary: {
      brief_id: "daily-brief:e2e:ready",
      headline: dashboardState.daily_brief.headline,
      beginner_explanation: dashboardState.daily_brief.beginner_explanation,
      as_of: dashboardState.daily_brief.as_of,
      source_coverage: dashboardState.daily_brief.source_coverage,
    },
  };
}

function rebuildAutomationQueue(automationState: ReturnType<typeof buildAutomationState>) {
  automationState.active_count = automationState.automations.filter(
    (item) => item.enabled,
  ).length;
  automationState.next_queue = automationState.automations
    .filter((item) => item.enabled)
    .map((item) => ({
      automation_key: item.key,
      title: item.title,
      next_run_at: item.next_run_at ?? "2026-04-27T00:30:00Z",
      cadence_label: item.cadence_label,
    }));
}

function buildProfileContext() {
  return {
    user_id: "user_e2e",
    display_name: "QA 用户",
    context_readiness: {
      ready_count: 7,
      total_count: 8,
      items: [
        { key: "profile", label: "基础画像", ready: true, last_updated_at: "2026-04-26T08:00:00Z", missing_action_route: null },
        { key: "risk", label: "风险问卷", ready: true, last_updated_at: "2026-04-26T08:00:00Z", missing_action_route: null },
        { key: "portfolio", label: "组合报告", ready: true, last_updated_at: "2026-04-26", missing_action_route: null },
        { key: "news", label: "资讯分析", ready: true, last_updated_at: "2026-04-26T08:20:00Z", missing_action_route: null },
        { key: "learning", label: "学习状态", ready: true, last_updated_at: null, missing_action_route: null },
        { key: "simulation", label: "训练复盘", ready: true, last_updated_at: "2026-04-26T09:20:00Z", missing_action_route: null },
        { key: "behavior", label: "行为证据", ready: true, last_updated_at: "2026-04-26T08:00:00Z", missing_action_route: null },
        { key: "automations", label: "自动任务", ready: false, last_updated_at: null, missing_action_route: "/automations" },
      ],
    },
    risk_profile: {
      risk_level: "balanced",
      latest_risk_score: 18,
      updated_at: "2026-04-26T08:00:00Z",
    },
    behavior_profile: {
      bias_tags: ["追热点倾向", "回撤焦虑"],
      evidence: ["问卷显示在热门基金讨论中容易冲动跟进。"],
      updated_at: "2026-04-26T08:00:00Z",
    },
    portfolio_context: {
      has_report: true,
      latest_snapshot_date: "2026-04-26",
      total_value: 52000,
      summary: "组合覆盖权益、债券和现金，但第一大持仓需要继续观察。",
    },
    learning_context: {
      overall_progress_percentage: 34,
      recommended_course_title: "风险和回撤基础",
    },
    simulation_context: {
      latest_review_summary: "最近复盘显示你能先检查计划，再决定是否调整。",
      latest_completed_at: "2026-04-26T09:20:00Z",
    },
    automation_authorizations: [
      { automation_key: "daily_brief", enabled: true, cadence_label: "每天 08:30" },
      { automation_key: "weekly_portfolio", enabled: false, cadence_label: "每周一 09:00" },
    ],
    authorization_scope: [
      { key: "profile", label: "基础画像", readable: true },
      { key: "portfolio", label: "组合报告", readable: true },
      { key: "news", label: "资讯分析", readable: true },
      { key: "behavior", label: "行为证据", readable: true },
    ],
    pending_proposal_count: 1,
  };
}

function buildPendingProposals() {
  return {
    pending_count: 1,
    resolved_count: 0,
    proposals: [
      {
        id: "proposal_behavior_hot_topic",
        title: "把“追热点倾向”加入待观察行为证据",
        source_label: "最近对话 + 情境训练理由",
        evidence_summary: "用户在热门基金讨论中更容易先问收益表现，而不是先问风险来源。",
        writeback_label: "行为证据，不是永久标签",
        target_type: "behavior_profile_note",
        target_id: null,
        patch_preview: { evidence: "追热点倾向待观察" },
        reason: "这是一条需要用户确认的行为证据候选。",
        validator_status: "passed",
        validator_message: null,
        status: "pending",
        safety_note: "确认后只追加行为证据，不会触发交易或账户动作。",
        created_at: "2026-04-26T09:40:00Z",
        run_id: "run_e2e",
      },
    ],
  };
}

function json(route: Route, body: unknown, status = 200) {
  const requestOrigin = new URL(route.request().headers().origin ?? route.request().url()).origin;

  return route.fulfill({
    status,
    contentType: "application/json",
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
      "Access-Control-Allow-Origin": requestOrigin,
    },
    body: JSON.stringify(body),
  });
}

export async function mockFundGeneApi(
  page: Page,
  options: { authenticated?: boolean } = {},
) {
  const authenticated = options.authenticated ?? true;
  const automationState = buildAutomationState();
  const profileContext = buildProfileContext();
  const pendingProposals = buildPendingProposals();

  await page.context().route("**/*", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;

    if (!path.startsWith("/api/")) {
      return route.continue();
    }

    if (route.request().method() === "OPTIONS") {
      return json(route, {}, 204);
    }

    if (path === "/api/auth/session") {
      if (!authenticated) {
        return json(route, { detail: "Authentication required." }, 401);
      }
      return json(route, sessionUser);
    }
    if (path === "/api/auth/logout") {
      return json(route, {});
    }
    if (path === "/api/behavior/profile") {
      return json(route, behaviorProfile);
    }
    if (path === "/api/dashboard") {
      return json(route, dashboardState);
    }
    if (path === "/api/automations") {
      return json(route, automationState);
    }
    if (path.startsWith("/api/automations/") && path.endsWith("/run")) {
      const automationKey = path.split("/").at(-2);
      const item = automationState.automations.find(
        (automation) => automation.key === automationKey,
      );
      if (!item) {
        return json(route, { detail: "Automation does not exist." }, 404);
      }
      if (!item.enabled) {
        return json(route, { detail: "Automation is disabled." }, 409);
      }
      const run = {
        run_id: `run_${automationKey}_e2e`,
        agent_run_id: `agent_run_${automationKey}_e2e`,
        status: "succeeded",
        started_at: "2026-04-26T10:00:00Z",
        completed_at: "2026-04-26T10:00:00Z",
        summary: `${item.title} 已生成同步运行记录。`,
        output_ref: `automation:${automationKey}:e2e`,
      };
      (item as unknown as { last_run: typeof run | null }).last_run = run;
      return json(route, {
        run_id: run.run_id,
        automation_key: item.key,
        status: "succeeded",
        agent_run_id: run.agent_run_id,
        started_at: "2026-04-26T10:00:00Z",
        completed_at: run.completed_at,
        summary: run.summary,
        output_ref: run.output_ref,
        created_pending_proposal_ids: [],
        steps: [
          {
            key: "read_context",
            label: "读取授权上下文",
            status: "completed",
            detail: "已读取画像、组合、新闻、学习和训练状态。",
          },
          {
            key: "notify_user",
            label: "写入通知和运行记录",
            status: "completed",
            detail: "已保存运行记录和通知。",
          },
        ],
        output_payload: {
          automation_key: item.key,
          headline: dashboardState.daily_brief.headline,
          source_coverage: dashboardState.daily_brief.source_coverage,
          primary_action: dashboardState.daily_brief.primary_action,
          safety_boundary: item.safety_boundary,
        },
      });
    }
    if (path.startsWith("/api/automations/")) {
      const automationKey = path.split("/").at(-1);
      const item = automationState.automations.find(
        (automation) => automation.key === automationKey,
      );
      if (!item) {
        return json(route, { detail: "Automation does not exist." }, 404);
      }
      let payload: Record<string, unknown> = {};
      try {
        payload = route.request().postDataJSON() as Record<string, unknown>;
      } catch {
        payload = {};
      }
      if (typeof payload.enabled === "boolean") {
        item.enabled = payload.enabled;
        item.status = payload.enabled ? "ready" : "disabled";
        item.can_run_now = payload.enabled;
        item.next_run_at = payload.enabled ? "2026-04-27T00:30:00Z" : null;
      }
      if (typeof payload.cadence_key === "string") {
        const option = item.cadence_options.find(
          (entry) => entry.key === payload.cadence_key,
        );
        if (!option) {
          return json(route, { detail: "cadence_key is not valid for this automation." }, 422);
        }
        item.cadence_key = option.key;
        item.cadence_label = option.label;
      }
      rebuildAutomationQueue(automationState);
      return json(route, item);
    }
    if (path === "/api/profile/context") {
      profileContext.pending_proposal_count = pendingProposals.pending_count;
      profileContext.automation_authorizations = automationState.automations.map(
        (item) => ({
          automation_key: item.key,
          enabled: item.enabled,
          cadence_label: item.cadence_label,
        }),
      );
      return json(route, profileContext);
    }
    if (path === "/api/profile/pending-proposals") {
      return json(route, pendingProposals);
    }
    if (path.startsWith("/api/profile/pending-proposals/")) {
      const parts = path.split("/");
      const proposalId = parts.at(-2);
      const action = parts.at(-1);
      const proposal = pendingProposals.proposals.find(
        (item) => item.id === proposalId,
      );
      if (!proposal) {
        return json(
          route,
          { detail: "Pending proposal does not exist for the current user." },
          404,
        );
      }
      pendingProposals.proposals = pendingProposals.proposals.filter(
        (item) => item.id !== proposalId,
      );
      pendingProposals.pending_count = pendingProposals.proposals.length;
      pendingProposals.resolved_count += 1;
      proposal.status = action === "accept" ? "applied" : "rejected";
      return json(route, {
        proposal,
        applied_writeback: action === "accept",
      });
    }
    if (path === "/api/assistant/session") {
      return json(route, assistantSession);
    }
    if (path.startsWith("/api/assistant/runs/") && path.endsWith("/trace")) {
      return json(route, agentRunTrace);
    }
    if (path === "/api/assistant/messages") {
      return json(route, assistantSession);
    }
    if (path === "/api/learning/path") {
      return json(route, learningPath);
    }
    if (path.startsWith("/api/learning/courses/")) {
      return json(route, {
        ...learningPath.courses[0],
        path_slug: learningPath.path_slug,
        path_title: learningPath.title,
        course_slug: learningPath.courses[0].slug,
        sections: [
          {
            slug: "intro",
            title: "先理解风险",
            summary: "风险不是单日涨跌，而是计划可能承受的波动。",
            estimated_duration_minutes: 6,
            position: 1,
            completed: true,
          },
          {
            slug: "drawdown",
            title: "如何理解回撤",
            summary: "回撤帮助你观察阶段性压力。",
            estimated_duration_minutes: 7,
            position: 2,
            completed: false,
          },
        ],
      });
    }
    if (path === "/api/portfolio/latest") {
      return json(route, { report: portfolioReport });
    }
    if (path === "/api/portfolio/history") {
      return json(route, {
        items: [
          {
            snapshot_id: portfolioReport.snapshot_id,
            snapshot_date: portfolioReport.snapshot_date,
            total_value: portfolioReport.total_value,
            summary: portfolioReport.summary,
            generated_at: portfolioReport.generated_at,
          },
        ],
      });
    }
    if (path === "/api/portfolio/snapshots") {
      return json(route, portfolioReport);
    }
    if (path === "/api/simulations/scenarios") {
      return json(route, simulationCatalog);
    }
    if (path === "/api/news") {
      return json(route, newsCatalog);
    }
    if (path === "/api/news/analyze") {
      const analysisPayload = {
        analysis: {
          id: "analysis_e2e",
          item: newsCatalog.items[0],
          fact_summary: "政策信息强调长期资金入市，但落地节奏仍需继续跟踪。",
          impact_path: ["可能影响权益基金风险偏好。", "对个人组合的影响取决于持仓结构。"],
          uncertainties: ["政策执行节奏不确定。", "市场短期反应可能和长期影响不同。"],
          risk_notice: "资讯解读不构成买卖建议。",
          recommended_actions: ["先回看自己的权益基金比例。"],
          related_learning: ["风险和回撤基础"],
          citations: ["news_e2e"],
          model_status: "enhanced",
          model_provider: "deepseek",
          model_name: "deepseek:deepseek-v4-pro",
          fallback_reason: null,
          agent_process: [
            {
              key: "deepseek_enhancement",
              label: "调用 DeepSeek 生成解读",
              status: "completed",
              detail: "deepseek:deepseek-v4-pro 已完成结构化解读。",
            },
          ],
          generated_at: "2026-04-26T08:20:00Z",
        },
      };
      return json(route, analysisPayload);
    }
    if (path === "/api/news/analyses/analysis_e2e") {
      return json(route, {
        id: "analysis_e2e",
        item: newsCatalog.items[0],
        facts: ["政策信息强调长期资金入市。", "落地节奏仍需继续跟踪。"],
        impact_paths: ["可能影响权益基金风险偏好。", "对个人组合的影响取决于持仓结构。"],
        uncertainty_notes: ["政策执行节奏不确定。", "市场短期反应可能和长期影响不同。"],
        beginner_translation: "先理解政策影响路径，再回看自己的权益基金比例。",
        related_learning_topics: ["风险和回撤基础"],
        recommended_next_actions: ["先回看自己的权益基金比例。"],
        risk_notice: "资讯解读不构成买卖建议。",
        citations: [],
        model_status: "enhanced",
        model_provider: "deepseek",
        model_name: "deepseek:deepseek-v4-pro",
        fallback_reason: null,
        agent_process: [
          {
            key: "deepseek_enhancement",
            label: "调用 DeepSeek 生成解读",
            status: "completed",
            detail: "deepseek:deepseek-v4-pro 已完成结构化解读。",
          },
        ],
        generated_at: "2026-04-26T08:20:00Z",
      });
    }

    return json(route, { detail: `Unhandled test route: ${path}` }, 404);
  });
}
