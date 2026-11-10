import { TopBar, SiteFooter } from "@/components/chrome";
import Hero from "@/components/landing/Hero";
import {
  CloseBand,
  EndpointsSection,
  ReproduceSection,
  ScenariosSection,
  type ScenarioRow,
} from "@/components/landing/Sections";
import { buildHeroCases, HERO_DOORS } from "@/lib/hero";
import { endpointExamples } from "@/lib/landing";
import { SCENARIOS } from "@/data/scenarios";

// The landing page reads only recorded responses, so it renders statically.
export default function Landing() {
  const cases = buildHeroCases();
  const outcomeByScenario = Object.fromEntries(cases.map((c) => [c.scenarioId, c.outcome]));
  const rows: ScenarioRow[] = SCENARIOS.map((s) => ({
    id: s.id,
    name: s.name,
    channel: s.channel,
    tagline: s.tagline,
    outcome: outcomeByScenario[s.id] ?? { tone: "warn", title: "Held" },
  }));

  return (
    <>
      <TopBar active="home" />
      <main>
        <Hero cases={cases} doors={HERO_DOORS} />
        <EndpointsSection examples={endpointExamples()} />
        <ScenariosSection rows={rows} />
        {/* Result of `npm run eval` against the live API (scripts/eval.mjs). */}
        <ReproduceSection evalLine="21 passed, 0 failed." />
        <CloseBand />
      </main>
      <SiteFooter />
    </>
  );
}
