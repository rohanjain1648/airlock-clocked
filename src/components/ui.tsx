"use client";
import React from "react";
import type { Group } from "@/lib/types";

export const GROUP_COLOR: Record<Group, string> = {
  core: "var(--core)",
  safety: "var(--safety)",
  knowledge: "var(--knowledge)",
};
export const GROUP_SOFT: Record<Group, string> = {
  core: "var(--core-soft)",
  safety: "var(--safety-soft)",
  knowledge: "var(--knowledge-soft)",
};
export const GROUP_NAME: Record<Group, string> = {
  core: "Decide · Extract · Fill",
  safety: "Protect · Guard · Inspect",
  knowledge: "Verify · Compare · Rerank",
};

export const STATUS_COLOR: Record<string, string> = {
  pass: "var(--pass)",
  block: "var(--block)",
  warn: "var(--warn)",
  info: "var(--info)",
};

export function Chip({
  color,
  children,
  soft,
  title,
}: {
  color: string;
  children: React.ReactNode;
  soft?: boolean;
  title?: string;
}) {
  return (
    <span
      title={title}
      className="mono inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-semibold uppercase tracking-wider"
      style={{
        color: soft ? color : "#06121a",
        background: soft ? "transparent" : color,
        border: `1px solid ${color}`,
      }}
    >
      {children}
    </span>
  );
}

export function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 rounded-full"
      style={{ background: color, boxShadow: `0 0 8px ${color}` }}
    />
  );
}

/** Collapsible raw-JSON viewer for a Clocked response. */
export function RawJson({ data, label = "raw response" }: { data: unknown; label?: string }) {
  return (
    <details className="mt-2">
      <summary className="mono text-[11px] uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
        ▸ {label}
      </summary>
      <pre
        className="mono mt-2 max-h-72 overflow-auto rounded-lg p-3 text-[11px] leading-relaxed"
        style={{ background: "var(--bg-sunken)", color: "var(--text-dim)", border: "1px solid var(--line-soft)" }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

/** A labeled probability bar. */
export function Bar({
  label,
  value,
  color = "var(--info)",
  sub,
}: {
  label: string;
  value: number;
  color?: string;
  sub?: string;
}) {
  const pctNum = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="flex items-center gap-2 text-[12px]">
      <span className="w-40 shrink-0 truncate" style={{ color: "var(--text-dim)" }} title={label}>
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-sunken)" }}>
        <div className="h-full rounded-full" style={{ width: `${pctNum}%`, background: color }} />
      </div>
      <span className="mono w-14 shrink-0 text-right tabular-nums" style={{ color: "var(--text)" }}>
        {sub ?? `${pctNum.toFixed(1)}%`}
      </span>
    </div>
  );
}

export function Evidence({ quote }: { quote: string }) {
  return (
    <div
      className="mono rounded-md px-2 py-1 text-[11px] leading-snug"
      style={{ background: "var(--safety-soft)", color: "#ffd9dd", border: "1px solid var(--safety)" }}
    >
      “{quote}”
    </div>
  );
}
