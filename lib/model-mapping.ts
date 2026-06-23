// Non-standard model name -> standard name.
// Keys must be lowercase — lookup lowercases the input, so case variants
// (DeepSeek-V4-Pro / deepseek-v4-pro) merge without separate entries.
// OpenRouter-style provider prefixes (deepseek/, anthropic/, ...) are
// stripped automatically — list them under PROVIDER_PREFIXES below, not here.
const MODEL_ALIASES: Record<string, string> = {
  // Claude - date-versioned → base name
  "claude-haiku-4-5-20251001": "claude-haiku-4-5",
  "claude-sonnet-4-20250514": "claude-sonnet-4",
  "claude-opus-4-5-20251101": "claude-opus-4-5",
  "claude-sonnet-4-5-20250929": "claude-sonnet-4-5",
  "claude-opus-4-6-20260203": "claude-opus-4-6",
  "claude-3-5-haiku-20241022": "claude-haiku-3-5",

  // Claude - thinking variants → base name
  "claude-opus-4-5-thinking": "claude-opus-4-5",
  "claude-sonnet-4-5-thinking": "claude-sonnet-4-5",
  "claude-opus-4-6-thinking": "claude-opus-4-6",

  // Claude - dot notation → dash notation
  "claude-opus-4.6": "claude-opus-4-6",
  "claude-sonnet-4.5": "claude-sonnet-4-5",
  "claude-sonnet-4.6": "claude-sonnet-4-6",
  "claude-haiku-4.5": "claude-haiku-4-5",

  // Kimi
  "kimi-k2.5-turbo": "kimi-k2.5",
  "accounts/fireworks/routers/kimi-k2p5-turbo": "kimi-k2.5",
  "accounts/fireworks/routers/kimi-k2p6-turbo": "kimi-k2.6",
  "kimi-k2:1t": "kimi-k2",
  "kimi-k2-thinking": "kimi-k2",
  "kimi-k2.6-precision": "kimi-k2.6",
  "kimi-k2.7-code": "kimi-k2.7",
  "umans-kimi-k2.6": "kimi-k2.6",
  "umans-kimi-k2.7": "kimi-k2.7",

  // Qwen
  "umans-qwen3.6-35b-a3b": "qwen3.6-35b-a3b",

  // GLM
  "zai-glm-4.6": "glm-4.6",
  "zai-glm-4.7": "glm-4.7",
  "umans-glm-5.1": "glm-5.1",
  "umans-glm-5.2": "glm-5.2",
  "glm-5.1-precision": "glm-5.1",
  "glm-4.7-free": "glm-4.7",

  // DeepSeek
  "deepseek-v4-pro-precision": "deepseek-v4-pro",

  // MiniMax
  "minimax-m2.1-free": "minimax-m2.1",

  // GPT
  "gpt-oss-120b": "gpt-oss:120b",

  // Gemini
  "gemini-3-flash": "gemini-3-flash-preview",
  "gemini-3-pro-high": "gemini-3-pro-preview",
  "gemini-3-pro-low": "gemini-3-pro-preview",
};

// OpenRouter-style provider prefixes auto-stripped before dictionary lookup,
// so deepseek/deepseek-v4-pro / anthropic/claude-opus-4.6 / etc. don't need
// per-vendor entries in MODEL_ALIASES.
const PROVIDER_PREFIXES = new Set([
  "anthropic",
  "baidu",
  "bytedance-seed",
  "deepseek",
  "google",
  "kwaipilot",
  "minimax",
  "mistralai",
  "moonshotai",
  "nvidia",
  "openai",
  "qwen",
  "tencent",
  "x-ai",
  "xiaomi",
  "z-ai",
  "zenmux",
]);

export function normalizeModelName(name: string): string {
  if (!name || !name.trim()) return "unknown";
  let key = name.toLowerCase();
  // Strip nested provider prefixes left-to-right, so router-chained names like
  // zenmux/z-ai/glm-5.1 collapse to glm-5.1 (not just one segment).
  let slash = key.indexOf("/");
  while (slash > 0 && PROVIDER_PREFIXES.has(key.slice(0, slash))) {
    key = key.slice(slash + 1);
    slash = key.indexOf("/");
  }
  return MODEL_ALIASES[key] ?? key;
}

// Gateway provider name -> canonical provider. Lookup lowercases the input, so
// case variants (Fireworks / fireworks) merge into one slice.
const PROVIDER_NAME_ALIASES: Record<string, string> = {
  cloud: "openrouter",
  google: "openrouter",
  "opencode-claude": "opencode",
  "opencode-a": "opencode",
  "opencode-o": "opencode",
  openai: "codex",
};

export function normalizeProviderName(name: string): string {
  if (!name || !name.trim()) return "unknown";
  const key = name.toLowerCase();
  return PROVIDER_NAME_ALIASES[key] ?? key;
}

// Model prefix patterns -> Brand name
const BRAND_PATTERNS: [RegExp, string][] = [
  [/^(qwen|qwq)/i, "Qwen"],
  [/^(gpt|o1|o3|chatgpt)/i, "OpenAI"],
  [/^claude/i, "Claude"],
  [/^(moonshot|kimi)/i, "Kimi"],
  [/^(glm|chatglm|zai-glm)/i, "GLM"],
  [/^deepseek/i, "DeepSeek"],
  [/^gemini/i, "Gemini"],
  [/^(llama|meta-llama)/i, "Llama"],
  [/^grok/i, "Grok"],
  [/^(mistral|mixtral|codestral|ministral|devstral)/i, "Mistral"],
  [/^(yi-|yi\d)/i, "Yi"],
  [/^(doubao|skylark)/i, "Doubao"],
  [/^(ernie|wenxin)/i, "ERNIE"],
  [/^hunyuan/i, "Hunyuan"],
  [/^(minimax|abab)/i, "MiniMax"],
  [/^(spark|xunfei)/i, "Spark"],
  [/^baichuan/i, "Baichuan"],
  [/^nemotron/i, "NVIDIA"],
];

export function getModelBrand(modelName: string): string {
  const normalized = normalizeModelName(modelName);
  const modelPart = normalized.includes("/")
    ? normalized.split("/").pop() ?? normalized
    : normalized;

  for (const [pattern, brand] of BRAND_PATTERNS) {
    if (pattern.test(modelPart)) {
      return brand;
    }
  }

  return "Other";
}
