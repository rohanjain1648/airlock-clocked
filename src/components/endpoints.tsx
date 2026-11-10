"use client";
import React from "react";
import {
  BadgeCheck,
  ClipboardList,
  EyeOff,
  GitCompareArrows,
  Highlighter,
  ListOrdered,
  type LucideIcon,
  ScanSearch,
  ShieldAlert,
  Signpost,
  Workflow,
} from "lucide-react";
import type { Group } from "@/lib/types";

export type ChipAnim = "scan" | "mask" | "stack" | "tilt" | "lock";

export interface EndpointMeta {
  /** The Clocked path, e.g. "injection". */
  path: string;
  /** Product name Clocked uses, e.g. "Guard". */
  name: string;
  group: Group | "bonus";
  Icon: LucideIcon;
  anim: ChipAnim;
  /** What its output changes in Airlock, in one line. */
  changes: string;
}

/** The ten Clocked endpoints, in the order a ticket meets them. */
export const ENDPOINTS: EndpointMeta[] = [
  { path: "injection", name: "Guard", group: "safety", Icon: ShieldAlert, anim: "scan",
    changes: "Locks automation on an injection, and drops poisoned knowledge-base passages before Aria reads them." },
  { path: "pii", name: "Protect", group: "safety", Icon: EyeOff, anim: "mask",
    changes: "Its masked copy is the only text Aria and vendor handoffs see; it re-scans the reply before it leaves." },
  { path: "script", name: "Inspect", group: "safety", Icon: ScanSearch, anim: "scan",
    changes: "Enables or disables the Run fix control, and pins the exact line that makes a script unsafe." },
  { path: "extract", name: "Extract", group: "core", Icon: Highlighter, anim: "stack",
    changes: "The asset tag drives an asset lookup; fixes already tried feed Rerank; the deadline sets the SLA." },
  { path: "decide", name: "Decide", group: "core", Icon: Signpost, anim: "tilt",
    changes: "Sets queue, priority, major incident and self-service, which decides whether Aria resolves or escalates." },
  { path: "fill", name: "Fill", group: "core", Icon: ClipboardList, anim: "stack",
    changes: "Builds the resolution record and a drafted reply in one call: the draft Verify checks next." },
  { path: "rerank", name: "Rerank", group: "knowledge", Icon: ListOrdered, anim: "scan",
    changes: "Marks each passage use, expand or skip; a different-case skip keeps the wrong tenant's fix out of the answer." },
  { path: "compare", name: "Compare", group: "knowledge", Icon: GitCompareArrows, anim: "stack",
    changes: "Links a new ticket to an open report of the same outage, and flags knowledge articles that disagree." },
  { path: "grounding", name: "Verify", group: "knowledge", Icon: BadgeCheck, anim: "scan",
    changes: "Checks the draft claim by claim; an unsupported claim is removed and auto-send is blocked." },
  { path: "pipeline", name: "Pipeline", group: "bonus", Icon: Workflow, anim: "stack",
    changes: "Runs Protect, Guard and Decide as one request; a flagged Guard stops it before triage runs." },
];

export const ENDPOINT_BY_PATH: Record<string, EndpointMeta> = Object.fromEntries(
  ENDPOINTS.map((e) => [e.path, e]),
);

export const GROUP_INK: Record<Group | "bonus", string> = {
  safety: "var(--safety)",
  core: "var(--core)",
  knowledge: "var(--knowledge)",
  bonus: "var(--text)",
};
export const GROUP_FILL: Record<Group | "bonus", string> = {
  safety: "var(--safety-fill)",
  core: "var(--core-fill)",
  // White text on the bright cyan fill is ~2.9:1, so solid knowledge plates use the ink.
  knowledge: "var(--knowledge)",
  bonus: "var(--text)",
};
export const GROUP_SOFT: Record<Group | "bonus", string> = {
  safety: "var(--safety-soft)",
  core: "var(--core-soft)",
  knowledge: "var(--knowledge-soft)",
  bonus: "var(--bg-sunken)",
};
export const GROUP_LINE: Record<Group | "bonus", string> = {
  safety: "var(--safety-line)",
  core: "var(--core-line)",
  knowledge: "var(--knowledge-line)",
  bonus: "var(--line)",
};
export const GROUP_TITLE: Record<Group | "bonus", string> = {
  safety: "Protect · Guard · Inspect",
  core: "Decide · Extract · Fill",
  knowledge: "Verify · Compare · Rerank",
  bonus: "Pipeline",
};

/**
 * An animated icon chip. The icon plays its motion on hover (of the chip or a
 * `group/chip` ancestor), once when `live` turns on, or continuously with `loop`.
 */
export function IconChip({
  Icon,
  group,
  anim = "scan",
  size = 34,
  live = false,
  loop = false,
  solid = false,
  label,
}: {
  Icon: LucideIcon;
  group: Group | "bonus";
  anim?: ChipAnim;
  size?: number;
  live?: boolean;
  loop?: boolean;
  /** Solid signage fill instead of a soft wash. */
  solid?: boolean;
  /** Accessible name; omit when the chip sits next to visible text. */
  label?: string;
}) {
  const ink = GROUP_INK[group];
  return (
    <span
      className={`ichip${live ? " is-live" : ""}${loop ? " is-loop" : ""}`}
      data-anim={anim}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        width: size,
        height: size,
        // Core plates carry ink: white on the amber fill is ~2:1.
        color: solid ? (group === "core" ? "var(--text)" : "#ffffff") : ink,
        background: solid ? GROUP_FILL[group] : GROUP_SOFT[group],
        boxShadow: solid ? "none" : `inset 0 0 0 1px ${GROUP_LINE[group]}`,
      }}
    >
      <Icon size={Math.round(size * 0.52)} strokeWidth={2} />
    </span>
  );
}

/** Chip for one endpoint by its Clocked path. */
export function EndpointChip({
  path,
  size,
  live,
  loop,
  solid,
}: {
  path: string;
  size?: number;
  live?: boolean;
  loop?: boolean;
  solid?: boolean;
}) {
  const e = ENDPOINT_BY_PATH[path];
  if (!e) return null;
  return <IconChip Icon={e.Icon} group={e.group} anim={e.anim} size={size} live={live} loop={loop} solid={solid} />;
}
