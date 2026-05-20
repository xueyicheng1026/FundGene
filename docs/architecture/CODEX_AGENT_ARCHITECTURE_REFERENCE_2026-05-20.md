# Codex Agent Architecture Reference - 2026-05-20

This note records the safe, product-relevant parts of the public OpenAI Codex
repository that FundGene should borrow conceptually. The reference checkout was
created outside this repository at `/tmp/openai-codex-reference` from
`openai/codex` commit `59507b849126f598ed7c624bbaf75d7ebc5588c2`.

## What Codex Contributes

Codex's strongest reusable pattern is not its CLI UI. It is the separation
between:

- submission queue entries from the user,
- event queue entries from the agent,
- per-turn lifecycle events,
- tool begin/end events,
- approval and interruption events,
- persistent thread history.

The closest source references are:

- `codex-rs/protocol/src/protocol.rs`: `Submission`, `Op`, `Event`, and
  `EventMsg`.
- `codex-rs/core/src/session/session.rs`: session state, active turn, input
  queue, permission profile, and sandbox configuration.
- `codex-rs/core/src/session/input_queue.rs`: pending input and mailbox
  delivery for active or next turns.
- `codex-rs/core/src/codex_thread.rs`: thread-level bidirectional stream
  wrapper.
- `codex-rs/core/src/rollout.rs`: thread persistence wrapper.

FundGene should not copy the Rust implementation or code-editing tools. The
useful move is to translate the protocol shape into FundGene's investment-coach
domain.

## FundGene Mapping

Current FundGene already has the right persistence primitives:

- `agent_runs` acts like a turn/run record.
- `agent_steps` acts like lifecycle events.
- `agent_tool_calls` acts like read-only tool begin/end records.
- `chat_sessions` and `chat_messages` act like thread history.

The first Codex-inspired slice added in this pass is:

- `GET /api/assistant/runs/{run_id}/events`
- response schema `agent_run_events_v1`
- event types: `turn_started`, `step_completed`, `tool_call_completed`,
  `agent_message`, `turn_complete`

This is intentionally post-run for now. It gives the frontend a Codex-like
event contract without changing answer generation, business logic, or model
configuration.

## Next Runtime Moves

1. Add a real streaming endpoint, likely
   `POST /api/assistant/messages/stream`, that yields the same event schema
   during execution.
2. Split current synchronous `send_message` into a turn controller:
   `submit -> run lifecycle -> stream events -> persist`.
3. Add interrupt/cancel semantics for long-running or model-backed turns.
4. Keep all write-capable behavior behind pending proposals; FundGene should
   borrow Codex's approval shape, not its filesystem write tools.
5. Let `/agent` render the event stream as the primary process view, while
   keeping raw payloads behind an advanced/debug affordance.
