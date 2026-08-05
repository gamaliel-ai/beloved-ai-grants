# Docs — organization and rules of the road

This file is the source of truth for how Beloved AI Grants documentation is
organized. Keep one backlog and one id space; cross-link instead of duplicating
requirements.

The layout follows the useful parts of Reeve and Marshall's single-queue
backlogs, with Beloved ticket ids **`B-NNNN`**.

## Mental model

| Job | Home |
| --- | --- |
| What are we doing now? | [`../focus.md`](../focus.md) |
| Durable product and architecture | Existing topic docs in `docs/` |
| Operator MCP connect + tool catalog | [`MCP-ADMIN.md`](MCP-ADMIN.md) |
| Phased product sequence | [`ROADMAP.md`](ROADMAP.md) |
| Implementable work | [`BACKLOG.md`](BACKLOG.md) + `backlog/` |

`ROADMAP.md` describes product phases. It is not a second ticket queue.

## Sorting test

- Something concrete to implement: create a `B-NNNN` ticket.
- A durable product, security, or architecture decision: update the relevant
  topic doc and link the implementing ticket.
- Current priorities or resumable work: update `focus.md`.

Small, clear work goes directly into the backlog.

## Backlog conventions

- Everyday name: **ticket**.
- Id: **`B-NNNN`**, four-digit and zero-padded.
- Kinds: `bug`, `improvement`, or `chore`.
- Allocate only from **Next id** in `BACKLOG.md`; bump it in the same change.
- Active file: `backlog/B-NNNN-slug.md`.
- Closed file: `backlog/archive/B-NNNN-slug.md`.
- Every open ticket appears in `BACKLOG.md` under Active or Deferred.
- Index entries stay short; full rationale and acceptance live in the ticket.
- Link ids in docs: `[B-0001](backlog/B-0001-example.md)`.

## Ticket shape

Each ticket includes:

1. **Kind** and **Status**
2. **Problem / goal**
3. **Direction** and dependencies
4. **Acceptance**
5. Explicit **out of scope** where useful

Interviewed tickets can grow implementation and TDD sections before their
status changes to ready for implementation.

## Lifecycle

To close a ticket:

1. Record final status, date, and one-line outcome.
2. Move it to `backlog/archive/` with `git mv`.
3. Move its index entry to Recently closed.
4. Update `focus.md` if listed.
5. Search the id and repair links that still point to the active path.

Do not create parallel idea, bug, opportunity, or epic databases until a real
need cannot be represented by this queue.
