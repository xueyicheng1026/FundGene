# FundGene Agent Command Center Implementation Plan

Date: 2026-05-17
Status: V1 implementation plan. Supersedes `agentic-beginner-coach-implementation-plan.md` for future product work.

## 1. Core Direction

FundGene V1 should implement the Agent Command Center model:

```text
profile and authorization
  -> default Daily Brief automation
  -> Today home
  -> Agent Workspace task run
  -> safe action / pending confirmation
  -> writeback after user confirmation
  -> next brief
```

This is a product IA and runtime-contract change, not just a visual redesign.

## 2. Non-Negotiable Boundaries

Allowed automation:

- read authorized user context,
- analyze portfolio/news/learning/simulation/behavior context,
- generate Daily Brief,
- generate safe next actions,
- prepare pending writebacks,
- notify the user that confirmation is needed.

Forbidden automation:

- broker connection or trade execution,
- buy/sell/clear/full-position instructions,
- return promises,
- exact investment amount instructions,
- silent canonical profile mutation from weak evidence,
- hidden background changes to high-impact user state.

## 3. Phase 0: Documentation and Contract Alignment

Goal: stop old module-first context from steering implementation.

Tasks:

- Update `AGENTS.md`, `PROJECT_OVERVIEW.md`, and `docs/product/PRODUCT_BLUEPRINT.md`.
- Add this plan and `agent-command-center-ux-v1.md`.
- Mark old Agentic Beginner Coach UX/plan docs as superseded.
- Add Command Center notes to architecture docs.

Verification:

```bash
rg -n "Agent Command Center|/today|/agent|/automations|/profile" AGENTS.md PROJECT_OVERVIEW.md docs/product docs/architecture
```

## 4. Phase 1: Route and Navigation Migration

Goal: make IA visible before deeply rewriting every domain module.

Target:

- `/today`: Daily Brief home.
- `/agent`: Agent Workspace.
- `/automations`: automation authorization.
- `/profile`: context and authorization center.

Migration:

- Redirect or alias `/dashboard` to `/today`.
- Redirect or alias `/coach` to `/agent`.
- Remove `/learning`, `/portfolio`, `/simulation`, `/news` from primary navigation.
- Keep old routes as detail/action targets.

Frontend verification:

```bash
pnpm lint:web
pnpm build:web
pnpm test:web:e2e
pnpm test:web:a11y
```

Screenshot verification:

- desktop and mobile screenshots for `/today`, `/agent`, `/automations`, `/profile`,
- interaction screenshots for a Daily Brief action and an Agent Workspace task.

## 5. Phase 2: Today / Daily Brief Contract

Goal: make Daily Brief the default product object.

Backend target:

- Keep current `GET /api/dashboard` temporarily if useful.
- Add or migrate toward `GET /api/today`.
- Return `DailyBrief` with:
  - `brief_id`,
  - `as_of`,
  - `status`,
  - `priority_level`,
  - `headline`,
  - `beginner_explanation`,
  - `evidence[]`,
  - `primary_action`,
  - `secondary_actions[]`,
  - `do_not_do`,
  - `source_coverage`,
  - `trace_id`.

Frontend target:

- First screen shows one judgment.
- Evidence capped at three.
- Safe action is clear and product-internal.
- `do_not_do` is visible.
- Source coverage and generation time are visible but secondary.

Verification:

```bash
pnpm test:api
pnpm test:agent-evals
pnpm migrate:api:sql
```

## 6. Phase 3: Agent Workspace Run Contract

Goal: replace chat-page mental model with task-run mental model.

Backend target:

- Current `POST /api/assistant/messages` can remain as compatibility path.
- Add or adapt an Agent Workspace run contract:
  - task input,
  - run status,
  - natural-language steps,
  - output sections,
  - command actions,
  - pending confirmations,
  - advanced trace link.

Frontend target:

- Task input is primary.
- Agent process is visible.
- Default steps are beginner-readable.
- Advanced trace is expandable.
- Confirmation cards are explicit before writeback.

Example default steps:

```text
正在理解任务
正在读取你的风险画像
正在检查最新组合
正在筛选相关资讯
正在评估影响路径
正在生成安全下一步
等待你确认是否写回
```

## 7. Phase 4: Automations MVP

Goal: make L2 automation visible and controllable.

MVP automations:

- Daily Brief, default on and user-controllable.
- Weekly Portfolio Check, opt-in or clearly explained.
- News Impact Watch, opt-in or limited default.
- Behavior Bias Observation, pending confirmation only.

Data/API target:

- `automation_settings`
- `automation_runs`
- `daily_brief_preferences`
- enable/disable/frequency controls
- last run and next run metadata

UX target:

- Cards explain reads, outputs, frequency, confirmation needs, and safety boundary.
- No hidden monitoring language.

## 8. Phase 5: Profile Authorization and Pending Writeback

Goal: make the user the confirmer, not the analyst.

Profile should manage:

- user facts,
- risk profile,
- portfolio context,
- behavior evidence,
- learning state,
- automation permissions,
- pending state proposals.

Backend target:

- `pending_user_confirmations` or equivalent state proposal table.
- clear confirmation endpoints.
- reject/update/accept flows.

Rules:

- Weak behavior evidence stays pending.
- Durable profile writes require confirmation.
- Agent-generated plan changes are proposals first.

## 9. Phase 6: Module-to-Tool Migration

Goal: preserve working capability while removing module-first navigation.

Keep:

- portfolio report generation,
- news analysis,
- learning progress,
- simulation sessions,
- behavior profiles.

Change:

- pages are entered from Agent actions, evidence drilldowns, or Profile.
- page first screens show Agent conclusion before raw lists.
- old module pages do not appear in top-level nav.

## 10. Phase 7: Regression and Visual Review

Required checks for large implementation changes:

```bash
pnpm lint:web
pnpm build:web
pnpm test:web:e2e
pnpm test:web:a11y
pnpm test:api
pnpm test:agent-evals
pnpm migrate:api:sql
```

Required browser/screenshot review:

- `/today` desktop/mobile,
- `/agent` desktop/mobile after submitting a task,
- `/automations` desktop/mobile,
- `/profile` desktop/mobile,
- old detail pages entered from Agent actions.

Review questions:

- Does the first screen show the agent already did work?
- Is the user choosing/confirming rather than manually analyzing?
- Are old modules visually demoted?
- Are trace details layered instead of dumped?
- Are safety boundaries visible?
