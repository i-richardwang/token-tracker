// Non-standard model name -> standard name
const MODEL_ALIASES: Record<string, string> = {
  "zai-glm-4.6": "glm-4.6",
  "gpt-oss-120b": "gpt-oss:120b",
};

export function normalizeModelName(name: string): string {
  return MODEL_ALIASES[name] ?? name;
}
