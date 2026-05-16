# Agent Runtime v2 Tech Scan - 2026-05-16

## Scope

This note records the public repository scan requested for the next FundGene agent-runtime pass.

Reviewed source:

- `https://github.com/claude-code-best/claude-code`
- Shallow local checkout used for inspection only: `/tmp/fundgene-agent-refs/claude-code`
- Checked commit: `5b941d4`, tag `v2.4.4`

The repository README describes itself as a reverse-engineered reconstruction of Claude Code. FundGene does not copy code from it, import its runtime, or adopt its code-execution, remote-control, browser-control, shell, pipe IPC, or unofficial provider-routing behavior.

## Patterns Worth Borrowing As Architecture Ideas

The parts worth adapting to FundGene are general runtime engineering patterns:

1. Capability gates and feature flags
   - Useful idea: advanced agent features should be explicitly gated.
   - FundGene adaptation: `FUNDGENE_AGENT_RUNTIME_FLAGS`, `FUNDGENE_AGENT_MAX_TOOL_CALLS`, and `FUNDGENE_AGENT_MAX_WORKERS`.

2. Tool discovery rather than full tool injection
   - Useful idea: large tool surfaces should be indexed and selected by task relevance.
   - FundGene adaptation: ToolRegistry now carries category, search terms, allowed intents, budget cost, and emits `tool_selection_signals`.

3. Trace observability
   - Useful idea: agent loops should expose plan, tool calls, workers, guardrails, and composer events.
   - FundGene adaptation: run trace now includes `runtime_capabilities`, scored planning signals, `trace_events`, worker validation, and final response validation.

4. Guardrail checkpoints
   - Useful idea: safety checks should happen before tools, around worker output, and after final composition.
   - FundGene adaptation: final response validation now filters unsupported citations and unsafe recommended actions after composition.

## Patterns Deliberately Not Borrowed

FundGene should not add:

- shell or file-editing tools for end users,
- browser or computer-use tools,
- remote-control surfaces,
- LAN or pipe IPC coordination,
- autonomous subagent swarms,
- direct MCP execution by the model,
- trading execution, broker connection, or buy/sell automation semantics.

Those capabilities are useful for a coding CLI, but they conflict with FundGene's product boundary as a beginner fund-investing learning and decision-support system.

## Implementation Landed In This Pass

- `apps/api/app/runtime/v2/features.py`
  - `agent_runtime_capabilities_v1`
  - runtime flags, tool budget, worker budget

- `apps/api/app/runtime/v2/tools/registry.py`
  - richer `ToolDefinition` metadata
  - scored tool recommendation
  - traceable `ToolSelectionSignal`

- `apps/api/app/runtime/v2/planner.py`
  - capability-aware planning
  - optional fallback to static intent mapping
  - explicit max-worker and max-tool constraints

- `apps/api/app/runtime/v2/orchestrator.py`
  - `runtime_capabilities` in `tool_trace`
  - `trace_events`
  - strict final response validation and normalization

- `apps/api/tests/test_agent_runtime_v2_trace.py`
  - tool scoring assertions
  - feature-flag downgrade assertions
  - unsupported citation and unsafe action filtering assertions

## Verification

Completed locally:

- `uv run --project apps/api ruff check apps/api/app apps/api/tests services/evals`
- `pnpm test:api`
- `pnpm test:agent-evals`
- `pnpm migrate:api:sql`

No live PostgreSQL migration or real DeepSeek smoke was run in this pass.
