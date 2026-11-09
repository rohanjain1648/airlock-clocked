# Airlock — Clocked Build Challenge submission

_Copy these fields into the entry form at clocked.rezolve.ai/challenge. Written
for the four Rezolve.ai judges and the entry form._

## Project name
**Airlock — a trust layer for autonomous agents**

## Overview (what it does, who it is for, what problem it solves)
Airlock is a safety-and-reliability gateway that sits in front of an autonomous
IT service-desk agent ("Aria") that can change ticket state, email customers, and
run remediation scripts. Such an agent is only as trustworthy as the weakest
message it reads — one injected instruction, one hallucinated "issue resolved,"
or one script that disables antivirus, and it does real damage.

Airlock gates the agent with **ten Clocked endpoints**, and **every gate's output
changes what the agent is allowed to do**: Guard locks automation on an injection
and drops poisoned knowledge-base passages; Protect masks the only text the agent
ever sees; Inspect enables or disables the "Run fix" button; Extract/Decide/Fill
turn a ticket into a routed, drafted record; Rerank picks the right-tenant source;
Compare clusters duplicate incidents and suppresses conflicting KB articles; and
Verify strips an unsupported claim and blocks auto-send. A Pipeline fast path runs
the screen-and-triage stage as a single call. It is for anyone deploying agentic
automation on a support desk, an inbox, or any flow that reads untrusted text.

## Demo
- Live app: _<your Vercel URL>_ (runs fully in **replay mode** — no key needed)
- Walkthrough video: _<optional Loom/YouTube link>_
- Four built-in scenarios; press **Run Airlock** on each to watch the gates.

## Repository
_<your public GitHub URL>_ — public, with development history. README has the
endpoint→feature map, run instructions (replay + live), and an 18-assertion eval
harness (`npm run eval`).

## Which Clocked endpoints you used, and how their outputs affect the app
All ten are integrated; each changes behavior (no ignored calls):

- **Guard (`/injection`)** — screens the inbound message; a flag **locks
  automation** and stops the pipeline. Also screens retrieved KB passages and
  **drops poisoned ones** before the agent reads them.
- **Protect (`/pii`)** — the returned `anonymized_text` is the **only text the
  agent and vendor handoffs see**; re-scans the outbound reply before sending.
- **Inspect (`/script`)** — the verdict **enables/disables the "Run fix" button**
  and pins the offending line (EDR-evasion detection).
- **Extract (`/extract`)** — asset tag drives an **asset-register lookup**;
  tried-fixes list feeds Rerank; deadline feeds the SLA.
- **Decide (`/decide`)** — sets **queue, priority, major-incident, self-service**,
  gating whether Aria resolves or escalates.
- **Fill (`/fill`)** — assembles a record with a **generated draft reply** (all
  six field types) — the draft the next gate verifies.
- **Rerank (`/rerank`)** — **use/expand/skip**; a `different_case` skip prevents
  answering from the wrong-tenant article; `expand` fetches the neighbor chunk.
- **Compare (`/compare`)** — **clusters a duplicate ticket** into one major
  incident and **flags two conflicting KB articles** so only the authoritative
  one is cited.
- **Verify (`/grounding`)** — claim-by-claim check; an unsupported claim is
  **stripped and auto-send blocked**, routing to a human.
- **Pipeline (`/pipeline`)** — the one-call fast path (Protect → Guard(`stop`) →
  Decide); the guard's `stop` means triage never runs on a hostile message.

How they work together: the gates share one mutable decision. Guard/Protect gate
what reaches the core; Extract/Decide/Fill produce the draft; Rerank/Compare pick
and reconcile its sources; Verify and outbound Protect decide if it may auto-send;
Inspect gates the one-click fix. See the README table and `src/lib/pipeline.ts`.

## What we learned
Separate signals must stay separate: extraction confidence (a source read),
Verify support (relative to supplied docs), and a Decide probability (a judgment)
mean different things, and conflating them produces false confidence. Airlock
keeps each distinct and routes uncertainty to a human instead of acting on it.

## Awards entered
- **Best Overall App** (ten endpoints, each load-bearing)
- **Best Use of Decide, Extract, or Fill** (all three used)
- **Best Use of Protect, Guard, or Inspect** (all three used)
- **Best Use of Verify, Compare, or Rerank** (all three used)
- **People's Choice** (add the LinkedIn post URL — see `docs/linkedin-post.md`)

## Team
- _<name> · <email> · <github handle>_
