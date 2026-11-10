# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: the Clocked Build Challenge judges.** Four Rezolve.ai leaders (CTO, CEO, CRO, Head of Applied AI) scoring entries November 11–17, 2026 on practical usefulness, quality of the Clocked integration, use of additional endpoints, implementation and UX, and clarity/reproducibility. They review the demo and repository directly and may run the demo themselves. They must grasp the mechanism within seconds and see all ten Clocked endpoints doing real work.
- **Secondary: engineers deploying autonomous agents** who would put a gateway in front of an agent that reads untrusted text and can act.

## Product Purpose

Airlock is a trust layer in front of an autonomous IT service-desk agent ("Aria") that can change ticket state, email customers and run remediation scripts. Every inbound ticket and every action passes through Clocked gates, and each gate's output changes what the agent is allowed to do. Success: an agent that is safe to deploy, and a judge who leaves convinced every endpoint is load-bearing.

## Positioning

The gates are not a dashboard over model calls; they are the agent's permission system. A Guard verdict locks automation, Protect's masked copy is the only text the agent sees, Inspect enables or disables the "Run fix" control, Verify strips unsupported claims and blocks auto-send. All ten Clocked endpoints (Decide, Extract, Fill, Protect, Guard, Inspect, Verify, Compare, Rerank, Pipeline) are used, each changing the outcome.

## Operating Context

- Built for the Clocked Build Challenge (deadline November 10, 2026, 11:59 p.m. ET). Entry form asks for demo, public repo, endpoint usage, team, awards.
- Runs in **live** mode with `CLOCKED_API_KEY` (server-side only) or **replay** mode from recorded responses, so anyone can run it with no key.
- Four scenarios: Payroll VPN outage (knowledge layer), The ticket that resolves itself (prompt injection), The printer fix that blinds security (malicious script), Poisoned knowledge base (retrieved-content attack).
- An 18-assertion eval harness (`npm run eval`) proves each gate changes the decision.

## Capabilities and Constraints

- Next.js 15 App Router, TypeScript, Tailwind v4, official `clocked-sdk` 0.7.0. Routes: `/` (console), `/api/triage`, `/api/fastpath`.
- Clocked calls run only on the server; keys never reach the browser.
- No database; state is per request.
- Terminology: "gate", "Aria" (the agent), "automation locked", "auto-send", "Run fix", "replay mode" / "live API".

## Brand Commitments

- Name: **Airlock**. Tagline in use: "a trust layer for autonomous agents, built on Clocked."
- Existing logo mark: a ring with a red core and an amber notch (`Logo` in `src/components/Console.tsx`).
- Three endpoint groups keep stable identities across the product: Protect · Guard · Inspect (safety), Decide · Extract · Fill (core), Verify · Compare · Rerank (knowledge).
- User-pinned (2026-11-10): white background across the whole product; animated cards; every emoji replaced by real icons and animated icon chips.

## Evidence on Hand

- Working app with four scenarios and real gate outputs; recorded fixtures in `src/data/fixtures.ts`; live API key configured locally.
- Screenshots in `docs/`. 18/18 eval assertions passing.
- All ticket data is fictional and synthetic. There are **no** customers, testimonials, benchmarks, adoption numbers or pricing; none may be invented.

## Product Principles

1. Every gate must change the outcome; a call whose result is ignored does not ship.
2. Prove, don't claim: show the gate blocking the attack, with its evidence.
3. Uncertainty routes to a human; the agent never acts on a low-confidence or flagged result.
4. Anyone can reproduce it: replay mode with no key, live mode with one.
