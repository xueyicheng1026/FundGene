type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
};

export type JsonObject = Record<string, unknown>;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type RiskLevel = "conservative" | "balanced" | "growth" | null;
export type LearningProgressStatus =
  | "not_started"
  | "in_progress"
  | "completed";

export type SessionUser = {
  id: string;
  email: string | null;
  profileId: string | null;
  onboardingCompleted: boolean;
  displayName: string | null;
  investingExperience: string | null;
  monthlyContributionBand: string | null;
  primaryGoal: string | null;
};

export type UserSummary = {
  id: string;
  displayName: string;
  investingExperience: string;
  monthlyContributionBand: string | null;
  primaryGoal: string | null;
  onboardingCompleted: boolean;
};

export type BehaviorProfile = {
  userId: string;
  riskLevel: RiskLevel;
  biasTags: string[];
  evidence: string[];
  updatedAt: string | null;
};

export type DashboardSummaryCard = {
  label: string;
  value: string;
  detail: string;
};

export type DashboardCoachActivity = {
  sessionId: string;
  topic: string;
  intent: string | null;
  question: string;
  answerFocus: string;
  recommendedAction: string | null;
  updatedAt: string | null;
};

export type DashboardLearningStatus = {
  overallProgressPercentage: number;
  completedCoursesCount: number;
  totalCourses: number;
  recommendedCourseSlug: string | null;
  recommendedCourseTitle: string | null;
};

export type DashboardPortfolioStatus = {
  hasReport: boolean;
  latestSnapshotId: string | null;
  latestSnapshotDate: string | null;
  totalValue: number | null;
  summary: string | null;
};

export type DashboardSimulationStatus = {
  completedSessionsCount: number;
  recommendedScenarioSlug: string | null;
  recommendedScenarioTitle: string | null;
  latestSessionId: string | null;
  latestScenarioSlug: string | null;
  latestScenarioTitle: string | null;
  latestReviewSummary: string | null;
  latestCompletedAt: string | null;
};

export type DashboardNewsStatus = {
  hasAnalysis: boolean;
  latestAnalysisId: string | null;
  latestItemId: string | null;
  latestItemType: string | null;
  latestTitle: string | null;
  sourceName: string | null;
  beginnerTranslation: string | null;
  recommendedAction: string | null;
  generatedAt: string | null;
};

export type DashboardState = {
  userId: string;
  onboardingCompleted: boolean;
  riskLevel: RiskLevel;
  biasTags: string[];
  latestRiskScore: number | null;
  nextActions: string[];
  summaryCards: DashboardSummaryCard[];
  learningStatus: DashboardLearningStatus | null;
  portfolioStatus: DashboardPortfolioStatus | null;
  simulationStatus: DashboardSimulationStatus | null;
  newsStatus: DashboardNewsStatus | null;
  latestCoachActivity: DashboardCoachActivity | null;
};

export type LearningCourseSummary = {
  slug: string;
  title: string;
  focus: string;
  description: string;
  estimatedDurationMinutes: number;
  sectionCount: number;
  completedSectionCount: number;
  progressPercentage: number;
  status: LearningProgressStatus;
  nextSectionSlug: string | null;
  nextSectionTitle: string | null;
};

export type LearningPathState = {
  pathSlug: string;
  title: string;
  description: string;
  overallProgressPercentage: number;
  completedCoursesCount: number;
  totalCourses: number;
  recommendedCourseSlug: string | null;
  recommendedCourseTitle: string | null;
  courses: LearningCourseSummary[];
};

export type LearningSectionDetail = {
  slug: string;
  title: string;
  summary: string;
  estimatedDurationMinutes: number;
  position: number;
  completed: boolean;
};

export type LearningCourseDetail = {
  pathSlug: string;
  pathTitle: string;
  courseSlug: string;
  title: string;
  focus: string;
  description: string;
  estimatedDurationMinutes: number;
  sectionCount: number;
  completedSectionCount: number;
  progressPercentage: number;
  status: LearningProgressStatus;
  nextSectionSlug: string | null;
  nextSectionTitle: string | null;
  sections: LearningSectionDetail[];
};

export type LearningProgressInput = {
  courseSlug: string;
  sectionSlug: string;
};

export type LearningProgressUpdate = {
  courseSlug: string;
  progressPercentage: number;
  completedSectionCount: number;
  sectionCount: number;
  status: LearningProgressStatus;
  nextSectionSlug: string | null;
  nextSectionTitle: string | null;
};

export type OnboardingProfileInput = {
  displayName: string;
  investingExperience: string;
  monthlyContributionBand: string;
  primaryGoal: string;
};

export type QuestionnaireInput = {
  answers: Record<string, number>;
};

export type AuthCredentialsInput = {
  email: string;
  password: string;
};

export type AdvisorStructuredResponse = {
  answer: string;
  intent: string;
  citations: string[];
  riskNotice: string;
  recommendedActions: string[];
  followUpQuestions: string[];
};

export type AssistantSessionSummary = {
  id: string;
  topic: string;
  contextType: string;
  latestIntent: string | null;
  lastQuestion: string | null;
  lastAnswerPreview: string | null;
  lastRecommendedAction: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AssistantConversationMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  messageType: string;
  createdAt: string | null;
  agentRunId: string | null;
  advisorResponse: AdvisorStructuredResponse | null;
};

export type AssistantConversationState = {
  session: AssistantSessionSummary | null;
  messages: AssistantConversationMessage[];
};

export type AssistantMessageInput = {
  message: string;
  sessionId?: string | null;
};

export type AgentRunTraceRun = {
  id: string;
  intent: string | null;
  runStatus: string | null;
  policyStatus: string | null;
  orchestratorVersion: string | null;
  startedAt: string | null;
  completedAt: string | null;
  latencyMs: number | null;
  fallbackReason: string | null;
  toolTrace: JsonObject;
};

export type AgentRunTraceStep = {
  id: string;
  stepName: string;
  sequence: number | null;
  status: string | null;
  latencyMs: number | null;
  inputPayload: JsonObject;
  outputPayload: JsonObject;
  error: string | null;
};

export type AgentRunTraceToolCall = {
  id: string;
  stepId: string | null;
  toolName: string;
  permissionLevel: string | null;
  status: string | null;
  latencyMs: number | null;
  inputPayload: JsonObject;
  outputPayload: JsonObject;
  error: string | null;
};

export type AgentRunTraceEvidenceRef = {
  id: string;
  stepId: string | null;
  workerName: string | null;
  sourceType: string | null;
  sourceId: string | null;
  sourceVersion: string | null;
  quoteOrSummary: string | null;
  claim: string | null;
  supportSummary: string | null;
};

export type AgentRunTrace = {
  run: AgentRunTraceRun;
  contextSnapshot: JsonObject;
  steps: AgentRunTraceStep[];
  toolCalls: AgentRunTraceToolCall[];
  evidenceRefs: AgentRunTraceEvidenceRef[];
  stateUpdateProposals: JsonObject[];
};

export type PortfolioHoldingInput = {
  fundCode: string;
  fundName: string;
  fundType: string;
  marketValue: number;
};

export type PortfolioSnapshotInput = {
  snapshotDate: string;
  cashValue: number;
  holdings: PortfolioHoldingInput[];
};

export type PortfolioHolding = {
  fundCode: string;
  fundName: string;
  fundType: string;
  marketValue: number;
  weight: number;
};

export type PortfolioReport = {
  snapshotId: string;
  snapshotDate: string;
  totalValue: number;
  cashValue: number;
  summary: string;
  riskExposure: string[];
  concentrationFlags: string[];
  allocationBalance: string[];
  recommendedNextActions: string[];
  holdings: PortfolioHolding[];
  generatedAt: string | null;
};

export type PortfolioLatestState = {
  report: PortfolioReport | null;
};

export type PortfolioHistoryItem = {
  snapshotId: string;
  snapshotDate: string;
  totalValue: number;
  summary: string;
  generatedAt: string | null;
};

export type PortfolioHistoryState = {
  items: PortfolioHistoryItem[];
};

export type SimulationScenario = {
  id: string;
  slug: string | null;
  title: string;
  synopsis: string;
  marketPhase: string | null;
  difficulty: string | null;
  estimatedDurationMinutes: number | null;
  decisionCount: number | null;
  startingYear: number | null;
  headline: string | null;
  description: string | null;
  setup: string | null;
  objective: string | null;
  biasFocus: string[];
  tags: string[];
  timelinePreview: string[];
  recommended: boolean;
  completed: boolean;
};

export type SimulationScenarioCatalog = {
  scenarios: SimulationScenario[];
  recommendedScenarioId: string | null;
  activeSessionId: string | null;
};

export type SimulationSessionActionChoice = {
  id: string;
  label: string;
  description: string | null;
  biasSignal: string | null;
};

export type SimulationSessionEvent = {
  id: string;
  index: number;
  title: string;
  dateLabel: string | null;
  marketContext: string | null;
  prompt: string | null;
  decisionFocus: string[];
  availableActions: SimulationSessionActionChoice[];
};

export type SimulationSession = {
  id: string;
  scenarioId: string | null;
  scenarioTitle: string | null;
  status: string;
  stageLabel: string | null;
  currentStep: number;
  totalSteps: number | null;
  startedAt: string | null;
  completedAt: string | null;
  openingBrief: string | null;
  reflectionPrompt: string | null;
  activeEvent: SimulationSessionEvent | null;
};

export type SimulationFeedback = {
  summary: string;
  impact: string | null;
  disciplineSignals: string[];
  nextPrompt: string | null;
};

export type SimulationActionResult = {
  session: SimulationSession;
  feedback: SimulationFeedback | null;
  reviewReady: boolean;
};

export type SimulationReview = {
  sessionId: string;
  scenarioId: string | null;
  scenarioTitle: string | null;
  completedAt: string | null;
  overallAssessment: string;
  outcomeSummary: string | null;
  finalDisposition: string | null;
  biasSignals: string[];
  strengths: string[];
  improvementAreas: string[];
  recommendedNextActions: string[];
  reflectionQuestions: string[];
  scoreLabel: string | null;
};

export type SimulationSessionStartInput = {
  scenarioId: string;
};

export type SimulationActionInput = {
  sessionId: string;
  eventId?: string | null;
  actionId: string;
  rationale?: string;
};

export type NewsItem = {
  id: string;
  itemType: "news" | "policy" | null;
  title: string;
  source: string | null;
  category: string | null;
  summary: string;
  url: string | null;
  publishedAt: string | null;
  impactAreas: string[];
  tags: string[];
  relevanceScore: number | null;
  latestAnalysisId: string | null;
};

export type NewsCatalogState = {
  items: NewsItem[];
  policyItems: NewsItem[];
  generatedAt: string | null;
};

export type NewsAnalysisInput = {
  itemId?: string | null;
  headline?: string;
  body?: string;
};

export type NewsAnalysis = {
  id: string | null;
  itemId: string | null;
  headline: string;
  factSummary: string;
  impactPath: string[];
  uncertainty: string[];
  riskNotice: string;
  recommendedActions: string[];
  relatedLearning: string[];
  citations: string[];
  generatedAt: string | null;
};

function resolveApiBase() {
  const rawBase =
    process.env.NEXT_PUBLIC_FUNDGENE_API_URL ?? "http://127.0.0.1:8000";
  return rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;
}

function asObject(value: unknown): JsonObject {
  return typeof value === "object" && value !== null ? (value as JsonObject) : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function asStringLike(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return asString(value);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function pickString(source: JsonObject, keys: string[]): string | null {
  for (const key of keys) {
    const value = asStringLike(source[key]);
    if (value) {
      return value;
    }
  }

  return null;
}

function pickNumber(source: JsonObject, keys: string[]): number | null {
  for (const key of keys) {
    const value = asNumber(source[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function pickStringArray(source: JsonObject, keys: string[]): string[] {
  for (const key of keys) {
    const value = asStringArray(source[key]);
    if (value.length > 0) {
      return value;
    }

    const singleValue = asStringLike(source[key]);
    if (singleValue) {
      return [singleValue];
    }
  }

  return [];
}

function pickObject(source: JsonObject, keys: string[]): JsonObject {
  for (const key of keys) {
    const value = asObject(source[key]);
    if (Object.keys(value).length > 0) {
      return value;
    }
  }

  return {};
}

function pickArray(source: JsonObject, keys: string[]): unknown[] {
  for (const key of keys) {
    const value = source[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function asRiskLevel(value: unknown): RiskLevel {
  if (
    value === "conservative" ||
    value === "balanced" ||
    value === "growth"
  ) {
    return value;
  }

  return null;
}

function asLearningStatus(value: unknown): LearningProgressStatus | null {
  if (
    value === "not_started" ||
    value === "in_progress" ||
    value === "completed"
  ) {
    return value;
  }

  return null;
}

async function request(path: string, options: RequestOptions): Promise<unknown> {
  const url = `${resolveApiBase()}${path.startsWith("/api") ? path : `/api${path}`}`;
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "request failed";

    try {
      const payload = asObject(await response.json());
      message = asString(payload.detail) ?? message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function pickSessionSource(input: unknown): JsonObject {
  const root = asObject(input);
  const nested = asObject(root.user);
  return Object.keys(nested).length > 0 ? nested : root;
}

function parseSessionUser(input: unknown): SessionUser {
  const source = pickSessionSource(input);
  const profile = asObject(source.profile);

  const id = asString(source.id) ?? asString(profile.id) ?? "unknown";
  const onboardingCompleted =
    asBoolean(source.onboarding_completed) ||
    asBoolean(profile.onboarding_completed);

  return {
    id,
    email: asString(source.email),
    profileId: asString(source.profile_id),
    onboardingCompleted,
    displayName: asString(source.display_name) ?? asString(profile.display_name),
    investingExperience:
      asString(source.investing_experience) ??
      asString(profile.investing_experience),
    monthlyContributionBand:
      asString(source.monthly_contribution_band) ??
      asString(profile.monthly_contribution_band),
    primaryGoal: asString(source.primary_goal) ?? asString(profile.primary_goal),
  };
}

function parseUserSummary(input: unknown): UserSummary {
  const source = asObject(input);
  return {
    id: asString(source.id) ?? "unknown",
    displayName: asString(source.display_name) ?? "新用户",
    investingExperience: asString(source.investing_experience) ?? "beginner",
    monthlyContributionBand: asString(source.monthly_contribution_band),
    primaryGoal: asString(source.primary_goal),
    onboardingCompleted: asBoolean(source.onboarding_completed),
  };
}

function parseBehaviorProfile(input: unknown): BehaviorProfile {
  const source = asObject(input);
  return {
    userId: asString(source.user_id) ?? "unknown",
    riskLevel: asRiskLevel(source.risk_level),
    biasTags: asStringArray(source.bias_tags),
    evidence: asStringArray(source.evidence),
    updatedAt: asString(source.updated_at),
  };
}

function parseDashboardSummaryCards(input: unknown): DashboardSummaryCard[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      const card = asObject(item);
      const label = asString(card.label);
      const value = asString(card.value);
      const detail = asString(card.detail);

      if (!label || !value || !detail) {
        return null;
      }

      return { label, value, detail };
    })
    .filter((item): item is DashboardSummaryCard => item !== null);
}

function parseDashboardCoachActivity(input: unknown): DashboardCoachActivity | null {
  const source = asObject(input);
  const sessionId = asString(source.session_id);
  const topic = asString(source.topic);
  const question = asString(source.question);
  const answerFocus = asString(source.answer_focus);

  if (!sessionId || !topic || !question || !answerFocus) {
    return null;
  }

  return {
    sessionId,
    topic,
    intent: asString(source.intent),
    question,
    answerFocus,
    recommendedAction: asString(source.recommended_action),
    updatedAt: asString(source.updated_at),
  };
}

function parseDashboardLearningStatus(
  input: unknown,
): DashboardLearningStatus | null {
  const source = asObject(input);
  const overallProgressPercentage = asNumber(source.overall_progress_percentage);
  const completedCoursesCount = asNumber(source.completed_courses_count);
  const totalCourses = asNumber(source.total_courses);

  if (
    overallProgressPercentage === null ||
    completedCoursesCount === null ||
    totalCourses === null
  ) {
    return null;
  }

  return {
    overallProgressPercentage,
    completedCoursesCount,
    totalCourses,
    recommendedCourseSlug: asString(source.recommended_course_slug),
    recommendedCourseTitle: asString(source.recommended_course_title),
  };
}

function parseDashboardPortfolioStatus(
  input: unknown,
): DashboardPortfolioStatus | null {
  const source = asObject(input);
  const hasReport = asBoolean(source.has_report);
  const hasAnyField =
    hasReport ||
    asString(source.latest_snapshot_id) !== null ||
    asString(source.latest_snapshot_date) !== null ||
    asNumber(source.total_value) !== null ||
    asString(source.summary) !== null;

  if (!hasAnyField) {
    return null;
  }

  return {
    hasReport,
    latestSnapshotId: asString(source.latest_snapshot_id),
    latestSnapshotDate: asString(source.latest_snapshot_date),
    totalValue: asNumber(source.total_value),
    summary: asString(source.summary),
  };
}

function parseDashboardSimulationStatus(
  input: unknown,
): DashboardSimulationStatus | null {
  const source = asObject(input);
  const completedSessionsCount = pickNumber(source, [
    "completed_sessions_count",
    "completedSessionsCount",
  ]);
  const hasAnyField =
    completedSessionsCount !== null ||
    pickString(source, ["recommended_scenario_slug", "recommendedScenarioSlug"]) !== null ||
    pickString(source, ["latest_session_id", "latestSessionId"]) !== null ||
    pickString(source, ["latest_review_summary", "latestReviewSummary"]) !== null;

  if (!hasAnyField) {
    return null;
  }

  return {
    completedSessionsCount: completedSessionsCount ?? 0,
    recommendedScenarioSlug: pickString(source, [
      "recommended_scenario_slug",
      "recommendedScenarioSlug",
    ]),
    recommendedScenarioTitle: pickString(source, [
      "recommended_scenario_title",
      "recommendedScenarioTitle",
    ]),
    latestSessionId: pickString(source, ["latest_session_id", "latestSessionId"]),
    latestScenarioSlug: pickString(source, [
      "latest_scenario_slug",
      "latestScenarioSlug",
    ]),
    latestScenarioTitle: pickString(source, [
      "latest_scenario_title",
      "latestScenarioTitle",
    ]),
    latestReviewSummary: pickString(source, [
      "latest_review_summary",
      "latestReviewSummary",
    ]),
    latestCompletedAt: pickString(source, [
      "latest_completed_at",
      "latestCompletedAt",
    ]),
  };
}

function parseDashboardNewsStatus(input: unknown): DashboardNewsStatus | null {
  const source = asObject(input);
  const hasAnalysis =
    asBoolean(source.has_analysis) || asBoolean(source.hasAnalysis);
  const hasAnyField =
    hasAnalysis ||
    pickString(source, ["latest_analysis_id", "latestAnalysisId"]) !== null ||
    pickString(source, ["latest_title", "latestTitle"]) !== null ||
    pickString(source, ["beginner_translation", "beginnerTranslation"]) !== null;

  if (!hasAnyField) {
    return null;
  }

  return {
    hasAnalysis,
    latestAnalysisId: pickString(source, [
      "latest_analysis_id",
      "latestAnalysisId",
    ]),
    latestItemId: pickString(source, ["latest_item_id", "latestItemId"]),
    latestItemType: pickString(source, ["latest_item_type", "latestItemType"]),
    latestTitle: pickString(source, ["latest_title", "latestTitle"]),
    sourceName: pickString(source, ["source_name", "sourceName"]),
    beginnerTranslation: pickString(source, [
      "beginner_translation",
      "beginnerTranslation",
    ]),
    recommendedAction: pickString(source, [
      "recommended_action",
      "recommendedAction",
    ]),
    generatedAt: pickString(source, ["generated_at", "generatedAt"]),
  };
}

function parseDashboard(input: unknown): DashboardState {
  const source = asObject(input);
  return {
    userId: asString(source.user_id) ?? "unknown",
    onboardingCompleted: asBoolean(source.onboarding_completed),
    riskLevel: asRiskLevel(source.risk_level),
    biasTags: asStringArray(source.bias_tags),
    latestRiskScore: asNumber(source.latest_risk_score),
    nextActions: asStringArray(source.next_actions),
    summaryCards: parseDashboardSummaryCards(source.summary_cards),
    learningStatus: parseDashboardLearningStatus(source.learning_status),
    portfolioStatus: parseDashboardPortfolioStatus(source.portfolio_status),
    simulationStatus: parseDashboardSimulationStatus(
      source.simulation_status ?? source.simulationStatus,
    ),
    newsStatus: parseDashboardNewsStatus(source.news_status ?? source.newsStatus),
    latestCoachActivity: parseDashboardCoachActivity(source.latest_coach_activity),
  };
}

function parseAdvisorStructuredResponse(
  input: unknown,
): AdvisorStructuredResponse | null {
  const source = asObject(input);
  const answer = asString(source.answer);
  const intent = asString(source.intent);
  const riskNotice = asString(source.risk_notice);

  if (!answer || !intent || !riskNotice) {
    return null;
  }

  return {
    answer,
    intent,
    citations: asStringArray(source.citations),
    riskNotice,
    recommendedActions: asStringArray(source.recommended_actions),
    followUpQuestions: asStringArray(source.follow_up_questions),
  };
}

function parseAssistantSessionSummary(input: unknown): AssistantSessionSummary | null {
  const source = asObject(input);
  const id = asString(source.id);
  const topic = asString(source.topic);
  const contextType = asString(source.context_type);

  if (!id || !topic || !contextType) {
    return null;
  }

  return {
    id,
    topic,
    contextType,
    latestIntent: asString(source.latest_intent),
    lastQuestion: asString(source.last_question),
    lastAnswerPreview: asString(source.last_answer_preview),
    lastRecommendedAction: asString(source.last_recommended_action),
    createdAt: asString(source.created_at),
    updatedAt: asString(source.updated_at),
  };
}

function parseAssistantConversationMessage(
  input: unknown,
): AssistantConversationMessage | null {
  const source = asObject(input);
  const id = asString(source.id);
  const role = asString(source.role);
  const content = asString(source.content);
  const messageType = asString(source.message_type);

  if (!id || (role !== "user" && role !== "assistant") || !content || !messageType) {
    return null;
  }

  return {
    id,
    role,
    content,
    messageType,
    createdAt: asString(source.created_at),
    agentRunId: asString(source.agent_run_id),
    advisorResponse: parseAdvisorStructuredResponse(source.advisor_response),
  };
}

function parseAssistantConversation(input: unknown): AssistantConversationState {
  const source = asObject(input);
  const rawMessages = Array.isArray(source.messages) ? source.messages : [];

  return {
    session: parseAssistantSessionSummary(source.session),
    messages: rawMessages
      .map((item) => parseAssistantConversationMessage(item))
      .filter((item): item is AssistantConversationMessage => item !== null),
  };
}

function parseAgentRunTraceRun(input: unknown, fallbackRunId: string): AgentRunTraceRun {
  const source = asObject(input);

  return {
    id: pickString(source, ["id", "run_id", "runId"]) ?? fallbackRunId,
    intent: pickString(source, ["intent"]),
    runStatus: pickString(source, ["runStatus", "run_status", "status"]),
    policyStatus: pickString(source, ["policyStatus", "policy_status"]),
    orchestratorVersion: pickString(source, [
      "orchestratorVersion",
      "orchestrator_version",
    ]),
    startedAt: pickString(source, ["startedAt", "started_at"]),
    completedAt: pickString(source, ["completedAt", "completed_at"]),
    latencyMs: pickNumber(source, ["latencyMs", "latency_ms"]),
    fallbackReason: pickString(source, ["fallbackReason", "fallback_reason"]),
    toolTrace: pickObject(source, ["toolTrace", "tool_trace"]),
  };
}

function parseAgentRunTraceStep(input: unknown, index: number): AgentRunTraceStep {
  const source = asObject(input);
  const sequence = pickNumber(source, ["sequence"]);

  return {
    id:
      pickString(source, ["id", "step_id", "stepId"]) ??
      `step-${sequence ?? index + 1}`,
    stepName:
      pickString(source, ["stepName", "step_name", "name"]) ??
      `步骤 ${sequence ?? index + 1}`,
    sequence,
    status: pickString(source, ["status"]),
    latencyMs: pickNumber(source, ["latencyMs", "latency_ms"]),
    inputPayload: pickObject(source, ["inputPayload", "input_payload"]),
    outputPayload: pickObject(source, ["outputPayload", "output_payload"]),
    error: pickString(source, ["error"]),
  };
}

function parseAgentRunTraceToolCall(
  input: unknown,
  index: number,
): AgentRunTraceToolCall {
  const source = asObject(input);

  return {
    id:
      pickString(source, ["id", "tool_call_id", "toolCallId"]) ??
      `tool-${index + 1}`,
    stepId: pickString(source, ["stepId", "step_id"]),
    toolName:
      pickString(source, ["toolName", "tool_name", "name"]) ??
      `工具 ${index + 1}`,
    permissionLevel: pickString(source, [
      "permissionLevel",
      "permission_level",
    ]),
    status: pickString(source, ["status"]),
    latencyMs: pickNumber(source, ["latencyMs", "latency_ms"]),
    inputPayload: pickObject(source, ["inputPayload", "input_payload"]),
    outputPayload: pickObject(source, ["outputPayload", "output_payload"]),
    error: pickString(source, ["error"]),
  };
}

function parseAgentRunTraceEvidenceRef(
  input: unknown,
  index: number,
): AgentRunTraceEvidenceRef {
  const source = asObject(input);

  return {
    id:
      pickString(source, ["id", "evidence_ref_id", "evidenceRefId"]) ??
      `evidence-${index + 1}`,
    stepId: pickString(source, ["stepId", "step_id"]),
    workerName: pickString(source, ["workerName", "worker_name"]),
    sourceType: pickString(source, ["sourceType", "source_type"]),
    sourceId: pickString(source, ["sourceId", "source_id"]),
    sourceVersion: pickString(source, ["sourceVersion", "source_version"]),
    quoteOrSummary: pickString(source, ["quoteOrSummary", "quote_or_summary"]),
    claim: pickString(source, ["claim"]),
    supportSummary: pickString(source, ["supportSummary", "support_summary"]),
  };
}

function parseAgentRunTrace(
  input: unknown,
  fallbackRunId: string,
): AgentRunTrace {
  const source = asObject(input);

  return {
    run: parseAgentRunTraceRun(source.run, fallbackRunId),
    contextSnapshot: pickObject(source, ["contextSnapshot", "context_snapshot"]),
    steps: pickArray(source, ["steps"]).map((item, index) =>
      parseAgentRunTraceStep(item, index),
    ),
    toolCalls: pickArray(source, ["toolCalls", "tool_calls"]).map((item, index) =>
      parseAgentRunTraceToolCall(item, index),
    ),
    evidenceRefs: pickArray(source, ["evidenceRefs", "evidence_refs"]).map(
      (item, index) => parseAgentRunTraceEvidenceRef(item, index),
    ),
    stateUpdateProposals: pickArray(source, [
      "stateUpdateProposals",
      "state_update_proposals",
    ]).map((item) => asObject(item)),
  };
}

function parseLearningCourseSummary(input: unknown): LearningCourseSummary | null {
  const source = asObject(input);
  const slug = asString(source.slug);
  const title = asString(source.title);
  const focus = asString(source.focus);
  const description = asString(source.description);
  const estimatedDurationMinutes = asNumber(source.estimated_duration_minutes);
  const sectionCount = asNumber(source.section_count);
  const completedSectionCount = asNumber(source.completed_section_count);
  const progressPercentage = asNumber(source.progress_percentage);
  const status = asLearningStatus(source.status);

  if (
    !slug ||
    !title ||
    !focus ||
    !description ||
    estimatedDurationMinutes === null ||
    sectionCount === null ||
    completedSectionCount === null ||
    progressPercentage === null ||
    status === null
  ) {
    return null;
  }

  return {
    slug,
    title,
    focus,
    description,
    estimatedDurationMinutes,
    sectionCount,
    completedSectionCount,
    progressPercentage,
    status,
    nextSectionSlug: asString(source.next_section_slug),
    nextSectionTitle: asString(source.next_section_title),
  };
}

function parseLearningPath(input: unknown): LearningPathState {
  const source = asObject(input);
  const rawCourses = Array.isArray(source.courses) ? source.courses : [];

  return {
    pathSlug: asString(source.path_slug) ?? "beginner-core-path",
    title: asString(source.title) ?? "Learning path",
    description: asString(source.description) ?? "",
    overallProgressPercentage: asNumber(source.overall_progress_percentage) ?? 0,
    completedCoursesCount: asNumber(source.completed_courses_count) ?? 0,
    totalCourses: asNumber(source.total_courses) ?? 0,
    recommendedCourseSlug: asString(source.recommended_course_slug),
    recommendedCourseTitle: asString(source.recommended_course_title),
    courses: rawCourses
      .map((item) => parseLearningCourseSummary(item))
      .filter((item): item is LearningCourseSummary => item !== null),
  };
}

function parseLearningSectionDetail(input: unknown): LearningSectionDetail | null {
  const source = asObject(input);
  const slug = asString(source.slug);
  const title = asString(source.title);
  const summary = asString(source.summary);
  const estimatedDurationMinutes = asNumber(source.estimated_duration_minutes);
  const position = asNumber(source.position);

  if (
    !slug ||
    !title ||
    !summary ||
    estimatedDurationMinutes === null ||
    position === null
  ) {
    return null;
  }

  return {
    slug,
    title,
    summary,
    estimatedDurationMinutes,
    position,
    completed: asBoolean(source.completed),
  };
}

function parseLearningCourseDetail(input: unknown): LearningCourseDetail {
  const source = asObject(input);
  const rawSections = Array.isArray(source.sections) ? source.sections : [];

  return {
    pathSlug: asString(source.path_slug) ?? "beginner-core-path",
    pathTitle: asString(source.path_title) ?? "Learning path",
    courseSlug: asString(source.course_slug) ?? "unknown-course",
    title: asString(source.title) ?? "Untitled course",
    focus: asString(source.focus) ?? "",
    description: asString(source.description) ?? "",
    estimatedDurationMinutes: asNumber(source.estimated_duration_minutes) ?? 0,
    sectionCount: asNumber(source.section_count) ?? 0,
    completedSectionCount: asNumber(source.completed_section_count) ?? 0,
    progressPercentage: asNumber(source.progress_percentage) ?? 0,
    status: asLearningStatus(source.status) ?? "not_started",
    nextSectionSlug: asString(source.next_section_slug),
    nextSectionTitle: asString(source.next_section_title),
    sections: rawSections
      .map((item) => parseLearningSectionDetail(item))
      .filter((item): item is LearningSectionDetail => item !== null),
  };
}

function parseLearningProgressUpdate(input: unknown): LearningProgressUpdate {
  const source = asObject(input);
  return {
    courseSlug: asString(source.course_slug) ?? "unknown-course",
    progressPercentage: asNumber(source.progress_percentage) ?? 0,
    completedSectionCount: asNumber(source.completed_section_count) ?? 0,
    sectionCount: asNumber(source.section_count) ?? 0,
    status: asLearningStatus(source.status) ?? "not_started",
    nextSectionSlug: asString(source.next_section_slug),
    nextSectionTitle: asString(source.next_section_title),
  };
}

function parsePortfolioHolding(input: unknown): PortfolioHolding | null {
  const source = asObject(input);
  const fundCode = asString(source.fund_code);
  const fundName = asString(source.fund_name);
  const fundType = asString(source.fund_type);
  const marketValue = asNumber(source.market_value);
  const weight = asNumber(source.weight);

  if (!fundCode || !fundName || !fundType || marketValue === null || weight === null) {
    return null;
  }

  return {
    fundCode,
    fundName,
    fundType,
    marketValue,
    weight,
  };
}

function parsePortfolioReport(input: unknown): PortfolioReport | null {
  const source = asObject(input);
  const snapshotId = asString(source.snapshot_id);
  const snapshotDate = asString(source.snapshot_date);
  const totalValue = asNumber(source.total_value);
  const cashValue = asNumber(source.cash_value);
  const summary = asString(source.summary);
  const rawHoldings = Array.isArray(source.holdings) ? source.holdings : [];

  if (
    !snapshotId ||
    !snapshotDate ||
    totalValue === null ||
    cashValue === null ||
    !summary
  ) {
    return null;
  }

  return {
    snapshotId,
    snapshotDate,
    totalValue,
    cashValue,
    summary,
    riskExposure: asStringArray(source.risk_exposure),
    concentrationFlags: asStringArray(source.concentration_flags),
    allocationBalance: asStringArray(source.allocation_balance),
    recommendedNextActions: asStringArray(source.recommended_next_actions),
    holdings: rawHoldings
      .map((item) => parsePortfolioHolding(item))
      .filter((item): item is PortfolioHolding => item !== null),
    generatedAt: asString(source.generated_at),
  };
}

function parsePortfolioLatest(input: unknown): PortfolioLatestState {
  const source = asObject(input);
  return {
    report: parsePortfolioReport(source.report),
  };
}

function parsePortfolioHistoryItem(input: unknown): PortfolioHistoryItem | null {
  const source = asObject(input);
  const snapshotId = asString(source.snapshot_id);
  const snapshotDate = asString(source.snapshot_date);
  const totalValue = asNumber(source.total_value);
  const summary = asString(source.summary);

  if (!snapshotId || !snapshotDate || totalValue === null || !summary) {
    return null;
  }

  return {
    snapshotId,
    snapshotDate,
    totalValue,
    summary,
    generatedAt: asString(source.generated_at),
  };
}

function parsePortfolioHistory(input: unknown): PortfolioHistoryState {
  const source = asObject(input);
  const rawItems = Array.isArray(source.items) ? source.items : [];

  return {
    items: rawItems
      .map((item) => parsePortfolioHistoryItem(item))
      .filter((item): item is PortfolioHistoryItem => item !== null),
  };
}

function parseSimulationScenario(input: unknown): SimulationScenario | null {
  const source = asObject(input);
  const id = pickString(source, ["id", "scenario_id", "slug"]);
  const title = pickString(source, ["title", "name"]);
  const synopsis = pickString(source, ["synopsis", "summary", "description"]);

  if (!id || !title || !synopsis) {
    return null;
  }

  const timelinePreview = pickStringArray(source, [
    "timeline_preview",
    "key_events",
    "step_titles",
  ]);

  return {
    id,
    slug: pickString(source, ["slug"]),
    title,
    synopsis,
    marketPhase: pickString(source, ["market_phase", "phase_label", "theme"]),
    difficulty: pickString(source, ["difficulty", "difficulty_label", "level"]),
    estimatedDurationMinutes: pickNumber(source, [
      "estimated_duration_minutes",
      "duration_minutes",
    ]),
    decisionCount:
      pickNumber(source, [
        "decision_count",
        "events_count",
        "steps_count",
        "event_count",
      ]) ??
      (timelinePreview.length > 0 ? timelinePreview.length : null),
    startingYear: pickNumber(source, ["starting_year", "year"]),
    headline: pickString(source, ["headline", "hero_headline"]),
    description: pickString(source, ["description", "summary", "synopsis"]),
    setup: pickString(source, ["setup", "background", "context"]),
    objective: pickString(source, ["objective", "goal", "training_goal"]),
    biasFocus: pickStringArray(source, [
      "bias_focus",
      "behavior_focus",
      "bias_tags",
    ]),
    tags: pickStringArray(source, ["tags", "focus_tags"]),
    timelinePreview,
    recommended:
      asBoolean(source.recommended) || asBoolean(source.is_recommended),
    completed: asBoolean(source.completed) || asBoolean(source.is_completed),
  };
}

function parseSimulationScenarioCatalog(
  input: unknown,
): SimulationScenarioCatalog {
  if (Array.isArray(input)) {
    return {
      scenarios: input
        .map((item) => parseSimulationScenario(item))
        .filter((item): item is SimulationScenario => item !== null),
      recommendedScenarioId: null,
      activeSessionId: null,
    };
  }

  const source = asObject(input);
  const rawScenarios = pickArray(source, ["scenarios", "items"]);
  const recommendedScenarioId = pickString(source, [
    "recommended_scenario_id",
    "recommended_scenario_slug",
  ]);
  const activeSessionId =
    pickString(source, ["active_session_id"]) ??
    rawScenarios
      .map((item) => asObject(item))
      .map((item) => pickString(item, ["active_session_id"]))
      .find((value) => Boolean(value)) ??
    null;

  return {
    scenarios: rawScenarios
      .map((item) => {
        const parsed = parseSimulationScenario(item);
        if (!parsed) {
          return null;
        }

        const rawItem = asObject(item);
        const status = pickString(rawItem, ["status"]);
        const scenarioId = parsed.slug ?? parsed.id;

        return {
          ...parsed,
          recommended:
            parsed.recommended ||
            (recommendedScenarioId !== null && scenarioId === recommendedScenarioId),
          completed: parsed.completed || status === "completed",
        };
      })
      .filter((item): item is SimulationScenario => item !== null),
    recommendedScenarioId,
    activeSessionId,
  };
}

function parseSimulationSessionActionChoice(
  input: unknown,
): SimulationSessionActionChoice | null {
  const source = asObject(input);
  const id = pickString(source, ["id", "action_id", "slug", "key", "choice_key"]);
  const label = pickString(source, ["label", "title", "action"]);

  if (!id || !label) {
    return null;
  }

  return {
    id,
    label,
    description: pickString(source, [
      "description",
      "rationale_hint",
      "explanation",
    ]),
    biasSignal:
      pickString(source, ["bias_signal", "behavior_signal"]) ??
      asStringArray(source.signals)[0] ??
      null,
  };
}

function parseSimulationSessionEvent(
  input: unknown,
): SimulationSessionEvent | null {
  const source = asObject(input);
  const index =
    pickNumber(source, ["step_index", "position", "index", "sequence"]) ?? 1;
  const title =
    pickString(source, ["title", "headline", "label"]) ?? `关键节点 ${index}`;
  const availableActions = pickArray(source, [
    "available_actions",
    "actions",
    "choices",
  ])
    .map((item) => parseSimulationSessionActionChoice(item))
    .filter((item): item is SimulationSessionActionChoice => item !== null);
  const id =
    pickString(source, ["id", "event_id", "step_id"]) ?? `event-${index}`;

  return {
    id,
    index,
    title,
    dateLabel: pickString(source, ["date_label", "as_of_label", "date"]),
    marketContext: pickString(source, [
      "market_context",
      "context",
      "brief",
      "summary",
      "narrative",
    ]),
    prompt: pickString(source, ["prompt", "question", "decision_prompt"]),
    decisionFocus: pickStringArray(source, [
      "decision_focus",
      "focus_tags",
      "bias_focus",
    ]),
    availableActions,
  };
}

function parseSimulationSession(input: unknown): SimulationSession | null {
  const source = asObject(input);
  const nestedScenario = pickObject(source, ["scenario"]);
  const id = pickString(source, ["id", "session_id"]);

  if (!id) {
    return null;
  }

  const activeEvent = parseSimulationSessionEvent(
    source.active_event ?? source.current_event ?? source.event,
  );
  const completedAt = pickString(source, ["completed_at"]);
  const status =
    pickString(source, ["status", "state"]) ??
    (completedAt || !activeEvent ? "completed" : "in_progress");

  return {
    id,
    scenarioId:
      pickString(source, ["scenario_id", "scenario_slug"]) ??
      pickString(nestedScenario, ["id", "scenario_id", "slug"]),
    scenarioTitle:
      pickString(source, ["scenario_title"]) ??
      pickString(nestedScenario, ["title", "name"]),
    status,
    stageLabel: pickString(source, ["stage_label", "phase_label"]),
    currentStep:
      pickNumber(source, ["current_step", "current_event_index"]) ??
      activeEvent?.index ??
      1,
    totalSteps:
      pickNumber(source, ["total_steps", "total_events"]) ??
      pickNumber(nestedScenario, ["decision_count", "events_count", "steps_count"]),
    startedAt: pickString(source, ["started_at", "created_at"]),
    completedAt,
    openingBrief:
      pickString(source, ["opening_brief", "introduction", "setup", "background"]) ??
      activeEvent?.marketContext ??
      null,
    reflectionPrompt: pickString(source, [
      "reflection_prompt",
      "rationale_prompt",
      "next_prompt",
    ]) ??
      activeEvent?.prompt ??
      null,
    activeEvent,
  };
}

function parseSimulationFeedback(input: unknown): SimulationFeedback | null {
  const source = asObject(input);
  const summary = pickString(source, ["summary", "feedback", "message"]);
  const impact = pickString(source, ["impact", "consequence"]);
  const nextPrompt = pickString(source, ["next_prompt", "reflection_prompt"]);
  const disciplineSignals = pickStringArray(source, [
    "discipline_signals",
    "behavior_signals",
    "bias_signals",
  ]);

  if (!summary && !impact && !nextPrompt && disciplineSignals.length === 0) {
    return null;
  }

  return {
    summary: summary ?? impact ?? nextPrompt ?? "已记录本次动作。",
    impact,
    disciplineSignals,
    nextPrompt,
  };
}

function parseSimulationActionResult(input: unknown): SimulationActionResult {
  const source = asObject(input);
  const session =
    parseSimulationSession(source.session) ?? parseSimulationSession(source);

  if (!session) {
    throw new ApiError(500, "Simulation session payload is invalid.");
  }

  const feedback = parseSimulationFeedback(
    source.feedback ?? source.decision_feedback ?? source.result,
  );

  return {
    session,
    feedback,
    reviewReady:
      asBoolean(source.review_ready) ||
      asBoolean(source.has_review) ||
      session.status === "completed" ||
      (session.activeEvent === null && session.completedAt !== null),
  };
}

function parseSimulationReview(
  input: unknown,
  fallbackSessionId: string,
): SimulationReview {
  const source = asObject(input);
  const nestedReview = pickObject(source, ["review"]);
  const reviewSource =
    Object.keys(nestedReview).length > 0 ? nestedReview : source;

  return {
    sessionId:
      pickString(reviewSource, ["session_id"]) ??
      pickString(source, ["session_id"]) ??
      fallbackSessionId,
    scenarioId:
      pickString(reviewSource, ["scenario_id", "scenario_slug"]) ??
      pickString(source, ["scenario_id", "scenario_slug"]),
    scenarioTitle:
      pickString(reviewSource, ["scenario_title"]) ??
      pickString(source, ["scenario_title"]),
    completedAt:
      pickString(reviewSource, ["completed_at", "generated_at"]) ??
      pickString(source, ["completed_at", "generated_at"]),
    overallAssessment:
      pickString(reviewSource, [
        "overall_assessment",
        "summary",
        "overall_summary",
        "review_summary",
        "decision_summary",
      ]) ?? "复盘已生成。",
    outcomeSummary: pickString(reviewSource, [
      "outcome_summary",
      "what_happened",
      "market_outcome",
      "coach_feedback",
    ]),
    finalDisposition: pickString(reviewSource, [
      "final_disposition",
      "behavior_verdict",
      "training_result",
      "bias_focus",
    ]),
    biasSignals: (() => {
      const directSignals = pickStringArray(reviewSource, [
        "bias_signals",
        "behavior_signals",
        "exposed_biases",
      ]);
      if (directSignals.length > 0) {
        return directSignals;
      }

      const biasFocus = pickString(reviewSource, ["bias_focus"]);
      return biasFocus ? [biasFocus] : [];
    })(),
    strengths: pickStringArray(reviewSource, [
      "strengths",
      "what_went_well",
      "positive_signals",
    ]),
    improvementAreas: pickStringArray(reviewSource, [
      "improvement_areas",
      "what_to_improve",
      "missed_opportunities",
      "bias_observations",
    ]),
    recommendedNextActions: pickStringArray(reviewSource, [
      "recommended_next_actions",
      "next_actions",
    ]),
    reflectionQuestions: pickStringArray(reviewSource, [
      "reflection_questions",
      "follow_up_questions",
    ]),
    scoreLabel: pickString(reviewSource, [
      "score_label",
      "discipline_score_label",
      "score",
    ]),
  };
}

function parseNewsItem(input: unknown): NewsItem | null {
  const source = asObject(input);
  const id = pickString(source, ["id", "news_id", "item_id", "slug", "url"]);
  const title = pickString(source, ["title", "headline", "name"]);
  const summary = pickString(source, [
    "summary",
    "description",
    "excerpt",
    "brief",
    "body",
  ]);

  if (!id || !title || !summary) {
    return null;
  }

  return {
    id,
    itemType:
      pickString(source, ["item_type", "itemType", "type"]) === "policy"
        ? "policy"
        : pickString(source, ["item_type", "itemType", "type"]) === "news"
          ? "news"
          : null,
    title,
    source: pickString(source, [
      "source",
      "source_name",
      "publisher",
      "provider",
    ]),
    category: pickString(source, [
      "category",
      "item_type",
      "type",
      "topic",
      "policy_area",
    ]),
    summary,
    url: pickString(source, ["url", "link"]),
    publishedAt: pickString(source, [
      "published_at",
      "publishedAt",
      "date",
      "created_at",
    ]),
    impactAreas: pickStringArray(source, [
      "impact_areas",
      "impactAreas",
      "affected_areas",
      "themes",
    ]),
    tags: pickStringArray(source, ["tags", "labels", "keywords"]),
    relevanceScore: pickNumber(source, [
      "relevance_score",
      "relevanceScore",
      "score",
    ]),
    latestAnalysisId: pickString(source, [
      "latest_analysis_id",
      "latestAnalysisId",
    ]),
  };
}

function parseNewsCatalog(input: unknown): NewsCatalogState {
  if (Array.isArray(input)) {
    return {
      items: input
        .map((item) => parseNewsItem(item))
        .filter((item): item is NewsItem => item !== null),
      policyItems: [],
      generatedAt: null,
    };
  }

  const source = asObject(input);
  const rawItems = pickArray(source, ["items", "news", "news_items", "articles"]);
  const rawPolicyItems = pickArray(source, [
    "policy_items",
    "policy",
    "policyItems",
  ]);

  return {
    items: rawItems
      .map((item) => parseNewsItem(item))
      .filter((item): item is NewsItem => item !== null),
    policyItems: rawPolicyItems
      .map((item) => parseNewsItem(item))
      .filter((item): item is NewsItem => item !== null),
    generatedAt: pickString(source, ["generated_at", "updated_at", "as_of"]),
  };
}

function parseNewsAnalysis(input: unknown): NewsAnalysis {
  const source = asObject(input);
  const nested = pickObject(source, ["analysis", "result"]);
  const analysisSource = Object.keys(nested).length > 0 ? nested : source;
  const itemSource = pickObject(analysisSource, ["item", "news_item", "policy_item"]);
  const facts = pickStringArray(analysisSource, ["facts", "fact_list"]);
  const citationStrings = pickStringArray(analysisSource, [
    "citations",
    "sources",
  ]);
  const citationObjects = pickArray(analysisSource, ["citations", "sources"])
    .map((item) => {
      const citation = asObject(item);
      const title = pickString(citation, ["title", "source_name", "url"]);
      const url = pickString(citation, ["url", "link"]);
      if (title && url) {
        return `${title} (${url})`;
      }
      return title ?? url;
    })
    .filter((item): item is string => item !== null);
  const headline =
    pickString(analysisSource, ["headline", "title", "news_title"]) ??
    pickString(itemSource, ["title", "headline", "name"]) ??
    pickString(source, ["headline", "title"]) ??
    "新闻解读";
  const factSummary =
    pickString(analysisSource, [
      "fact_summary",
      "summary",
      "beginner_translation",
      "what_happened",
      "answer",
    ]) ??
    (facts.length > 0
      ? facts.join(" ")
      : "后端已返回解读结果，但没有提供事实摘要字段。");
  const riskNotice =
    pickString(analysisSource, ["risk_notice", "riskNotice", "disclaimer"]) ??
    "资讯解读只帮助理解事实与影响路径，不构成买卖建议。";

  return {
    id: pickString(analysisSource, ["id", "analysis_id"]),
    itemId:
      pickString(analysisSource, ["item_id", "news_id"]) ??
      pickString(itemSource, ["id", "item_id", "news_id"]) ??
      pickString(source, ["item_id", "news_id"]),
    headline,
    factSummary,
    impactPath: pickStringArray(analysisSource, [
      "impact_paths",
      "impact_path",
      "impactPath",
      "impact_analysis",
      "influence_chain",
    ]),
    uncertainty: pickStringArray(analysisSource, [
      "uncertainty_notes",
      "uncertainty",
      "uncertainties",
      "unknowns",
    ]),
    riskNotice,
    recommendedActions: pickStringArray(analysisSource, [
      "recommended_next_actions",
      "recommended_actions",
      "next_actions",
      "recommendedNextActions",
    ]),
    relatedLearning: pickStringArray(analysisSource, [
      "related_learning_topics",
      "related_learning",
      "learning_links",
      "relatedLearning",
    ]),
    citations:
      citationStrings.length > 0 ? citationStrings : citationObjects,
    generatedAt:
      pickString(analysisSource, ["generated_at", "created_at"]) ??
      pickString(source, ["generated_at", "created_at"]),
  };
}

export async function registerAuthAccount(
  input: AuthCredentialsInput,
): Promise<void> {
  await request("/api/auth/register", {
    method: "POST",
    body: {
      email: input.email.trim(),
      password: input.password,
    },
  });
}

export async function loginAuthAccount(
  input: AuthCredentialsInput,
): Promise<void> {
  await request("/api/auth/login", {
    method: "POST",
    body: {
      email: input.email.trim(),
      password: input.password,
    },
  });
}

export async function logoutAuthSession(): Promise<void> {
  await request("/api/auth/logout", { method: "POST" });
}

export async function getSessionUser(): Promise<SessionUser> {
  const payload = await request("/api/auth/session", {});
  return parseSessionUser(payload);
}

export async function getCurrentUser(): Promise<UserSummary> {
  const payload = await request("/api/users/me", {});
  return parseUserSummary(payload);
}

export async function upsertOnboardingProfile(
  input: OnboardingProfileInput,
): Promise<UserSummary> {
  const payload = await request("/api/onboarding/profile", {
    method: "POST",
    body: {
      display_name: input.displayName,
      investing_experience: input.investingExperience,
      monthly_contribution_band: input.monthlyContributionBand,
      primary_goal: input.primaryGoal,
    },
  });

  const source = asObject(payload);
  return parseUserSummary(source.user);
}

export async function submitRiskQuestionnaire(
  input: QuestionnaireInput,
): Promise<BehaviorProfile> {
  const payload = await request("/api/behavior/questionnaires", {
    method: "POST",
    body: {
      questionnaire_version: "v1",
      answers: input.answers,
    },
  });

  return parseBehaviorProfile(payload);
}

export async function getBehaviorProfile(): Promise<BehaviorProfile> {
  const payload = await request("/api/behavior/profile", {});
  return parseBehaviorProfile(payload);
}

export async function getDashboardState(): Promise<DashboardState> {
  const payload = await request("/api/dashboard", {});
  return parseDashboard(payload);
}

export async function getLearningPath(): Promise<LearningPathState> {
  const payload = await request("/api/learning/path", {});
  return parseLearningPath(payload);
}

export async function getLearningCourse(
  courseSlug: string,
): Promise<LearningCourseDetail> {
  const payload = await request(`/api/learning/courses/${courseSlug}`, {});
  return parseLearningCourseDetail(payload);
}

export async function updateLearningProgress(
  input: LearningProgressInput,
): Promise<LearningProgressUpdate> {
  const payload = await request("/api/learning/progress", {
    method: "POST",
    body: {
      course_slug: input.courseSlug,
      section_slug: input.sectionSlug,
      status: "completed",
    },
  });

  return parseLearningProgressUpdate(payload);
}

export async function getAssistantSession(): Promise<AssistantConversationState> {
  const payload = await request("/api/assistant/session", {});
  return parseAssistantConversation(payload);
}

export async function sendAssistantMessage(
  input: AssistantMessageInput,
): Promise<AssistantConversationState> {
  const payload = await request("/api/assistant/messages", {
    method: "POST",
    body: {
      message: input.message.trim(),
      session_id: input.sessionId ?? undefined,
    },
  });

  return parseAssistantConversation(payload);
}

export async function getAgentRunTrace(runId: string): Promise<AgentRunTrace> {
  const payload = await request(`/api/assistant/runs/${runId}/trace`, {});
  return parseAgentRunTrace(payload, runId);
}

export async function createPortfolioSnapshot(
  input: PortfolioSnapshotInput,
): Promise<PortfolioReport> {
  const payload = await request("/api/portfolio/snapshots", {
    method: "POST",
    body: {
      snapshot_date: input.snapshotDate,
      cash_value: input.cashValue,
      holdings: input.holdings.map((holding) => ({
        fund_code: holding.fundCode.trim(),
        fund_name: holding.fundName.trim(),
        fund_type: holding.fundType.trim(),
        market_value: holding.marketValue,
      })),
    },
  });

  const report = parsePortfolioReport(payload);
  if (!report) {
    throw new ApiError(500, "Portfolio report payload is invalid.");
  }
  return report;
}

export async function getLatestPortfolioReport(): Promise<PortfolioLatestState> {
  const payload = await request("/api/portfolio/latest", {});
  return parsePortfolioLatest(payload);
}

export async function getPortfolioHistory(): Promise<PortfolioHistoryState> {
  const payload = await request("/api/portfolio/history", {});
  return parsePortfolioHistory(payload);
}

export async function getSimulationScenarios(): Promise<SimulationScenarioCatalog> {
  const payload = await request("/api/simulations/scenarios", {});
  return parseSimulationScenarioCatalog(payload);
}

export async function startSimulationSession(
  input: SimulationSessionStartInput,
): Promise<SimulationSession> {
  const payload = await request("/api/simulations/sessions", {
    method: "POST",
    body: {
      scenario_slug: input.scenarioId,
    },
  });

  const session = parseSimulationSession(payload);
  if (!session) {
    throw new ApiError(500, "Simulation session payload is invalid.");
  }

  return session;
}

export async function submitSimulationAction(
  input: SimulationActionInput,
): Promise<SimulationActionResult> {
  const payload = await request("/api/simulations/actions", {
    method: "POST",
    body: {
      session_id: input.sessionId,
      event_id: input.eventId ?? undefined,
      choice_key: input.actionId,
      reflection: input.rationale?.trim() || undefined,
    },
  });

  return parseSimulationActionResult(payload);
}

export async function getSimulationReview(
  sessionId: string,
): Promise<SimulationReview> {
  const payload = await request(`/api/simulations/review/${sessionId}`, {});
  return parseSimulationReview(payload, sessionId);
}

export async function getNewsCatalog(): Promise<NewsCatalogState> {
  const payload = await request("/api/news?refresh=true", {});
  return parseNewsCatalog(payload);
}

export async function analyzeNews(
  input: NewsAnalysisInput,
): Promise<NewsAnalysis> {
  const payload = await request("/api/news/analyze", {
    method: "POST",
    body: {
      item_id: input.itemId ?? undefined,
      headline: input.headline?.trim() || undefined,
      body: input.body?.trim() || undefined,
    },
  });

  return parseNewsAnalysis(payload);
}
