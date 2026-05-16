# FundGene

FundGene 是一个面向基金投资新手的 AI 投资陪练与决策支持产品，不是泛聊天机器人，也不是自动交易系统。

## 当前状态

截至 2026-04-30，FundGene 已从“主干已恢复”推进到“onboarding / coach / dashboard / learning / portfolio / simulation / news 都已有真实前后端闭环，并完成 Agent Runtime v2 第一条可追踪 advisor spine 和 DeepSeek V4 默认模型接入”的阶段。

已确认并验证的事实：

- `AGENTS.md` 仍然是唯一指定的全局上下文文档，后续 agent 必须先读它。
- `PROJECT_OVERVIEW.md` 是当前项目总览、demo 叙事和 Agent Runtime v2 蓝图的集中入口。
- FundGene 现在已经是独立 git 仓库边界；此前损坏的元数据被保留为 `.git.broken-20260402`。
- `apps/web` 已恢复为真实前端主应用根：
  - Next.js 16
  - React 19
  - TypeScript
  - App Router
  - Tailwind CSS 4
  - 已落地 `/`、`/start`、`/dashboard`、`/onboarding`、`/coach`、`/learning`、`/portfolio`、`/simulation`、`/news`
  - 已形成 `/start` -> onboarding -> questionnaire -> coach -> dashboard 的第一条最小真实前端工作流
  - `/coach` 已从“读当前用户上下文”推进到“真实提问 -> 后端持久化 -> 结构化回答 -> 最小历史回读 -> dashboard 留痕”的第一条产品闭环
  - `/learning` 已从占位页推进到“真实学习路径 -> 课程详情 -> section 完成回写 -> dashboard 刷新”的学习闭环
  - `/portfolio` 已从 schema 占位推进到“手动录入持仓快照 -> 生成解释型报告 -> 历史回读 -> dashboard 留痕”的组合分析闭环
  - `/simulation` 已推进到“场景目录 -> 会话启动 -> 节点动作提交 -> 最终复盘 -> dashboard / behavior / coach 联动”的行为训练闭环
  - `/news` 已推进到“资讯/政策列表 -> 结构化解读 -> 手动粘贴解读 -> dashboard / coach 联动”的新闻政策解读闭环
  - 已通过 `pnpm lint:web`、`pnpm build:web` 与 `pnpm test:web:e2e`
- `apps/api` 已恢复为真实后端主应用根：
  - Python 3.12+
  - FastAPI
  - SQLAlchemy 2.x
  - Alembic
  - PydanticAI
  - 已落地 `GET /api/health`、`GET /api/product`、`GET /api/assistant/session`、`POST /api/assistant/messages`
  - 已落地最小认证与会话接口：
    - `POST /api/auth/register`
    - `POST /api/auth/login`
    - `GET /api/auth/session`
    - `GET /api/auth/me`（兼容别名）
    - `POST /api/auth/logout`
  - 已落地 MVP Spine A / B 当前核心接口：
    - `POST /api/onboarding/profile`
    - `GET /api/users/me`
    - `POST /api/behavior/questionnaires`
    - `GET /api/behavior/profile`
    - `GET /api/behavior/training-plan`
    - `GET /api/dashboard`
    - `GET /api/learning/path`
    - `GET /api/learning/courses/{course_slug}`
    - `POST /api/learning/progress`
    - `POST /api/portfolio/snapshots`
    - `GET /api/portfolio/latest`
    - `GET /api/portfolio/history`
    - `GET /api/simulations/scenarios`
    - `POST /api/simulations/sessions`
    - `GET /api/simulations/sessions/{session_id}`
    - `POST /api/simulations/actions`
    - `GET /api/simulations/review/{session_id}`
    - `GET /api/news`
    - `GET /api/news/{item_id}`
    - `POST /api/news/analyze`
    - `GET /api/news/analyses/{analysis_id}`
  - 已落地 coach 最小持久化表与聚合基线：
    - `chat_sessions`
    - `chat_messages`
    - `agent_runs` 继续承载每次响应的 trace
  - 已落地 learning / portfolio / simulation 最小持久化表：
    - `learning_paths`
    - `courses`
    - `course_sections`
    - `user_course_progress`
    - `portfolio_snapshots`
    - `portfolio_holdings`
    - `portfolio_analyses`
    - `scenarios`
    - `scenario_events`
    - `simulation_sessions`
    - `simulation_actions`
    - `simulation_reviews`
    - `news_items`
    - `policy_items`
    - `news_analyses`
    - `agent_citations`
  - 已通过 `pnpm test:api`
  - 已通过真实 HTTP 请求验证 `/api/health` 与 `/api/product`
  - 已通过 `pnpm migrate:api:sql` 验证 Alembic 离线迁移展开到 `20260429_0009`
  - 已在此前完成 live PostgreSQL migration 到 `20260402_0005`
  - revisions `20260426_0006`、`20260426_0007`、`20260426_0008` 与 `20260429_0009` 的 live local PostgreSQL 升级尚未重跑，因为当前本机 Docker daemon 不可用
  - 已通过真实 HTTP / pytest 闭环验证 register -> session -> profile -> questionnaire -> learning -> portfolio -> simulations -> news -> assistant/messages -> dashboard 的关键主路径
- Agent Runtime v2 第一条 deterministic advisor spine 已落地，但不能误读为完整长期 agent 平台：
  - 当前稳定对外入口仍是 `GET /api/assistant/session` 与 `POST /api/assistant/messages`
  - 代码中已出现 `20260429_0009` trace migration、`agent_steps`、`agent_tool_calls`、`agent_evidence_refs`、`agent_state_update_proposals` 模型和 `agent_runs.policy_status` 字段
  - `POST /api/assistant/messages` 已创建 run、执行 v2 orchestrator、写入 steps/tool calls/evidence/state proposals/policy status/context snapshot，并保存结构化 assistant message
  - `GET /api/assistant/runs/{run_id}/trace` 已按当前登录用户授权读取 trace
  - `/coach` 已通过 trace API client 和 `TraceAuditPanel` 展示 steps、tools、evidence、policy status 和 orchestrator version
  - `services/evals` 已提供首个 20 条用例的本地 agent regression harness，根脚本为 `pnpm test:agent-evals`，CI 的 API job 已纳入该检查
  - 后续重点是扩展 eval 覆盖、选择性 RAG、citation faithfulness、跨领域 worker 组合和生产观测，不是把它包装成自由聊天式多 agent demo
  - 涉及 v2 仍必须持续跑 `pnpm sync:api`、`pnpm test:api`、`pnpm migrate:api:sql`，并保留 web 的 `pnpm lint:web`、`pnpm build:web`、`pnpm test:web:e2e`
- DeepSeek V4 接入已落地在后端运行时：
  - 默认模型为 `FUNDGENE_ADVISOR_MODEL=deepseek:deepseek-v4-pro`
  - 省成本/低延迟时可切到 `deepseek:deepseek-v4-flash`
  - key 只通过 `FUNDGENE_DEEPSEEK_API_KEY` 或兼容的 `DEEPSEEK_API_KEY` 从环境变量读取
  - 无 key 或模型失败时，coach 请求自动保留 deterministic fallback，并在 trace metadata 记录原因
  - news/portfolio 只允许 DeepSeek 增强解释文本；事实、权重、集中度、风险桶、citation 与安全边界仍由后端规则和持久化数据决定
- `packages/` 与 `services/` 仍主要是占位目录，不应被误认为共享层已成熟。
- `data/dev/fundgene.db` 仍然只是参考 fixture，不是主干实现真相源。
- `archive/` 仍然是参考归档，不得直接回流主干。

当前需要明确理解的实现约束：

- 当前主路径已经切到最小正式认证基线：邮箱 + password hash + 持久化 session + `HttpOnly` cookie。
- `X-FundGene-User-Id` 不再是主路径依赖，不应回流前端或后端主干。
- `GET /api/auth/me` 目前保留为兼容别名，但规范入口应收敛到 `GET /api/auth/session`。

## 快速命令

```bash
pnpm install
pnpm dev:web
pnpm sync:api
pnpm dev:api
pnpm infra:up
pnpm lint:web
pnpm build:web
pnpm test:web:e2e
pnpm test:api
pnpm test:agent-evals
pnpm smoke:deepseek
pnpm migrate:api
pnpm migrate:api:sql
```

QA/CI 基线：

- GitHub Actions 现在应同时保留 `web` job 和 `api` job。
- `web` job 跑 `pnpm lint:web`、`pnpm build:web`、`pnpm test:web:e2e`。
- `api` job 使用 Python 3.12 + uv，跑 `pnpm sync:api`、`pnpm test:api`、`pnpm migrate:api:sql`。
- `pnpm smoke:deepseek` 是本地可选真实调用检查，只在当前 shell 显式设置 DeepSeek key 时使用，不进入默认 CI。
- `pnpm migrate:api:sql` 是离线 Alembic SQL 展开验证；不能替代 Docker 可用后的 live PostgreSQL migration 验证。

真实数据库迁移：

```bash
pnpm infra:up
pnpm migrate:api
```

## 文档入口

- [AGENTS.md](./AGENTS.md)
- [项目总览](./PROJECT_OVERVIEW.md)
- [本地启动指南](./LOCAL_STARTUP_GUIDE.md)
- [本地测试指南](./LOCAL_TESTING_GUIDE.md)
- [产品蓝图](./docs/product/PRODUCT_BLUEPRINT.md)
- [系统架构基线](./docs/architecture/SYSTEM_ARCHITECTURE.md)
- [实施路线图](./docs/architecture/IMPLEMENTATION_ROADMAP.md)
- [插件策略](./docs/architecture/PLUGIN_STRATEGY.md)
- [数据模型](./docs/architecture/DATA_MODEL.md)
- [API 契约](./docs/api/API_CONTRACT.md)

## 仓库结构现状

```text
FundGene/
├── apps/
│   ├── api/                 # FastAPI / SQLAlchemy / Alembic / PydanticAI 主干
│   └── web/                 # Next.js 16 / React 19 / Tailwind 4 主干
├── archive/                 # 旧前后端原型与历史材料，只作参考
├── data/                    # 参考数据与 fixture
├── docs/                    # 产品、架构、数据模型与 API 契约文档
├── infra/                   # Docker 等基础设施
├── packages/                # 目标目录，当前仍主要为占位
├── services/                # 目标目录，当前仍主要为占位
├── AGENTS.md
├── PROJECT_OVERVIEW.md
├── LOCAL_STARTUP_GUIDE.md
├── LOCAL_TESTING_GUIDE.md
└── README.md
```

## 说明

- 当前仓库已经不再是“只有规划、没有实现”的状态，但仍不是业务功能完整的产品。
- 当前已经站住的是 onboarding / dashboard / coach / learning / portfolio / simulation / news 的前几条真实闭环，但仍不是完整业务产品。
- 当前已补上 minimal auth/session baseline，并把 learning、portfolio、simulation、news、Agent Runtime v2 trace spine 和首个 agent eval harness 都接入主干；下一阶段重点应收敛到 selective RAG、citation faithfulness、observability、部署硬化和生产运行质量，而不是回头复用旧原型界面或引入额外复杂度。
