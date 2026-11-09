// Shared types between the pipeline (server) and the UI (client).
import type {
  DecideResponse,
  ExtractResponse,
  FillResponse,
  PiiResponse,
  InjectionResponse,
  ScriptResponse,
  GroundingResponse,
  CompareResponse,
  RerankResponse,
  PipelineResponse,
} from "clocked-sdk";
import type { GateCost, Mode } from "./clocked";

export type Group = "core" | "safety" | "knowledge";

export const GROUP_LABEL: Record<Group, string> = {
  core: "Decide · Extract · Fill",
  safety: "Protect · Guard · Inspect",
  knowledge: "Verify · Compare · Rerank",
};

/** A knowledge-base passage the retriever returned for a ticket. */
export interface KbPassage {
  id: string;
  title: string;
  text: string;
  /** Neighbor chunk ids, fetched when Rerank says "expand". */
  neighbors?: string[];
  metadata?: Record<string, string | number>;
}

/** A demo ticket the pipeline runs on. */
export interface Scenario {
  id: string;
  name: string;
  channel: "email" | "chat" | "voice" | "form";
  tagline: string;
  /** What this scenario is built to demonstrate. */
  teaches: string;
  /** The raw inbound message (untrusted). */
  body: string;
  /** The user's underlying question, used by Rerank. */
  query: string;
  /** Retrieved KB passages for this ticket. */
  kb: KbPassage[];
  /** Other open tickets, compared for duplicate / major-incident clustering. */
  relatedTickets: { id: string; text: string }[];
  /** A remediation script the agent proposes (gated by Inspect), if any. */
  proposedScript?: {
    language: string;
    code: string;
    /** The approved change context Inspect judges against. */
    changeContext: string;
  };
  /** Known device/asset records keyed by asset id, for the "lookup" after Extract. */
  assets?: Record<string, { model: string; owner: string; site: string }>;
}

/** The verdict of one gate — generic shell the UI renders. */
export interface GateResult<T = unknown> {
  endpoint: string;
  group: Group;
  label: string;
  /** One-line headline the UI shows, derived from the response. */
  headline: string;
  /** What this gate changed about the run (the "meaningful use" line). */
  effect: string;
  /** "pass" | "block" | "warn" | "info" drives the color. */
  status: "pass" | "block" | "warn" | "info";
  cost: GateCost;
  source: Mode;
  data: T;
}

export interface TriageOutput {
  scenarioId: string;
  mode: Mode;
  /** Ordered gates as they ran. */
  gates: GateResult[];
  /** Final decision surfaced at the top. */
  decision: {
    automationAllowed: boolean;
    autoSend: boolean;
    queue: string | null;
    priority: string | null;
    majorIncident: boolean | null;
    duplicateOf: string | null;
    scriptRunnable: boolean | null;
    /** The reply the agent would send, after verification stripped bad claims. */
    reply: string;
    /** The anonymized copy of the ticket that downstream systems see. */
    safeText: string;
    /** Why the final call was made, in plain language. */
    rationale: string[];
  };
  totals: {
    credits: number;
    costUsd: number;
    modelMs: number;
    gateCount: number;
    liveCount: number;
  };
}

// Narrowed data types per endpoint for UI rendering.
export type AnyGateData =
  | DecideResponse
  | ExtractResponse
  | FillResponse
  | PiiResponse
  | InjectionResponse
  | ScriptResponse
  | GroundingResponse
  | CompareResponse
  | RerankResponse
  | PipelineResponse;
