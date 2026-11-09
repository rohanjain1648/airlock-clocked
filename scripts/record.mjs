#!/usr/bin/env node
/**
 * Record real Clocked responses into src/data/fixtures.generated.json.
 *
 * Usage:
 *   1. Set your key:            export CLOCKED_API_KEY=clk_...   (or put it in .env.local)
 *   2. Start the app live:      npm run dev        (in another terminal)
 *   3. Record:                  npm run record
 *
 * The recorder drives the app's own /api/triage and /api/fastpath so every
 * request is exactly what the product sends. It maps each gate to its fixture
 * key and writes the raw endpoint responses, which REPLAY mode then serves.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE = process.env.AIRLOCK_BASE ?? "http://localhost:3000";
const SCENARIOS = ["payroll-outage", "injected-ticket", "printer-script", "poisoned-kb"];

// Gate label → fixture key (stable; both sides are in this repo).
const LABEL_KEY = {
  "Guard · screen inbound": "guard_inbound",
  "Protect · mask inbound": "protect_inbound",
  "Extract · ticket facts": "extract",
  "Decide · route & prioritize": "decide",
  "Guard · screen retrieved KB": "guard_kb",
  "Rerank · pick passages": "rerank",
  "Compare · conflicts & duplicates": "compare",
  "Fill · resolution record": "fill",
  "Verify · check the draft": "verify",
  "Protect · outbound reply": "protect_outbound",
  "Inspect · gate the fix script": "inspect",
};

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

async function main() {
  const out = {};
  let live = 0;
  let total = 0;

  for (const id of SCENARIOS) {
    const triage = await post("/api/triage", { scenarioId: id });
    if (triage.mode !== "live") {
      console.warn(
        `\n⚠  App is in REPLAY mode (no CLOCKED_API_KEY). Start it with a key:\n   CLOCKED_API_KEY=clk_... npm run dev\n`,
      );
    }
    for (const g of triage.gates) {
      const key = LABEL_KEY[g.label];
      if (!key) {
        console.warn(`  ? no key mapping for gate label "${g.label}" — skipped`);
        continue;
      }
      out[`${id}:${key}`] = g.data;
      total++;
      if (g.source === "live") live++;
    }

    const fast = await post("/api/fastpath", { scenarioId: id });
    if (fast.raw) {
      out[`${id}:pipeline`] = fast.raw;
      total++;
      if (fast.source === "live") live++;
    }
    console.log(`✓ ${id}: ${triage.gates.length} gates + pipeline`);
  }

  const dest = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "data", "fixtures.generated.json");
  writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(out).length} fixtures to src/data/fixtures.generated.json`);
  console.log(`${live}/${total} were live API calls.${live === 0 ? "  (Run the app with CLOCKED_API_KEY to record real data.)" : ""}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
