// Non-standard model name -> standard name.
// Keys must be lowercase — lookup lowercases the input, so case variants
// (DeepSeek-V4-Pro / deepseek-v4-pro) merge without separate entries.
// OpenRouter-style provider prefixes (deepseek/, anthropic/, ...) are
// stripped automatically — list them under PROVIDER_PREFIXES below, not here.
const MODEL_ALIASES: Record<string, string> = {
  "zai-glm-4.6": "glm-4.6",
  "zai-glm-4.7": "glm-4.7",
  "gpt-oss-120b": "gpt-oss:120b",
  "glm-4.7-free": "glm-4.7",
  "minimax-m2.1-free": "minimax-m2.1",
  "claude-opus-4-5-thinking": "claude-opus-4-5",
  "claude-sonnet-4-5-thinking": "claude-sonnet-4-5",
  "claude-opus-4-6-thinking": "claude-opus-4-6",
  "claude-sonnet-4.5": "claude-sonnet-4-5",
  "gemini-3-flash": "gemini-3-flash-preview",
  "gemini-3-pro-high": "gemini-3-pro-preview",
  "gemini-3-pro-low": "gemini-3-pro-preview",
  "claude-opus-4-6-20260203": "claude-opus-4-6",
  "claude-opus-4.6": "claude-opus-4-6",
  "claude-haiku-4.5": "claude-haiku-4-5",
  "kimi-k2.5-turbo": "kimi-k2.5",
  "accounts/fireworks/routers/kimi-k2p5-turbo": "kimi-k2.5",
  "accounts/fireworks/routers/kimi-k2p6-turbo": "kimi-k2.6",
  "kimi-k2.6-precision": "kimi-k2.6",
  "umans-kimi-k2.6": "kimi-k2.6",
  "umans-kimi-k2.7": "kimi-k2.7",
  "umans-qwen3.6-35b-a3b": "qwen3.6-35b-a3b",
  "glm-5.1-precision": "glm-5.1",
  "umans-glm-5.1": "glm-5.1",
  "deepseek-v4-pro-precision": "deepseek-v4-pro",
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
]);

export function normalizeModelName(name: string): string {
  let key = name.toLowerCase();
  const slash = key.indexOf("/");
  if (slash > 0 && PROVIDER_PREFIXES.has(key.slice(0, slash))) {
    key = key.slice(slash + 1);
  }
  return MODEL_ALIASES[key] ?? key;
}

const PROVIDER_ALIASES: Record<string, string> = {
  cloud: "openrouter",
  google: "openrouter",
  "opencode-claude": "opencode",
  "opencode-a": "opencode",
  "opencode-o": "opencode",
  openai: "codex",
};

export function normalizeProviderName(name: string): string {
  return PROVIDER_ALIASES[name] ?? name;
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
