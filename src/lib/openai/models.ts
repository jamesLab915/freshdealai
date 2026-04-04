/** Cost-sensitive tasks use the fast tier; merchandising / SEO uses quality. */
export const OPENAI_MODELS = {
  fast: process.env.OPENAI_MODEL_FAST ?? "gpt-4o-mini",
  quality: process.env.OPENAI_MODEL_QUALITY ?? "gpt-4o",
} as const;

export type ModelTier = keyof typeof OPENAI_MODELS;
