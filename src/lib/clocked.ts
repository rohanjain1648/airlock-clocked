import "server-only";
import {
  Clocked,
  ClockedError,
  type ClockedResponse,
} from "clocked-sdk";
import { getFixture } from "@/data/fixtures";

/**
 * Server-only Clocked client wrapper.
 *
 * Responsibilities:
 *  - Hold the single API key (never shipped to the browser).
 *  - Add a cost ledger so every gate reports credits + USD, which the UI surfaces.
 *  - Fall back to recorded fixtures when no key is configured, so judges can run
 *    the whole app without spending a single credit (REPLAY mode).
 */

export type Mode = "live" | "replay";

export const MODE: Mode = process.env.CLOCKED_API_KEY ? "live" : "replay";

const client: Clocked | null = process.env.CLOCKED_API_KEY
  ? new Clocked({
      apiKey: process.env.CLOCKED_API_KEY,
      // Generous per-attempt timeout; the gateway allows the model 110s.
      timeout: 120_000,
      maxAttempts: 4,
    })
  : null;

export interface GateCost {
  credits: number | null;
  costUsd: number | null;
  costBasis: string | null;
  modelMs: number | null;
}

export interface GateCall<T> {
  /** Endpoint path, e.g. "injection". */
  endpoint: string;
  /** Human label shown in the UI, e.g. "Guard · screen inbound". */
  label: string;
  /** The parsed endpoint response. */
  data: T;
  cost: GateCost;
  /** "live" or "replay" for this specific call. */
  source: Mode;
}

function costFrom<T>(res: ClockedResponse<T>): GateCost {
  return {
    credits: res.credits,
    costUsd: res.costUsd,
    costBasis: res.costBasis,
    modelMs: res.modelMs,
  };
}

/** Zero cost for replayed fixtures (nothing was charged). */
const ZERO_COST: GateCost = {
  credits: 0,
  costUsd: 0,
  costBasis: "replay",
  modelMs: null,
};

/**
 * Run one endpoint call. In live mode it calls the real API; in replay mode it
 * returns the matching recorded fixture. `fixtureKey` selects the recorded
 * response for this exact gate inside a scenario.
 */
export async function callGate<T>(opts: {
  endpoint:
    | "decide"
    | "extract"
    | "fill"
    | "pii"
    | "injection"
    | "script"
    | "grounding"
    | "compare"
    | "rerank"
    | "pipeline";
  label: string;
  // The request body for the endpoint (typed loosely here; callers pass correct shapes).
  request: Record<string, unknown>;
  // Key of the recorded response (`scenario:gate`). Loaded lazily, only for
  // replay mode or an error fallback, so live recording works for new keys.
  fixtureKey: string;
}): Promise<GateCall<T>> {
  const { endpoint, label, request, fixtureKey } = opts;

  if (!client) {
    return {
      endpoint,
      label,
      data: getFixture<T>(fixtureKey),
      cost: ZERO_COST,
      source: "replay",
    };
  }

  try {
    // `request(endpoint, body)` posts to <baseUrl>/<endpoint> and handles
    // idempotency keys, retries, image/pdf encoding and cost headers for us.
    const res = await client.request<T>(endpoint, request);
    return {
      endpoint,
      label,
      data: res.data,
      cost: costFrom(res),
      source: "live",
    };
  } catch (err) {
    if (err instanceof ClockedError) {
      // Surface a typed failure but keep the pipeline resilient: fall back to the
      // recorded fixture so the demo never dead-ends, and tag it.
      console.error(
        `[clocked] ${endpoint} failed (${err.status}): ${err.error}`,
      );
    } else {
      console.error(`[clocked] ${endpoint} unexpected error`, err);
    }
    // A failed live call falls back to the recorded response when one exists;
    // otherwise the failure propagates instead of inventing an answer.
    return {
      endpoint,
      label,
      data: getFixture<T>(fixtureKey),
      cost: { ...ZERO_COST, costBasis: "error-fallback" },
      source: "replay",
    };
  }
}

export { ClockedError };
