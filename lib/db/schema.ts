import {
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
  doublePrecision,
  boolean,
} from "drizzle-orm/pg-core";

// Mirrors `logs_archive` in the gateway log-archive database: a metadata-only
// merge of each gateway's request logs (Bifrost `logs`, Manifest
// `agent_messages`), discriminated by `source`; the large request/response
// content columns are intentionally not synced. Manifest rows only populate
// the analytics-core columns plus error_details/metadata — the Bifrost-specific
// attribution columns stay NULL. See bifrost-log-archive/01_schema.sql.
export const logs = pgTable("logs_archive", {
  // identity / time
  id: text("id").primaryKey(),
  source: text("source"), // 'bifrost' | 'manifest'
  incNumber: bigint("inc_number", { mode: "number" }),
  parentRequestId: text("parent_request_id"),
  timestamp: timestamp("timestamp", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }),

  // routing / model / status
  objectType: text("object_type"),
  provider: text("provider"),
  model: text("model"),
  alias: text("alias"),
  canonicalModelName: text("canonical_model_name"),
  aliasModelFamily: text("alias_model_family"),
  status: text("status"),
  stopReason: text("stop_reason"),
  stream: boolean("stream"),
  numberOfRetries: integer("number_of_retries"),
  fallbackIndex: integer("fallback_index"),

  // tokens / cost (analytics core)
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),
  cachedReadTokens: integer("cached_read_tokens"),
  cacheCreationTokens: integer("cache_creation_tokens"), // Manifest only; NULL on Bifrost rows
  // What the gateway itself billed. Left as the archive's audit baseline and
  // NOT what this dashboard sums: gateways record NULL or 0 for whole
  // providers (subscription routes, free channels, models missing from their
  // price table), so summing it silently undercounts.
  cost: doublePrecision("cost"),
  // Filled by the archive's pricing pass: the gateway's own figure where it
  // billed something, otherwise the usage valued at the model vendor's list
  // price. costBasis says which ('gateway' | 'listprice' | 'unpriced').
  costEffective: doublePrecision("cost_effective"),
  costBasis: text("cost_basis"),
  // Canonical model behind `model`, resolved by the archive's alias table.
  // Unused here -- model grouping still runs through normalizeModelName(),
  // whose prefix stripping also handles models the archive has no alias for.
  modelKey: text("model_key"),
  latency: doublePrecision("latency"),
  tokenUsage: text("token_usage"),

  // attribution / governance dimensions
  userId: text("user_id"),
  userName: text("user_name"),
  teamId: text("team_id"),
  teamName: text("team_name"),
  customerId: text("customer_id"),
  customerName: text("customer_name"),
  businessUnitId: text("business_unit_id"),
  businessUnitName: text("business_unit_name"),
  teamIds: text("team_ids"),
  teamNames: text("team_names"),
  customerIds: text("customer_ids"),
  customerNames: text("customer_names"),
  businessUnitIds: text("business_unit_ids"),
  businessUnitNames: text("business_unit_names"),
  virtualKeyId: text("virtual_key_id"),
  virtualKeyName: text("virtual_key_name"),
  selectedKeyId: text("selected_key_id"),
  selectedKeyName: text("selected_key_name"),
  routingRuleId: text("routing_rule_id"),
  routingRuleName: text("routing_rule_name"),
  routingEnginesUsed: text("routing_engines_used"),
  selectedPromptId: text("selected_prompt_id"),
  selectedPromptName: text("selected_prompt_name"),
  selectedPromptVersion: text("selected_prompt_version"),

  // other small fields
  errorDetails: text("error_details"),
  metadata: text("metadata"),
  clusterNodeId: text("cluster_node_id"),
  budgetIds: text("budget_ids"),
  rateLimitIds: text("rate_limit_ids"),
  isLargePayloadRequest: boolean("is_large_payload_request"),
  isLargePayloadResponse: boolean("is_large_payload_response"),
});

export type Log = typeof logs.$inferSelect;
