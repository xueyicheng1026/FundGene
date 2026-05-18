# FundGene Agentic Beginner Coach UX v1

日期：2026-05-17
状态：已归档。本文档原本是 Agentic Beginner Coach 阶段的 UX 基线，但已被新的 Agent Command Center 方向取代。

请不要把本文档作为后续 V1 IA、页面导航、路由命名或重构顺序的依据。

新的权威文档：

- `docs/product/PRODUCT_BLUEPRINT.md`
- `docs/product/agent-command-center-ux-v1.md`
- `docs/product/agent-command-center-implementation-plan.md`

关键变化：

- 目标一级 IA 从 `/dashboard`、`/coach` 和多个模块页，改为 `/today`、`/agent`、`/automations`、`/profile`。
- `/dashboard` 是 `/today` 的迁移前身。
- `/coach` 是 `/agent` 的迁移前身。
- `/learning`、`/portfolio`、`/simulation`、`/news` 降级为 Agent 工具详情页，不再代表主导航。
- V1 自动化范围是 L1 用户主动任务 + L2 默认每日简报。
- 默认展示自然语言 Agent 执行步骤，高级模式才展示 tool call、trace、worker output、policy guard 等内部细节。

历史价值：

- Daily Brief、Evidence、Safe Next Action、安全边界、pending behavior proposal 等对象仍可作为概念来源。
- 旧页面逐个 agentic 化的实施顺序不再适用。
