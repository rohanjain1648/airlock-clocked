"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  CornerDownRight,
  FileText,
  Hand,
  Lock,
  Mail,
  MessageSquare,
  OctagonX,
  Play,
  RotateCcw,
  TriangleAlert,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { GateResult, TriageOutput } from "@/lib/types";
import type { FastPathResult } from "@/lib/fastpath";
import { GateDetail } from "./GateDetail";
import { Dot, STATUS_COLOR } from "./ui";
import { ENDPOINT_BY_PATH, EndpointChip, GROUP_INK, GROUP_TITLE, IconChip } from "./endpoints";

export interface ScenarioSummary {
  id: string;
  name: string;
  channel: string;
  tagline: string;
  teaches: string;
  body: string;
  hasScript: boolean;
}

const CHANNEL_ICON: Record<string, LucideIcon> = {
  email: Mail,
  chat: MessageSquare,
  voice: MessageSquare,
  form: FileText,
};

const REVEAL_MS = 240;

export default function Console({
  scenarios,
  mode,
  initialId,
}: {
  scenarios: ScenarioSummary[];
  mode: "live" | "replay";
  initialId?: string;
}) {
  const [activeId, setActiveId] = useState(initialId ?? scenarios[0]?.id);
  const [result, setResult] = useState<TriageOutput | null>(null);
  const [running, setRunning] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [openGate, setOpenGate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fast, setFast] = useState<FastPathResult | null>(null);
  const [fastLoading, setFastLoading] = useState(false);
  const [fastError, setFastError] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const active = scenarios.find((s) => s.id === activeId);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const runFast = useCallback(async (scenarioId: string) => {
    setFastLoading(true);
    setFast(null);
    setFastError(null);
    try {
      const res = await fetch("/api/fastpath", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (!res.ok) throw new Error(`The fast path returned ${res.status}.`);
      setFast(await res.json());
    } catch (e) {
      setFastError(e instanceof Error ? e.message : "The fast path failed.");
    } finally {
      setFastLoading(false);
    }
  }, []);

  const run = useCallback(async (scenarioId: string) => {
    clearTimers();
    setRunning(true);
    setResult(null);
    setRevealed(0);
    setOpenGate(null);
    setError(null);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ? `${body.error} (${res.status})` : `The board returned ${res.status}.`);
      }
      const data: TriageOutput = await res.json();
      setResult(data);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        setRevealed(data.gates.length);
        setRunning(false);
        return;
      }
      data.gates.forEach((_, i) => {
        timers.current.push(setTimeout(() => setRevealed(i + 1), 160 + i * REVEAL_MS));
      });
      timers.current.push(setTimeout(() => setRunning(false), 160 + data.gates.length * REVEAL_MS));
    } catch (e) {
      setError(e instanceof Error ? e.message : "The run failed.");
      setRunning(false);
    }
  }, []);

  useEffect(() => () => clearTimers(), []);

  const select = (id: string) => {
    setActiveId(id);
    setResult(null);
    setRevealed(0);
    setOpenGate(null);
    setError(null);
    setFast(null);
    setFastError(null);
    clearTimers();
    setRunning(false);
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1320px] px-4 pb-16 sm:px-6">
      <div className="flex flex-col gap-3 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display text-[44px] font-bold leading-none" style={{ color: "var(--text)" }}>
            The gate board
          </h1>
          <p className="mt-3 max-w-[64ch] text-[14px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            Pick a ticket and run it. Every gate is a real Clocked call, and the line under each one says
            what its verdict changed for Aria, the autonomous agent.
          </p>
        </div>
        <ModeBadge mode={mode} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="space-y-2" aria-label="Tickets">
          <h2 className="text-[12px] font-semibold" style={{ color: "var(--text-faint)" }}>Tickets</h2>
          <div className="space-y-2" role="radiogroup" aria-label="Choose a ticket">
            {scenarios.map((s) => (
              <ScenarioCard key={s.id} s={s} active={s.id === activeId} onClick={() => select(s.id)} />
            ))}
          </div>
          <GroupLegend />
        </aside>

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

          {(fast || fastLoading || fastError) && <FastPathCard fast={fast} loading={fastLoading} error={fastError} />}

          {error && <ErrorCard message={error} onRetry={() => active && run(active.id)} />}

          {result && <DecisionBanner result={result} revealed={revealed} />}

          <div>
            {!result && !running && !error && <Empty />}
            {!result && error && !running && <Empty quiet />}
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

          {result && revealed >= result.gates.length && <CostStrip result={result} />}
        </main>
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: "live" | "replay" }) {
  const live = mode === "live";
  return (
    <span
      className="inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12px] font-semibold sm:self-auto"
      style={{
        color: live ? "var(--pass)" : "var(--knowledge)",
        background: live ? "var(--pass-soft)" : "var(--knowledge-soft)",
        boxShadow: `inset 0 0 0 1px ${live ? "#b6dfc6" : "var(--knowledge-line)"}`,
      }}
      title={live ? "Calling the live Clocked API" : "Replaying responses recorded from the live Clocked API; no credits spent"}
    >
      <Dot color={live ? "var(--pass)" : "var(--knowledge)"} />
      {live ? "Live Clocked API" : "Replay mode"}
    </span>
  );
}

function ScenarioCard({ s, active, onClick }: { s: ScenarioSummary; active: boolean; onClick: () => void }) {
  const Icon = CHANNEL_ICON[s.channel] ?? FileText;
  return (
    <button
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className="tap card flex w-full gap-3 p-3 text-left"
      style={{
        borderColor: active ? "var(--text)" : "var(--line)",
        boxShadow: active ? "var(--shadow-md)" : "var(--shadow-sm)",
      }}
    >
      <span
        className="ichip"
        style={{
          width: 32,
          height: 32,
          background: active ? "var(--text)" : "var(--bg-sunken)",
          color: active ? "#ffffff" : "var(--text-dim)",
        }}
        aria-hidden
      >
        <Icon size={16} strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold leading-snug" style={{ color: "var(--text)" }}>{s.name}</span>
        <span className="mt-0.5 block text-[12px] leading-snug" style={{ color: "var(--text-dim)" }}>{s.tagline}</span>
      </span>
    </button>
  );
}

function GroupLegend() {
  const groups = ["safety", "core", "knowledge"] as const;
  const firstOf = { safety: "injection", core: "decide", knowledge: "grounding" } as const;
  return (
    <div className="card mt-4 p-3.5">
      <h2 className="text-[12px] font-semibold" style={{ color: "var(--text-faint)" }}>Endpoint groups</h2>
      <ul className="mt-2.5 space-y-2">
        {groups.map((g) => (
          <li key={g} className="group/chip flex items-center gap-2.5">
            <EndpointChip path={firstOf[g]} size={24} />
            <span className="text-[12.5px] font-medium" style={{ color: GROUP_INK[g] }}>{GROUP_TITLE[g]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11.5px] leading-snug" style={{ color: "var(--text-faint)" }}>
        All nine run across these tickets. The tenth, Pipeline, powers the one-call fast path.
      </p>
    </div>
  );
}

function TicketPanel({
  s,
  running,
  onRun,
  onFast,
  fastLoading,
  hasResult,
}: {
  s: ScenarioSummary;
  running: boolean;
  onRun: () => void;
  onFast: () => void;
  fastLoading: boolean;
  hasResult: boolean;
}) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="display text-[28px] font-bold leading-none" style={{ color: "var(--text)" }}>{s.name}</h2>
          <p className="mt-2 max-w-[70ch] text-[13.5px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{s.teaches}</p>
        </div>
        <div className="flex shrink-0 flex-row gap-2 sm:w-[220px] sm:flex-col">
          <button
            onClick={onRun}
            disabled={running}
            className="tap inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-[13px] font-semibold sm:w-full sm:flex-none"
            style={{
              background: running ? "var(--bg-sunken)" : "var(--text)",
              color: running ? "var(--text-faint)" : "#ffffff",
              cursor: running ? "default" : "pointer",
              boxShadow: running ? "none" : "var(--shadow-md)",
            }}
          >
            {running ? (
              <span className="running inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--knowledge)" }} aria-hidden />
            ) : hasResult ? (
              <RotateCcw size={15} strokeWidth={2.2} aria-hidden />
            ) : (
              <Play size={15} strokeWidth={2.2} aria-hidden />
            )}
            {running ? "Running gates…" : hasResult ? "Run again" : "Run Airlock"}
          </button>
          <button
            onClick={onFast}
            disabled={fastLoading}
            title="Run Protect, Guard and Decide as a single Clocked Pipeline request"
            className="tap group/chip inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-[12.5px] font-semibold sm:w-full sm:flex-none"
            style={{ background: "var(--core-soft)", color: "var(--core)", boxShadow: "inset 0 0 0 1px var(--core-line)" }}
          >
            <Zap size={15} strokeWidth={2.2} aria-hidden />
            {fastLoading ? "Running pipeline…" : (<><span className="sm:hidden">Fast path</span><span className="hidden sm:inline">Fast path: one request</span></>)}
          </button>
        </div>
      </div>
      <pre
        className="mono mt-4 whitespace-pre-wrap rounded-lg p-3.5 text-[12px] leading-relaxed"
        style={{ background: "var(--bg-sunken)", color: "var(--text)" }}
      >
        {s.body}
      </pre>
    </div>
  );
}

function FastPathCard({ fast, loading, error }: { fast: FastPathResult | null; loading: boolean; error: string | null }) {
  return (
    <div className="card p-4 sm:p-5" style={{ borderColor: "var(--core-line)" }}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="group/chip flex items-center gap-2.5">
          <EndpointChip path="pipeline" size={30} live={!!fast} />
          <h3 className="display text-[22px] font-bold leading-none" style={{ color: "var(--text)" }}>One-request fast path</h3>
        </div>
        {fast && (
          <span className="mono text-[11px]" style={{ color: "var(--text-faint)" }}>
            {fast.cost.credits != null ? `${fast.cost.credits} credits · one bill` : "one bill"} · {fast.source}
          </span>
        )}
      </div>
      <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        Protect, then Guard with <span className="mono">stop</span>, then Decide, as a single{" "}
        <span className="mono">/pipeline</span> request: one admission, one round trip, one bill. A flagged Guard ends
        the pipeline, so triage never runs on a hostile message.
      </p>
      {loading && (
        <p className="mt-3 inline-flex items-center gap-2 text-[13px]" style={{ color: "var(--core)" }}>
          <span className="running inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--core-fill)" }} aria-hidden />
          Running the pipeline…
        </p>
      )}
      {error && (
        <p className="mt-3 inline-flex items-center gap-2 text-[13px]" style={{ color: "var(--safety)" }}>
          <TriangleAlert size={15} strokeWidth={2.2} aria-hidden />
          {error} Try again; the gate board still works on its own.
        </p>
      )}
      {fast && (
        <ol className="mt-4 space-y-1.5">
          {fast.steps.map((st, i) => {
            const skipped = st.status === null;
            const flagged = st.headline.startsWith("injection");
            const color = skipped ? "var(--text-faint)" : flagged ? "var(--block)" : "var(--pass)";
            return (
              <li
                key={i}
                className="gate-in flex items-center gap-3 rounded-lg px-3 py-2"
                style={{ background: "var(--bg-sunken)", animationDelay: `${i * 90}ms` }}
              >
                <EndpointChip path={st.endpoint} size={24} live={!skipped} />
                <span className="mono w-20 shrink-0 text-[11px] font-semibold" style={{ color: "var(--text-dim)" }}>/{st.endpoint}</span>
                <Dot color={color} />
                <span className="text-[13px]" style={{ color: skipped ? "var(--text-faint)" : "var(--text)" }}>
                  {skipped ? "Skipped: the guard stopped the pipeline" : st.headline}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {fast?.stoppedReason && (
        <p className="mt-3 inline-flex items-center gap-2 text-[12.5px] font-medium" style={{ color: "var(--block)" }}>
          <OctagonX size={15} strokeWidth={2.2} aria-hidden />
          Stopped at step {(fast.stoppedAtStep ?? 0) + 1}, reason: {fast.stoppedReason}
        </p>
      )}
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderColor: "var(--safety-line)", background: "var(--safety-soft)" }}
      role="alert"
    >
      <div className="flex gap-2.5">
        <TriangleAlert size={18} strokeWidth={2.2} style={{ color: "var(--safety)", flexShrink: 0, marginTop: 1 }} aria-hidden />
        <div>
          <p className="text-[14px] font-semibold" style={{ color: "var(--safety)" }}>The run did not finish.</p>
          <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-dim)" }}>
            {message} Nothing was sent and no ticket state changed. Run it again.
          </p>
        </div>
      </div>
      <button
        onClick={onRetry}
        className="tap inline-flex h-9 items-center gap-1.5 self-start rounded-lg px-3 text-[13px] font-semibold sm:self-auto"
        style={{ background: "var(--panel)", color: "var(--text)", border: "1px solid var(--line)" }}
      >
        <RotateCcw size={14} strokeWidth={2.2} aria-hidden />
        Try again
      </button>
    </div>
  );
}

const TONES = {
  block: { ink: "var(--safety)", soft: "var(--safety-soft)", line: "var(--safety-line)", Icon: Lock },
  warn: { ink: "var(--core)", soft: "var(--core-soft)", line: "var(--core-line)", Icon: Hand },
  pass: { ink: "var(--pass)", soft: "var(--pass-soft)", line: "#b6dfc6", Icon: Check },
};

function DecisionBanner({ result, revealed }: { result: TriageOutput; revealed: number }) {
  const done = revealed >= result.gates.length;
  const d = result.decision;
  const blocked = !d.automationAllowed;
  const held = d.automationAllowed && !d.autoSend;
  const tone = TONES[blocked ? "block" : held ? "warn" : "pass"];
  const title = blocked ? "Automation locked: a human takes this ticket" : held ? "Draft held for human approval" : "Cleared: Aria may resolve and reply";
  return (
    <div className="card overflow-hidden p-0" style={{ borderColor: tone.line }}>
      {(blocked || held) && <div className="hazard h-2" aria-hidden />}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: tone.soft }}>
        <span className="ichip is-live" data-anim="lock" style={{ width: 30, height: 30, background: tone.ink, color: "#ffffff" }} aria-hidden>
          <tone.Icon size={15} strokeWidth={2.4} />
        </span>
        <span className="display text-[22px] font-bold leading-tight" style={{ color: tone.ink }}>{title}</span>
        {!done && (
          <span className="mono ml-auto text-[11px]" style={{ color: "var(--text-faint)" }}>
            gate {revealed} of {result.gates.length}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 sm:grid-cols-3 lg:grid-cols-6">
        <Fact k="Queue" v={d.queue ?? "—"} />
        <Fact k="Priority" v={d.priority ?? "—"} />
        <Fact k="Major incident" v={d.majorIncident == null ? "—" : d.majorIncident ? "Yes" : "No"} />
        <Fact k="Linked ticket" v={d.duplicateOf ?? "—"} />
        <Fact k="Auto-send" v={d.autoSend ? "Allowed" : "Blocked"} tone={d.autoSend ? "var(--pass)" : "var(--block)"} />
        <Fact k="Run fix" v={d.scriptRunnable == null ? "n/a" : d.scriptRunnable ? "Enabled" : "Disabled"} tone={d.scriptRunnable == null ? undefined : d.scriptRunnable ? "var(--pass)" : "var(--block)"} />
      </dl>
      {done && (
        <div className="border-t px-4 py-4" style={{ borderColor: "var(--line-soft)" }}>
          <h3 className="flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: "var(--text-faint)" }}>
            <Bot size={14} strokeWidth={2.2} aria-hidden />
            The reply Aria would send
          </h3>
          <p className="mt-1.5 max-w-[78ch] text-[14px] leading-relaxed" style={{ color: "var(--text)" }}>{d.reply || "—"}</p>
          <h3 className="mt-4 text-[12px] font-semibold" style={{ color: "var(--text-faint)" }}>Why</h3>
          <ul className="mt-1.5 space-y-1.5">
            {d.rationale.map((r, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-snug" style={{ color: "var(--text-dim)" }}>
                <CornerDownRight size={14} strokeWidth={2.2} style={{ color: tone.ink, flexShrink: 0, marginTop: 2 }} aria-hidden />
                {r}
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
      <dt className="text-[11.5px] font-medium" style={{ color: "var(--text-faint)" }}>{k}</dt>
      <dd className="mt-0.5 text-[15px] font-semibold capitalize" style={{ color: tone ?? "var(--text)" }}>{v}</dd>
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
    <ol className="space-y-2">
      {gates.slice(0, revealed).map((g, i) => (
        <GateRow key={i} g={g} index={i} open={openGate === i} onToggle={() => setOpenGate(openGate === i ? null : i)} />
      ))}
      {running && revealed < Math.max(gates.length, 1) && <RunningRow />}
    </ol>
  );
}

function GateRow({ g, index, open, onToggle }: { g: GateResult; index: number; open: boolean; onToggle: () => void }) {
  const statusColor = STATUS_COLOR[g.status];
  const meta = ENDPOINT_BY_PATH[g.endpoint];
  const detailId = `gate-detail-${index}`;
  return (
    <li className="gate-in group/chip card overflow-hidden" style={{ borderColor: open ? "#c3cad3" : "var(--line)" }}>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={detailId}
        className="flex w-full items-center gap-3 p-3 text-left"
      >
        <span className="mono w-5 shrink-0 text-right text-[11px] font-semibold" style={{ color: "var(--text-faint)" }}>
          {index + 1}
        </span>
        <EndpointChip path={g.endpoint} size={32} live />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{g.label}</span>
            <span className="mono text-[11px]" style={{ color: GROUP_INK[g.group] }}>/{g.endpoint}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <Dot color={statusColor} />
            <span className="text-[13px] sm:truncate" style={{ color: "var(--text-dim)" }}>{g.headline}</span>
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <div className="mono text-[12px]" style={{ color: "var(--text)" }}>
            {g.cost.credits != null ? `${g.cost.credits} cr` : "—"}
          </div>
          <div className="text-[11px]" style={{ color: "var(--text-faint)" }}>{g.source === "live" ? "live" : "recorded"}</div>
        </div>
        <ChevronDown
          size={17}
          strokeWidth={2.2}
          aria-hidden
          style={{ color: "var(--text-faint)", transform: open ? "rotate(180deg)" : "none", transition: "transform .25s var(--ease-out)", flexShrink: 0 }}
        />
      </button>
      <div className="flex items-start gap-1.5 px-3 pb-3 text-[12.5px] leading-snug sm:pl-[76px]" style={{ color: "var(--text-dim)" }}>
        <ArrowRight size={14} strokeWidth={2.4} style={{ color: statusColor, flexShrink: 0, marginTop: 2 }} aria-hidden />
        <span>
          <span className="font-semibold" style={{ color: "var(--text)" }}>Changed: </span>
          {g.effect}
        </span>
      </div>
      {open && (
        <div id={detailId} className="border-t px-4 py-4" style={{ borderColor: "var(--line-soft)", background: "var(--bg-raised)" }}>
          <p className="mb-3 text-[12px]" style={{ color: "var(--text-faint)" }}>
            {meta ? `${meta.name}: ${meta.changes}` : null}
          </p>
          <GateDetail gate={g} />
        </div>
      )}
    </li>
  );
}

function RunningRow() {
  return (
    <li className="card flex items-center gap-3 p-3" style={{ borderColor: "var(--knowledge-line)" }}>
      <span className="w-5" />
      <span className="running inline-flex h-8 w-8 items-center justify-center rounded-[9px]" style={{ background: "var(--knowledge-soft)" }} aria-hidden>
        <Dot color="var(--knowledge)" />
      </span>
      <span className="text-[13px] font-medium" style={{ color: "var(--knowledge)" }}>Waiting for the next Clocked verdict…</span>
    </li>
  );
}

function CostStrip({ result }: { result: TriageOutput }) {
  const t = result.totals;
  const live = result.mode === "live";
  return (
    <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
      <dl className="flex flex-wrap items-center gap-6">
        <Metric k="Gates run" v={String(t.gateCount)} />
        <Metric k="Credits" v={t.credits.toLocaleString()} />
        <Metric k="Cost" v={live ? `$${t.costUsd.toFixed(5)}` : "$0, replayed"} />
        <Metric k="Model time" v={`${Math.round(t.modelMs).toLocaleString()} ms`} />
      </dl>
      <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>
        {live
          ? `${t.liveCount} of ${t.gateCount} gates called Clocked live; credits and cost come from Clocked's response headers.`
          : "Recorded responses from the live API. Set CLOCKED_API_KEY to call Clocked live."}
      </p>
    </div>
  );
}

function Metric({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[11.5px] font-medium" style={{ color: "var(--text-faint)" }}>{k}</dt>
      <dd className="mono mt-0.5 text-[17px] font-semibold" style={{ color: "var(--text)" }}>{v}</dd>
    </div>
  );
}

function Empty({ quiet }: { quiet?: boolean }) {
  return (
    <div className="group/chip flex flex-col items-center justify-center gap-3 py-14 text-center">
      {!quiet && (
        <div className="flex items-center gap-1.5" aria-hidden>
          <EndpointChip path="injection" size={34} loop />
          <span className="h-px w-6" style={{ background: "var(--line)" }} />
          <EndpointChip path="decide" size={34} />
          <span className="h-px w-6" style={{ background: "var(--line)" }} />
          <EndpointChip path="grounding" size={34} />
          <span className="h-px w-6" style={{ background: "var(--line)" }} />
          <IconChip Icon={Bot} group="bonus" size={34} />
        </div>
      )}
      <p className="max-w-[44ch] text-[14px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {quiet
          ? "No gates ran."
          : "Run the ticket to send it through the gates. Each one appears here with its verdict and what it changed."}
      </p>
    </div>
  );
}
