import { Analysis, Language } from '../types';
import { ANALYSIS_SCHEMA, USER_PROMPT, systemPrompt } from './prompt';
import { parseAnalysis } from './parse';
import { RefusalError } from './errors';

export async function analyzeWithOpenAI(
  apiKey: string,
  model: string,
  imageBase64: string,
  lang: Language,
): Promise<Analysis> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt(lang) },
        {
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: 'high' } },
            { type: 'text', text: USER_PROMPT },
          ],
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'haircut_analysis', schema: ANALYSIS_SCHEMA, strict: true },
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null; refusal?: string | null } }>;
  };
  const msg = json.choices?.[0]?.message;
  if (msg?.refusal) throw new RefusalError(msg.refusal);
  return parseAnalysis(msg?.content ?? '');
}
