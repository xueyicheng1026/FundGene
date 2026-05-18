# Agent Command Center Frontend API Connection Review

Date: 2026-05-17

Source context:

- `automations-profile-review.md`
- `docs/api/API_CONTRACT.md`
- `apps/api/tests/test_automations_flow.py`
- `apps/api/tests/test_profile_command_center_flow.py`

## Summary

This continuation connected the `/automations` and `/profile` frontend surfaces to the first durable Agent Command Center backend contracts.

Before this pass, `/automations` and `/profile` were useful frontend workspaces but still relied on local seed state for automation cards, switch/cadence changes, pending writebacks, and resolved counts. After this pass, the UI consumes backend-owned view models and writes decisions through backend endpoints.

## Rework Completed

- Added typed web API clients for:
  - `GET /api/automations`
  - `PATCH /api/automations/{automation_key}`
  - `POST /api/automations/{automation_key}/run`
  - `GET /api/profile/context`
  - `GET /api/profile/pending-proposals`
  - `POST /api/profile/pending-proposals/{proposal_id}/accept`
  - `POST /api/profile/pending-proposals/{proposal_id}/reject`
- Reworked `/automations` so backend data is the source of truth for:
  - automation titles and safety copy,
  - enabled state,
  - cadence options and selected cadence,
  - next queue,
  - last run,
  - manual run eligibility,
  - Daily Brief summary and source coverage.
- Reworked `/profile` so backend data is the source of truth for:
  - context readiness,
  - risk and behavior profile summaries,
  - portfolio, learning, and simulation context,
  - automation authorization status,
  - authorization scope,
  - pending proposals and resolved counts.
- Replaced local pending proposal filtering with backend accept/reject mutations and React Query invalidation.
- Updated Playwright fixtures to mock the new backend contracts, including PATCH and pending proposal decision routes.

## Screenshots

- `/automations` desktop: `apps/web/test-results/visual-smoke-automations-visual-smoke-chromium/automations-desktop.png`
- `/automations` mobile: `apps/web/test-results/visual-smoke-automations-visual-smoke-chromium/automations-mobile.png`
- `/profile` desktop: `apps/web/test-results/visual-smoke-profile-visual-smoke-chromium/profile-desktop.png`
- `/profile` mobile: `apps/web/test-results/visual-smoke-profile-visual-smoke-chromium/profile-mobile.png`

## Verification

Passed:

```bash
pnpm lint:web
pnpm build:web
pnpm --filter @fundgene/web test:e2e -- e2e/workspaces.spec.ts --project=chromium
FUNDGENE_WEB_PORT=3033 pnpm test:web:a11y
FUNDGENE_WEB_PORT=3032 pnpm --dir apps/web exec playwright test e2e/visual-smoke.spec.ts --project=chromium -g "automations|profile"
git diff --check -- apps/web/lib/api.ts apps/web/components/automations-workspace.tsx apps/web/components/profile-workspace.tsx apps/web/e2e/fixtures.ts apps/web/e2e/workspaces.spec.ts
```

Notes:

- An earlier a11y run collided with a concurrently running Playwright web server. It was rerun separately and passed.
- An earlier `pnpm build:web` surfaced TypeScript issues in the Playwright fixture mock shape. The fixture was adjusted and the build passed.

## Acceptance

`/automations` and `/profile` are now connected to the backend-owned Command Center contracts for the current V1 migration stage.

Residual product/backend limitations:

- Automation runs are still synchronous backend records, not a scheduler or background worker.
- Pending proposal application remains allow-listed; current durable application covers confirmed `behavior_profile_note`.
- A future pass can add scheduler semantics, notification delivery, and richer writeback targets after the safety boundary is designed.
