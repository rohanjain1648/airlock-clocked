"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Check,
  FileText,
  Filter,
  Hand,
  Lock,
  Mail,
  MessageSquare,
  RotateCcw,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import type { DoorState, HeroCase } from "@/lib/hero";
import { ENDPOINT_BY_PATH, EndpointChip, IconChip } from "@/components/endpoints";
import type { Group } from "@/lib/types";

const STEP_MS = 620;

const CASE_ICON: Record<string, { Icon: LucideIcon; group: Group }> = {
  injection: { Icon: MessageSquare, group: "safety" },
  poisoned: { Icon: FileText, group: "safety" },
  script: { Icon: SquareTerminal, group: "safety" },
  draft: { Icon: Mail, group: "knowledge" },
};
const CHANNEL_ICON: Record<HeroCase["channel"], LucideIcon> = {
  chat: MessageSquare,
  email: Mail,
  form: FileText,
};
const TONE = {
  block: { ink: "var(--safety)", soft: "var(--safety-soft)", line: "var(--safety-line)", Icon: Lock },
  warn: { ink: "var(--core)", soft: "var(--core-soft)", line: "var(--core-line)", Icon: Hand },
  pass: { ink: "var(--pass)", soft: "var(--pass-soft)", line: "#b6dfc6", Icon: Check },
};

interface Door {
  title: string;
  sub: string;
  paths: readonly string[];
}

export default function Hero({ cases, doors }: { cases: HeroCase[]; doors: readonly Door[] }) {
  const [active, setActive] = useState(cases[0].id);
  const [resolved, setResolved] = useState(0); // doors resolved so far
  const [tokenAt, setTokenAt] = useState(0); // column the ticket sits over
  const [settled, setSettled] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const c = cases.find((x) => x.id === active)!;

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const play = useCallback(
    (id: string) => {
      clear();
      const hc = cases.find((x) => x.id === id)!;
      setActive(id);
      setResolved(0);
      setTokenAt(0);
      setSettled(false);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const last = Math.min(hc.stopAt, hc.doors.length - 1);
      if (reduce) {
        setResolved(hc.doors.length);
        setTokenAt(hc.stopAt >= hc.doors.length ? hc.doors.length : hc.stopAt);
        setSettled(true);
        return;
      }
      // Walk the ticket door by door until it stops or passes through.
      for (let i = 0; i <= last; i++) {
        timers.current.push(
          setTimeout(() => {
            setResolved(i + 1);
            const passes = i < hc.stopAt;
            if (passes) setTokenAt(i + 1);
          }, 420 + i * STEP_MS),
        );
      }
      // Doors after the stop resolve too (e.g. Inspect still reads the script).
      const tail = 420 + (last + 1) * STEP_MS;
      timers.current.push(setTimeout(() => setResolved(hc.doors.length), tail));
      timers.current.push(setTimeout(() => setSettled(true), tail + 180));
    },
    [cases],
  );

  useEffect(() => {
    play(cases[0].id);
    return clear;
  }, [play, cases]);

  const ChannelIcon = CHANNEL_ICON[c.channel];
  const tone = TONE[c.outcome.tone];
  const cols = doors.length + 1;
  const passedAll = c.stopAt >= doors.length;

  return (
    <section className="mx-auto max-w-[1240px] px-4 pt-10 pb-16 sm:px-6 sm:pt-12" aria-labelledby="hero-title">
      {/* Headline row */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <h1
            id="hero-title"
            className="display font-bold"
            style={{ fontSize: "clamp(3rem, 6.4vw, 5.6rem)", lineHeight: 0.9, color: "var(--text)" }}
          >
            Nothing reaches the agent unchecked.
          </h1>
          <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed sm:text-[17px]" style={{ color: "var(--text-dim)" }}>
            Airlock puts ten Clocked endpoints between an autonomous IT agent and everything it
            reads or does. Each verdict decides whether the next door opens.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/console"
              className="tap inline-flex h-11 items-center gap-2 rounded-lg px-5 text-[14px] font-semibold no-underline"
              style={{ background: "var(--text)", color: "#ffffff", boxShadow: "var(--shadow-md)" }}
            >
              Open the console
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
            </Link>
            <a
              href="#endpoints"
              className="tap inline-flex h-11 items-center rounded-lg px-4 text-[14px] font-semibold no-underline"
              style={{ border: "1px solid var(--line)", color: "var(--text)", background: "var(--panel)" }}
            >
              See the ten gates
            </a>
          </div>
        </div>

        {/* Attack picker */}
        <div>
          <p className="mb-3 text-[13px] font-medium" style={{ color: "var(--text-dim)" }} id="attack-label">
            Send a ticket through the airlock:
          </p>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="attack-label">
            {cases.map((hc) => {
              const on = hc.id === active;
              const ci = CASE_ICON[hc.id];
              return (
                <button
                  key={hc.id}
                  role="radio"
                  aria-checked={on}
                  onClick={() => play(hc.id)}
                  className="tap group/chip flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left"
                  style={{
                    border: `1px solid ${on ? "var(--text)" : "var(--line)"}`,
                    background: on ? "var(--text)" : "var(--panel)",
                    color: on ? "#ffffff" : "var(--text)",
                    boxShadow: on ? "var(--shadow-md)" : "var(--shadow-sm)",
                  }}
                >
                  <IconChip Icon={ci.Icon} group={ci.group} anim="scan" size={30} live={on} solid={on} />
                  <span className="text-[13px] font-semibold leading-tight">{hc.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* The airlock strip */}
      <div className="card mt-8 overflow-hidden" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div className="board relative px-3 pt-4 pb-5 sm:px-5">
          {/* Ticket row (desktop): the ticket travels above the doors */}
          <div className="relative hidden h-[86px] md:block" aria-hidden>
            <div
              className="token absolute top-1 px-1.5"
              style={{ left: `${(tokenAt / cols) * 100}%`, width: `${100 / cols}%` }}
            >
              <div
                className="rounded-lg px-3 py-2"
                style={{
                  background: "var(--panel)",
                  border: `1px solid ${settled && !passedAll ? tone.line : "var(--line)"}`,
                  boxShadow: "var(--shadow-md)",
                }}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  <ChannelIcon size={12} strokeWidth={2.2} aria-hidden />
                  {c.channel} ticket
                </div>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug" style={{ color: "var(--text)" }}>
                  {c.ticket}
                </p>
              </div>
            </div>
          </div>

          {/* Doors */}
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6 md:gap-3">
            {doors.map((d, i) => (
              <DoorTile key={d.title} door={d} index={i} state={i < resolved ? c.doors[i].state : "pending"} note={c.doors[i].note} />
            ))}
            <AgentBay reached={settled && passedAll} />
          </ol>

          <p className="mt-5 border-t pt-3 text-[11.5px]" style={{ color: "var(--text-faint)", borderColor: "var(--line)" }}>
            Every verdict here is a response recorded from the live Clocked API, replayed. The console calls it live.
          </p>
        </div>

        {/* Readout */}
        <div className="grid gap-0 border-t lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" style={{ borderColor: "var(--line)" }}>
          <ul className="divide-y" style={{ borderColor: "var(--line-soft)" }} aria-live="polite">
            {c.readings.map((r, i) => {
              const e = ENDPOINT_BY_PATH[r.path];
              return (
                <li
                  key={`${c.id}-${r.path}`}
                  className="flex gap-3 px-4 py-4 sm:px-5"
                  style={{
                    borderColor: "var(--line-soft)",
                    opacity: settled ? 1 : 0,
                    transform: settled ? "none" : "translateY(6px)",
                    transition: `opacity .5s var(--ease-out) ${i * 110}ms, transform .5s var(--ease-out) ${i * 110}ms`,
                  }}
                >
                  <EndpointChip path={r.path} size={34} live={settled} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>{e?.name}</span>
                      <span className="mono text-[11px]" style={{ color: "var(--text-faint)" }}>/{r.path}</span>
                      <span className="mono ml-auto text-[13px] font-semibold" style={{ color: "var(--text)" }}>{r.value}</span>
                    </div>
                    <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-dim)" }}>{r.detail}</p>
                    {r.quote && (
                      <p
                        className={`mt-2 rounded-md px-2.5 py-1.5 text-[12px] leading-snug ${r.quoteIsCode ? "mono" : ""}`}
                        style={{ background: "var(--bg-sunken)", color: "var(--text)", borderLeft: "1px solid var(--line)" }}
                      >
                        {r.quoteIsCode ? r.quote : `“${r.quote}”`}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div
            className="flex flex-col justify-between gap-5 border-t p-5 lg:border-t-0 lg:border-l"
            style={{
              borderColor: "var(--line)",
              background: settled ? tone.soft : "var(--panel)",
              transition: "background-color .5s var(--ease-out)",
            }}
          >
            <div style={{ opacity: settled ? 1 : 0.35, transition: "opacity .4s var(--ease-out)" }}>
              <div className="flex items-center gap-2.5">
                <span
                  className="ichip"
                  data-anim="lock"
                  style={{ width: 34, height: 34, background: settled ? tone.ink : "var(--bg-sunken)", color: "#ffffff" }}
                  aria-hidden
                >
                  <tone.Icon size={17} strokeWidth={2.2} />
                </span>
                <h2 className="display text-[28px] font-bold leading-none" style={{ color: settled ? tone.ink : "var(--text-faint)" }}>
                  {settled ? c.outcome.title : "Reading…"}
                </h2>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {settled ? c.outcome.body : "Each door waits for its Clocked verdict."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/console?s=${c.scenarioId}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold underline"
                style={{ color: "var(--text)" }}
              >
                Run this ticket on the full board
                <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
              </Link>
              <button
                onClick={() => play(c.id)}
                className="tap ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium"
                style={{ border: "1px solid var(--line)", color: "var(--text-dim)", background: "var(--panel)" }}
              >
                <RotateCcw size={13} strokeWidth={2.2} aria-hidden />
                Replay
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DoorTile({
  door,
  index,
  state,
  note,
}: {
  door: Door;
  index: number;
  state: DoorState | "pending";
  note: string;
}) {
  const lead = ENDPOINT_BY_PATH[door.paths[0]];
  const look = DOOR_LOOK[state];
  return (
    <li className="door relative min-w-0" data-state={state}>
      <div
        className="relative flex h-full min-h-[132px] flex-col overflow-hidden rounded-xl p-2.5 sm:p-3"
        style={{
          background: "var(--panel)",
          border: `1px solid ${look.border}`,
          boxShadow: state === "pending" || state === "idle" ? "none" : "var(--shadow-sm)",
          opacity: state === "idle" ? 0.55 : 1,
          transition: "border-color .35s var(--ease-out), opacity .35s var(--ease-out)",
        }}
      >
        <div className="flex items-center justify-between gap-1">
          <span className="mono text-[10px] font-semibold" style={{ color: "var(--text-faint)" }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          {lead && <EndpointChip path={lead.path} size={26} live={state !== "pending" && state !== "idle"} />}
        </div>
        <div className="mt-auto pt-3">
          <div className="display text-[20px] font-bold leading-none sm:text-[22px]" style={{ color: "var(--text)" }}>
            {door.title}
          </div>
          <div className="mt-1 hidden text-[11px] leading-tight sm:block" style={{ color: "var(--text-faint)" }}>
            {door.sub}
          </div>
        </div>

        {/* The sealing panel: hazard stripes drop over a sealed door. */}
        <div className="door-panel hazard absolute inset-0 flex items-center justify-center" aria-hidden>
          <span className="ichip is-live" data-anim="lock" style={{ width: 36, height: 36, background: "var(--safety-fill)", color: "#fff", boxShadow: "0 4px 10px -2px rgba(12,17,22,.4)" }}>
            <Lock size={18} strokeWidth={2.4} />
          </span>
        </div>
      </div>
      <div className="mt-2 flex min-h-[30px] items-start gap-1.5">
        {look.Icon && <look.Icon size={13} strokeWidth={2.4} style={{ color: look.ink, marginTop: 1, flexShrink: 0 }} aria-hidden />}
        <span className="text-[11px] leading-tight" style={{ color: state === "pending" ? "var(--text-faint)" : look.ink }}>
          <span className="sr-only">{door.title}: </span>
          {state === "pending" ? "waiting" : note}
        </span>
      </div>
    </li>
  );
}

const DOOR_LOOK: Record<DoorState | "pending", { border: string; ink: string; Icon?: LucideIcon }> = {
  pending: { border: "var(--line)", ink: "var(--text-faint)" },
  idle: { border: "var(--line)", ink: "var(--text-faint)" },
  open: { border: "#9fd3b4", ink: "var(--pass)", Icon: Check },
  sealed: { border: "var(--safety-line)", ink: "var(--safety)", Icon: Lock },
  held: { border: "var(--core-line)", ink: "var(--core)", Icon: Hand },
  filtered: { border: "var(--core-line)", ink: "var(--core)", Icon: Filter },
};

function AgentBay({ reached }: { reached: boolean }) {
  return (
    <li className="min-w-0">
      <div
        className="flex h-full min-h-[132px] flex-col rounded-xl p-2.5 sm:p-3"
        style={{
          border: `1px dashed ${reached ? "#9fd3b4" : "var(--line)"}`,
          background: reached ? "var(--pass-soft)" : "transparent",
          transition: "background-color .45s var(--ease-out), border-color .45s var(--ease-out)",
        }}
      >
        <span
          className="ichip"
          style={{ width: 26, height: 26, background: reached ? "var(--pass)" : "var(--bg-sunken)", color: reached ? "#fff" : "var(--text-faint)" }}
          aria-hidden
        >
          <Bot size={14} strokeWidth={2.2} />
        </span>
        <div className="mt-auto pt-3">
          <div className="display text-[20px] font-bold leading-none sm:text-[22px]" style={{ color: reached ? "var(--pass)" : "var(--text-faint)" }}>
            Aria acts
          </div>
          <div className="mt-1 hidden text-[11px] leading-tight sm:block" style={{ color: "var(--text-faint)" }}>
            the agent
          </div>
        </div>
      </div>
      <div className="mt-2 min-h-[30px] text-[11px] leading-tight" style={{ color: reached ? "var(--pass)" : "var(--text-faint)" }}>
        {reached ? "reply sent" : "only if every door opens"}
      </div>
    </li>
  );
}
