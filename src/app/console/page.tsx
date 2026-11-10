import type { Metadata } from "next";
import Console, { type ScenarioSummary } from "@/components/Console";
import { TopBar } from "@/components/chrome";
import { SCENARIOS } from "@/data/scenarios";
import { MODE } from "@/lib/clocked";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Console — Airlock",
};

export default async function ConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string }>;
}) {
  const { s } = await searchParams;
  const scenarios: ScenarioSummary[] = SCENARIOS.map((sc) => ({
    id: sc.id,
    name: sc.name,
    channel: sc.channel,
    tagline: sc.tagline,
    teaches: sc.teaches,
    body: sc.body,
    hasScript: !!sc.proposedScript,
  }));
  const initialId = scenarios.some((x) => x.id === s) ? s : scenarios[0].id;
  return (
    <>
      <TopBar active="console" />
      <Console scenarios={scenarios} mode={MODE} initialId={initialId} />
    </>
  );
}
