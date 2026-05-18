# Agentic Beginner Coach Screenshot Review

Date: 2026-05-17
Scope: screenshot review after the first Agentic Beginner Coach implementation pass
Source target: `docs/product/agentic-beginner-coach-ux-v1.md`

## Verification Run

Command:

```bash
FUNDGENE_WEB_PORT=3000 pnpm --filter @fundgene/web exec playwright test e2e/visual-smoke.spec.ts --output=../../docs/audits/agentic-beginner-coach-review-2026-05-17/playwright-output-3000
```

Result:

- 10 visual-smoke tests passed.
- Desktop and mobile screenshots were generated for all current routes.
- The run reused the already-running Next dev server on port `3000`; starting a second dev server on a clean port failed because Next reported an existing dev server for this app directory.

Screenshot directory:

`docs/audits/agentic-beginner-coach-review-2026-05-17/playwright-output-3000/`

## Expected Product Shape

The expected shape is not "prettier cards." The expected shape is:

```text
Agent synthesis
  -> one main judgment
  -> why it matters to this user
  -> one safe next action
  -> what not to do
  -> page-level writeback
```

The benchmark is:

- `/dashboard` is the real personal Daily Brief home.
- `/` is only an entry or return path, not the personal judgment page.
- Every major workspace should open with an Agent judgment or safe empty state.
- Safe actions must be concrete, internal, explainable, and low-risk.
- Evidence must be visible as "why this matters to me," not as raw data.
- No page should imply buying, selling, position clearing, exact amount advice, return promises, or short-term certainty.

## Overall Judgment

Current distance to the target: about 70%.

The implementation has crossed the most important line: `/dashboard` now looks like a Daily Brief surface rather than an ordinary status board. The product now visibly says "today's judgment, evidence, safe next action, safety boundary." That is the core move.

The remaining gap is mainly consistency across all pages. Some pages are still closer to their original module identity:

- `/portfolio` is still partly a report and input workspace.
- `/news` is still partly a structured news explainer.
- `/learning` is still partly a course catalog.
- `/simulation` is still partly a scenario directory.
- `/` still reads more like a module matrix than a sharp Agentic Coach entry.

## Page Findings

### `/dashboard`

Status: close to target.

Screenshot paths:

- `visual-smoke-dashboard-visual-smoke-chromium/dashboard-desktop.png`
- `visual-smoke-dashboard-visual-smoke-chromium/dashboard-mobile.png`

What works:

- First screen now clearly says `今日教练简报`.
- There is one headline judgment.
- Evidence cards are visible under `为什么和我有关`.
- A `先不要` safety boundary is visible.
- The primary action is framed as `安全下一步`.
- Mobile still surfaces the brief, evidence, boundary, and action before the rest of the module material.

Remaining gap:

- Desktop hero has a large left blank area because evidence is concentrated in the right column and the action sits below; visually this feels slightly stretched rather than tightly coached.
- The second half of the page still returns to module-board language: `判断基线`, `今日任务流`, `行动队列`, `最新回流信号`.
- Mobile height increased to `390x3578`; it is acceptable for a rich home, but the secondary sections are still long.

Priority:

- P0 polish: tighten the desktop Daily Brief hero composition and reduce secondary section weight.

### `/start`

Status: partially aligned.

Screenshot paths:

- `visual-smoke-start-visual-smoke-chromium/start-desktop.png`
- `visual-smoke-start-visual-smoke-chromium/start-mobile.png`

What works:

- It remains a functional account entry, not a marketing page.
- It says the product creates a safe profile and does not do trading execution or return promises.
- Mobile puts account entry near the top.

Remaining gap:

- It does not yet clearly present the three states from the UX doc: unauthenticated, new user needing profile, returning user going to Daily Brief.
- The copy still emphasizes `建立安全画像` more than `登录后先生成今日教练简报`.

Priority:

- P1: sharpen the three-state entry promise.

### `/portfolio`

Status: halfway to target.

Screenshot paths:

- `visual-smoke-portfolio-visual-smoke-chromium/portfolio-desktop.png`
- `visual-smoke-portfolio-visual-smoke-chromium/portfolio-mobile.png`

What works:

- Existing report appears before the input form on desktop.
- Copy says "先解释持仓结构，再讨论配置原则," which is aligned.
- Report chart, risk exposure, concentration alert, and next action are readable.
- Mobile uses segmented controls and keeps report first.

Remaining gap:

- It is still more "portfolio report + manual input" than "profile-aware portfolio conclusion."
- The profile-aware layer is not explicit enough: the page does not strongly say why this portfolio risk matters for this specific user's risk level or behavior pattern.
- Mobile remains very long at `390x4477`.

Priority:

- P1: add explicit profile-aware conclusion and make it the first report unit.

### `/news`

Status: structurally clean, but still not enough relevance-to-user.

Screenshot paths:

- `visual-smoke-news-visual-smoke-chromium/news-desktop.png`
- `visual-smoke-news-visual-smoke-chromium/news-mobile.png`

What works:

- It strongly avoids turning news into a trading instruction.
- The structure of fact, path, uncertainty is clear.
- The mobile screen is readable and not broken.

Remaining gap:

- The page still reads mostly as "choose a news item, generate structured explanation."
- Relevance to this user is only lightly visible through labels like `相关度 0.82`, not through a full impact path tied to portfolio, behavior risk, and learning gap.
- The expected shape is `policy/news -> market path -> user's portfolio exposure -> behavior risk -> safe next action`.

Priority:

- P1: add `relevance-to-user` and `impact path` as first-class display objects.

### `/learning`

Status: visually good, but not fully agentic.

Screenshot paths:

- `visual-smoke-learning-visual-smoke-chromium/learning-desktop.png`
- `visual-smoke-learning-visual-smoke-chromium/learning-mobile.png`

What works:

- The current recommendation is visible near the top.
- Learning is framed as decision language, not generic course browsing.
- The page is compact compared with other workspaces.

Remaining gap:

- The page does not yet show enough "why now" evidence, such as "来自组合/新闻/行为/模拟."
- Completion writeback is implied, not explicit.

Priority:

- P1/P2: add recommendation trigger and completion writeback explanation.

### `/simulation`

Status: aligned in tone, still needs stronger behavior-evidence loop.

Screenshot paths:

- `visual-smoke-simulation-visual-smoke-chromium/simulation-desktop.png`
- `visual-smoke-simulation-visual-smoke-chromium/simulation-mobile.png`

What works:

- The page clearly frames simulation as training, not prediction.
- It explains the sequence: choose scenario, write reason, receive feedback, generate review.
- It surfaces behavior focus and recommended scenario.

Remaining gap:

- Behavior Evidence and pending proposal are not yet visible as product concepts.
- The first screen is still partly a scenario-selection page; the recommended training assignment could be more dominant.

Priority:

- P1: make recommended training assignment and pending behavior evidence loop explicit.

### `/coach`

Status: strong for conversation, needs better Daily Brief anchoring.

Screenshot paths:

- `visual-smoke-coach-visual-smoke-chromium/coach-desktop.png`
- `visual-smoke-coach-visual-smoke-chromium/coach-mobile.png`

What works:

- Conversation-first layout is clear.
- The answer card has boundary reminder, next step, and user-voice follow-up prompts.
- Internal trace details are not visible.

Remaining gap:

- It should more explicitly show "current Daily Brief context" at the top.
- The right rail shows user context and next-step queue, but the link to the current brief could be stronger.

Priority:

- P1/P2: strengthen Daily Brief context and source-route explanation.

### `/`

Status: acceptable for now, but not final.

Screenshot paths:

- `visual-smoke-overview-visual-smoke-chromium/overview-desktop.png`
- `visual-smoke-overview-visual-smoke-chromium/overview-mobile.png`

What works:

- It clearly shows product boundaries and module path.
- It does not pretend to be a personal judgment page.

Remaining gap:

- It still reads as a "FundGene 工作总控" module matrix.
- The expected final entry should more sharply say: "enter to get today's coach brief," not "here are all modules."

Priority:

- P2: leave it after `/dashboard`, `/portfolio`, `/news`, `/learning`, `/simulation`, and `/coach`.

## Priority Next Fixes

1. Tighten `/dashboard` Daily Brief hero layout.
2. Add profile-aware conclusion to `/portfolio`.
3. Add relevance-to-user and impact path to `/news`.
4. Add recommendation trigger and completion writeback to `/learning`.
5. Make `/simulation` show behavior evidence and pending proposal language.
6. Make `/coach` explicitly inherit current Daily Brief context.
7. Finally simplify `/` around the Agentic Coach promise.

## Verification Notes

Passed:

```bash
FUNDGENE_WEB_PORT=3000 pnpm --filter @fundgene/web exec playwright test e2e/visual-smoke.spec.ts --output=../../docs/audits/agentic-beginner-coach-review-2026-05-17/playwright-output-3000
```

Not run in this audit:

```bash
pnpm lint:web
pnpm build:web
pnpm test:web:e2e
pnpm test:web:a11y
pnpm test:api
pnpm test:agent-evals
pnpm migrate:api:sql
```

