import { NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";
import { getScenario } from "@/data/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { scenarioId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const scenario = body.scenarioId ? getScenario(body.scenarioId) : undefined;
  if (!scenario) {
    return NextResponse.json({ error: "unknown scenarioId" }, { status: 404 });
  }
  try {
    const result = await runPipeline(scenario);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[triage] pipeline failed", err);
    return NextResponse.json(
      { error: "pipeline failed", detail: String(err) },
      { status: 500 },
    );
  }
}
