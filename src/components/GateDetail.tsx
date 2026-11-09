"use client";
import React from "react";
import { Bar, Evidence, RawJson, STATUS_COLOR } from "./ui";
import type { GateResult } from "@/lib/types";
import type {
  DecideResponse,
  ExtractResponse,
  FillResponse,
  PiiResponse,
  InjectionResponse,
  ScriptResponse,
  GroundingResponse,
  CompareResponse,
  RerankResponse,
} from "clocked-sdk";

const VERDICT_COLOR: Record<string, string> = {
  supported: "var(--pass)",
  contradicted: "var(--block)",
  not_stated: "var(--warn)",
  not_a_claim: "var(--text-faint)",
  use: "var(--pass)",
  expand: "var(--info)",
  skip: "var(--text-faint)",
};

function topEntries(obj: Record<string, number>, n = 5): [string, number][] {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);
}

export function GateDetail({ gate }: { gate: GateResult }) {
  const e = gate.endpoint;

  if (e === "injection") return <GuardView d={gate.data as InjectionResponse} />;
  if (e === "pii") return <ProtectView d={gate.data as PiiResponse} />;
  if (e === "extract") return <ExtractView d={gate.data as ExtractResponse} />;
  if (e === "decide") return <DecideView d={gate.data as DecideResponse} />;
  if (e === "rerank") return <RerankView d={gate.data as RerankResponse} />;
  if (e === "compare") return <CompareView d={gate.data as CompareResponse} />;
  if (e === "fill") return <FillView d={gate.data as FillResponse} />;
  if (e === "grounding") return <VerifyView d={gate.data as GroundingResponse} />;
  if (e === "script") return <InspectView d={gate.data as ScriptResponse} />;
  return <RawJson data={gate.data} />;
}

function GuardView({ d }: { d: InjectionResponse }) {
  const flagged = d.verdict !== "benign" && d.injection >= d.threshold;
  return (
    <div className="space-y-2">
      <Bar label="injection probability" value={d.injection} color={flagged ? "var(--block)" : "var(--pass)"} />
      <div className="flex flex-wrap gap-2 text-[11px]" style={{ color: "var(--text-dim)" }}>
        <span className="mono">verdict: <b style={{ color: flagged ? "var(--block)" : "var(--pass)" }}>{d.verdict}</b></span>
        {d.severity && <span className="mono">severity: <b>{d.severity}</b></span>}
        <span className="mono">category: <b>{d.category}</b></span>
        <span className="mono">source: {d.source}</span>
      </div>
      <div className="space-y-1 pt-1">
        {topEntries(d.categories, 4).map(([k, v]) => (
          <Bar key={k} label={k} value={v} color={k === d.category && flagged ? "var(--block)" : "var(--text-faint)"} />
        ))}
      </div>
      {!!d.evidence?.length && (
        <div className="space-y-1 pt-1">
          <div className="mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>evidence</div>
          {d.evidence.map((ev, i) => <Evidence key={i} quote={ev.quote} />)}
        </div>
      )}
      <RawJson data={d} />
    </div>
  );
}

function ProtectView({ d }: { d: PiiResponse }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {d.entities.map((ent, i) => (
          <span key={i} className="mono rounded-md px-2 py-1 text-[11px]" style={{ background: "var(--bg-sunken)", border: "1px solid var(--line)", color: "var(--text)" }}>
            <span style={{ color: "var(--safety)" }}>&lt;{ent.type.toUpperCase()}&gt;</span> {ent.value}
          </span>
        ))}
        {!d.entities.length && <span className="text-[12px]" style={{ color: "var(--pass)" }}>No personal data found.</span>}
      </div>
      {d.anonymized_text && (
        <div>
          <div className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>masked copy sent downstream</div>
          <pre className="mono whitespace-pre-wrap rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: "var(--bg-sunken)", border: "1px solid var(--line-soft)", color: "var(--text-dim)" }}>
            {highlightPlaceholders(d.anonymized_text)}
          </pre>
        </div>
      )}
      <RawJson data={d} />
    </div>
  );
}

function highlightPlaceholders(text: string): React.ReactNode[] {
  const parts = text.split(/(<[A-Z_]+>)/g);
  return parts.map((p, i) =>
    /^<[A-Z_]+>$/.test(p) ? (
      <span key={i} style={{ color: "var(--safety)", fontWeight: 700 }}>{p}</span>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

function ExtractView({ d }: { d: ExtractResponse }) {
  return (
    <div className="space-y-1.5">
      {Object.entries(d.fields).map(([k, f]) => {
        const val = f.value;
        const isNull = val === null;
        const isList = Array.isArray(val);
        return (
          <div key={k} className="flex items-start gap-2 text-[12px]">
            <span className="mono w-32 shrink-0" style={{ color: "var(--text-faint)" }}>{k}</span>
            <span className="flex-1" style={{ color: isNull ? "var(--text-faint)" : "var(--text)" }}>
              {isNull ? "— null —" : isList ? (val as string[]).join("  ·  ") : String(val)}
            </span>
            <span className="mono text-[10px]" style={{ color: "var(--text-faint)" }}>
              {f.confidence !== undefined ? `${(f.confidence * 100).toFixed(0)}%` : ""}
            </span>
          </div>
        );
      })}
      <RawJson data={d} />
    </div>
  );
}

function DecideView({ d }: { d: DecideResponse }) {
  return (
    <div className="space-y-3">
      {Object.entries(d.answers).map(([name, a]) => (
        <div key={name}>
          <div className="mono mb-1 text-[11px]" style={{ color: "var(--core)" }}>{name}</div>
          {a.type === "choice" && (
            <div className="space-y-1">
              {topEntries(a.probabilities, 4).map(([k, v]) => (
                <Bar key={k} label={k} value={v} color={k === a.choice ? "var(--core)" : "var(--text-faint)"} />
              ))}
            </div>
          )}
          {a.type === "score" && (
            <div className="space-y-1">
              {Object.entries(a.probabilities).map(([k, v]) => (
                <Bar key={k} label={a.legend[k] ?? k} value={v} color={Math.round(a.score) === Number(k) ? "var(--core)" : "var(--text-faint)"} />
              ))}
            </div>
          )}
          {a.type === "noul" && (
            <Bar label="yes" value={a.noul} sub={a.decision !== undefined ? (a.decision ? "YES" : "no") : `${(a.noul * 100).toFixed(1)}%`} color={a.noul >= 0.5 ? "var(--core)" : "var(--text-faint)"} />
          )}
          {a.type === "multiselect" && (
            <div className="space-y-1">
              {Object.entries(a.probabilities).map(([k, v]) => (
                <Bar key={k} label={k} value={v} color={a.selected.includes(k) ? "var(--core)" : "var(--text-faint)"} />
              ))}
            </div>
          )}
        </div>
      ))}
      <RawJson data={d} />
    </div>
  );
}

function RerankView({ d }: { d: RerankResponse }) {
  return (
    <div className="space-y-1.5">
      {d.results.map((r) => (
        <div key={r.index} className="rounded-lg p-2" style={{ background: "var(--bg-sunken)", border: "1px solid var(--line-soft)" }}>
          <div className="flex items-center justify-between gap-2">
            <span className="mono text-[12px]" style={{ color: "var(--text)" }}>{r.id ?? `#${r.index}`}</span>
            <span className="mono text-[10px] font-bold uppercase tracking-wider" style={{ color: VERDICT_COLOR[r.action] }}>
              {r.action}{r.action === "skip" && r.reason ? ` · ${r.reason}` : ""}
            </span>
          </div>
          <div className="mt-1 flex gap-3 text-[10px]" style={{ color: "var(--text-dim)" }}>
            <span className="mono">answers {(r.levels.answers * 100).toFixed(0)}%</span>
            <span className="mono">elsewhere {(r.levels.elsewhere * 100).toFixed(0)}%</span>
            <span className="mono">diff-case {(r.levels.different_case * 100).toFixed(0)}%</span>
            <span className="mono">unrelated {(r.levels.unrelated * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}
      <RawJson data={d} />
    </div>
  );
}

function CompareView({ d }: { d: CompareResponse }) {
  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-[11px]" style={{ color: "var(--text-dim)" }}>
        <span className="mono">conflicts: <b style={{ color: "var(--block)" }}>{d.conflicts.length}</b></span>
        <span className="mono">duplicates: <b style={{ color: "var(--warn)" }}>{d.duplicates.length}</b></span>
        <span className="mono">pairs: {d.pairs.length}</span>
      </div>
      {d.pairs.map((p, i) => {
        const finding = p.conflict ?? p.duplicate;
        const color = p.relation === "conflicting" ? "var(--block)" : p.relation === "same" ? "var(--warn)" : "var(--text-faint)";
        return (
          <div key={i} className="rounded-lg p-2" style={{ background: "var(--bg-sunken)", border: `1px solid var(--line-soft)` }}>
            <div className="mono text-[12px]">
              <span style={{ color: "var(--text)" }}>{p.a}</span>
              <span style={{ color }}> ↔ </span>
              <span style={{ color: "var(--text)" }}>{p.b}</span>
              <span className="ml-2 text-[10px] font-bold uppercase" style={{ color }}>{p.relation}</span>
            </div>
            {finding && (
              <div className="mt-1 space-y-1">
                <div className="mono text-[11px]" style={{ color: "var(--text-dim)" }}>“{finding.a.quote}”</div>
                <div className="mono text-[11px]" style={{ color: "var(--text-dim)" }}>“{finding.b.quote}”</div>
              </div>
            )}
          </div>
        );
      })}
      <RawJson data={d} />
    </div>
  );
}

function FillView({ d }: { d: FillResponse }) {
  return (
    <div className="space-y-1.5">
      {Object.entries(d.fields).map(([k, f]) => {
        const generated = f.source === "generated";
        return (
          <div key={k} className={generated ? "rounded-lg p-2" : "flex items-start gap-2 text-[12px]"} style={generated ? { background: "var(--core-soft)", border: "1px solid var(--core)" } : {}}>
            {generated ? (
              <div>
                <div className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--core)" }}>{k} · generated</div>
                <div className="text-[12px] leading-relaxed" style={{ color: "var(--text)" }}>{String(f.value)}</div>
              </div>
            ) : (
              <>
                <span className="mono w-32 shrink-0" style={{ color: "var(--text-faint)" }}>{k}</span>
                <span className="flex-1" style={{ color: "var(--text)" }}>{Array.isArray(f.value) ? f.value.join(", ") : String(f.value)}</span>
              </>
            )}
          </div>
        );
      })}
      <RawJson data={d} />
    </div>
  );
}

function VerifyView({ d }: { d: GroundingResponse }) {
  return (
    <div className="space-y-2">
      <Bar label="overall support (weighted)" value={d.grounded} color={d.verdict === "supported" ? "var(--pass)" : "var(--block)"} />
      <div className="flex gap-3 text-[11px]" style={{ color: "var(--text-dim)" }}>
        <span className="mono">verdict: <b style={{ color: d.verdict === "supported" ? "var(--pass)" : "var(--block)" }}>{d.verdict}</b></span>
        {d.answers_question !== undefined && <span className="mono">answers question: {(d.answers_question * 100).toFixed(0)}%</span>}
      </div>
      <div className="space-y-1.5">
        {d.claims.map((c, i) => (
          <div key={i} className="rounded-lg p-2" style={{ background: "var(--bg-sunken)", border: `1px solid ${VERDICT_COLOR[c.verdict ?? "not_a_claim"]}` }}>
            <div className="flex items-start justify-between gap-2">
              <span className="text-[12px]" style={{ color: "var(--text)" }}>{c.claim}</span>
              <span className="mono shrink-0 text-[10px] font-bold uppercase" style={{ color: VERDICT_COLOR[c.verdict ?? "not_a_claim"] }}>{c.verdict}</span>
            </div>
            {c.evidence && (
              <div className="mono mt-1 text-[11px]" style={{ color: "var(--text-dim)" }}>
                {c.evidence.document}: “{c.evidence.quote}”
              </div>
            )}
          </div>
        ))}
      </div>
      <RawJson data={d} />
    </div>
  );
}

function InspectView({ d }: { d: ScriptResponse }) {
  const flagged = d.verdict !== "benign" && d.malicious >= d.threshold;
  return (
    <div className="space-y-2">
      <Bar label="malicious probability" value={d.malicious} color={flagged ? "var(--block)" : "var(--pass)"} />
      <div className="flex flex-wrap gap-2 text-[11px]" style={{ color: "var(--text-dim)" }}>
        <span className="mono">verdict: <b style={{ color: flagged ? "var(--block)" : "var(--pass)" }}>{d.verdict}</b></span>
        {d.severity && <span className="mono">severity: <b>{d.severity}</b></span>}
        <span className="mono">category: <b>{d.category}</b></span>
      </div>
      <div className="space-y-1">
        {topEntries(d.categories, 4).map(([k, v]) => (
          <Bar key={k} label={k} value={v} color={k === d.category && flagged ? "var(--block)" : "var(--text-faint)"} />
        ))}
      </div>
      {!!d.evidence?.length && (
        <div className="space-y-1 pt-1">
          <div className="mono text-[10px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>offending line</div>
          {d.evidence.map((ev, i) => <Evidence key={i} quote={ev.line} />)}
        </div>
      )}
      <RawJson data={d} />
    </div>
  );
}

export { STATUS_COLOR };
