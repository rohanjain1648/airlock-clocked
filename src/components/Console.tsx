"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { GateResult, TriageOutput } from "@/lib/types";
import type { FastPathResult } from "@/lib/fastpath";
import { GateDetail } from "./GateDetail";
import { Chip, Dot, GROUP_COLOR, GROUP_NAME, GROUP_SOFT, STATUS_COLOR } from "./ui";

export interface ScenarioSummary {
  id: string;
  name: string;
  channel: string;
  tagline: string;
  teaches: string;
  body: string;
  hasScript: boolean;
}

const GROUP_ORDER = ["safety", "core", "knowledge"] as const;

export default function Console({
  scenarios,
  mode,
}: {
  scenarios: ScenarioSummary[];
  mode: "live" | "replay";
}) {
  const [activeId, setActiveId] = useState(scenarios[0]?.id);
  const [result, setResult] = useState<TriageOutput | null>(null);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [openGate, setOpenGate] = useState<number | null>(null);
  const [fast, setFast] = useState<FastPathResult | null>(null);
  const [fastLoading, setFastLoading] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const active = scenarios.find((s) => s.id === activeId);

  const runFast = useCallback(async (scenarioId: string) => {
    setFastLoading(true);
    setFast(null);
    try {
      const res = await fetch("/api/fastpath", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      setFast(await res.json());
    } finally {
      setFastLoading(false);
    }
  }, []);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const run = useCallback(async (scenarioId: string) => {
    clearTimers();
    setRunning(true);
    setResult(null);
    setRevealed(0);
    setOpenGate(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      const data: TriageOutput = await res.json();
      setResult(data);
      // Reveal gates one at a time for a "pipeline" feel.
      data.gates.forEach((_, i) => {
        timers.current.push(
          setTimeout(() => setRevealed(i + 1), 160 + i * 230),
        );
      });
      timers.current.push(
        setTimeout(() => setRunning(false), 160 + data.gates.length * 230),
      );
    } catch {
      setRunning(false);
    }
  }, []);

  useEffect(() => () => clearTimers(), []);

  const select = (id: string) => {
    setActiveId(id);
    setResult(null);
    setRevealed(0);
    setOpenGate(null);
    setFast(null);
    clearTimers();
    setRunning(false);
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1400px] px-4 pb-16 sm:px-6">
      <Header mode={mode} />

      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Left rail: scenarios */}
        <aside className="space-y-3">
          <SectionLabel>Tickets</SectionLabel>
          {scenarios.map((s) => (
            <ScenarioCard
              key={s.id}
              s={s}
              active={s.id === activeId}
              onClick={() => select(s.id)}
            />
          ))}
          <AwardLegend />
        </aside>

        {/* Center: the board */}
        <main className="min-w-0 space-y-4">
          {active && (
            <TicketPanel
              s={active}
              running={running}
              onRun={() => run(active.id)}
              onFast={() => runFast(active.id)}
              fastLoading={fastLoading}
              hasResult={!!result}
            />
          )}

          {(fast || fastLoading) && <FastPathCard fast={fast} loading={fastLoading} />}

          {result && (
            <DecisionBanner result={result} revealed={revealed} />
          )}

          <div className="board rounded-2xl border p-4" style={{ borderColor: "var(--line)" }}>
            {!result && !running && (
              <Empty />
            )}
            {(running || result) && (
              <GateBoard
                gates={result?.gates ?? []}
                revealed={revealed}
                openGate={openGate}
                setOpenGate={setOpenGate}
                running={running}
              />
            )}
          </div>

          {result && revealed >= result.gates.length && (
            <CostStrip result={result} />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

function Header({ mode }: { mode: "live" | "replay" }) {
  return (
    <header className="flex flex-col gap-3 py-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <Logo />
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Airlock
          </h1>
          <span className="mono text-[11px]" style={{ color: "var(--text-faint)" }}>v1 · built on Clocked</span>
        </div>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          A trust layer for an autonomous IT service-desk agent. Every ticket and every action
          passes through nine Clocked gates — three for safety, three to understand, three for
          reliable answers. Each gate&apos;s output changes what the agent is allowed to do.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="mono inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            color: mode === "live" ? "#06121a" : "var(--knowledge)",
            background: mode === "live" ? "var(--pass)" : "transparent",
            border: `1px solid ${mode === "live" ? "var(--pass)" : "var(--knowledge)"}`,
          }}
          title={mode === "live" ? "Calling the real Clocked API" : "Replaying recorded responses — no credits spent"}
        >
          <Dot color={mode === "live" ? "#06121a" : "var(--knowledge)"} />
          {mode === "live" ? "live API" : "replay mode"}
        </span>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
      <circle cx="13" cy="13" r="11" fill="none" stroke="var(--knowledge)" strokeWidth="2" />
      <circle cx="13" cy="13" r="4" fill="var(--safety)" />
      <line x1="13" y1="2" x2="13" y2="7" stroke="var(--core)" strokeWidth="2" />
    </svg>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-faint)" }}>
      {children}
    </div>
  );
}

function ScenarioCard({ s, active, onClick }: { s: ScenarioSummary; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="tap card w-full p-3 text-left"
      style={{ borderColor: active ? "var(--knowledge)" : "var(--line)", background: active ? "var(--bg-raised)" : "var(--panel)" }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>{s.name}</span>
        <span className="mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{s.channel}</span>
      </div>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: "var(--text-dim)" }}>{s.tagline}</p>
    </button>
  );
}

function AwardLegend() {
  return (
    <div className="card mt-4 p-3">
      <SectionLabel>Endpoint groups</SectionLabel>
      <div className="mt-2 space-y-2">
        {GROUP_ORDER.map((g) => (
          <div key={g} className="flex items-center gap-2">
            <Dot color={GROUP_COLOR[g]} />
            <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>{GROUP_NAME[g]}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] leading-snug" style={{ color: "var(--text-faint)" }}>
        All nine endpoints run across these tickets; the tenth (Pipeline) powers the one-call fast path.
      </p>
    </div>
  );
}

function TicketPanel({ s, running, onRun, onFast, fastLoading, hasResult }: { s: ScenarioSummary; running: boolean; onRun: () => void; onFast: () => void; fastLoading: boolean; hasResult: boolean }) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>{s.name}</h2>
            <Chip color="var(--knowledge)" soft>{s.channel}</Chip>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{s.teaches}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button
            onClick={onRun}
            disabled={running}
            className="tap w-full rounded-lg px-4 py-2 text-[13px] font-semibold"
            style={{
              background: running ? "var(--bg-raised)" : "var(--knowledge)",
              color: running ? "var(--text-faint)" : "#06181a",
              border: "1px solid var(--knowledge)",
              cursor: running ? "default" : "pointer",
            }}
          >
            {running ? "Running…" : hasResult ? "Run again" : "Run Airlock ▸"}
          </button>
          <button
            onClick={onFast}
            disabled={fastLoading}
            title="Run the screen+triage stage as a single Clocked Pipeline call"
            className="tap w-full rounded-lg px-4 py-1.5 text-[11px] font-semibold"
            style={{ background: "transparent", color: "var(--core)", border: "1px solid var(--core)" }}
          >
            {fastLoading ? "…" : "⚡ Fast path (1 Pipeline call)"}
          </button>
        </div>
      </div>
      <pre className="mono mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg p-3 text-[11px] leading-relaxed" style={{ background: "var(--bg-sunken)", border: "1px solid var(--line-soft)", color: "var(--text-dim)" }}>
        {s.body}
      </pre>
    </div>
  );
}

function DecisionBanner({ result, revealed }: { result: TriageOutput; revealed: number }) {
  const done = revealed >= result.gates.length;
  const d = result.decision;
  const blocked = !d.automationAllowed;
  const held = d.automationAllowed && !d.autoSend;
  const tone = blocked ? "var(--block)" : held ? "var(--warn)" : "var(--pass)";
  const title = blocked
    ? "Automation locked — human required"
    : held
      ? "Draft held for human approval"
      : "Cleared to auto-resolve";
  return (
    <div className="card overflow-hidden p-0" style={{ borderColor: tone }}>
      <div className="flex items-center gap-2 px-4 py-2" style={{ background: blocked ? "var(--safety-soft)" : held ? "var(--core-soft)" : "var(--knowledge-soft)" }}>
        <Dot color={tone} />
        <span className="text-[13px] font-bold" style={{ color: tone }}>{title}</span>
        {!done && <span className="mono text-[10px]" style={{ color: "var(--text-faint)" }}>· gates {revealed}/{result.gates.length}</span>}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-4 py-3 text-[12px] sm:grid-cols-4">
        <Fact k="queue" v={d.queue ?? "—"} />
        <Fact k="priority" v={d.priority ?? "—"} />
        <Fact k="major incident" v={d.majorIncident == null ? "—" : d.majorIncident ? "yes" : "no"} />
        <Fact k="duplicate of" v={d.duplicateOf ?? "—"} />
        <Fact k="auto-send" v={d.autoSend ? "allowed" : "blocked"} tone={d.autoSend ? "var(--pass)" : "var(--block)"} />
        <Fact k="run fix" v={d.scriptRunnable == null ? "n/a" : d.scriptRunnable ? "enabled" : "disabled"} tone={d.scriptRunnable == null ? undefined : d.scriptRunnable ? "var(--pass)" : "var(--block)"} />
      </div>
      {done && (
        <div className="border-t px-4 py-3" style={{ borderColor: "var(--line-soft)" }}>
          <div className="mono mb-1 text-[10px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>reply Aria would send</div>
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text)" }}>{d.reply || "—"}</p>
          <ul className="mt-3 space-y-1">
            {d.rationale.map((r, i) => (
              <li key={i} className="flex gap-2 text-[11px] leading-snug" style={{ color: "var(--text-dim)" }}>
                <span style={{ color: tone }}>›</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Fact({ k, v, tone }: { k: string; v: string; tone?: string }) {
  return (
    <div>
      <div className="mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{k}</div>
      <div className="text-[13px] font-semibold" style={{ color: tone ?? "var(--text)" }}>{v}</div>
    </div>
  );
}

function GateBoard({
  gates,
  revealed,
  openGate,
  setOpenGate,
  running,
}: {
  gates: GateResult[];
  revealed: number;
  openGate: number | null;
  setOpenGate: (n: number | null) => void;
  running: boolean;
}) {
  return (
    <div className="space-y-2.5">
      {gates.slice(0, revealed).map((g, i) => (
        <GateRow
          key={i}
          g={g}
          index={i}
          open={openGate === i}
          onToggle={() => setOpenGate(openGate === i ? null : i)}
          last={i === gates.length - 1}
        />
      ))}
      {running && revealed < gates.length && <RunningRow />}
      {gates.length === 0 && running && <RunningRow />}
    </div>
  );
}

function GateRow({ g, index, open, onToggle, last }: { g: GateResult; index: number; open: boolean; onToggle: () => void; last: boolean }) {
  const groupColor = GROUP_COLOR[g.group];
  const statusColor = STATUS_COLOR[g.status];
  return (
    <div className="gate-in relative">
      {!last && (
        <div className="absolute left-[18px] top-[42px] h-[calc(100%-20px)] w-px" style={{ background: "var(--line)" }} />
      )}
      <div
        className="tap card relative overflow-hidden"
        style={{ borderColor: open ? groupColor : "var(--line)", borderLeftWidth: 3, borderLeftColor: groupColor }}
      >
        <button onClick={onToggle} className="flex w-full items-center gap-3 p-3 text-left">
          <span
            className="mono flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
            style={{ background: GROUP_SOFT[g.group], color: groupColor, border: `1px solid ${groupColor}` }}
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="mono text-[11px] font-semibold uppercase tracking-wide" style={{ color: groupColor }}>
                /{g.endpoint}
              </span>
              <span className="text-[12px] font-semibold" style={{ color: "var(--text)" }}>{g.label}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <Dot color={statusColor} />
              <span className="truncate text-[12px]" style={{ color: "var(--text-dim)" }}>{g.headline}</span>
            </div>
          </div>
          <div className="hidden shrink-0 text-right sm:block">
            <div className="mono text-[11px] tabular-nums" style={{ color: "var(--text)" }}>
              {g.cost.credits != null ? `${g.cost.credits} cr` : "—"}
            </div>
            <div className="mono text-[9px]" style={{ color: "var(--text-faint)" }}>
              {g.source === "live" ? "live" : "replay"}
            </div>
          </div>
          <span className="mono text-[14px]" style={{ color: "var(--text-faint)" }}>{open ? "−" : "+"}</span>
        </button>

        <div className="px-3 pb-1" style={{ marginLeft: 40 }}>
          <div
            className="mono inline-block rounded-md px-2 py-1 text-[10px] leading-snug"
            style={{ background: "var(--bg-sunken)", color: "var(--text-dim)", border: "1px solid var(--line-soft)" }}
          >
            <span style={{ color: statusColor }}>▎changed → </span>{g.effect}
          </div>
        </div>

        {open && (
          <div className="border-t px-4 py-3" style={{ borderColor: "var(--line-soft)", marginLeft: 0 }}>
            <GateDetail gate={g} />
          </div>
        )}
      </div>
    </div>
  );
}

function RunningRow() {
  return (
    <div className="card flex items-center gap-3 p-3" style={{ borderColor: "var(--knowledge)" }}>
      <span className="running flex h-7 w-7 items-center justify-center rounded-full" style={{ border: "1px solid var(--knowledge)" }}>
        <Dot color="var(--knowledge)" />
      </span>
      <span className="mono text-[12px]" style={{ color: "var(--knowledge)" }}>passing through the next gate…</span>
    </div>
  );
}

function CostStrip({ result }: { result: TriageOutput }) {
  const t = result.totals;
  return (
    <div className="card flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="flex flex-wrap items-center gap-4">
        <Metric k="gates run" v={String(t.gateCount)} />
        <Metric k="credits" v={t.credits.toLocaleString()} />
        <Metric k="cost" v={result.mode === "live" ? `$${t.costUsd.toFixed(5)}` : "$0 (replay)"} />
        <Metric k="model time" v={`${t.modelMs} ms`} />
      </div>
      <p className="mono text-[10px]" style={{ color: "var(--text-faint)" }}>
        {result.mode === "live"
          ? `${t.liveCount}/${t.gateCount} gates hit the live API · cost headers from Clocked`
          : "recorded responses · set CLOCKED_API_KEY for live calls and real credit accounting"}
      </p>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="mono text-[9px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{k}</div>
      <div className="mono text-[15px] font-bold tabular-nums" style={{ color: "var(--text)" }}>{v}</div>
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <svg width="40" height="40" viewBox="0 0 26 26" aria-hidden className="opacity-60">
        <circle cx="13" cy="13" r="11" fill="none" stroke="var(--knowledge)" strokeWidth="1.5" />
        <circle cx="13" cy="13" r="4" fill="var(--safety)" />
      </svg>
      <p className="text-[13px]" style={{ color: "var(--text-dim)" }}>Pick a ticket and run Airlock to watch it pass through the gates.</p>
    </div>
  );
}

function FastPathCard({ fast, loading }: { fast: FastPathResult | null; loading: boolean }) {
  return (
    <div className="card p-4" style={{ borderColor: "var(--core)" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Chip color="var(--core)">pipeline</Chip>
          <span className="text-[13px] font-bold" style={{ color: "var(--text)" }}>One-call fast path</span>
        </div>
        {fast && (
          <span className="mono text-[11px]" style={{ color: "var(--text-faint)" }}>
            {fast.cost.credits != null ? `${fast.cost.credits} cr · one bill` : "one bill"} · {fast.source}
          </span>
        )}
      </div>
      <p className="mt-1 text-[11px] leading-snug" style={{ color: "var(--text-dim)" }}>
        Protect → Guard (stop) → Decide as a single <span className="mono">/pipeline</span> request: one admission, one
        round trip, one bill. A flagged Guard ends the pipeline, so triage never runs on a hostile message.
      </p>
      {loading && <p className="mono mt-3 text-[12px]" style={{ color: "var(--core)" }}>running pipeline…</p>}
      {fast && (
        <div className="mt-3 space-y-1.5">
          {fast.steps.map((st, i) => {
            const skipped = st.status === null;
            const flagged = st.headline.startsWith("injection");
            const color = skipped ? "var(--text-faint)" : flagged ? "var(--block)" : "var(--pass)";
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "var(--bg-sunken)", border: "1px solid var(--line-soft)" }}>
                <span className="mono text-[11px] font-bold" style={{ color: "var(--core)" }}>{i + 1}</span>
                <span className="mono text-[11px] uppercase" style={{ color: "var(--core)" }}>/{st.endpoint}</span>
                {st.name && <span className="mono text-[10px]" style={{ color: "var(--text-faint)" }}>{st.name}</span>}
                <Dot color={color} />
                <span className="text-[12px]" style={{ color: skipped ? "var(--text-faint)" : "var(--text)" }}>
                  {skipped ? "skipped — guard stopped the pipeline" : st.headline}
                </span>
              </div>
            );
          })}
          {fast.stoppedReason && (
            <p className="mono text-[11px]" style={{ color: "var(--block)" }}>
              ⏹ stopped at step {(fast.stoppedAtStep ?? 0) + 1} · reason: {fast.stoppedReason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-10 border-t pt-4 text-[11px]" style={{ borderColor: "var(--line-soft)", color: "var(--text-faint)" }}>
      <p>
        Airlock · Clocked Build Challenge entry. All ticket data is fictional and synthetic. Clocked
        calls run server-side only; keys never reach the browser.
      </p>
    </footer>
  );
}
