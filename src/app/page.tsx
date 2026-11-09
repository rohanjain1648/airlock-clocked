import Console, { type ScenarioSummary } from "@/components/Console";
import { SCENARIOS } from "@/data/scenarios";
import { MODE } from "@/lib/clocked";

export const dynamic = "force-dynamic";

export default function Page() {
  const scenarios: ScenarioSummary[] = SCENARIOS.map((s) => ({
    id: s.id,
    name: s.name,
    channel: s.channel,
    tagline: s.tagline,
    teaches: s.teaches,
    body: s.body,
    hasScript: !!s.proposedScript,
  }));
  return <Console scenarios={scenarios} mode={MODE} />;
}
