import { Analysis, Language } from '../types';
import { ANALYSIS_SCHEMA, USER_PROMPT, systemPrompt } from './prompt';
import { parseAnalysis } from './parse';
import { RefusalError } from './errors';

// Gemini's responseSchema is an OpenAPI subset: it rejects additionalProperties and $-keywords.
function toGeminiSchema(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(toGeminiSchema);
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (k === 'additionalProperties') continue;
      out[k] = toGeminiSchema(v);
    }
    return out;
  }
  return node;
}

export async function analyzeWithGemini(
  apiKey: string,
  model: string,
  imageBase64: string,
  lang: Language,
): Promise<Analysis> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt(lang) }] },
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
            { text: USER_PROMPT },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: toGeminiSchema(ANALYSIS_SCHEMA),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    candidates?: Array<{ finishReason?: string; content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  if (json.promptFeedback?.blockReason) throw new RefusalError(json.promptFeedback.blockReason);
  const cand = json.candidates?.[0];
  if (cand?.finishReason === 'SAFETY') throw new RefusalError('SAFETY');
  const text = (cand?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  return parseAnalysis(text);
}
