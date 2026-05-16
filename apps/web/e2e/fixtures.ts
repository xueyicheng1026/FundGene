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
  next_actions: [
    "完成一节风险与回撤基础课。",
    "录入一份组合快照并查看集中度。",
  ],
  summary_cards: [
    {
      label: "Risk level",
      value: "balanced",
      detail: "来自最新问卷结果。",
    },
    {
      label: "Behavior focus",
      value: "追热点倾向",
      detail: "Coach 会优先解释冲动跟进风险。",
    },
    {
      label: "Portfolio",
      value: "已生成",
      detail: "最近组合报告已回流 dashboard。",
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

function json(route: Route, body: unknown, status = 200) {
  const requestOrigin = new URL(route.request().headers().origin ?? route.request().url()).origin;

  return route.fulfill({
    status,
    contentType: "application/json",
    headers: {
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
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
    if (path === "/api/simulations/scenarios") {
      return json(route, simulationCatalog);
    }
    if (path === "/api/news") {
      return json(route, newsCatalog);
    }
    if (path === "/api/news/analyze") {
      return json(route, {
        analysis: {
          id: "analysis_e2e",
          item_id: "news_e2e",
          headline: "长期资金入市政策继续推进",
          fact_summary: "政策信息强调长期资金入市，但落地节奏仍需继续跟踪。",
          impact_path: ["可能影响权益基金风险偏好。", "对个人组合的影响取决于持仓结构。"],
          uncertainties: ["政策执行节奏不确定。", "市场短期反应可能和长期影响不同。"],
          risk_notice: "资讯解读不构成买卖建议。",
          recommended_actions: ["先回看自己的权益基金比例。"],
          related_learning: ["风险和回撤基础"],
          citations: ["news_e2e"],
          generated_at: "2026-04-26T08:20:00Z",
        },
      });
    }

    return json(route, { detail: `Unhandled test route: ${path}` }, 404);
  });
}
