import "server-only";
import { getFixture } from "@/data/fixtures";
import type {
  CompareResponse,
  DecideResponse,
  ExtractResponse,
  FillResponse,
  GroundingResponse,
  InjectionResponse,
  PiiResponse,
  PipelineResponse,
  RerankResponse,
  ScriptResponse,
} from "clocked-sdk";

/**
 * One real readout per endpoint, read from responses the live Clocked API
 * returned for the demo tickets. Shown on the landing-page endpoint cards.
 */
const pct = (n: number, d = 1) => `${(n * 100).toFixed(d)}%`;
const f = <T,>(key: string) => getFixture<T>(key);

function safe(fn: () => string): string {
  try {
    return fn();
  } catch {
    return "";
  }
}

export function endpointExamples(): Record<string, string> {
  return {
    injection: safe(() => {
      const g = f<InjectionResponse>("injected-ticket:guard_inbound");
      return `${pct(g.injection)} injection · ${g.category}`;
    }),
    pii: safe(() => {
      const p = f<PiiResponse>("injected-ticket:protect_inbound");
      const kinds = [...new Set(p.entities.map((e) => `<${e.type.toUpperCase()}>`))].join(" ");
      return `${p.entities.length} spans → ${kinds}`;
    }),
    script: safe(() => {
      const s = f<ScriptResponse>("printer-script:inspect");
      return `${pct(s.malicious)} malicious · ${s.category}`;
    }),
    extract: safe(() => {
      const e = f<ExtractResponse>("payroll-outage:extract");
      const a = e.fields.asset_id;
      return a?.start !== undefined ? `asset_id = ${a.value} · chars ${a.start}–${a.end}` : `asset_id = ${a?.value}`;
    }),
    decide: safe(() => {
      const d = f<DecideResponse>("payroll-outage:decide").answers;
      const q = d.queue.type === "choice" ? d.queue : null;
      const p = d.priority.type === "score" ? d.priority : null;
      const lvl = p ? p.legend[String(Math.round(p.score))]?.split(":")[0] : "";
      return `queue ${q?.choice} ${q ? pct(q.probabilities[q.choice], 0) : ""} · priority ${lvl}`;
    }),
    fill: safe(() => {
      const r = f<FillResponse>("payroll-outage:fill").fields;
      return `next_action = ${r.next_action?.value} · draft generated`;
    }),
    rerank: safe(() => {
      const r = f<RerankResponse>("payroll-outage:rerank").results;
      const s = r.find((x) => x.action === "skip" && x.reason === "different_case");
      const u = r.find((x) => x.action === "use");
      return `${u?.id} → use · ${s?.id} → skip (different case)`;
    }),
    compare: safe(() => {
      const c = f<CompareResponse>("payroll-outage:compare");
      const p = c.pairs
        .filter((x) => (x.a === "this-ticket" || x.b === "this-ticket") && /^INC-/.test(x.a === "this-ticket" ? x.b : x.a))
        .sort((a, b) => b.related - a.related)[0];
      return p ? `ticket ↔ ${p.a === "this-ticket" ? p.b : p.a} · ${p.relation} ${pct(p.related, 0)}` : "";
    }),
    grounding: safe(() => {
      const v = f<GroundingResponse>("payroll-outage:verify");
      const n = v.unsupported_claims?.length ?? 0;
      return `${v.verdict.replace(/_/g, " ")} · ${pct(v.grounded, 0)} support · ${n} claim removed`;
    }),
    pipeline: safe(() => {
      const p = f<PipelineResponse>("injected-ticket:pipeline");
      return p.stopped
        ? `stopped at step ${p.stopped.step + 1} (${p.stopped.endpoint}) · triage skipped`
        : `${p.steps.length} steps · one request`;
    }),
  };
}
