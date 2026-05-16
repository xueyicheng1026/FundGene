# FundGene Agent Context

Last updated: 2026-05-16
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

FundGene is an AI-guided learning and decision-support product for beginner fund investors. Its role is to help users understand investing basics, recognize behavior biases, interpret portfolio structure, and train decision-making through historical scenarios.

The product should feel like a disciplined investment coach for beginners, not like a speculative trading assistant.

## 4. Product Mission

FundGene exists to help beginner investors:

- understand fund investing fundamentals,
- understand risk and portfolio structure,
- identify behavior and decision-making biases,
- practice investment decisions in explainable historical scenarios,
- improve judgment through explanation, reflection, and guided next steps.

## 5. Target Users

Primary users:

- beginner or early-stage retail fund investors,
- users with limited financial vocabulary,
- users who need structured explanation before taking action,
- users who are vulnerable to emotional or impulsive investing behavior.

The default user model is beginner-first, not advanced trader-first.

## 6. Product Scope

### 6.1 Core product tracks

Phase 1 FundGene focuses on four core tracks:

1. AI learning assistant and fund knowledge education
2. user profiling and behavior bias identification
3. portfolio analysis and decision support
4. historical scenario simulation and review

Supporting product surfaces:

- dashboard or home overview,
- learning center,
- behavior coaching,
- portfolio analysis workspace,
- simulation workspace,
- news and policy interpretation.

### 6.2 Explicit non-goals

FundGene must not become:

- a live trading platform,
- an auto-execution or auto-order system,
- a product that promises returns,
- a high-risk investment recommendation engine,
- a multi-agent demo built mainly for novelty.

Any feature that looks like direct trade execution, guaranteed return language, or aggressive investment advice is outside scope unless this document is explicitly updated first.

## 7. Core Product Philosophy

### 7.1 Beginner-first

Every major decision should optimize for clarity and usability for a beginner investor.

### 7.2 Explanation-first

The system should explain before it recommends. Answers should help the user understand why, not just what.

### 7.3 Training-first

The product should improve the user's judgment over time, not simply produce one-off answers.

### 7.4 Traceability-first

Agent outputs should be structured, inspectable, and tied to evidence, execution steps, and risk notices wherever applicable.

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

### 8.2 Schema-first outputs

Business-critical AI outputs should be defined by schemas before prompt expansion. Structured outputs are preferred over free-form text whenever the result affects persistence, rendering, or downstream logic.

### 8.3 Backend owns business truth

Domain logic, validation, persistence, recommendation logic, and auditability belong in the backend. The frontend should present product workflows clearly, but should not become the primary home of business rules.

### 8.4 Data model before feature sprawl

The data model should support durable learning progress, behavior profiles, portfolio analyses, simulation sessions, and agent traces before adding extra feature breadth.

### 8.5 Real product loops before advanced orchestration

The project should first complete usable product loops with strong explanation and persistence. Advanced orchestration, complex long-running agent graphs, or human-in-the-loop workflow engines are second-stage concerns.

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
- `apps/web` now includes a minimal auth entry route at `/start`; authenticated workspace pages run on a real cookie-backed user session instead of a local header bridge.
- `apps/web` now includes the first real MVP Spine A workflow: `/start` -> `/onboarding` persists profile and questionnaire state to the backend, `/coach` can submit a real beginner fund question and read persisted structured answers, and `/dashboard` reads the resulting real state instead of mock placeholders.
- `apps/web` now includes a real learning loop: `/learning` reads the persisted learning path, `/learning/[courseSlug]` reads course detail and section completion state, and section completion writes back to the backend and refreshes dashboard state.
- `apps/web` now includes a real portfolio loop: `/portfolio` accepts manual snapshot input, renders the latest persisted explainable report, and shows report history instead of schema placeholder fields.
- `apps/web` now includes a real simulation loop: `/simulation` lists seeded historical scenarios, starts persisted training sessions, submits step actions, and reads final structured reviews that flow back into dashboard and behavior context.
- `apps/web` now includes a real `/news` workspace that reads persisted news/policy items, can request structured interpretation for a selected item, and can submit a user-pasted headline/body for current-user-only analysis.
- `apps/web` now has a systematic high-end financial workbench visual pass across the shared shell and the main workspace routes. The redesign keeps the beginner-first product boundary, removes generic SaaS/gradient-orb styling, centralizes core UI primitives in `components/ui/primitives.tsx`, and uses the existing ECharts dependency for the portfolio allocation donut.
- The 2026-05-04 Figma replacement pass implemented the `FundGene` Figma file `FFZJZxEArViu5GYUDx2gr9`, root node `38:2`, across the current frontend. The pass tightened the dark black-green Figma shell and token system, rebuilt `/start` around the Figma account-entry screen, preserved the authenticated workspace behavior, and expanded visual coverage across `/`, `/start`, `/dashboard`, `/onboarding`, `/coach`, `/learning`, `/learning/[courseSlug]`, `/portfolio`, `/simulation`, and `/news`.
- The 2026-05-04 frontend UX pass moves `/coach` to a conversation-first layout: chat is the primary surface, structured answer details stay inside assistant messages, and internal agent trace/evidence stays out of the user-facing UI. Trace and evidence remain persisted and readable through authorized backend APIs for development and audit, but beginner users should see explanation, risk boundary, next actions, and follow-up prompts rather than tool names, run IDs, or citation keys.
- `apps/web` now includes a Playwright plus axe QA baseline under `apps/web/e2e` and a GitHub Actions workflow at `.github/workflows/ci.yml`.
- `.github/workflows/ci.yml` now has separate `web` and `api` jobs. The `api` job uses Python 3.12 plus uv and runs `pnpm sync:api`, `pnpm test:api`, `pnpm test:agent-evals`, and `pnpm migrate:api:sql`.
- `apps/web` is verified by `pnpm lint:web`, `pnpm build:web`, and the new `pnpm test:web:e2e` entrypoint when Playwright browsers are installed. The 2026-04-29 visual pass was additionally smoke-checked at 1440px, 900px, and 390px widths for horizontal overflow and screenshot review. The 2026-05-04 expanded visual-smoke suite now covers every current product route at desktop and mobile widths, including `/`, `/start`, `/onboarding`, and `/learning/[courseSlug]`.
- `apps/api` now exists as a real Python 3.12+ / FastAPI / SQLAlchemy / Alembic / PydanticAI application skeleton.
- `apps/api` currently provides `GET /api/health`, `GET /api/ready`, `GET /api/product`, `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/assistant/session`, `POST /api/assistant/messages`, `GET /api/assistant/runs/{run_id}/trace`, `POST /api/onboarding/profile`, `GET /api/users/me`, `POST /api/behavior/questionnaires`, `GET /api/behavior/profile`, `GET /api/behavior/training-plan`, `GET /api/dashboard`, `GET /api/learning/path`, `GET /api/learning/courses/{course_slug}`, `POST /api/learning/progress`, `POST /api/portfolio/snapshots`, `GET /api/portfolio/latest`, `GET /api/portfolio/history`, `GET /api/simulations/scenarios`, `POST /api/simulations/sessions`, `GET /api/simulations/sessions/{session_id}`, `POST /api/simulations/actions`, `GET /api/simulations/review/{session_id}`, `GET /api/news`, `GET /api/news/{item_id}`, `POST /api/news/analyze`, and `GET /api/news/analyses/{analysis_id}`, plus a single-entry `AdvisorAgent` runtime with domain toolchains.
- `apps/api` now has a coherent migration-first auth-plus-onboarding-plus-coach-plus-learning-plus-portfolio-plus-simulation-plus-news-plus-agent-trace baseline; the authoritative current baseline tables are `auth_users`, `auth_sessions`, `user_profiles`, `risk_questionnaires`, `behavior_profiles`, `chat_sessions`, `chat_messages`, `agent_runs`, `agent_steps`, `agent_tool_calls`, `agent_evidence_refs`, `agent_state_update_proposals`, `learning_paths`, `courses`, `course_sections`, `user_course_progress`, `portfolio_snapshots`, `portfolio_holdings`, `portfolio_analyses`, `scenarios`, `scenario_events`, `simulation_sessions`, `simulation_actions`, `simulation_reviews`, `news_items`, `policy_items`, `news_analyses`, and `agent_citations`.
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

FundGene is a beginner fund investing coach. It should move users from fragmented information and emotional reactions toward explainable understanding, repeatable practice, and disciplined next steps.

### 13.2 Core user problems

FundGene is designed to solve:

- knowledge gaps about funds, risk, and asset allocation,
- noise overload from news and opinions,
- inability to interpret portfolio structure and risk exposure,
- hidden behavior biases such as chasing gains or panic selling,
- lack of a safe practice environment for historical decision training.

### 13.3 Core modules

The product spine is:

- dashboard,
- AI coach workspace,
- learning center,
- behavior profile,
- portfolio analysis,
- historical scenario simulation,
- news and policy interpretation.

### 13.4 User main path

The main user loop is:

1. onboarding and risk profile,
2. dashboard with recommended next actions,
3. guided learning,
4. portfolio health check,
5. micro-simulation or historical training,
6. behavior update and next-step recommendation.

### 13.5 Minimal releasable spine

The minimum releasable spine is:

- authentication and basic user profile,
- risk questionnaire,
- dashboard,
- AI coach for beginner fund questions,
- learning center with progress tracking,
- portfolio analysis with explainable output,
- durable structured records for runs, reports, and evidence.

Historical simulation and news interpretation can be released in reduced form after the above spine is real and stable.

### 13.6 MVP input rules

For MVP:

- portfolio inputs should be manual entry or controlled fixtures first,
- questionnaire inputs should be internal and structured,
- course content should come from internal fixtures or curated local sources first,
- no broker links, trading account connections, or live execution flows are allowed.

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
3. build on top of the current migration-first baseline rather than ad hoc fixtures or offline-only assumptions,
4. stabilize the now-real onboarding/dashboard/coach/learning/portfolio/simulation loops before expanding breadth,
5. stabilize `/news` against real feed refresh, manual interpretation, dashboard, and coach-context behavior,
6. move the next engineering focus toward observability, production deployment, and runtime hardening rather than new novelty surfaces.

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
  - course section completion writes to `user_course_progress` and refreshes dashboard next actions.
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
