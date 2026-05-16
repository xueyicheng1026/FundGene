# FundGene Agent Upgrade Research Proposal - 2026-05-16

## 1. Objective

The request was to look again at currently popular GitHub agent projects, gather broader ideas, and write an upgrade proposal without changing code.

This document is intentionally more expansive than the current FundGene blueprint. It includes bolder product and architecture options, then separates what should be adopted, deferred, or rejected.

No runtime implementation was changed for this proposal.

## 2. Research Method

Current GitHub repository metadata was checked through the GitHub API on 2026-05-16, using high-star and recently pushed agent-related searches. Project README and official repository pages were then reviewed for architecture ideas.

Representative current repository signals:

| Project | Stars checked | Recent activity | Useful signal |
|---|---:|---|---|
| `n8n-io/n8n` | 188k | pushed 2026-05-16 | workflow automation, integrations, human-visible graph |
| `langgenius/dify` | 141k | pushed 2026-05-16 | visual agentic workflow product, RAG, LLMOps |
| `browser-use/browser-use` | 94k | pushed 2026-05-15 | browser automation for agents |
| `modelcontextprotocol/servers` | 85k | pushed 2026-05-12 | MCP tool ecosystem and server catalog |
| `OpenHands/OpenHands` | 74k | pushed 2026-05-16 | sandboxed coding agent architecture |
| `bytedance/deer-flow` | 67k | pushed 2026-05-16 | long-horizon super-agent harness, skills, subagents, sandbox, memory |
| `FoundationAgents/MetaGPT` | 68k | pushed 2026-01-21 | SOP-driven multi-agent team pattern |
| `mem0ai/mem0` | 56k | pushed 2026-05-16 | production long-term memory layer |
| `crewAIInc/crewAI` | 51k | pushed 2026-05-15 | crews plus flows, autonomy plus precise control |
| `agno-agi/agno` | 40k | pushed 2026-05-16 | agent platform control plane, RBAC, scheduling, observability |
| `langchain-ai/langgraph` | 32k | pushed 2026-05-16 | durable stateful graph runtime |
| `ComposioHQ/composio` | 28k | pushed 2026-05-16 | toolkits, auth, tool search, sandboxed workbench |
| `langfuse/langfuse` | 27k | pushed 2026-05-15 | LLM observability, evals, datasets, prompt management |
| `openai/openai-agents-python` | 26k | pushed 2026-05-16 | lightweight multi-agent workflows, guardrails, tracing |
| `letta-ai/letta` | 22k | pushed 2026-05-14 | stateful agents with advanced memory |
| `pydantic/pydantic-ai` | 17k | pushed 2026-05-16 | typed agents, structured outputs, capabilities |

Important caveat: GitHub star counts are a popularity signal, not proof of architectural fit. Some high-star results were excluded if they were unrelated, suspiciously noisy, or product-misaligned.

## 3. What The Popular Agent Projects Are Converging On

### 3.1 Agent as runtime, not prompt

The best projects no longer treat an agent as just "LLM plus tools." They treat it as a runtime with:

- state,
- tool registry,
- memory,
- trace,
- policy,
- workflow graph,
- human approval,
- deployment and monitoring.

FundGene implication: the next upgrade should not only add more workers. It should make the runtime itself a product asset.

### 3.2 Graph/workflow control is returning

LangGraph, CrewAI Flows, Dify, n8n, and DeerFlow all show the same trend: free-form autonomous loops are being wrapped inside explicit workflow structure.

FundGene implication: do not let every user query become a single invisible planner pass. For important flows, expose a backend workflow state machine:

- Learn concept
- Apply to my portfolio
- Test in scenario
- Reflect on behavior
- Save next rule

### 3.3 Skills are becoming first-class assets

DeerFlow and CrewAI both emphasize skills/instructions as installable or reusable units. PydanticAI also now frames reusable capabilities as composable units.

FundGene implication: turn domain expertise into versioned "financial coaching skills":

- `drawdown_explainer`
- `portfolio_concentration_review`
- `chasing_gain_debias`
- `policy_news_impact_path`
- `monthly_review_coach`

These should be reviewed, versioned, tested, and selectable by the planner.

### 3.4 Memory is splitting into layers

mem0 and Letta are strong signals that memory needs structure. "Dump chat history into context" is not enough.

FundGene implication: split memory into:

- stable profile memory: goals, horizon, risk capacity,
- episodic memory: recent questions and concerns,
- behavior memory: repeated bias patterns,
- portfolio memory: prior analyses and changes,
- teaching memory: concepts already explained,
- contraindication memory: what not to recommend or repeat.

### 3.5 Observability and eval are product infrastructure

Langfuse, RagaAI Catalyst, OpenAI Agents SDK tracing, Agno observability, and LangGraph/LangSmith all point the same way: agent quality improves through traces, datasets, and evaluation loops.

FundGene implication: "agent run trace" should become an internal quality product:

- failure categories,
- unsupported-claim rate,
- unsafe-action filter rate,
- citation faithfulness,
- user confusion markers,
- answer revision history,
- per-skill success metrics.

### 3.6 Tool ecosystems are moving toward MCP and authenticated tool brokers

Composio, MCP servers, Dify, and n8n suggest that tools should become discoverable, authenticated, permissioned, and auditable.

FundGene implication: do not jump to uncontrolled MCP. Instead, design a "FundGene Tool Broker":

- every tool has intent scope,
- read/write mode,
- data classification,
- approval requirement,
- timeout/cost budget,
- evidence contract,
- eval coverage.

## 4. Bolder FundGene Upgrade Concepts

These ideas intentionally go beyond the current blueprint. They should be treated as candidate directions, not automatic implementation tasks.

### Concept A: FundGene Agent Studio

A developer/admin-facing control plane for agent behavior.

Capabilities:

- view all skills,
- edit skill instructions,
- see tool permissions,
- inspect eval pass/fail,
- replay agent traces,
- compare deterministic vs model-composed outputs,
- promote a skill version after eval passes.

Why it matters:

- Turns FundGene from a demo coach into an inspectable agent product.
- Makes future research/competition/demo presentations more concrete.

Risk:

- Can become a heavy internal platform if built before enough agent traffic exists.

Recommendation:

- Build later as an admin page over existing trace/eval data, not as a separate product first.

### Concept B: Financial Coaching Skills System

Create a skill registry inside backend, inspired by DeerFlow/CrewAI/PydanticAI capabilities.

Each skill has:

- name,
- version,
- applicable intents,
- prerequisites,
- required tools,
- forbidden language,
- output schema,
- eval cases,
- expected learning outcome.

Example skills:

- `fund_basics_explain_v1`
- `portfolio_risk_lens_v1`
- `behavior_bias_reflection_v1`
- `news_policy_path_v1`
- `scenario_review_v1`

Recommendation:

- This is the highest-value next architecture step. It fits FundGene better than adding more generic subagents.

### Concept C: Guided Multi-Step Journeys

Move beyond one-turn Q&A into agent-led workflows.

Example journey:

1. User asks about a policy/news event.
2. Agent explains facts and uncertainty.
3. Agent links the news to user's portfolio categories.
4. Agent asks whether the user feels urge to chase/panic.
5. Agent starts a short behavior reflection.
6. Agent recommends one learning section or simulation.
7. Agent records a review note.

Recommendation:

- This would make FundGene feel much more like a real coach.
- It should be implemented as explicit workflow state, not free-form agent memory.

### Concept D: Memory Ledger

Instead of opaque chat memory, create a user-visible memory ledger:

- "What FundGene remembers about my goals"
- "My recurring behavior patterns"
- "Concepts I have already learned"
- "Rules I chose for myself"
- "Coach assumptions I can edit"

Recommendation:

- Strong product fit.
- Also solves trust: users can inspect and correct memory.

### Concept E: Human Approval For Sensitive Transitions

Borrow Agno/OpenAI Agents/CrewAI guardrail ideas.

Sensitive operations should pause for explicit confirmation:

- saving a long-term memory,
- updating behavior profile,
- creating a monthly review note,
- interpreting user portfolio as high risk,
- exporting a report.

Recommendation:

- Useful once FundGene starts writing more durable user state.
- Do not add approval prompts for every normal chat response.

### Concept F: Tool Broker With Permission Tiers

Current tools are internal and read-only. A future tool broker could support tiers:

- Tier 0: no external data, deterministic rules only.
- Tier 1: internal read-only user state.
- Tier 2: internal write proposal, requires validation.
- Tier 3: external read-only APIs, cached and cited.
- Tier 4: external write or user export, requires explicit approval.
- Forbidden: brokerage execution, order placement, return promise generation.

Recommendation:

- Design now; implement gradually.

### Concept G: Deep Research Mode For Fund Education

Inspired by DeerFlow and Dify, but adapted to finance education.

User asks:

- "帮我理解最近债券基金为什么波动"
- "整理一下红利基金适合什么样的人"
- "把这条政策对基金新手的影响讲清楚"

Agent runs a longer workflow:

- retrieve curated sources,
- summarize facts,
- map concepts,
- identify uncertainty,
- create a beginner note,
- suggest portfolio questions without giving trade commands.

Recommendation:

- High demo value.
- Should run asynchronously and persist a report.

### Concept H: Scenario Generator

Use agent to generate historical training scenarios from curated market events.

Flow:

- retrieve event,
- extract timeline,
- generate decision points,
- attach behavior traps,
- validate no hindsight leakage,
- save scenario draft for review.

Recommendation:

- Strongly aligned with FundGene's training mission.
- Needs human/admin review before publishing scenarios.

### Concept I: Agent Quality Flywheel

Every agent run can feed internal improvement:

- classify failures,
- collect weak answers,
- generate new eval cases,
- compare skill versions,
- monitor unsupported claim rate,
- track whether users ask follow-up clarification.

Recommendation:

- This is how FundGene can show technical depth without adding unsafe autonomy.

### Concept J: Visual Workflow Builder

Borrow from Dify/n8n only at the product-design level.

Internal users could visually compose:

- trigger,
- context read,
- skill,
- tool,
- guardrail,
- user approval,
- persistence.

Recommendation:

- Powerful, but expensive.
- Defer until backend workflow primitives exist.

## 5. Proposed Future Architecture: FundGene Agent Runtime v3

The bigger direction:

```text
User Request
  ↓
Intent Router
  ↓
Journey Planner
  ↓
Skill Registry
  ↓
Tool Broker
  ↓
Memory Ledger
  ↓
Domain Workers / Research Workers / Simulation Workers
  ↓
Guardrail Stack
  ↓
Composer
  ↓
Trace + Eval + User-visible Coach Output
```

### Core runtime components

1. `JourneyPlanner`
   - Selects one-turn answer vs multi-step workflow.
   - Chooses skill bundle and state transitions.

2. `SkillRegistry`
   - Versioned domain coaching procedures.
   - Each skill has tests and forbidden claims.

3. `ToolBroker`
   - Central permission, budget, evidence, auth, timeout layer.

4. `MemoryLedger`
   - Structured long-term memory with user-visible editability.

5. `WorkflowState`
   - Persisted journey state for multi-turn coaching.

6. `AgentQualityStore`
   - Trace, eval, failure taxonomy, prompt/skill version metrics.

7. `HumanApprovalGate`
   - Explicit confirmation for durable writes and sensitive interpretations.

## 6. Adoption Priority

### Tier 1: Highest value, low regret

1. Skill registry for financial coaching procedures.
2. Memory ledger with inspectable assumptions.
3. Journey planner for multi-step coaching flows.
4. Better trace/eval quality metrics.

### Tier 2: Medium value, needs product maturity

1. Async deep research reports.
2. Scenario generator with human review.
3. Tool broker permission tiers.
4. Admin Agent Studio.

### Tier 3: Attractive but should wait

1. Visual workflow builder.
2. MCP-based external tool marketplace.
3. Browser automation.
4. Multi-agent autonomous swarms.

## 7. What Not To Do

Do not simply add:

- more role-playing agents,
- live market-action agents,
- browser/computer-use tools for end users,
- uncontrolled MCP servers,
- opaque long-term memory,
- "auto improve itself" loops without eval and rollback,
- visible internal agent chatter in the beginner-facing UI.

These would make the project look more agentic, but less trustworthy.

## 8. Concrete Next Planning Milestone

Before code changes, decide which of these three tracks should be the next implementation target:

### Option 1: Skill Registry First

Best for technical depth and manageable implementation.

Deliverables:

- `SkillDefinition` schema
- 5 built-in FundGene skills
- skill selection in planner
- eval cases per skill
- trace showing selected skill version

### Option 2: Memory Ledger First

Best for product differentiation.

Deliverables:

- memory categories
- user-visible memory assumptions
- proposal/approval flow for memory writes
- "what FundGene remembers" API
- evals for memory correctness and non-overreach

### Option 3: Guided Journey First

Best for making the app feel less like a chatbot.

Deliverables:

- workflow state schema
- 2 guided journeys: news-to-portfolio reflection, portfolio-to-behavior review
- next-step persistence
- user approval for durable state changes

Recommended order:

1. Skill Registry
2. Memory Ledger
3. Guided Journey
4. Tool Broker
5. Agent Studio

## 9. Source Links

- LangGraph: https://github.com/langchain-ai/langgraph
- OpenAI Agents SDK: https://github.com/openai/openai-agents-python
- PydanticAI: https://github.com/pydantic/pydantic-ai
- Agno: https://github.com/agno-agi/agno
- CrewAI: https://github.com/crewAIInc/crewAI
- DeerFlow: https://github.com/bytedance/deer-flow
- Dify: https://github.com/langgenius/dify
- n8n: https://github.com/n8n-io/n8n
- mem0: https://github.com/mem0ai/mem0
- Letta: https://github.com/letta-ai/letta
- Composio: https://github.com/ComposioHQ/composio
- Langfuse: https://github.com/langfuse/langfuse
- MCP servers: https://github.com/modelcontextprotocol/servers
- OpenHands: https://github.com/OpenHands/OpenHands
- browser-use: https://github.com/browser-use/browser-use
