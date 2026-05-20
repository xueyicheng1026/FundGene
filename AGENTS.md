# FundGene Agent Context

Last updated: 2026-05-20
Status: Canonical working context for all future agents

## 1. Purpose of This Document

This is the single designated context document for FundGene.

All future agents working in this repository must:

1. Read this document first before making architectural or product assumptions.
2. Treat this document as the primary onboarding and coordination entrypoint.
3. Update this document whenever a durable project decision, scope change, or execution milestone changes.

This document does not replace every detailed design document. It keeps the project direction, constraints, implementation plan, and current repository truth coherent across sessions.

`PROJECT_OVERVIEW.md` is now the compact project-wide overview and future agent runtime blueprint. Future agents should read it after this file when they need the current product narrative, demo framing, and Agent Runtime v2 plan.

## 2. How Future Agents Must Use This Document

Use this document in the following order:

1. Read Sections 3 to 11 for the fixed product and architecture foundation.
2. Read Section 12 for the verified repository reality and blockers.
3. Read Sections 13 to 17 for the current product blueprint, architecture baseline, plugin strategy, execution plan, and code transformation strategy.
4. Verify the current filesystem state before assuming planned directories or modules already exist.
5. If a task changes project scope, architecture, delivery priorities, or repository truth, update this document in the same session.

When updating this document:

- Keep stable principles stable.
- Update plans and status explicitly.
- Prefer small factual edits over large rewrites unless the old text is materially misleading.
- Change the `Last updated` date whenever the meaning changes.

## 3. Project Identity

FundGene is not a general chatbot and not a trading automation system.

FundGene is now moving toward an Agent Command Center product model for beginner fund investors. Its role is to let users give goals to a disciplined investment coach agent, then have the agent automatically organize user context, portfolio structure, news/policy signals, behavior evidence, learning gaps, and safe next actions.

The product should feel like an agent that has already done the first round of thinking for the user: it prepares a daily brief, explains why it matters, shows what it checked, proposes safe actions, and asks for confirmation before durable state changes.

The product must still feel like a disciplined investment coach for beginners, not like a speculative trading assistant, brokerage tool, or autonomous trading system.

## 4. Product Mission

FundGene exists to help beginner investors:

- understand fund investing fundamentals,
- understand risk and portfolio structure,
- identify behavior and decision-making biases,
- practice investment decisions in explainable historical scenarios,
- improve judgment through explanation, reflection, and guided next steps,
- reduce manual analysis burden by letting an agent summarize what changed, why it matters to the user's context, and what safe action is worth considering next.

## 5. Target Users

Primary users:

- beginner or early-stage retail fund investors,
- users with limited financial vocabulary,
- users who need structured explanation before taking action,
- users who are vulnerable to emotional or impulsive investing behavior.

The default user model is beginner-first, not advanced trader-first.

## 6. Product Scope

### 6.1 Core product tracks

The next FundGene direction is Agent Command Center first. V1 focuses on:

1. Daily Brief as the default home: the agent automatically summarizes today's most important judgment, evidence, user impact, safe next action, and safety boundary.
2. Agent Workspace as the primary manual task surface: the user gives a task, the agent plans, calls tools, shows progress, and returns a structured answer.
3. Automations as authorized background work: daily brief and weekly portfolio/behavior checks can run without the user manually opening each module.
4. Profile and Authorization Center: portfolio, risk profile, behavior evidence, learning state, and data permissions are managed as agent context.

Existing domain capabilities are not removed, but they are no longer the main information architecture:

- portfolio analysis becomes an agent tool and detail surface,
- news and policy interpretation becomes an agent tool and detail surface,
- learning becomes an agent-recommended action and detail surface,
- simulation becomes an agent-triggered training action and detail surface,
- behavior profile becomes context plus confirmation workflow, not a standalone destination-first module.

### 6.2 Explicit non-goals

FundGene must not become:

- a live trading platform,
- an auto-execution or auto-order system,
- a product that promises returns,
- a high-risk investment recommendation engine,
- a multi-agent demo built mainly for novelty.

Any feature that looks like direct trade execution, guaranteed return language, or aggressive investment advice is outside scope unless this document is explicitly updated first.

Automation is allowed only for analysis, summarization, monitoring, recommendation drafting, trace generation, and pending state proposals. Automation must not place trades, connect to broker execution, promise returns, silently rewrite canonical behavior profile from weak evidence, or present safe next actions as investment orders.

## 7. Core Product Philosophy

### 7.1 Beginner-first

Every major decision should optimize for clarity and usability for a beginner investor.

### 7.2 Explanation-first

The system should explain before it recommends. Answers should help the user understand why, not just what.

### 7.3 Training-first

The product should improve the user's judgment over time, not simply produce one-off answers.

### 7.4 Traceability-first

Agent outputs should be structured, inspectable, and tied to evidence, execution steps, and risk notices wherever applicable.

The user-facing product should show a clear natural-language process view by default, similar in spirit to a coding agent showing work progress, while reserving raw tool names, trace IDs, evidence keys, worker outputs, and model metadata for advanced/developer views.

### 7.5 Product-first, framework-second

Choose the simplest architecture that supports a real product. Avoid complexity that exists only to satisfy framework fashion or agent novelty.

### 7.6 Safety and restraint

The product should avoid overstating certainty, avoid return promises, and avoid language that implies blind execution.

## 8. System Design Principles

### 8.1 Single entry agent, toolchain-based execution

The default architecture is:

- one primary user-facing advisor agent,
- structured tool selection and execution,
- toolchains specialized by domain,
- one final structured answer assembled for the user.

Do not default to free-form multi-agent conversations.

Implementation agents may use multi-agent development workflows when useful, but the FundGene product itself should expose one coherent user-facing agent. Internal workers, skills, tools, scheduled jobs, and traces are implementation machinery behind that single product agent.

### 8.2 Schema-first outputs

Business-critical AI outputs should be defined by schemas before prompt expansion. Structured outputs are preferred over free-form text whenever the result affects persistence, rendering, or downstream logic.

### 8.3 Backend owns business truth

Domain logic, validation, persistence, recommendation logic, and auditability belong in the backend. The frontend should present product workflows clearly, but should not become the primary home of business rules.

### 8.4 Data model before feature sprawl

The data model should support durable learning progress, behavior profiles, portfolio analyses, simulation sessions, and agent traces before adding extra feature breadth.

### 8.5 Real product loops before advanced orchestration

The project should first complete usable product loops with strong explanation and persistence. Advanced orchestration, complex long-running agent graphs, or human-in-the-loop workflow engines are second-stage concerns.

For the new Agent Command Center direction, the first real loop is:

```text
authorized context -> Daily Brief -> user asks follow-up or confirms action -> Agent Workspace run -> safe next action or pending proposal -> writeback after confirmation -> next Daily Brief
```

## 9. Canonical Technical Stack

This is the canonical stack unless this document is explicitly updated.

### 9.1 Frontend

- Next.js 16
- React 19
- TypeScript
- App Router
- Tailwind CSS 4
- TanStack Query
- Zod
- Apache ECharts

Frontend operating rules:

- Treat the frontend primarily as the product UI layer.
- Keep domain logic in the backend.
- Avoid unnecessary framework-specific complexity when simple React and API composition is enough.
- Build dashboard and workspace flows that are fast, explainable, and easy to extend.
- Do not inherit the legacy visual direction by default. Frontend should be treated as rebuildable.
- As of 2026-05-17, the current frontend visual direction is Apple-style polish: light canvas, translucent white materials, blue primary actions, calm depth, precise typography, and restrained financial-workbench density. Preserve beginner-first product meaning and do not turn FundGene into a generic Apple product landing page.
- As of the later 2026-05-17 Agent Command Center decision, future frontend work should reduce top-level navigation around the target IA: `Today`, `Agent Workspace`, `Automations`, and `Profile`. Existing routes may remain during migration, but should not keep driving the product structure.

### 9.2 Backend

- Python 3.12+
- FastAPI
- PydanticAI
- SQLAlchemy 2.x
- Alembic
- PostgreSQL as the intended primary database
- Redis only when caching, queues, or coordination clearly require it
- pgvector only when retrieval use cases are validated

Backend operating rules:

- Keep the API clean, typed, and testable.
- Prefer structured service layers over ad hoc script-like logic.
- Keep the system provider-flexible where practical.
- Persist user-relevant analyses and agent runs when they matter for product traceability.

### 9.3 Infra and delivery

- pnpm workspace for JavaScript workspace management
- Docker for containerization
- GitHub Actions for CI
- Sentry for error monitoring
- OpenTelemetry as the long-term observability direction
- OpenAPI-driven API contracts and generated clients when the repo reaches that stage

## 10. Canonical Architecture Boundaries

### 10.1 Frontend responsibility

The frontend is responsible for:

- product workflows,
- rendering state and evidence clearly,
- streaming and interactive assistant experiences,
- charting and workspace UX,
- authenticated user-facing navigation.

### 10.2 Backend responsibility

The backend is responsible for:

- domain services,
- persistence,
- authentication and authorization,
- agent runtime orchestration,
- tool execution,
- recommendation logic,
- safety and response structure,
- auditability and durable run records.

### 10.3 Data responsibility

The data layer is responsible for:

- separating raw inputs from system conclusions,
- versioning important generated analyses,
- storing traces and references for important agent outputs,
- supporting historical review rather than only latest-state overwrite.

## 11. Canonical Repository Direction

The intended target structure is:

```text
FundGene/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── config/
│   ├── sdk/
│   └── ui/
├── services/
│   ├── agent/
│   ├── domain/
│   ├── data-pipeline/
│   └── evals/
├── docs/
├── infra/
└── data/
```

Important rule:

- Future agents must verify the actual repository state before assuming every target directory already exists or is fully implemented.

## 12. Verified Repository Reality and Blockers

### 12.1 Verified facts as of 2026-04-26

- `apps/web` now exists as a real Next.js 16 / React 19 / TypeScript / App Router / Tailwind CSS 4 application skeleton.
- `apps/web` currently provides a shared product shell plus `/`, `/dashboard`, `/onboarding`, `/coach`, `/learning`, `/learning/[courseSlug]`, `/portfolio`, `/simulation`, and `/news` workspace routes.
- Target V1 information architecture is now `/today`, `/agent`, `/automations`, and `/profile`, with current routes kept or aliased during migration as needed. Until those routes are implemented, treat `/dashboard` as the current Daily Brief surface and `/coach` as the current Agent Workspace precursor.
- `apps/web` now includes a minimal auth entry route at `/start`; authenticated workspace pages run on a real cookie-backed user session instead of a local header bridge.
- `apps/web` now includes the first real MVP Spine A workflow: `/start` -> `/onboarding` persists profile and questionnaire state to the backend, `/coach` can submit a real beginner fund question and read persisted structured answers, and `/dashboard` reads the resulting real state instead of mock placeholders.
- `apps/web` now includes a real learning loop: `/learning` reads the persisted learning path, `/learning/[courseSlug]` reads course detail and section completion state, and section completion writes back to the backend and refreshes dashboard state.
- `apps/web` now includes a real portfolio loop: `/portfolio` accepts manual snapshot input, renders the latest persisted explainable report, and shows report history instead of schema placeholder fields.
- `apps/web` now includes a real simulation loop: `/simulation` lists seeded historical scenarios, starts persisted training sessions, submits step actions, and reads final structured reviews that flow back into dashboard and behavior context.
- `apps/web` now includes a real `/news` workspace that reads persisted news/policy items, can request structured interpretation for a selected item, and can submit a user-pasted headline/body for current-user-only analysis.
- `apps/web` now has a systematic high-end financial workbench visual pass across the shared shell and the main workspace routes. The redesign keeps the beginner-first product boundary, removes generic SaaS/gradient-orb styling, centralizes core UI primitives in `components/ui/primitives.tsx`, and uses the existing ECharts dependency for the portfolio allocation donut.
- The 2026-05-04 Figma replacement pass implemented the `FundGene` Figma file `FFZJZxEArViu5GYUDx2gr9`, root node `38:2`, across the current frontend. The pass tightened the dark black-green Figma shell and token system, rebuilt `/start` around the Figma account-entry screen, preserved the authenticated workspace behavior, and expanded visual coverage across `/`, `/start`, `/dashboard`, `/onboarding`, `/coach`, `/learning`, `/learning/[courseSlug]`, `/portfolio`, `/simulation`, and `/news`.
- The 2026-05-04 frontend UX pass moves `/coach` to a conversation-first layout: chat is the primary surface, structured answer details stay inside assistant messages, and internal agent trace/evidence stays out of the user-facing UI. Trace and evidence remain persisted and readable through authorized backend APIs for development and audit, but beginner users should see explanation, risk boundary, next actions, and follow-up prompts rather than tool names, run IDs, or citation keys.
- The 2026-05-16 frontend remediation pass used `docs/audits/frontend-ux-2026-05-16/frontend-backend-ux-audit.md` as the source checklist: user-facing internal agent/runtime labels were removed or mapped, simulation active-session resume is exposed, news interpretation stays beside the selected item and defaults to a shorter list, portfolio input has field-level validation plus an example snapshot, fake search pills became static path hints, and seed/mock labels such as `FundGene dev fixture`, `POLICY`, and `Beginner Core Path` are mapped before display. The pass is verified by `pnpm lint:web`, `pnpm build:web`, `pnpm test:web:e2e`, and a live screenshot audit covering 20 route screenshots plus 7 interaction screenshots under `docs/audits/frontend-ux-2026-05-16/post-optimization/`.
- The later 2026-05-16 multi-agent browser-led UX optimization pass made `/learning` and `/learning/[courseSlug]` task-first on mobile, expanded course sections into readable learning/self-check/reflection blocks, improved `/coach` pending-message ergonomics, added `/onboarding` unsaved-change and missing-question feedback, required a short rationale before `/simulation` action submission, aligned `/start` submit copy with onboarding redirects, removed a remaining English `No trading` label, and added browser dark-theme metadata. The pass was checked with real browser interactions on course, coach, onboarding, and simulation paths, and verified by `pnpm lint:web`, `pnpm build:web`, `pnpm test:web:e2e`, `pnpm test:web:a11y`, and `git diff --check -- apps/web`.
- The later 2026-05-16 portfolio-focused reviewer pass optimized only `/portfolio`: duplicate fund codes, empty date, and empty cash are now caught before API submission; users first review draft total value, cash ratio, holding weights, and concentration before saving a persistent snapshot; success feedback moves attention to the refreshed latest report; report allocation metrics no longer collapse in the desktop right column; clipped ECharts outer labels were removed in favor of the explicit legend/weight rows. The pass added portfolio-specific web e2e coverage for duplicate-code blocking and two-step snapshot saving, and was verified by `pnpm lint:web`, `pnpm build:web`, `pnpm test:web:e2e`, `pnpm test:web:a11y`, visual smoke screenshots, and `git diff --check`.
- The 2026-05-17 Apple-style frontend pass converted the active web UI away from the dark black-green shell toward a light Apple-inspired material system: global tokens now use a light canvas, translucent white panels, blue primary controls, calmer shadows, lighter typography, and Apple-like chart colors. The pass updated the shared shell, account entry, section headings, metric cards, portfolio allocation palette, and documented the new direction here.
- The 2026-05-17 Coach action-target pass kept `recommended_actions` as the stable string array but added backend-owned `recommended_action_targets` for allow-listed internal product links. `/coach` now renders assistant “下一步” items as actionable links while preserving user-voiced follow-up prompt chips and keeping internal agent trace details out of the beginner-facing UI.
- The later 2026-05-17 frontend screenshot optimization pass used `docs/audits/frontend-screenshot-review-2026-05-17/README.md` as the checklist and optimized mobile scanability across `/`, `/start`, `/onboarding`, `/coach`, `/portfolio`, and `/simulation`: questionnaire items collapse to the current question on mobile, portfolio uses mobile jump controls and compact history/holdings, simulation hides desktop-only density and exposes a compact scenario action card, coach separates follow-up prompt chips from navigation links and removes the mobile side rail, and start/overview/dashboard reduce mobile explanatory density. The pass is documented in `docs/audits/frontend-optimization-2026-05-17/README.md` and verified by `pnpm lint:web`, `pnpm build:web`, and a 21-test Playwright run covering workspace, visual-smoke, and accessibility checks.
- The 2026-05-17 Agentic Beginner Coach pass implemented the first backend-owned Daily Brief contract inside `GET /api/dashboard`: `daily_brief` now carries one headline judgment, up to three displayable evidence items, one Safe Next Action, source coverage, and a `do_not_do` safety boundary. `/dashboard` now uses that object as the first-screen home instead of deriving a generic module action from `next_actions`; `/coach` can receive page context (`from_route`, `focus`, `source_ids`, `daily_brief_id`) and stores it in agent-run input/trace metadata. The pass was verified by `pnpm lint:web`, `pnpm build:web`, `pnpm test:web:e2e`, `pnpm test:web:a11y`, `pnpm test:api`, and `pnpm migrate:api:sql`.
- The later 2026-05-17 Agentic Beginner Coach continuation tightened the implementation against `docs/product/agentic-beginner-coach-implementation-plan.md` and `docs/product/agentic-beginner-coach-ux-v1.md`: simulation action submission now accepts rationale, worry, and impulse-control plan; simulation reviews return behavior evidence candidates and pending behavior-profile proposal copy instead of directly mutating canonical behavior profile from one session; Coach page context is injected into runtime planning/tool/worker inputs; `recommended_action_targets` now carry SafeNextAction-compatible route params, expected writeback, and safety notes; Daily Brief evidence is prioritized to match the current primary judgment; `/dashboard` mobile now shows judgment -> evidence -> safe action -> safety boundary, and `/portfolio` shows the latest report before the input form when a report exists. This continuation was verified by `pnpm test:api`, `pnpm test:agent-evals`, `pnpm lint:web`, `pnpm build:web`, `pnpm test:web:e2e`, `pnpm test:web:a11y`, `pnpm migrate:api:sql`, and screenshot review of generated Playwright portfolio/dashboard images.
- The later 2026-05-17 Agent Command Center handoff continuation completed the interrupted `/agent` review from `docs/audits/agent-command-center-handoff-2026-05-17/session-019e356f-handoff.md`: `/today` remained accepted, while `/agent` was reworked so mobile prioritizes the active task surface before support panels, the left rail honestly presents task context/recent prompts rather than pretending to switch fully independent sessions, internal labels such as `Session rail`, `Run status`, `TRACE`, and raw writeback table names are hidden from the default user-facing UI, and final screenshots are recorded under `apps/web/test-results/visual-smoke-today-visual-smoke-chromium/` and `apps/web/test-results/visual-smoke-agent-visual-smoke-chromium/`. The follow-up shell pass then moved the desktop workspace toward a ChatGPT/Codex-like model: a persistent left app rail, a thin main titlebar, a collapsible global sidebar, and `/agent` support-panel toggles in a compact toolbar so the active task surface expands instead of being squeezed by residual side controls. The continuation is summarized in `docs/audits/agent-command-center-handoff-2026-05-17/final-review.md`; the latest shell pass was verified by `pnpm lint:web`, `pnpm build:web`, and `pnpm --filter @fundgene/web test:e2e -- e2e/workspaces.spec.ts --project=chromium`.
- The later 2026-05-17 Automations/Profile continuation advanced the remaining Agent Command Center top-level surfaces after `/today` and `/agent`: `/automations` now has a client workspace with controllable Daily Brief, weekly portfolio check, news impact watch, and behavior observation cards, each showing cadence, read scope, generated output, confirmation boundary, and safety boundary; `/profile` now has a client context center showing profile readiness, risk/behavior context, latest portfolio context, learning/training state, authorization scope, and pending writeback cards with explicit user decision controls. This is still a frontend migration milestone only: durable `automation_settings`, `automation_runs`, profile-wide pending proposal listing, and accept/reject/apply endpoints are not yet implemented. The continuation is summarized in `docs/audits/agent-command-center-handoff-2026-05-17/automations-profile-review.md` and verified by `pnpm lint:web`, `pnpm build:web`, `FUNDGENE_WEB_PORT=3024 pnpm test:web:a11y`, `FUNDGENE_WEB_PORT=3027 pnpm --filter @fundgene/web test:e2e -- e2e/workspaces.spec.ts --project=chromium`, and `FUNDGENE_WEB_PORT=3028 pnpm --dir apps/web exec playwright test e2e/visual-smoke.spec.ts --project=chromium -g "automations|profile"`.
- The later 2026-05-17 Automations/Profile backend continuation added the first durable Agent Command Center backend contract: `automation_settings`, `automation_runs`, and `daily_brief_preferences` through Alembic revision `20260517_0010`; `GET /api/automations`, `PATCH /api/automations/{automation_key}`, and `POST /api/automations/{automation_key}/run`; `GET /api/profile/context`, `GET /api/profile/pending-proposals`, `POST /api/profile/pending-proposals/{proposal_id}/accept`, and `POST /api/profile/pending-proposals/{proposal_id}/reject`. Pending writebacks reuse `agent_state_update_proposals` with explicit user-decision fields (`user_decision_status`, `decision_note`, `decided_at`, `applied_at`) and only allow-listed `behavior_profile_note` is applied to behavior evidence after user confirmation. This is still not a background scheduler, and the frontend still needs to consume the new backend contracts instead of local `/automations` and `/profile` state.
- The later 2026-05-17 Automations/Profile frontend API continuation connected the Command Center frontend to the new backend contracts: `apps/web/lib/api.ts` now includes typed clients for automations, profile context, and pending proposal decisions; `/automations` reads backend-owned automation settings, cadence options, queue state, Daily Brief summary, PATCHes enable/cadence changes, and can POST manual runs; `/profile` reads backend-owned context readiness, authorization scope, automation authorizations, and pending proposals, then uses backend accept/reject endpoints instead of local seed state. The pass is summarized in `docs/audits/agent-command-center-handoff-2026-05-17/frontend-api-connection-review.md` and verified by `pnpm lint:web`, `pnpm build:web`, `pnpm --filter @fundgene/web test:e2e -- e2e/workspaces.spec.ts --project=chromium`, `FUNDGENE_WEB_PORT=3033 pnpm test:web:a11y`, `FUNDGENE_WEB_PORT=3032 pnpm --dir apps/web exec playwright test e2e/visual-smoke.spec.ts --project=chromium -g "automations|profile"`, and `git diff --check` on the touched web files. This still does not add a scheduler/background worker; automation runs remain synchronous backend records.
- The later 2026-05-17 Automation Scheduler continuation added the first real scheduler/background-worker path: Alembic revision `20260517_0011` adds `automation_notifications` plus scheduled/manual trigger metadata, due time, error message, and `agent_run_id` on `automation_runs`; `run_due_automations` scans enabled due tasks for onboarded users, computes real allow-listed cadence times with timezone handling, persists scheduled runs, creates in-app notifications, and creates pending proposals through the existing user-confirmation path. `daily_brief` generates notification-only output, `weekly_portfolio` and `news_watch` generate internal Safe Next Action proposals, and `behavior_observation` generates only a pending `behavior_profile_note` that cannot mutate behavior evidence until the user accepts it in Profile. The worker can run as `python -m app.scripts.run_automation_worker --once --limit 20` or loop with `--poll-seconds`; FastAPI lifespan startup is available only when `FUNDGENE_AUTOMATION_WORKER_ENABLED=true` and remains disabled by default to avoid test pollution or duplicated API-worker schedules. `/automations` now also renders backend `recent_notifications`. This is summarized in `docs/audits/agent-command-center-handoff-2026-05-17/automation-scheduler-review.md`; remaining production hardening is external deployment topology, richer notification delivery, and stronger multi-worker claim semantics beyond the first `FOR UPDATE SKIP LOCKED` scan.
- The 2026-05-18 real-news-source continuation connected the news loop to live configured RSS/Atom sources instead of relying on dev fixtures or manual paste only. `refresh_news_feeds` and `refresh_news_feeds_sync` now use a real feed User-Agent, respect system proxy environment, and ingest configured feeds into `news_items` / `policy_items`. `/news` frontend loads `GET /api/news?refresh=true&limit=20` by default and exposes a “同步真实资讯” refresh button. `news_watch` automation now refreshes feeds before creating its scheduled run, notification, and pending Safe Next Action. Local verification fetched real SEC/Fed feed entries through `/api/news?refresh=true&limit=10`, returning SEC Press Releases and Federal Reserve release items.
- The later 2026-05-19 domestic-news-source continuation added default Chinese-facing feeds for the news loop: 中国人民银行新闻 RSS, 人民网财经, and 中新网财经, while keeping the existing Fed/SEC/Treasury feeds and `FUNDGENE_NEWS_FEEDS` override path. 新华网财经 RSS was checked but not kept as a default because it returned stale 2022 entries without publish timestamps in live verification. News list retrieval now uses a larger candidate pool before sorting by published/fetched timestamp, so multi-source refreshes are less likely to show only the last-ingested feed.
- The later 2026-05-19 daily-news and learning-command continuation made `GET /api/news` return only the latest natural-day slice from currently synced news/policy items, so the default news page is for daily latest reading rather than historical browsing. `/learning` is now exposed in the shared workspace tool navigation and redesigned as a single-viewport learning cockpit, following the generated concept direction: left path/progress rail, central Today training task, right learning-to-action panel. Desktop visual smoke now asserts `/learning` has no whole-page vertical overflow.
- The later 2026-05-18 user-facing Agent copy cleanup made `/agent` stop exposing internal runtime/prompt language in normal conversation. Agent Runtime v2 now sanitizes deterministic and model-composed final answers before persistence/display, `portfolio` and `news` workers avoid user-visible markers such as `运行时风险约束`, `影响路径约束`, and `检索证据提示`, the frontend strips legacy persisted markers including `直接回答：`, and Daily Brief prompt chips no longer inject long raw evidence claims into user prompts. Chrome user-view verification confirmed the existing conversation no longer shows the cited internal markers after refresh and new Agent replies use the softer user-facing risk boundary copy.
- The 2026-05-20 LLM configuration pass made model connectivity explicit: Agent Runtime v2 no longer falls back to a deterministic answer when `hybrid`/`model` mode has no usable LLM API credentials, and instead returns a clear user-facing “模型未配置” answer with a link to Profile model settings. `/profile` now exposes a DeepSeek model settings panel backed by `user_llm_settings`, so a demo user can provide a personal API key; user keys override the workspace key for Agent Workspace generation, while returned settings are masked and must not expose the raw secret.
- The later 2026-05-18 beginner-facing UX compression pass responded to real Chrome walkthrough feedback across `/start`, `/onboarding`, `/today`, `/agent`, `/automations`, `/profile`, `/news`, `/portfolio`, and `/simulation`: `/start` now defaults to creating an account and starting onboarding, login failures explain that the account may not exist; `/onboarding` is now an explicit one-question-at-a-time flow; `/today` first screen is compressed to judgment, reason, one safe next action, and safety boundary with audit/source detail folded; `/agent` defaults to a chat-first focus mode with support panels collapsed; internal/developer labels such as `Daily Brief`, `L2`, `Assignment`, `DeepSeek`, `写回`, and raw behavior codes are mapped to beginner-facing copy; `/portfolio` makes the beginner example path more prominent; `/news` avoids English-heavy summaries by default and uses Chinese fact/impact/uncertainty framing; mobile navigation is a bottom four-item bar for top-level surfaces and hidden on onboarding to avoid covering the active question. Next dev indicators are disabled in `apps/web/next.config.ts` after dev-server restart. Verification covered `pnpm lint:web`, `pnpm build:web`, `pnpm --filter @fundgene/web test:e2e -- e2e/workspaces.spec.ts --project=chromium`, and visual smoke screenshots for start/today/agent/onboarding/portfolio/news.
- The 2026-05-19 accepted-page-direction continuation translated two user-approved frontend render references into the real `/news` and `/simulation` pages. `/news` now follows a three-column impact-reading workspace with searchable source list, central fact/portfolio-relationship/uncertainty analysis cards, source coverage, portfolio context, related news, and manual paste fallback. `/simulation` now follows a training-room layout with scenario cards, stage timeline, market replay chart, key-event panel, behavior-evidence preview, right-side decision task card, and compact progress/feedback/review footer. The follow-up refinement made `/news` and `/simulation` desktop surfaces true single-viewport workspaces by removing duplicate generic page chrome, constraining page height, moving overflow into internal panels, hiding nonessential desktop fallback rows, and adding visual-smoke assertions that fail if either desktop route becomes vertically scrollable again. A later review UX fix changed `/simulation` final review from a blocking overlay into an in-page review room that replaces the training room, summarizes trigger points, next actions, and pending evidence candidates, and hides raw behavior codes from beginner users. The pass preserves API-backed interactions and beginner-facing safety boundaries; verification covered `pnpm lint:web`, `pnpm build:web`, `pnpm --filter @fundgene/web exec tsc --noEmit --pretty false`, `pnpm test:api -- apps/api/tests/test_news_flow.py`, `FUNDGENE_WEB_PORT=3000 pnpm --dir apps/web exec playwright test e2e/visual-smoke.spec.ts --project=chromium -g "news|simulation"`, and `FUNDGENE_WEB_PORT=3000 pnpm --dir apps/web exec playwright test e2e/workspaces.spec.ts --project=chromium -g "news workspace can request|simulation"`.
- The later 2026-05-20 live Chrome UX repair followed a real user-path audit on `https://fundgene.onrender.com` and tightened demo-critical rough edges: `/start` now gives explicit slow authentication/cold-start feedback instead of indefinite login checks; shared web API calls have bounded timeouts; `/news` no longer refreshes feeds automatically on every page load and asks the user to trigger real sync explicitly; real synced news is preferred over `FundGene dev fixture` items in news lists and Today news evidence; Today no longer turns missing news summaries into the user-facing placeholder `原始摘要暂不可用`; `/simulation` shows an honest pre-start scenario preview instead of fake `当前阶段 2/4` progress or premature final-review actions; `/agent` topbar controls no longer use slash-separated debug-like copy; `/profile` model Key copy is beginner-facing and does not discuss production implementation details. Verification covered `pnpm lint:web`, `pnpm build:web`, `pnpm test:api`, `pnpm test:agent-evals`, `uv run --project apps/api python -m pytest apps/api/tests/test_news_flow.py -p no:capture`, and `FUNDGENE_WEB_PORT=3044 pnpm test:web:e2e`.
- The later 2026-05-20 local Chrome frontend repair addressed user screenshots for `/agent`, `/profile`, and `/today`: Agent support/history panels were kept from overlapping the active task surface, Profile model settings were compressed into a shorter non-scrolling panel, and Today was redesigned away from the old evidence-to-action chain into a judgment-first cockpit with one safe action, compact evidence cards, source coverage, and no clipped content on short desktop viewports. Verification covered local Chrome screenshots, `pnpm lint:web`, `pnpm build:web`, `FUNDGENE_WEB_PORT=3047 pnpm --filter @fundgene/web test:e2e -- e2e/workspaces.spec.ts --project=chromium`, `FUNDGENE_WEB_PORT=3048 pnpm test:web:a11y`, and `git diff --check`.
- The later 2026-05-20 auth cold-start repair changed `/start` and the shared workspace shell so Render Free backend wakeups no longer surface as a scary authentication outage. `GET /api/auth/session` now waits up to 60 seconds, session checks retry non-401 startup failures, `/start` keeps the account entry form usable while the check retries, and user-facing timeout copy says the service is starting and will continue retrying instead of saying the page will not fake a result.
- The later 2026-05-19 navigation discoverability fix keeps the Agent Command Center top-level IA focused on `/today`, `/agent`, `/automations`, and `/profile`, but exposes `/news` and `/simulation` as visible tool entries in the shared workspace sidebar. These pages should no longer require manual URL entry; future navigation simplification should preserve an obvious path into news interpretation and simulation training unless the product IA is explicitly changed.
- The later 2026-05-19 news caching fix changed `/news` so normal page entry reads the persisted catalog through the frontend query cache instead of forcing `refresh=true` on every mount. External RSS/Atom refresh is reserved for the explicit “同步真实资讯” action and automation workers; the frontend query keeps the news catalog fresh for 5 minutes and garbage-collects it after 30 minutes.
- The later 2026-05-20 persisted-news selection fix tightened that behavior: `GET /api/news` now filters out dev fixtures before choosing the latest natural-day slice, so a previously synced real feed day remains visible after login even if seeded fixture timestamps are newer. `/news` list cards now expose a dedicated clickable/keyboard-selectable item body while keeping “生成解读” and “查看原文” as separate actions, so users can switch away from the default first item without immediately generating an interpretation.
- `apps/web` now includes a Playwright plus axe QA baseline under `apps/web/e2e` and a GitHub Actions workflow at `.github/workflows/ci.yml`.
- `.github/workflows/ci.yml` now has separate `web` and `api` jobs. The `api` job uses Python 3.12 plus uv and runs `pnpm sync:api`, `pnpm test:api`, `pnpm test:agent-evals`, and `pnpm migrate:api:sql`.
- `apps/web` is verified by `pnpm lint:web`, `pnpm build:web`, and the new `pnpm test:web:e2e` entrypoint when Playwright browsers are installed. The 2026-04-29 visual pass was additionally smoke-checked at 1440px, 900px, and 390px widths for horizontal overflow and screenshot review. The 2026-05-04 expanded visual-smoke suite now covers every current product route at desktop and mobile widths, including `/`, `/start`, `/onboarding`, and `/learning/[courseSlug]`.
- `apps/api` now exists as a real Python 3.12+ / FastAPI / SQLAlchemy / Alembic / PydanticAI application skeleton.
- `apps/api` currently provides `GET /api/health`, `GET /api/ready`, `GET /api/product`, `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/assistant/session`, `POST /api/assistant/messages`, `GET /api/assistant/runs/{run_id}/trace`, `POST /api/onboarding/profile`, `GET /api/users/me`, `POST /api/behavior/questionnaires`, `GET /api/behavior/profile`, `GET /api/behavior/training-plan`, `GET /api/dashboard`, `GET /api/automations`, `PATCH /api/automations/{automation_key}`, `POST /api/automations/{automation_key}/run`, `GET /api/profile/context`, `GET /api/profile/pending-proposals`, `POST /api/profile/pending-proposals/{proposal_id}/accept`, `POST /api/profile/pending-proposals/{proposal_id}/reject`, `GET /api/learning/path`, `GET /api/learning/courses/{course_slug}`, `POST /api/learning/progress`, `POST /api/portfolio/snapshots`, `GET /api/portfolio/latest`, `GET /api/portfolio/history`, `GET /api/simulations/scenarios`, `POST /api/simulations/sessions`, `GET /api/simulations/sessions/{session_id}`, `POST /api/simulations/actions`, `GET /api/simulations/review/{session_id}`, `GET /api/news`, `GET /api/news/{item_id}`, `POST /api/news/analyze`, and `GET /api/news/analyses/{analysis_id}`, plus a single-entry `AdvisorAgent` runtime with domain toolchains.
- `apps/api` now has a coherent migration-first auth-plus-onboarding-plus-coach-plus-learning-plus-portfolio-plus-simulation-plus-news-plus-agent-trace-plus-command-center baseline; the authoritative current baseline tables are `auth_users`, `auth_sessions`, `user_profiles`, `risk_questionnaires`, `behavior_profiles`, `chat_sessions`, `chat_messages`, `agent_runs`, `agent_steps`, `agent_tool_calls`, `agent_evidence_refs`, `agent_state_update_proposals`, `automation_settings`, `automation_runs`, `automation_notifications`, `daily_brief_preferences`, `learning_paths`, `courses`, `course_sections`, `user_course_progress`, `portfolio_snapshots`, `portfolio_holdings`, `portfolio_analyses`, `scenarios`, `scenario_events`, `simulation_sessions`, `simulation_actions`, `simulation_reviews`, `news_items`, `policy_items`, `news_analyses`, and `agent_citations`.
- `apps/api` now contains the first Agent Runtime v2 deterministic advisor spine through revision `20260429_0009`: advisor runs persist steps, tool calls, evidence refs, state update proposals, policy status, latency, and context snapshots; `GET /api/assistant/runs/{run_id}/trace` exposes authorized trace reads for development and audit workflows, while `/coach` keeps those internals out of the default user interface.
- The 2026-05-05 runtime hardening pass added `worker_output_v2` structured findings inside Agent Runtime v2 traces. Domain workers still return the same beginner-facing assistant contract, but internal worker output now records each claim with evidence keys, support level, and safety boundary. This borrows the useful schema-first idea from TradingAgents-style systems without importing trader agents, buy/sell actions, stop-loss fields, simulated exchange execution, or multi-agent trading semantics.
- The 2026-05-16 agent-runtime orchestration pass studied public open-source agent systems including OpenHands SDK, LangGraph, DeepAgents, PydanticAI, AutoGen, CrewAI, and Llama Agents/Workflows, while explicitly avoiding leaked or non-public Claude Code material. The implementation borrowed architecture primitives only: explicit planning, tool constraints, read-only tool registry metadata, multi-worker fan-out/fan-in, worker-output validation, richer trace steps, and additional embedded domain tools. It did not import external frameworks wholesale, add code execution, add uncontrolled MCP access, or change FundGene into a trading/autonomous execution agent.
- The later 2026-05-16 agent-runtime technology pass inspected the public `claude-code-best/claude-code` repository at shallow checkout commit `5b941d4` as an architecture reference only. Because that repository describes itself as a reverse-engineered reconstruction, FundGene must not copy its code or adopt coding-CLI capabilities such as shell tools, browser/computer control, pipe IPC, remote control, or autonomous swarms. The safe borrowings landed as product-bounded runtime patterns: environment-driven capability gates, scored read-only tool discovery, trace observability events, and strict final-response validation.
- The 2026-05-16 Skill Registry pass added built-in versioned coaching skills inside Agent Runtime v2: fund basics explanation, portfolio concentration review, behavior bias reflection, simulation review coaching, news/policy impact path, and cross-domain synthesis. Skill selection is recorded in `agent_plan_v1`, `tool_trace.skills`, `selected_skill_versions`, and the `agent.skills` trace event. Skills are code-owned, read-only-tool constrained, and not an admin-editable prompt surface.
- The same pass added a first dedicated `SimulationWorker` for historical scenario training questions. Simulation still remains a training/review surface, not a prediction or trading module. `BehaviorWorker` can now create pending `behavior_profile_note` state proposals when the user describes chasing/panic behavior, but these proposals do not automatically mutate canonical behavior state.
- `apps/api` now defaults the advisor composer model to DeepSeek V4 via `FUNDGENE_ADVISOR_MODEL=deepseek:deepseek-v4-pro`. `deepseek-v4-flash` is the intended lower-cost switch target through the same environment variable.
- DeepSeek credentials are environment-only. The backend reads `FUNDGENE_DEEPSEEK_API_KEY` and also accepts `DEEPSEEK_API_KEY`; no real key is stored in repo files. If no key is present in `hybrid` mode, the advisor composer records a deterministic fallback in trace metadata instead of failing the user request.
- Agent Runtime v2 now uses an explicit model factory for DeepSeek: PydanticAI `OpenAIChatModel` with `DeepSeekProvider`, prompted JSON output, and schema validation. The current local default is `FUNDGENE_DEEPSEEK_THINKING=disabled` with `FUNDGENE_AGENT_MODEL_TIMEOUT_MS=30000`; `thinking=enabled` is available as an explicit experiment but should not be the default for Coach because it can push structured replies into slow reasoner paths and fallback.
- Agent Runtime v2 now records a 12-step trace for advisor messages: input guard, intent classification, agent plan construction, context snapshot loading, plan validation, tool selection, tool execution, worker execution, worker-output validation, policy guard, response composition, and final response validation. The public assistant response contract remains unchanged.
- News and portfolio analysis can now use DeepSeek only as a guarded text enhancer. Rule calculations, evidence selection, holdings weights, concentration flags, risk buckets, and persisted report structures remain backend-owned. Unsafe model output with return promises, direct buy/sell, clear/full-position, or automation wording is reverted to the rule-generated version.
- `pnpm smoke:deepseek` is the local real-call smoke entrypoint. It only sends a real request when `FUNDGENE_DEEPSEEK_API_KEY` or `DEEPSEEK_API_KEY` is explicitly present in the current shell environment.
- `services/evals` now contains the first local agent regression harness with 20 JSON cases covering safety refusal, tool selection, skill selection, trace events, citation presence, beginner clarity, portfolio, behavior, simulation, and news/policy intents.
- `apps/api` is verified by `pnpm test:api`, `pnpm test:agent-evals`, real HTTP requests to `/api/health`, a real HTTP register -> session -> onboarding/profile -> questionnaire -> assistant/messages -> assistant/session -> dashboard flow, `pnpm migrate:api:sql`, and the prior live local PostgreSQL migration verification through revision `20260402_0005`.
- `packages/config`, `packages/sdk`, and `packages/ui` are placeholder directories only.
- `services/agent`, `services/domain`, and `services/data-pipeline` are placeholder directories only. `services/evals` is no longer placeholder-only; it contains the first local agent eval runner and fixture set.
- `data/dev/fundgene.db` exists and contains the historical table set for users, learning, portfolio, simulations, news, and agent runs. It is a reference asset, not proof of current runnable backend code.
- `archive/legacy-frontend` is a Vite/React/Ant Design prototype with trading-oriented semantics that do not belong in the current product boundary.
- `archive/legacy-backend` is an AutoGen-era experimental codebase with nested `.git`, `node_modules`, hard-coded local paths, and experimental orchestration that must not re-enter the mainline architecture.
- the broken historical `.git` metadata has been preserved as `.git.broken-20260402`; the active git root now resolves to the FundGene directory itself.
- `README.md`, handoff material, and local startup/testing docs must remain aligned with the current implementation reality, not memory of previous sessions.

### 12.2 Repository boundary status and current phase caveat

- The repository boundary blocker is resolved: `git rev-parse --show-toplevel` now returns the FundGene root.
- Working decision remains unchanged: FundGene should be managed as its own repository boundary, not as an accidental subdirectory of the user home repository.
- The prior Phase 1 live migration blocker is resolved through the previously verified local Dockerized PostgreSQL baseline: `pnpm infra:up` and `pnpm migrate:api` succeeded through revision `20260402_0005`.
- The new learning-plus-portfolio-plus-simulation-plus-news and trace migration revisions `20260426_0006`, `20260426_0007`, `20260426_0008`, and `20260429_0009` are verified by `pnpm migrate:api:sql`, but their live local PostgreSQL upgrades were not rerun because the local Docker daemon was unavailable; `pnpm infra:up` failed with Docker daemon unavailable on 2026-04-26.
- The prior Phase 2 auth caveat is now resolved on the main path: the product uses a minimal production-shaped auth baseline with email + password hash, persisted sessions, and an `HttpOnly` cookie between `apps/web` and `apps/api`.
- A short compatibility seam still exists at the API layer: `GET /api/auth/me` is retained as an alias of `GET /api/auth/session` while docs and callers converge on the canonical session endpoint.

### 12.3 Operational consequences

- Treat the current repo as an early runnable monorepo skeleton, not as a feature-complete product.
- Use the root scripts as the canonical local entrypoints:
  - `pnpm dev:web`
  - `pnpm build:web`
  - `pnpm lint:web`
  - `pnpm test:web:e2e`
  - `pnpm test:web:a11y`
  - `pnpm sync:api`
  - `pnpm dev:api`
  - `pnpm test:api`
  - `pnpm migrate:api`
  - `pnpm migrate:api:sql`
  - `pnpm smoke:deepseek`
- Local browser demos should use `http://127.0.0.1:3000` for the frontend and `http://127.0.0.1:8000` for the API. Do not mix `localhost` and `127.0.0.1` during one login flow; cookie origin and Next dev-server behavior can otherwise leave the UI stuck on session-check loading or make authenticated calls look unauthenticated.
- Treat the current `/start` -> onboarding/profile/questionnaire/coach/dashboard path as the first real vertical slice, and treat `/learning`, `/portfolio`, `/simulation`, and `/news` as real persisted product loops rather than shell-only placeholders.
- Treat the session-backed auth flow as the new canonical identity path; do not reintroduce `X-FundGene-User-Id` into the mainline frontend or backend flow.
- Treat `data/dev/fundgene.db` as a fixture/reference only. The authoritative future truth must come from migrations and service-layer code, not from a leftover SQLite file.
- Treat `archive/` as reference-only and read-only. Do not reintroduce trading semantics, old UI patterns, AutoGen orchestration, or nested repository assets into the new mainline.
- `packages/` and `services/` should still be treated as mostly future-facing structure, not proof that shared abstractions are ready to extract.
- Revisions `20260402_0001` through `20260429_0009` are now the authoritative migration baseline in code; live local PostgreSQL verification has been previously confirmed through `20260402_0005`, while `20260426_0006`, `20260426_0007`, `20260426_0008`, and `20260429_0009` still need reruns against local Dockerized PostgreSQL when the Docker daemon is available.

## 13. Product Blueprint

### 13.1 Product positioning

FundGene is a beginner fund investing Agent Command Center.

It should move users from fragmented information and emotional reactions toward a simpler loop:

```text
Agent has checked today's context -> user sees the brief -> user asks or authorizes work -> agent runs tools -> user confirms safe next actions
```

The product promise is not "more pages" or "more financial data." The promise is that FundGene's agent does the first round of synthesis for the user and makes the next safe step obvious.

### 13.2 Core user problems

FundGene is designed to solve:

- knowledge gaps about funds, risk, and asset allocation,
- noise overload from news and opinions,
- inability to interpret portfolio structure and risk exposure,
- hidden behavior biases such as chasing gains or panic selling,
- lack of a safe practice environment for historical decision training.

### 13.3 Core modules

The target V1 product spine is:

1. Today: the default home and Daily Brief surface.
2. Agent Workspace: the user-driven task execution surface.
3. Automations: authorized background tasks such as daily brief, weekly portfolio check, and behavior-bias observation.
4. Profile: the user's portfolio, risk profile, behavior evidence, learning state, and authorization controls.

Former module pages become agent tools or detail surfaces:

- portfolio: inspect holdings, concentration, and risk detail when the agent asks for it or the user drills in,
- news: inspect source items and impact paths behind a brief or workspace run,
- learning: complete a recommended learning action,
- simulation: complete a recommended historical training assignment,
- behavior: confirm or reject pending behavior-profile evidence.

### 13.4 User main path

The main user loop is:

1. log in or complete onboarding/profile setup,
2. open Today and read the agent-generated Daily Brief,
3. see one judgment, why it matters, one safe next action, and one "do not do" boundary,
4. click into Agent Workspace to ask a follow-up or assign a task,
5. watch the agent's natural-language execution steps; optionally expand advanced trace/tool details,
6. receive a structured result with evidence and safe next actions,
7. confirm durable updates such as behavior evidence, recurring automations, or training assignments,
8. return to the next Daily Brief.

### 13.5 Minimal releasable spine

The minimum releasable spine is:

- authentication and basic user profile,
- risk questionnaire,
- Today / Daily Brief home,
- Agent Workspace for user-directed tasks,
- default-on but user-controllable Daily Brief automation,
- portfolio/news/learning/simulation capabilities callable by the agent,
- profile and authorization center,
- durable structured records for runs, reports, evidence, automations, and pending state proposals.

Historical simulation, learning, portfolio, and news interpretation should first support agent-led safe next actions and detail drill-downs, rather than returning as equal-weight navigation modules.

### 13.6 MVP input rules

For MVP:

- portfolio inputs should be manual entry or controlled fixtures first,
- questionnaire inputs should be internal and structured,
- course content should come from internal fixtures or curated local sources first,
- no broker links, trading account connections, or live execution flows are allowed.

### 13.7 Agent automation levels

V1 includes L1 and L2 automation:

- L1 manual task mode: the user asks the agent to analyze, explain, inspect, summarize, or plan.
- L2 daily automation mode: the system generates a Daily Brief by default, with user-visible authorization and the ability to turn it off.

L3 proactive monitoring is a later blueprint item only. It may produce alerts when risk context changes, but it must still require confirmation for durable profile changes and must not execute trades.

### 13.8 Agent process display

Default process display should use natural language:

```text
Understanding your task
Reading your risk profile
Checking your latest portfolio
Reviewing relevant news and policy items
Evaluating impact paths
Preparing a safe next action
Waiting for your confirmation
```

Advanced/developer mode may expose:

```text
tool calls
trace id
evidence refs
worker outputs
model/fallback metadata
policy guard result
```

Beginner-facing views must not dump internal labels by default.

## 14. Technical Architecture Baseline

### 14.1 Frontend plan

- `apps/web` now exists as the canonical frontend root and should continue evolving in place.
- Start inside `apps/web`; delay `packages/ui` until repeated component boundaries stabilize.
- Optimize for information hierarchy, explanation surfaces, and workspace UX rather than a trading-terminal look.
- Legacy frontend service shapes may be used as reference for API and state design, but legacy UI, styling, and routing must not be reused as the mainline.

### 14.2 Backend plan

- `apps/api` now exists as the canonical backend root and should continue evolving in place.
- Keep PostgreSQL as the primary target database from the start of real implementation.
- Use `data/dev/fundgene.db` only as a fixture/schema comparison aid.
- Use Redis only when concrete caching or coordination needs appear.

### 14.3 Agent runtime plan

Default runtime architecture:

- one `AdvisorAgent` as the only user-facing agent,
- internal toolchains for learning, portfolio, behavior, simulations, and news,
- structured outputs with citations, risk notices, and recommended in-product next actions,
- durable `agent_runs` and citation records for traceability,
- rule-based or template fallback when model execution fails.

The model must not directly execute arbitrary SQL or regain uncontrolled MCP-style access to local resources.

Next agent architecture decision as of 2026-04-30:

- The current agent architecture direction is `Agent Runtime v2`, documented in `PROJECT_OVERVIEW.md`.
- Agent Runtime v2 now has a first deterministic advisor spine: `POST /api/assistant/messages` creates a run, executes the v2 orchestrator, writes steps/tool calls/evidence/state proposals/policy status/context snapshot, and `GET /api/assistant/runs/{run_id}/trace` exposes the authorized trace for development and audit use.
- As of 2026-04-30, the v2 composer is DeepSeek-ready but still product-bounded: the public entrypoint remains unchanged, DeepSeek is only used when configured by environment key, and deterministic fallback remains the safe default when credentials or model execution fail.
- The default model string is `deepseek:deepseek-v4-pro`; switch to `deepseek:deepseek-v4-flash` only through `FUNDGENE_ADVISOR_MODEL` when latency or cost matters more than quality.
- FundGene should not become a free-form multi-agent conversation system.
- The intended v2 shape is one user-facing `Advisor Orchestrator` plus typed domain workers, evidence grounding, policy guards, trace persistence, and eval harnesses.
- The current v2 implementation target is to keep `POST /api/assistant/messages` as the user-facing entrypoint while expanding richer worker composition, selective RAG, eval coverage beyond the first 20-case harness, and production observability around the completed trace spine.
- As of 2026-05-16, the richer worker composition baseline has started: `AgentPlanner` builds a typed `agent_plan_v1`, validates tool budget/read-only/intent constraints, supports cross-domain internal fan-out to up to three typed workers, and aggregates results back into one beginner-facing answer. This is internal orchestration, not a free-form multi-agent chat surface.
- As of the 2026-05-16 Skill Registry pass, planner output also includes built-in `fundgene_skill_v1` coaching procedures and their selected versions. These skills may require existing read-only tools, but invalid skill required tools are rejected at registry load, missing required tools fail plan validation, and plan-validation failure is hard-gated to a `runtime_repair` fallback before execution.
- Agent Runtime v2 now has capability-gated runtime behavior through `FUNDGENE_AGENT_RUNTIME_FLAGS`, `FUNDGENE_AGENT_MAX_TOOL_CALLS`, and `FUNDGENE_AGENT_MAX_WORKERS`. Default capabilities are `scored_tool_discovery`, `multi_worker_fanout`, `strict_final_validation`, and `trace_observability`; disabling them must preserve the stable assistant contract and fall back to conservative intent mapping where appropriate.
- Required QA for this track is `pnpm sync:api`, `pnpm test:api`, `pnpm test:agent-evals`, `pnpm migrate:api:sql`, plus the existing web checks when frontend trace UI changes.
- If a real DeepSeek key is available for local-only validation, `pnpm smoke:deepseek` may be run with a temporary shell environment variable. This smoke test must not require committing a key or writing it into `.env`.
- Domain workers such as learning, portfolio, behavior, simulation, and news should receive structured inputs and return structured outputs; they must not freely chat with each other or directly mutate canonical user state.
- Runtime tools remain internal and read-only. Current embedded tools include profile, safety boundary rules, learning path, learning concept map, learning evidence search, portfolio latest report, portfolio risk lens, behavior profile, behavior training plan, simulation latest review, news latest analysis, news impact lens, and news/policy evidence search. State changes remain proposals or service-owned writes, not model-directed mutation.
- RAG should remain selective: SQL-first for user profile, portfolio reports, behavior state, simulation reviews, and persisted analyses; retrieval is appropriate for course knowledge, terminology, policy explanation, and news source material.
- MCP should be deferred until internal typed tool boundaries are mature. Start with an internal read-only tool registry with schemas, permissions, timeout, and audit logging.

### 14.4 Data and storage rules

- Raw inputs and system conclusions must remain separate.
- Report-like outputs must be versionable and reviewable.
- Important AI outputs must be stored in durable tables, not only transient responses.
- Any `trade_records`-like concept must be interpreted as user-reported historical activity or simulation activity, not live brokerage execution. Avoid product wording that implies trading capability.

### 14.5 API contract strategy

- `docs/api/API_CONTRACT.md` is the current target contract baseline.
- FastAPI OpenAPI can now become the machine-readable contract source from the restored `apps/api` application.
- Frontend mock development is allowed only when it conforms to the real schema and endpoint shapes.
- Generated SDKs come after the app roots and contract baseline exist, not before.

### 14.6 Authentication baseline

MVP authentication should be production-shaped but minimal:

- email plus password hash,
- expiring token/session,
- no social login requirement,
- no role hierarchy unless a real product need appears.

Current implementation note:

- The minimal auth baseline now lands through `auth_users`, `auth_sessions`, password hashes, and an expiring `HttpOnly` session cookie.
- The canonical current-session endpoint is `GET /api/auth/session`.
- `GET /api/auth/me` remains as a short-lived compatibility alias while session consumers converge.
- Future agents must treat the old `X-FundGene-User-Id` bridge as removed from the main path and should not reintroduce it.

### 14.7 Observability and delivery

- Local infra may use the existing Docker compose for Postgres and Redis.
- When Docker daemon is unavailable, use `pnpm migrate:api:sql` as an offline Alembic validation step, but do not confuse that with a successful live database migration.
- Sentry should be added once real request paths and error boundaries exist.
- OpenTelemetry remains a later enhancement.
- Vercel can be used for frontend preview and deployment once `apps/web` is real and buildable.

## 15. Plugin Strategy

### 15.1 Current minimum necessary plugin set

No plugin is mandatory for the current planning-and-rebuild phase.

If exactly one plugin is added during the next stage, it should be `github`, and only after:

- the FundGene repository boundary is normalized,
- a real remote workflow exists,
- implementation work is being tracked through issues or pull requests.

### 15.2 Worth integrating later

- `vercel`: after `apps/web` can build and preview deployments become useful.
- `sentry`: after `apps/api` and `apps/web` have stable request and error boundaries.
- `figma`: only if multi-person visual design collaboration becomes a real bottleneck.
- `linear`: only if task ownership expands beyond lightweight issue tracking.

### 15.3 Not recommended now

The following are not recommended in the current phase:

- huggingface
- slack
- box
- build ios apps
- build web apps
- canva
- cloudflare
- game studio
- gmail
- google calendar
- google drive
- jam
- netlify
- notion
- stripe
- test android apps

Reason:

- the current bottleneck is missing mainline implementation and repository truth, not external platform integration.

## 16. Execution Plan

### 16.1 Phase sequence

The project should move in this order:

1. fix repository truth and documentation drift,
2. normalize repository boundary and restore `apps/web` and `apps/api`,
3. lock database, migrations, and API contract baseline,
4. deliver the MVP spine,
5. expand into behavior, simulation, news, observability, and deployment hardening.

### 16.2 Current strategic priorities

Current priorities are:

1. keep one coherent product direction and one coherent repository story,
2. lock the beginner-first product boundary,
3. migrate the product from module-first navigation to Agent Command Center navigation,
4. keep the current migration-first backend baseline while reshaping outputs around Daily Brief, Agent Workspace runs, automations, and profile authorization,
5. preserve useful existing loops as agent tools/detail surfaces instead of deleting working domain capability,
6. use multi-agent development, frontend screenshot review, browser visual checks, e2e tests, accessibility checks, API tests, and agent evals for large UI/runtime changes,
7. move engineering focus toward the Agent Command Center contract before adding new breadth.

Important interpretation rule for Sections 16.3 through 16.8:

- These phases describe already-built capability assets and historical implementation sequence.
- They no longer define the future V1 product navigation.
- Future work should reuse the completed auth, onboarding, dashboard, coach, learning, portfolio, simulation, news, and runtime capabilities under the Agent Command Center IA: Today, Agent Workspace, Automations, and Profile.

### 16.3 Phase 0: Repository Truth and Hygiene

Goal:

- make docs truthful,
- isolate archived assets conceptually,
- record blockers explicitly,
- stop further work from assuming a fake baseline.

Outputs:

- updated `AGENTS.md`,
- truthful `README.md`,
- truthful handoff and local docs,
- clear keep/rewrite/archive decisions.

Done when:

- no primary doc claims `apps/web` or `apps/api` already exist,
- archived assets are clearly marked as reference-only,
- repo boundary problem is recorded as a blocker.

### 16.4 Phase 1: Repository Boundary and App Root Restoration

Goal:

- normalize the repository boundary,
- restore `apps/web` and `apps/api`,
- establish real startup and migration commands.

Status as of 2026-04-26:

- repo boundary has been normalized,
- `apps/web` and `apps/api` have been restored,
- `apps/web` builds and `GET /api/health` works,
- root startup/testing scripts now exist,
- live database migration has now been verified against the local Dockerized PostgreSQL instance.

Outputs:

- valid repo boundary for FundGene,
- working Next.js app shell,
- working FastAPI health endpoint,
- migration-first database baseline,
- real local startup/testing docs.

Dependencies:

- Phase 0 complete.

Risks:

- restoring apps while the repo boundary is still broken,
- copying legacy code instead of rebuilding on clear boundaries,
- starting abstraction work before the app roots exist.

Done when:

- repo-level operations target FundGene only,
- `GET /api/health` works,
- `apps/web` builds and starts,
- migrations are the authority, not leftover SQLite state.

Current status:

- complete.

### 16.5 Phase 2: MVP Spine A

Goal:

- implement onboarding, dashboard, AI coach, and learning.

Status as of 2026-04-02:

- the first real slice is now implemented and verified:
  - minimal auth/session baseline,
  - register/login/logout/current-session APIs,
  - onboarding profile creation,
  - risk questionnaire submission,
  - behavior profile read,
  - dashboard state aggregation,
  - coach session/message persistence and `agent_runs` trace binding for the current logged-in user,
  - frontend `/start` -> onboarding -> coach -> dashboard flow against real APIs,
  - coach workspace reads and writes the current logged-in user context,
  - dashboard can reflect the latest coach interaction,
  - `/learning` reads a real persisted learning path,
  - `/learning/[courseSlug]` reads real course detail and section completion state,
  - course section completion writes to `user_course_progress` and refreshes current product guidance.
- the temporary local identity bridge via `X-FundGene-User-Id` has been removed from the main path.
- learning is no longer shell-level and is now part of the same persisted user loop.

Outputs:

- basic auth,
- risk questionnaire,
- dashboard,
- coach workspace,
- learning path, course detail, and progress.

Done when:

- a new user can onboard, ask a beginner fund question through the persisted coach workspace, complete one learning unit, and see recommended next actions on the dashboard.

Current status:

- complete.

### 16.6 Phase 3: MVP Spine B

Goal:

- implement portfolio capture, analysis, explainable recommendations, and report persistence.

Status as of 2026-04-26:

- `/portfolio` now accepts manual snapshot input against real APIs.
- the backend now persists `portfolio_snapshots`, `portfolio_holdings`, and `portfolio_analyses`.
- the system now generates a rule-based explainable report with `summary`, `risk_exposure`, `concentration_flags`, `allocation_balance`, and `recommended_next_actions`.
- `GET /api/portfolio/latest` and `GET /api/portfolio/history` now expose the latest report and durable report history.
- dashboard now reflects the latest portfolio status, and coach portfolio answers can reference the most recent real report.

Outputs:

- portfolio snapshots,
- risk exposure and concentration analysis,
- rebalancing guidance framed as principles rather than trade execution,
- durable report history.

Done when:

- a user can input holdings and receive a persisted, explainable analysis report that the coach can reference.

Current status:

- complete.

### 16.7 Phase 4: MVP Spine C

Goal:

- implement behavior profile updates and micro historical simulations.

Status as of 2026-04-26:

- `GET /api/behavior/training-plan` now derives a real training focus, guidance, and recommended scenario from the current user context.
- `/simulation` now exposes a real beginner training workspace against persisted APIs instead of a placeholder surface.
- the backend now persists `scenarios`, `scenario_events`, `simulation_sessions`, `simulation_actions`, and `simulation_reviews`.
- two curated beginner scenarios now seed the main path:回撤纪律训练与追热点克制训练。
- completing a simulation now generates a structured review, writes behavior evidence back into `behavior_profiles`, updates dashboard simulation state, and becomes available to coach behavior / simulation intents.

Outputs:

- bias evidence model,
- training plan,
- one or two high-quality historical training scenarios,
- review reports that flow back into behavior state.

Done when:

- a user can finish a scenario, receive a structured review, and see updated behavior guidance on the dashboard.

Current status:

- complete.

### 16.8 Phase 5: Hardening and Expansion

Goal:

- add minimal news interpretation, monitoring, evaluation, and deployment hardening.

Outputs:

- limited news/policy interpretation,
- Sentry,
- Dockerized runtime path,
- baseline regression checks.

Status as of 2026-04-26:

- backend news/policy persistence now exists through `news_items`, `policy_items`, `news_analyses`, and `agent_citations`.
- real news APIs now exist for listing/refetching items, reading details, creating structured interpretation, and reading persisted analyses.
- `/news` is now a real workspace against those APIs, including selected-item analysis and manual current-user-only headline/body interpretation.
- dashboard and coach context now include the latest news/policy interpretation when one exists.
- Playwright plus axe configuration, minimal workspace/a11y tests, and GitHub Actions CI now exist for `apps/web`; `pnpm test:web:e2e` is verified locally after installing Playwright Chromium.
- Sentry, OpenTelemetry, production deployment hardening, and live PostgreSQL verification of revisions `20260426_0006` through `20260429_0009` remain future work.

## 17. Code Transformation Strategy

### 17.1 Keep

Keep and continue refining:

- `AGENTS.md`,
- `PROJECT_OVERVIEW.md`,
- product and architecture docs that reflect current truth,
- `docs/api/API_CONTRACT.md`,
- `docs/architecture/DATA_MODEL.md`,
- `infra/docker/docker-compose.yml`,
- `data/dev/fundgene.db` as a reference asset,
- archived course materials, scenario data, and historical research assets that can be curated into fixtures.

### 17.2 Rewrite

Rewrite rather than patch:

- the entire mainline backend in `apps/api`,
- any missing shared config or SDK layers once the app roots are real,
- any user-facing flow that inherits legacy trading semantics or low-quality visual structure.

Frontend status as of 2026-04-29:

- the mainline `apps/web` visual rebuild has landed and should now be continued in place,
- future frontend work should refine the current shared shell, global design system, primitives, and route workspaces rather than restarting from the legacy prototype or treating the current UI as placeholder-only.

### 17.3 Archive or deprecate

Keep out of the mainline path:

- legacy frontend UI, CSS, routing, and component hierarchy,
- legacy backend AutoGen orchestration, MCP workbench usage, and hard-coded local path scripts,
- nested `.git` and `node_modules` directories inside archives,
- misleading historical docs that describe missing code as implemented.

Documentation cleanup decision as of 2026-04-29:

- `PROJECT_REBUILD_PLAN.md`, `docs/HANDOFF_REBUILD_STATUS.md`, `docs/product/USER_JOURNEYS.md`, and `docs/product/INFORMATION_ARCHITECTURE.md` have been removed because their useful content is now absorbed by `PROJECT_OVERVIEW.md`, `README.md`, and `docs/product/PRODUCT_BLUEPRINT.md`.
- Archived dependency Markdown under `archive/**/node_modules/**` is treated as dependency noise, not project documentation.
- Legacy AutoGen and Vite prototype Markdown files under `archive/` have also been removed; archive code may remain as historical reference, but not as current documentation.

## 18. Decision Rules for Future Changes

Before adopting a new framework, tool, subsystem, or plugin, future agents should test the proposal against these questions:

1. Does it materially improve the beginner product experience?
2. Does it simplify or complicate the product architecture?
3. Does it improve traceability, testability, or delivery speed?
4. Can the same result be achieved with the existing stack more simply?
5. Is the change solving a real product bottleneck, or only satisfying architectural curiosity?

If the answer to question 5 is architectural curiosity, the change should usually be rejected.

## 19. Working Agreement for Future Agents

All future agents should follow these rules:

- read this file first,
- do not redefine product scope casually,
- do not introduce speculative multi-agent complexity by default,
- do not move core business logic into the frontend,
- do not assume planned directories already exist,
- do not reuse legacy trading semantics or low-quality UI just because they already exist,
- do not treat `archive/` or `data/dev/fundgene.db` as the current authoritative implementation,
- update this file when durable decisions or plans change,
- keep this file factual, operational, and aligned with the real filesystem.

## 20. Change Log

### 2026-04-02

- Reaffirmed `AGENTS.md` as the single designated context document.
- Added verified repository reality and blockers, including the broken git boundary and the missing `apps/web` and `apps/api`.
- Locked the current product blueprint, MVP spine, architecture baseline, plugin strategy, execution plan, and code transformation strategy.
- Explicitly marked archived assets as reference-only and `data/dev/fundgene.db` as a reference fixture rather than the future source of truth.
- Normalized the FundGene git boundary and preserved the broken prior metadata as `.git.broken-20260402`.
- Restored `apps/web` and `apps/api` as canonical implementation roots and verified the frontend build plus backend HTTP/test baselines.
- Added real root scripts for frontend build/run and backend sync/test/migration workflows.
- Recorded the remaining environment blocker for live Postgres migration verification: local Docker daemon availability.
- Verified local Dockerized PostgreSQL availability, ran `pnpm infra:up` and `pnpm migrate:api`, and established live migration authority through revision `20260402_0003`.
- Landed the first MVP Spine A vertical slice: onboarding profile creation, risk questionnaire persistence, behavior profile read, dashboard aggregation, and the matching `/onboarding` -> `/dashboard` frontend flow.
- Recorded the temporary local `X-FundGene-User-Id` bridge as the current auth-shaped caveat so future agents do not mistake it for the final authentication design.
- Added the minimal auth/session baseline with `auth_users`, `auth_sessions`, password hashes, and an `HttpOnly` cookie-backed current-session flow.
- Advanced live PostgreSQL migration authority through revision `20260402_0004`.
- Replaced the mainline `X-FundGene-User-Id` bridge with the `/start` -> auth session -> onboarding -> dashboard flow and wired `/coach` to current-user session context.
- Added coach persistence through `chat_sessions` and `chat_messages`, kept `agent_runs` as execution trace, and exposed `GET /api/assistant/session` plus the `/coach` -> dashboard trace loop.
- Advanced live PostgreSQL migration authority through revision `20260402_0005`.

### 2026-04-26

- Added the first real learning persistence loop with `learning_paths`, `courses`, `course_sections`, and `user_course_progress`.
- Added real learning APIs: `GET /api/learning/path`, `GET /api/learning/courses/{course_slug}`, and `POST /api/learning/progress`.
- Replaced the shell-level learning page with a persisted path view plus real course detail and section completion workflow.
- Added the first real portfolio persistence loop with `portfolio_snapshots`, `portfolio_holdings`, and `portfolio_analyses`.
- Added real portfolio APIs: `POST /api/portfolio/snapshots`, `GET /api/portfolio/latest`, and `GET /api/portfolio/history`.
- Replaced the shell-level portfolio page with manual snapshot input, latest report rendering, and durable report history.
- Extended dashboard aggregation so learning progress and portfolio report status now affect summary cards and next-step recommendations.
- Extended coach context so learning and portfolio toolchains can reference the current user learning state and latest real portfolio report.
- Added Alembic revision `20260426_0006`; offline migration expansion is verified, while live local PostgreSQL verification of this new revision still depends on local Docker daemon availability.
- Added behavior training planning through `GET /api/behavior/training-plan`.
- Added the first real simulation persistence loop with `scenarios`, `scenario_events`, `simulation_sessions`, `simulation_actions`, and `simulation_reviews`.
- Added real simulation APIs: `GET /api/simulations/scenarios`, `POST /api/simulations/sessions`, `GET /api/simulations/sessions/{session_id}`, `POST /api/simulations/actions`, and `GET /api/simulations/review/{session_id}`.
- Replaced the shell-level simulation surface with a real historical training workspace that can list scenarios, submit step decisions, and render final reviews.
- Extended dashboard and coach context so simulation reviews and behavior training focus now affect next-step recommendations.
- Added Alembic revision `20260426_0007`; offline migration expansion is verified, while live local PostgreSQL verification of revisions `20260426_0006` and `20260426_0007` still depends on local Docker daemon availability.
- Upgraded the front-end portfolio report state with allocation visualization, holding weights, and a richer report canvas without changing backend portfolio implementation.
- Upgraded the front-end coach workspace to render the persisted structured advisor response as an answer canvas instead of a plain card layout.
- Strengthened front-end onboarding progress with staged completion, profile readiness, and questionnaire progress indicators.
- Added real news/policy persistence with `news_items`, `policy_items`, `news_analyses`, and `agent_citations`, plus Alembic revision `20260426_0008`.
- Added real news APIs: `GET /api/news`, `GET /api/news/{item_id}`, `POST /api/news/analyze`, and `GET /api/news/analyses/{analysis_id}`.
- Replaced the contract-only `/news` frontend with a real workspace that supports feed-backed item analysis and current-user-only manual headline/body interpretation.
- Extended dashboard and coach context so latest news/policy analysis affects next-step recommendations and advisor answers.
- Added `GET /api/ready`, Playwright, axe, minimal web E2E/a11y tests, and `.github/workflows/ci.yml`.
- Verified `pnpm test:api`, `pnpm lint:web`, `pnpm build:web`, `pnpm test:web:e2e`, and `pnpm migrate:api:sql`; live Dockerized PostgreSQL verification remains blocked because the Docker daemon is unavailable.

### 2026-04-29

- Added an API CI job alongside the existing web job. The API job uses Python 3.12 plus uv and runs `pnpm sync:api`, `pnpm test:api`, `pnpm test:agent-evals`, and `pnpm migrate:api:sql`.
- Completed the first Agent Runtime v2 deterministic advisor spine: `POST /api/assistant/messages` now writes trace steps, tool calls, evidence refs, state update proposals, policy status, context snapshot, and assistant output; `GET /api/assistant/runs/{run_id}/trace` reads the current user's run for development and audit use. `/coach` no longer renders the trace panel to beginner users by default.
- Reconfirmed that `pnpm migrate:api:sql` remains an offline migration validation step and that live PostgreSQL migration for revisions after `20260402_0005`, including `20260429_0009`, still needs Docker availability.
- Added the first agent regression eval harness under `services/evals`, exposed it as `pnpm test:agent-evals`, and added it to the API CI job. The initial 20 cases cover safety boundary handling, tool-call correctness, citation presence, beginner clarity, and learning/portfolio/behavior/simulation/news intents.
- Completed a systematic `apps/web` visual and workflow refinement pass: rebuilt `globals.css`, expanded UI primitives, tightened the shared shell and route-level information hierarchy, replaced portfolio allocation rendering with ECharts, removed developer-facing UI copy, and verified `pnpm lint:web`, `pnpm build:web`, `pnpm test:web:e2e`, plus responsive smoke checks at 1440px, 900px, and 390px.

### 2026-04-30

- Switched the default advisor model configuration to `deepseek:deepseek-v4-pro`, with `deepseek:deepseek-v4-flash` as the intended environment-variable switch target.
- Added environment-only DeepSeek credential handling through `FUNDGENE_DEEPSEEK_API_KEY`, with compatibility for `DEEPSEEK_API_KEY`; no real key is stored in repo files.
- Added explicit DeepSeek model construction through PydanticAI `OpenAIChatModel` plus `DeepSeekProvider`, including optional thinking mode and reasoning-effort settings.
- Extended Agent Runtime v2 composer metadata with `composer_mode`, `model_name`, `provider`, `fallback_reason`, and DeepSeek mode fields. Missing credentials or model failures now preserve deterministic answers and trace the fallback reason. The 2026-05-04 live-key repair switched Coach composition from tool-output structured calls to prompted JSON output because DeepSeek reasoner rejected `tool_choice`; verified live smoke requires `composer_mode=model`, not deterministic fallback.
- Added guarded DeepSeek text enhancement for news and portfolio analyses. Backend rule calculations remain authoritative, and unsafe model text is reverted to rule output.
- Added `pnpm smoke:deepseek` for local real-call validation when a key is temporarily exported in the shell.

### 2026-05-16

- Studied public legal open-source agent designs before implementation: OpenHands SDK for agent/tool/event/security separation, LangGraph for persistent state and interruption patterns, DeepAgents for planning/subagent/context-management patterns, PydanticAI for typed tools and structured output validation, AutoGen/CrewAI for bounded specialist orchestration ideas, and Llama Agents/Workflows for event-driven step orchestration.
- Added `apps/api/app/runtime/v2/planner.py` with `AgentPlanner`, typed `agent_plan_v1`, multi-intent detection, bounded worker fan-out, tool budget, and read-only planning constraints.
- Expanded Agent Runtime v2 schemas with `AgentPlan`, `PlannedToolCall`, `PlanConstraint`, and `WorkerValidationResult`.
- Expanded the internal read-only `ToolRegistry` with safety boundary rules, learning concept map, portfolio risk lens, behavior training plan, and news impact lens, while preserving backend-owned business truth and avoiding write-capable tools.
- Upgraded `AdvisorOrchestrator` from an 8-step linear trace to a 12-step planned trace with explicit plan validation, tool execution, worker execution, worker-output validation, and richer `tool_trace` metadata.
- Added multi-worker fan-out/fan-in for cross-domain questions while keeping `POST /api/assistant/messages` and the beginner-facing assistant response contract stable.
- Hardened output policy checks so direct buy/sell terms are also caught in generated answers, not only return-promise and automation terms.
- Added API tests for planned traces and cross-domain fan-out. Verified `pnpm test:api`, `pnpm test:agent-evals`, `pnpm migrate:api:sql`, and `uv run --project apps/api ruff check apps/api/app apps/api/tests services/evals`.
- Inspected the public `claude-code-best/claude-code` repository at shallow checkout commit `5b941d4` and recorded the safe architecture takeaways in `docs/architecture/AGENT_RUNTIME_V2_TECH_SCAN_2026-05-16.md`. FundGene only borrowed generic patterns: capability gates, tool discovery, trace observability, and guardrail checkpoints.
- Added `apps/api/app/runtime/v2/features.py` and runtime settings for `FUNDGENE_AGENT_RUNTIME_FLAGS`, `FUNDGENE_AGENT_MAX_TOOL_CALLS`, and `FUNDGENE_AGENT_MAX_WORKERS`.
- Extended tool metadata with category and search terms, added scored read-only tool recommendation, and persisted `tool_selection_signals` in `agent_plan_v1`.
- Added trace-level `runtime_capabilities` and `trace_events`, plus strict final response validation that filters unsupported citations and unsafe recommended actions after model or deterministic composition.
- Expanded tests to cover tool scoring, capability-flag downgrade behavior, and final response normalization. Verified `pnpm test:api`, `pnpm test:agent-evals`, `pnpm migrate:api:sql`, and `uv run --project apps/api ruff check apps/api/app apps/api/tests services/evals`.
- Added the first code-owned `SkillRegistry` for Agent Runtime v2 with six built-in coaching skills, planner selection, required read-only tools, selected skill versions in trace, and eval runner checks for required skills and trace events.
- Added a dedicated `SimulationWorker`, kept behavior-profile changes as pending proposals only, and expanded tests/evals around skill traces, simulation routing, and pending behavior note proposals.

### 2026-05-19

- Upgraded Agent/Coach conversation history from latest-session-only behavior to ChatGPT-style persisted history: `GET /api/assistant/sessions` lists owned coach conversations, `GET /api/assistant/sessions/{session_id}` reloads full messages for a selected conversation, and `POST /api/assistant/messages` now supports `start_new_session` while preserving explicit `session_id` continuation.
- Updated `/agent` so the history rail shows real saved sessions, selecting a session restores its complete conversation, and sending another message appends to that selected session instead of silently starting from the latest conversation.

### 2026-05-20

- Live Render services were renamed in the dashboard from `fundgene-xueyicheng-api` / `fundgene-xueyicheng-web` to `fundgene-demo-api` / `fundgene-demo-web` so service display names no longer expose the maintainer name. The existing default `*.onrender.com` subdomains did not change in place; removing the name from public URLs requires either new Render services with non-personal slugs or a user-owned custom domain.
- A new Render Web Service named `fundgene` was created for the clean public demo entrypoint `https://fundgene.onrender.com` with service ID `srv-d869nk0g4nts73brhic0`, branch `codex/agentic-beginner-coach`, Free instance type, build command `pnpm install --frozen-lockfile && pnpm build:web`, and start command `cd apps/web && pnpm exec next start -H 0.0.0.0 -p $PORT`.
- The new `fundgene` web service currently points `NEXT_PUBLIC_FUNDGENE_API_URL` to the existing API service at `https://fundgene-xueyicheng-api.onrender.com`; the API `FUNDGENE_CORS_ORIGINS` setting includes both the old web origin and `https://fundgene.onrender.com`. If future work must remove the maintainer name from backend/network URLs as well, create a separate API service such as `fundgene-api.onrender.com` and carefully copy the production API environment, database, and secrets before repointing the frontend.
- A live Chrome user-path audit on `https://fundgene.onrender.com` found demo-facing UX issues around Render cold starts, news fixture priority, Today empty news placeholders, simulation pre-start state, Agent topbar copy, and Profile model-Key wording. The local repair makes slow auth/API waits explicit, keeps news sync manual, prefers real feed items over dev fixtures, prevents empty news placeholders from entering Today evidence, shows simulation pre-start as preview-only, removes slash-separated Agent topbar controls, and keeps Profile model wording user-facing.
- Fixed `/news` follow-up issues from live use: persisted real feed items are now selected before seeded fixtures when serving the default catalog, so users who have synced once see the latest real synced news after logging back in; the news list also supports explicit item selection through clickable and keyboard-accessible item bodies instead of always showing the first item by default.
- Fixed the follow-up local Chrome review from user screenshots: `/today` is now a judgment-first cockpit rather than a chain diagram, `/profile` model settings are shorter and do not require an inner scrollbar, and `/agent` support panels are constrained so they do not cover the active task surface. The route-level tests now assert the redesigned Today surface instead of the removed `今日信号面板` copy.
- Fixed the live `/start` authentication cold-start state: session checks now have a 60-second timeout and retry non-401 startup failures, the account form remains usable while the check is still retrying, shared workspace initialization uses the same startup copy, and a Playwright regression covers an initial 408 followed by an unauthenticated 401 without showing the old outage wording.
- Continued the compact-recovery session `019e4495` audit fixes: `/simulation` now starts with no selected action and keeps submission disabled until the user explicitly chooses an action and writes a rationale; beginner-facing copy maps raw risk and behavior values such as `balanced`, `no_major_bias_detected`, and `暂无显著行为偏差标签`; `/news` keeps generated analysis visible and marks list items as re-analyzable after a successful analysis; `/agent` handoffs from tool pages now clearly require user confirmation before sending; Agent Runtime v2 no longer recommends immediately repeating the just-completed simulation when a recent review exists. Verified with `pnpm lint:web`, `pnpm build:web`, relevant workspace Playwright tests, API simulation/runtime tests, `pnpm test:agent-evals`, `pnpm migrate:api:sql`, and local Chrome walkthrough of Today, Simulation, News, and Agent handoff.
- Inspected the public OpenAI Codex repository at shallow checkout commit `59507b849126f598ed7c624bbaf75d7ebc5588c2` and translated the key architecture idea into FundGene rather than copying code wholesale: Codex's submission/event queue and turn lifecycle became a first post-run event contract, `GET /api/assistant/runs/{run_id}/events`, with `agent_run_events_v1` events for turn start, step completion, tool completion, agent message, and turn completion. The reference mapping is recorded in `docs/architecture/CODEX_AGENT_ARCHITECTURE_REFERENCE_2026-05-20.md`; the next target is a real streaming endpoint that emits this same schema while a run is executing.
- Added the first real Codex-like live Agent Runtime v2 event path: `AgentTurnContext` and `AgentRunEventSink` now let the orchestrator emit turn, step, tool, assistant-message, and completion events during execution; `POST /api/assistant/messages/stream` streams those events as SSE and finishes with the same assistant conversation contract as `POST /api/assistant/messages`. `/agent` now submits through the streaming endpoint and shows live run events in the process panel, while `GET /api/assistant/runs/{run_id}/events` remains the post-run replay contract. Verified with `pnpm test:api`, `pnpm test:agent-evals`, `pnpm lint:web`, `pnpm build:web`, targeted `/agent` Playwright workspace tests, and `git diff --check`.
- Continued the Codex-inspired runtime absorption with the first active-run control slice: `ActiveAgentRunRegistry` tracks in-process running advisor turns with a cancellation token, `POST /api/assistant/runs/{run_id}/cancel` requests cancellation for the owning user, the orchestrator checks cancellation between major phases and emits `turn_cancel_requested` / `turn_aborted`, and `/agent` exposes a beginner-facing stop control while a streamed run is active. This is still process-local control, not a durable queue or multi-worker scheduler. Verified with targeted API runtime tests, `pnpm lint:web`, `pnpm build:web`, `/agent` visual smoke, workspace Playwright tests, and `git diff --check`.
