# FundGene Agentic Beginner Coach Implementation Plan

Date: 2026-05-17
Status: archived. This document has been superseded by the Agent Command Center implementation plan.

Do not use this file as the future V1 implementation roadmap.

Active implementation plan:

- `docs/product/agent-command-center-implementation-plan.md`

Active product/UX baselines:

- `docs/product/PRODUCT_BLUEPRINT.md`
- `docs/product/agent-command-center-ux-v1.md`

What changed:

- The old plan optimized `/dashboard`, `/coach`, `/portfolio`, `/news`, `/learning`, and `/simulation` as separate agentic pages.
- The new plan first changes the product IA to `/today`, `/agent`, `/automations`, and `/profile`.
- The old modules remain useful capabilities, but they should be reached as Agent action targets, evidence drilldowns, automation outputs, or profile/detail surfaces.
- V1 should implement L1 user-directed Agent Workspace runs plus L2 default Daily Brief automation.
- Natural-language process display is default; raw trace/tool details are advanced mode.
- Durable writes and behavior-profile changes require user confirmation.
