# Automation Scheduler Review

Date: 2026-05-17

## Summary

This continuation moves Agent Command Center automations from persisted manual runs to a first real scheduler/background-worker path.

The implementation remains product-bounded: automatic work can read authorized context, generate analysis, create product notifications, and prepare pending suggestions. It still cannot connect to broker execution, place orders, promise returns, silently change canonical behavior profile, or turn news relevance into a trading signal.

## Implementation

- Added Alembic revision `20260517_0011`.
- Added `automation_notifications` for in-app automation completion notices and confirmation entry points.
- Extended `automation_runs` with:
  - `trigger_type`
  - `due_at`
  - `error_message`
  - `agent_run_id`
- Added real cadence calculation for the allow-listed automation cadence keys, including weekday/weekend handling and timezone support.
- Added `run_due_automations(db, now=None, limit=...)` to scan enabled due settings for onboarded users.
- Refactored manual and scheduled execution to share the same execution path.
- Added a small CLI worker:
  - `python -m app.scripts.run_automation_worker --once --limit 20`
  - `python -m app.scripts.run_automation_worker --poll-seconds 60`
- Added optional FastAPI lifespan worker startup, gated by `FUNDGENE_AUTOMATION_WORKER_ENABLED=true` and disabled by default.
- Updated `/automations` to render backend `recent_notifications`.

## Pending Proposals

- `daily_brief` produces notification-only output to avoid daily confirmation noise.
- `weekly_portfolio` creates a pending internal Safe Next Action to inspect portfolio concentration.
- `news_watch` creates a pending internal Safe Next Action to inspect news impact paths.
- `behavior_observation` creates a pending `behavior_profile_note`.
- Behavior evidence is not applied until the user explicitly accepts the proposal in Profile.

## Safety And Runtime Notes

- The scheduler only scans tasks where `enabled=true`, `next_run_at <= now`, and the user has completed onboarding.
- Failed runs are persisted with `status=failed` and `error_message`; `next_run_at` is delayed to avoid tight retry loops.
- The first scan uses `FOR UPDATE SKIP LOCKED` where the database supports it, but production deployment should still prefer one dedicated worker process or add a stronger claim field if multiple schedulers are introduced.
- The FastAPI worker path is a convenience option only; the CLI worker is the cleaner deployment primitive for a separate process/container.

## Verification

Targeted verification passed during implementation:

```bash
uv run --project apps/api python -m pytest -p no:capture apps/api/tests/test_automations_flow.py
```

Broader verification should be refreshed after final review:

```bash
pnpm test:api
pnpm test:agent-evals
pnpm migrate:api:sql
pnpm lint:web
pnpm build:web
git diff --check
```
