import { getOpenAI } from "@/lib/openai/client";
import type { ModelTier } from "@/lib/openai/models";
import { OPENAI_MODELS } from "@/lib/openai/models";

export type JsonSchemaFormat = {
  name: string;
  description?: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

/**
 * OpenAI Responses API with structured JSON output.
 * Falls back to `null` text when the API key is missing or the call fails.
 */
export async function runResponsesJson<T>(opts: {
  tier: ModelTier;
  instructions: string;
  input: string;
  jsonSchema: JsonSchemaFormat;
}): Promise<{ ok: true; parsed: T } | { ok: false; error: string; raw?: string }> {
  const client = getOpenAI();
  if (!client) {
    return { ok: false, error: "OPENAI_API_KEY not configured" };
  }

  const model = OPENAI_MODELS[opts.tier];

  try {
    const res = await client.responses.create({
      model,
      instructions: opts.instructions,
      input: opts.input,
      text: {
        format: {
          type: "json_schema",
          name: opts.jsonSchema.name,
          description: opts.jsonSchema.description,
          schema: opts.jsonSchema.schema,
          strict: opts.jsonSchema.strict ?? true,
        },
      },
    });

    const text = res.output_text?.trim();
    if (!text) {
      return { ok: false, error: "Empty model output", raw: JSON.stringify(res.output) };
    }

    const parsed = JSON.parse(text) as T;
    return { ok: true, parsed };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

/**
 * Same as `runResponsesJson`, but on failure runs a cheaper chat.completions JSON-object fallback.
 */
export async function runResponsesJsonWithFallback<T>(opts: {
  tier: ModelTier;
  instructions: string;
  input: string;
  jsonSchema: JsonSchemaFormat;
  fallbackTier?: ModelTier;
}): Promise<{ ok: true; parsed: T } | { ok: false; error: string }> {
  const primary = await runResponsesJson<T>(opts);
  if (primary.ok) return primary;

  const client = getOpenAI();
  if (!client) return primary;

  const fbModel = OPENAI_MODELS[opts.fallbackTier ?? "fast"];
  const prompt = `${opts.instructions}\n\nRespond with JSON only matching the schema name "${opts.jsonSchema.name}".\nUser payload:\n${opts.input}`;

  try {
    const chat = await client.chat.completions.create({
      model: fbModel,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You output compact, valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });
    const text = chat.choices[0]?.message?.content?.trim();
    if (!text) return { ok: false, error: primary.error };
    const parsed = JSON.parse(text) as T;
    return { ok: true, parsed };
  } catch {
    return { ok: false, error: primary.error };
  }
}
