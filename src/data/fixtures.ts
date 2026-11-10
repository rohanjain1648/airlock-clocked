/**
 * Recorded Clocked responses for REPLAY mode, so the whole app runs offline
 * without spending credits. Every response here was returned by the live
 * Clocked API: `npm run record` drives the app with a CLOCKED_API_KEY and
 * writes them to `fixtures.generated.json`, keyed `${scenarioId}:${gate}`.
 *
 * There are no hand-written responses: a gate with no recording fails loudly
 * instead of showing an invented answer.
 */
import recorded from "./fixtures.generated.json";

const RECORDED = recorded as Record<string, unknown>;

export function getFixture<T>(key: string): T {
  const r = RECORDED[key];
  if (r === undefined) {
    throw new Error(
      `No recorded Clocked response for "${key}". Run the app with CLOCKED_API_KEY and \`npm run record\`.`,
    );
  }
  return r as T;
}

export const FIXTURE_KEYS = Object.keys(RECORDED);
