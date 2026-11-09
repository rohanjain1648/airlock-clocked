import { NextResponse } from "next/server";
import { runFastPath } from "@/lib/fastpath";
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
    const result = await runFastPath(scenario);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[fastpath] failed", err);
    return NextResponse.json({ error: "fastpath failed", detail: String(err) }, { status: 500 });
  }
}
