"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  FileText,
  Hand,
  Lock,
  Mail,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import {
  ENDPOINTS,
  GROUP_FILL,
  GROUP_INK,
  GROUP_TITLE,
  IconChip,
  type EndpointMeta,
} from "@/components/endpoints";
import type { Group } from "@/lib/types";

/** Arms scroll reveal for every `.reveal` inside the returned ref. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    root.classList.add("reveal-armed");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}

const STAGES: { group: Group; title: string; line: string }[] = [
  { group: "safety", title: "Screen what comes in", line: "Untrusted text is checked before the agent reads it, and scripts before anyone runs them." },
  { group: "core", title: "Understand the ticket", line: "Facts, routing and a drafted record, each with the probabilities behind it." },
  { group: "knowledge", title: "Check the answer before it leaves", line: "The right sources, reconciled, and every claim held against them." },
];

export function EndpointsSection({ examples }: { examples: Record<string, string> }) {
  const ref = useReveal<HTMLElement>();
  const pipeline = ENDPOINTS.find((e) => e.path === "pipeline")!;
  return (
    <section ref={ref} id="how" className="border-t" style={{ borderColor: "var(--line-soft)", background: "var(--bg-raised)" }}>
      <div id="endpoints" className="mx-auto max-w-[1240px] scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24">
        <div className="reveal grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <h2 className="display font-bold" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 0.95, color: "var(--text)" }}>
            Ten gates. Each one changes what the agent may do.
          </h2>
          <p className="max-w-[56ch] text-[15px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            No call is decoration: every Clocked verdict below writes into the same decision, so it can
            lock the agent, change what it sees, pick its sources, or disable a button. Each card shows a
            real reading from the demo tickets.
          </p>
        </div>

        <div className="mt-14 space-y-12">
          {STAGES.map((stage, si) => (
            <div key={stage.group} className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="reveal border-t pt-4" style={{ ["--d" as string]: "0ms", borderColor: "var(--line)" }}>
                <h3 className="display flex gap-2.5 text-[28px] font-bold leading-[1.02]" style={{ color: "var(--text)" }}>
                  <span style={{ color: GROUP_INK[stage.group] }}>{si + 1}</span>
                  <span>{stage.title}</span>
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--text-dim)" }}>{stage.line}</p>
                <p className="mono mt-3 text-[11px]" style={{ color: GROUP_INK[stage.group] }}>{GROUP_TITLE[stage.group]}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {ENDPOINTS.filter((e) => e.group === stage.group).map((e, i) => (
                  <EndpointCard key={e.path} e={e} example={examples[e.path]} delay={80 + i * 90} />
                ))}
              </div>
            </div>
          ))}

          {/* Pipeline: the tenth endpoint, spanning the width */}
          <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="reveal border-t pt-4" style={{ borderColor: "var(--line)" }}>
              <h3 className="display flex gap-2.5 text-[28px] font-bold leading-[1.02]" style={{ color: "var(--text)" }}>
                <span style={{ color: "var(--text-faint)" }}>+</span>
                <span>One request for the hot path</span>
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                The tenth endpoint runs the screen-and-triage stage in a single call.
              </p>
            </div>
            <EndpointCard e={pipeline} example={examples.pipeline} delay={80} wide />
          </div>
        </div>
      </div>
    </section>
  );
}

function EndpointCard({ e, example, delay, wide }: { e: EndpointMeta; example?: string; delay: number; wide?: boolean }) {
  return (
    <article
      className="reveal group/chip tap card flex flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
      style={{ ["--d" as string]: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 py-2" style={{ background: GROUP_FILL[e.group], color: e.group === "core" ? "var(--text)" : "#ffffff" }}>
        <span className="mono text-[11px] font-semibold">/clocked/{e.path}</span>
        <span className="display text-[13px] font-bold uppercase tracking-wide">{e.group === "bonus" ? "bonus" : e.group}</span>
      </div>
      <div className={`flex flex-1 gap-4 p-4 ${wide ? "flex-col sm:flex-row sm:items-center" : "flex-col"}`}>
        <div className="flex items-center gap-3">
          <IconChip Icon={e.Icon} group={e.group} anim={e.anim} size={40} />
          <h4 className="display text-[26px] font-bold leading-none" style={{ color: "var(--text)" }}>{e.name}</h4>
        </div>
        <p className={`text-[13.5px] leading-relaxed ${wide ? "sm:flex-1" : ""}`} style={{ color: "var(--text-dim)" }}>
          {e.changes}
        </p>
        {example && (
          <p
            className={`mono rounded-md px-2.5 py-2 text-[11px] leading-snug ${wide ? "sm:max-w-[42%]" : "mt-auto"}`}
            style={{ background: "var(--bg-sunken)", color: "var(--text)" }}
          >
            <span style={{ color: "var(--text-faint)" }}>real reading · </span>
            {example}
          </p>
        )}
      </div>
    </article>
  );
}

export interface ScenarioRow {
  id: string;
  name: string;
  channel: "email" | "chat" | "voice" | "form";
  tagline: string;
  outcome: { tone: "block" | "warn" | "pass"; title: string };
}

const CHANNEL: Record<ScenarioRow["channel"], LucideIcon> = {
  email: Mail,
  chat: MessageSquare,
  voice: MessageSquare,
  form: FileText,
};
const STAMP = {
  block: { ink: "var(--safety)", soft: "var(--safety-soft)", line: "var(--safety-line)", Icon: Lock },
  warn: { ink: "var(--core)", soft: "var(--core-soft)", line: "var(--core-line)", Icon: Hand },
  pass: { ink: "var(--pass)", soft: "var(--pass-soft)", line: "#b6dfc6", Icon: Check },
};

export function ScenariosSection({ rows }: { rows: ScenarioRow[] }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="scenarios" className="mx-auto max-w-[1240px] scroll-mt-16 px-4 py-20 sm:px-6 sm:py-24">
      <div className="reveal grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
        <h2 className="display font-bold" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 0.95, color: "var(--text)" }}>
          Four tickets. Four verdicts.
        </h2>
        <p className="max-w-[56ch] text-[15px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Each demo ticket is built to make one part of the airlock do its job. Open any of them on the
          full board to see every gate, its probabilities and its evidence.
        </p>
      </div>
      <ol className="mt-12 divide-y border-y" style={{ borderColor: "var(--line)" }}>
        {rows.map((r, i) => {
          const Icon = CHANNEL[r.channel];
          const s = STAMP[r.outcome.tone];
          return (
            <li key={r.id} className="reveal" style={{ borderColor: "var(--line)", ["--d" as string]: `${i * 80}ms` }}>
              <Link
                href={`/console?s=${r.id}`}
                className="group/row grid items-center gap-x-5 gap-y-3 py-5 no-underline sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
              >
                <span className="ichip" style={{ width: 40, height: 40, background: "var(--bg-sunken)", color: "var(--text-dim)", boxShadow: "inset 0 0 0 1px var(--line)" }} aria-hidden>
                  <Icon size={19} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <div className="display text-[24px] font-bold leading-tight" style={{ color: "var(--text)" }}>{r.name}</div>
                  <div className="mt-0.5 text-[14px]" style={{ color: "var(--text-dim)" }}>{r.tagline}</div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 justify-self-start rounded-md px-2.5 py-1.5 text-[12px] font-semibold"
                  style={{ color: s.ink, background: s.soft, boxShadow: `inset 0 0 0 1px ${s.line}` }}
                >
                  <s.Icon size={13} strokeWidth={2.4} aria-hidden />
                  {r.outcome.title}
                </span>
                <span className="inline-flex items-center gap-1 text-[13px] font-semibold transition-transform group-hover/row:translate-x-0.5" style={{ color: "var(--text)" }}>
                  Open on the board
                  <ArrowRight size={14} strokeWidth={2.2} aria-hidden />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ReproduceSection({ evalLine }: { evalLine: string }) {
  const ref = useReveal<HTMLElement>();
  return (
    <section ref={ref} id="reproduce" className="scroll-mt-16 border-t" style={{ borderColor: "var(--line-soft)", background: "var(--bg-raised)" }}>
      <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        <div className="reveal">
          <h2 className="display font-bold" style={{ fontSize: "clamp(2.2rem, 4.4vw, 3.6rem)", lineHeight: 0.95, color: "var(--text)" }}>
            Run it yourself, with or without a key.
          </h2>
          <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            Without a key, Airlock replays responses recorded from the live Clocked API, so every gate and
            every decision works with no credits spent. Add a key and the same board calls Clocked live,
            with the credits and cost of each gate shown as it runs.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Clocked is called only from the server; the key never reaches the browser.",
              "The official clocked-sdk retries busy and interrupted calls under one idempotency key.",
              "An eval script asserts that each gate's verdict changes the decision.",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 text-[14px] leading-relaxed" style={{ color: "var(--text)" }}>
                <Check size={16} strokeWidth={2.4} style={{ color: "var(--pass)", marginTop: 3, flexShrink: 0 }} aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal card overflow-hidden" style={{ ["--d" as string]: "120ms", boxShadow: "var(--shadow-md)" }}>
          <div className="flex items-center gap-2 border-b px-4 py-2.5" style={{ borderColor: "var(--line)" }}>
            <span className="mono text-[11px] font-semibold" style={{ color: "var(--text-faint)" }}>terminal</span>
          </div>
          <pre className="mono overflow-x-auto p-4 text-[12.5px] leading-[1.75]" style={{ color: "var(--text)" }}>
{`npm install
npm run dev              `}<span style={{ color: "var(--text-faint)" }}># replay mode, no key</span>{`

`}<span style={{ color: "var(--text-faint)" }}># live mode</span>{`
echo CLOCKED_API_KEY=clk_... > .env.local
npm run dev
npm run record           `}<span style={{ color: "var(--text-faint)" }}># re-record real responses</span>{`
npm run eval
`}<span style={{ color: "var(--pass)" }}>{evalLine}</span>
          </pre>
        </div>
      </div>
    </section>
  );
}

export function CloseBand() {
  return (
    <section className="border-t" style={{ borderColor: "var(--line-soft)" }}>
      <div className="mx-auto flex max-w-[1240px] flex-col items-start gap-6 px-4 py-16 sm:px-6 md:flex-row md:items-center md:justify-between">
        <h2 className="display font-bold" style={{ fontSize: "clamp(2rem, 3.6vw, 3rem)", lineHeight: 0.98, color: "var(--text)" }}>
          Watch all ten gates work on one ticket.
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/console"
            className="tap inline-flex h-11 items-center gap-2 rounded-lg px-5 text-[14px] font-semibold no-underline"
            style={{ background: "var(--text)", color: "#ffffff", boxShadow: "var(--shadow-md)" }}
          >
            Open the console
            <ArrowRight size={16} strokeWidth={2.2} aria-hidden />
          </Link>
          <a
            href="https://clocked.rezolve.ai/challenge"
            className="tap inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-[14px] font-semibold no-underline"
            style={{ border: "1px solid var(--line)", color: "var(--text)", background: "var(--panel)" }}
          >
            About the challenge
            <ArrowUpRight size={15} strokeWidth={2.2} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
