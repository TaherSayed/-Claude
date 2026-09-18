import Anthropic from '@anthropic-ai/sdk';
import { Analysis, Language } from '../types';
import { ANALYSIS_SCHEMA, USER_PROMPT, systemPrompt } from './prompt';
import { parseAnalysis } from './parse';
import { RefusalError } from './errors';

export async function analyzeWithAnthropic(
  apiKey: string,
  model: string,
  imageBase64: string,
  lang: Language,
): Promise<Analysis> {
  // The key belongs to the barbershop and is stored on its own device, so the
  // client runs on-device by design. dangerouslyAllowBrowser only matters for the web build.
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const response = await client.beta.messages.create({
    model,
    max_tokens: 8000,
    // Server-side refusal fallback: if a safety classifier declines, the API
    // re-runs the same request on a fallback model inside the same call.
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: systemPrompt(lang),
    output_config: {
      effort: 'medium',
      format: { type: 'json_schema', schema: ANALYSIS_SCHEMA as unknown as Record<string, unknown> },
    },
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 } },
          { type: 'text', text: USER_PROMPT },
        ],
      },
    ],
  });

  if (response.stop_reason === 'refusal') {
    throw new RefusalError(response.stop_details?.explanation ?? 'refused');
  }

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return parseAnalysis(text);
}
