"use client";
import React from "react";
import { ChevronRight } from "lucide-react";
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
      className="inline-flex items-center gap-1 rounded-md px-2 py-[3px] text-[11px] font-semibold"
      style={{
        color: soft ? color : "#ffffff",
        background: soft ? "transparent" : color,
        boxShadow: `inset 0 0 0 1px ${color}`,
      }}
    >
      {children}
    </span>
  );
}

/** A status lamp: a solid dot with a pale ring, no glow. */
export function Dot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: color, boxShadow: `0 0 0 3px color-mix(in srgb, ${color} 16%, transparent)` }}
      aria-hidden
    />
  );
}

/** Collapsible raw-JSON viewer for a Clocked response. */
export function RawJson({ data, label = "Raw Clocked response" }: { data: unknown; label?: string }) {
  return (
    <details className="mt-3">
      <summary className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: "var(--text-dim)" }}>
        <ChevronRight className="chev" size={14} strokeWidth={2.2} aria-hidden />
        {label}
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
      <span className="w-28 shrink-0 truncate sm:w-44" style={{ color: "var(--text-dim)" }} title={label}>
        {label}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bg-sunken)" }}>
        <div className="h-full rounded-full" style={{ width: `${pctNum}%`, background: color }} />
      </div>
      <span className="mono w-14 shrink-0 text-right" style={{ color: "var(--text)" }}>
        {sub ?? `${pctNum.toFixed(1)}%`}
      </span>
    </div>
  );
}

export function Evidence({ quote }: { quote: string }) {
  return (
    <div
      className="mono rounded-md px-2.5 py-1.5 text-[11.5px] leading-snug"
      style={{ background: "var(--safety-soft)", color: "var(--safety)", boxShadow: "inset 0 0 0 1px var(--safety-line)" }}
    >
      “{quote}”
    </div>
  );
}
