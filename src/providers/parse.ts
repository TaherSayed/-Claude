import { Analysis } from '../types';

export class ParseError extends Error {}

export function parseAnalysis(text: string): Analysis {
  let cleaned = text.trim();
  // Some models wrap JSON in ```json fences even when asked not to.
  const fence = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) cleaned = fence[1].trim();

  let data: unknown;
  try {
    data = JSON.parse(cleaned);
  } catch {
    throw new ParseError('Model returned invalid JSON');
  }
  if (!data || typeof data !== 'object') throw new ParseError('Model returned non-object');
  const a = data as Partial<Analysis>;
  if (!Array.isArray(a.recommendations) || a.recommendations.length === 0) {
    throw new ParseError('Model returned no recommendations');
  }
  return {
    face_shape: String(a.face_shape ?? ''),
    hair_type: String(a.hair_type ?? ''),
    hair_density: String(a.hair_density ?? ''),
    hair_length: String(a.hair_length ?? ''),
    beard: String(a.beard ?? ''),
    recommendations: a.recommendations.slice(0, 3).map((r) => ({
      name: String(r.name ?? ''),
      why: String(r.why ?? ''),
      how_to_ask: String(r.how_to_ask ?? ''),
      clipper_guards: String(r.clipper_guards ?? ''),
      maintenance: String(r.maintenance ?? ''),
      match_score: Math.max(0, Math.min(100, Number(r.match_score ?? 0) || 0)),
    })),
    avoid: Array.isArray(a.avoid) ? a.avoid.map(String) : [],
    note: String(a.note ?? ''),
  };
}
