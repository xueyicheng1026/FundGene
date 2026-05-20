# FundGene Codex-Inspired Agent Runtime Plan - 2026-05-20

## 1. Bottom Line

FundGene should borrow Codex's runtime shape, not Codex's full codebase.

Codex is a large coding-agent runtime. Its useful idea for FundGene is not the
terminal UI, filesystem tools, patch engine, or full session machinery. The
useful idea is a disciplined turn lifecycle:

```text
user submission
  -> active turn context
  -> event stream
  -> tool lifecycle
  -> optional interruption / pending input
  -> final assistant message
  -> replayable persisted history
```

FundGene should implement this gradually around the existing Agent Runtime v2.
The product boundary remains beginner fund-investing coaching. The runtime must
not become a code-agent clone, trading bot, or autonomous execution platform.

## 2. What Was Read From Codex

Reference checkout:

- `/tmp/openai-codex-reference`
- commit: `59507b849126f598ed7c624bbaf75d7ebc5588c2`
- latest checked file group: `codex-rs/core/src/session`, `tools`, `state`

Relevant Codex source points:

- `codex-rs/core/src/session/turn.rs:117-130`
  - Codex turn loop: model either requests tool calls or emits an assistant
    message; tool outputs are fed back into the next sampling request.
- `codex-rs/core/src/session/turn.rs:231-237`
  - A model client session is turn-scoped; pending input is drained carefully
    around sampling and compaction.
- `codex-rs/core/src/session/turn.rs:239-300`
  - Running turns can absorb pending input while the model/tool loop continues.
- `codex-rs/core/src/state/turn.rs:29-33`
  - `ActiveTurn` tracks currently running tasks and turn state.
- `codex-rs/core/src/state/turn.rs:35-54`
  - `MailboxDeliveryPhase` decides whether late messages join the current turn
    or wait for the next one.
- `codex-rs/core/src/state/turn.rs:72-81`
  - `RunningTask` has a cancellation token and task handle.
- `codex-rs/core/src/state/turn.rs:110-125`
  - `TurnState` carries pending approvals, pending user input, dynamic tools,
    granted permissions, tool count, and token usage.
- `codex-rs/core/src/session/input_queue.rs:187-207`
  - Input can be injected into an active turn.
- `codex-rs/core/src/session/input_queue.rs:213-270`
  - Pending input is drained based on active-turn state and mailbox delivery
    rules.
- `codex-rs/core/src/tools/parallel.rs:30-37`
  - Tool call runtime carries router, session, turn context, diff tracker, and
    parallel execution lock.
- `codex-rs/core/src/tools/lifecycle.rs:12-70`
  - Tool start, finish, and abort are lifecycle events, not ad hoc UI text.

The scale matters: only `core/src/session + tools + state` is about 56k lines.
FundGene should not pretend that a 1k-line pass recreates Codex. It should take
the smallest product-relevant subset, then deepen only where the product needs
it.

## 3. Current FundGene State After The First Slice

Already present before this plan:

- `agent_runs` stores the run/turn-level record.
- `agent_steps` stores planned runtime steps.
- `agent_tool_calls` stores read-only tool calls.
- `agent_evidence_refs` stores evidence support.
- `agent_state_update_proposals` stores pending writeback proposals.
- `chat_sessions` and `chat_messages` store user-facing conversation history.

Recently added Codex-inspired first slice:

- `AgentTurnContext`
- `AgentRunEventSink`
- `POST /api/assistant/messages/stream`
- live SSE events for:
  - `turn_started`
  - `step_started`
  - `step_completed`
  - `tool_call_started`
  - `tool_call_completed`
  - `agent_message`
  - `turn_complete`
- `/agent` consumes the stream and shows live process events.
- `GET /api/assistant/runs/{run_id}/events` remains the post-run replay
  contract.

This is useful but still shallow. It gives user-visible process streaming, but
does not yet provide true active-turn management, cancellation, pending input,
or durable event storage.

## 4. Design Principles For The Next Changes

1. Keep one user-facing FundGene agent.
   Internal tools/workers can be many, but the product should not expose a
   swarm of agents.

2. Preserve backend ownership of business truth.
   Frontend process panels should render events. They should not decide risk
   policy, tool validity, writeback rules, or evidence support.

3. Use durable schemas for product-critical state.
   Anything that needs replay, audit, or frontend rendering should have a
   stable schema before it becomes clever.

4. Add runtime depth only when it unlocks product behavior.
   Cancellation and active-run state are useful. A full model tool-call loop is
   not urgent unless FundGene truly needs dynamic model-chosen tools.

5. FundGene approval is not Codex filesystem approval.
   Codex asks for command/patch permissions. FundGene should ask for user
   confirmation before behavior-profile writeback, recurring automation changes,
   or other durable personal context changes.

## 5. Target Architecture

```text
POST /api/assistant/messages/stream
  |
  | creates user message
  | creates AgentRun
  | creates ActiveAgentTurn
  v
AgentTurnController
  |
  | builds AgentTurnContext
  | owns cancellation token
  | owns event sink
  | owns pending input policy
  v
AdvisorOrchestrator
  |
  | emits events through sink
  | records steps/tool calls/evidence/proposals
  v
ResponseComposer
  |
  | returns final structured AdvisorResponse
  v
ChatMessage + AgentRun completion
  |
  v
SSE final conversation event
```

Post-run replay path:

```text
GET /api/assistant/runs/{run_id}/events
  -> reads durable events if available
  -> falls back to reconstructing from steps/tool calls
```

## 6. Proposed Phases

### Phase 0: Stabilize The Current Streaming Slice

Purpose:

Make the first live stream robust without changing behavior.

Work:

- Keep `POST /api/assistant/messages` as the non-stream fallback.
- Keep `POST /api/assistant/messages/stream` as the `/agent` primary path.
- Make the frontend process panel tolerate:
  - duplicate events,
  - missing timestamps,
  - stream error event,
  - final conversation event arriving after `turn_complete`.
- Add one browser-facing assertion that a submitted `/agent` task displays live
  process text before the final assistant message.

Do not add:

- cancellation,
- pending input,
- event table,
- model tool-call loop.

Expected files:

- `apps/web/components/coach-workspace.tsx`
- `apps/web/lib/api.ts`
- `apps/web/e2e/workspaces.spec.ts`
- `apps/api/tests/test_agent_runtime_v2_trace.py`

### Phase 1: Add Active Run State And Cancellation

Purpose:

Turn the current stream into a controllable active run.

Why this matters:

Codex's `RunningTask` has a cancellation token and task handle. FundGene needs
the same concept before it can safely expose "stop this run" or handle slow
model/tool calls.

Work:

- Add an in-process `ActiveAgentRunRegistry`.
- Track:
  - `run_id`
  - `session_id`
  - `user_id`
  - `started_at`
  - `status`
  - cancellation flag/token
  - latest event sequence
- Add endpoint:
  - `POST /api/assistant/runs/{run_id}/cancel`
- Add event types:
  - `turn_cancel_requested`
  - `turn_aborted`
- Orchestrator checks cancellation between major steps:
  - after input guard,
  - after plan,
  - after each tool,
  - before composer,
  - before final persistence.

Keep it simple:

- No background queue yet.
- No multi-worker process control yet.
- No cancellation inside one blocking DB query.
- If a model call is already in flight, cancellation can take effect after the
  awaited call returns unless the model client exposes a clean abort path.

Expected files:

- `apps/api/app/runtime/v2/active_runs.py`
- `apps/api/app/runtime/v2/events.py`
- `apps/api/app/runtime/v2/orchestrator.py`
- `apps/api/app/api/routes/assistant.py`
- `apps/web/components/coach-workspace.tsx`

Frontend:

- Show a "停止本次整理" control only while a run is active.
- After cancellation, show a beginner-facing message:
  - "已停止这次整理，没有写入新的长期记录。"

### Phase 2: Persist Runtime Events As First-Class Records

Purpose:

Make live events replayable exactly as seen, instead of reconstructing only from
steps/tool calls.

Why this matters:

The current replay endpoint is good enough for a first slice, but it cannot
replay `step_started`, `tool_call_started`, stream errors, cancellation events,
or pending-input events unless those events are stored.

Work:

- Add table `agent_run_events`.
- Suggested columns:
  - `id`
  - `run_id`
  - `sequence`
  - `event_type`
  - `phase`
  - `title`
  - `status`
  - `payload`
  - `duration_ms`
  - `created_at`
  - `occurred_at`
- Update `AgentRunEventSink`:
  - emit to SSE queue,
  - persist event row,
  - keep sequence monotonic per run.
- Update `GET /api/assistant/runs/{run_id}/events`:
  - prefer stored `agent_run_events`,
  - fallback to reconstruction for old runs.

Expected files:

- `apps/api/app/models/agent_run_event.py`
- `apps/api/app/models/__init__.py`
- Alembic revision under `apps/api/alembic/versions/`
- `apps/api/app/runtime/v2/events.py`
- `apps/api/app/services/assistant.py`

Test:

- Streamed run writes event rows.
- Replay returns the same event ordering.
- Old runs without event rows still replay from steps/tool calls.

### Phase 3: Add Pending Input, But Only As "Next Instruction"

Purpose:

Let the user add a message while the agent is working without corrupting a
nearly finished answer.

Codex has a mailbox/current-turn/next-turn model. FundGene should start with a
smaller rule:

```text
if run has not emitted agent_message:
  allow the new input to be attached as a same-turn steering note
else:
  queue it as the next user message
```

Work:

- Add endpoint:
  - `POST /api/assistant/runs/{run_id}/input`
- Add table or JSON field for pending input:
  - simplest first: table `agent_run_pending_inputs`
- Add event types:
  - `pending_input_received`
  - `pending_input_applied`
  - `pending_input_deferred`
- Orchestrator reads pending input only at safe boundaries:
  - before tool selection,
  - before worker execution,
  - before composer.

Do not let pending input:

- override safety policy,
- silently change profile,
- become tool payload without validation,
- interrupt a completed answer retroactively.

Frontend:

- While a run is active, composer copy becomes:
  - "可以补充一句，Agent 会在安全节点读取。"
- If the answer is already being generated:
  - "这句会作为下一轮问题。"

### Phase 4: Add Durable Turn Controller

Purpose:

Separate route/service orchestration from runtime orchestration.

Current `send_message` still does too much:

- session selection,
- user message creation,
- run creation,
- orchestrator invocation,
- final assistant message creation,
- event emission,
- conversation return.

Create a controller that owns the lifecycle:

```text
AgentTurnController.submit_user_message()
AgentTurnController.run_turn()
AgentTurnController.complete_turn()
AgentTurnController.abort_turn()
```

Expected files:

- `apps/api/app/runtime/v2/controller.py`
- `apps/api/app/services/assistant.py` becomes thinner.

This is the point where FundGene starts to look structurally closer to Codex,
but still remains product-specific.

### Phase 5: Consider Model Tool-Call Loop Only If Needed

Purpose:

Decide whether FundGene needs Codex-style model-directed tool calls.

Current FundGene:

- planner chooses tools through backend rules/scoring,
- tools are read-only,
- workers synthesize findings,
- composer writes final response.

This is safer for beginner investing and should remain the default.

Only add model tool-call loop if there is a concrete need such as:

- user asks an open-ended multi-hop task where static planner is too rigid,
- model needs to choose among many retrieval tools,
- evidence coverage improves measurably in evals.

If added, it should be bounded:

- max tool calls,
- read-only tools only,
- strict tool schema,
- evidence required,
- no trade/write tools,
- final backend validation.

Do not make the model the owner of:

- risk classification,
- portfolio facts,
- behavior-profile mutation,
- automation authorization,
- recommendation safety boundary.

## 7. What Not To Borrow From Codex

Do not borrow:

- shell execution,
- filesystem patching,
- sandbox permissions,
- code diff tracker,
- coding-agent approval UI,
- multi-workspace environment management,
- plugin system complexity,
- full mailbox architecture before FundGene has real need.

FundGene equivalents should be domain-specific:

| Codex concept | FundGene equivalent |
| --- | --- |
| shell command approval | confirming durable profile/automation changes |
| apply patch diff | proposed behavior/profile/plan writeback |
| cwd / filesystem sandbox | authorized user data scope |
| tool call | read-only domain data lookup or analysis step |
| turn abort | stop current agent analysis |
| pending input | user adds clarification while agent is working |
| compact | summarize long conversation/context for future agent runs |

## 8. Recommended Immediate Next Task

The best next implementation is Phase 1:

```text
ActiveAgentRunRegistry + cancel endpoint + turn_aborted event + frontend stop button
```

Why:

- It builds directly on the new stream.
- It is visible to the user.
- It makes long DeepSeek/model runs less scary.
- It creates the runtime spine needed before pending input.
- It is much smaller than durable event storage or model tool-call loops.

Acceptance criteria:

- A streaming `/agent` run can be cancelled from the UI.
- Backend emits `turn_cancel_requested` and `turn_aborted`.
- The assistant does not persist a normal completed answer after cancellation.
- Existing `POST /api/assistant/messages` and trace tests still pass.
- Beginner-facing copy clearly says no durable profile/writeback happened.

## 9. Suggested Order Of Work

1. Implement Phase 1 cancellation.
2. Implement Phase 2 durable event table.
3. Implement Phase 3 pending input.
4. Refactor into Phase 4 controller once behavior is stable.
5. Re-evaluate Phase 5 model tool-call loop only after eval evidence says the
   static planner is limiting answer quality.

This order keeps the runtime moving toward Codex's strengths while avoiding a
large, fragile rewrite.
