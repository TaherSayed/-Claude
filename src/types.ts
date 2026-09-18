export type Provider = 'anthropic' | 'openai' | 'gemini';
export type Language = 'ar' | 'de' | 'en';

export interface Settings {
  provider: Provider;
  apiKey: string;
  model: string;
  language: Language;
}

export interface Recommendation {
  name: string;
  why: string;
  how_to_ask: string;
  clipper_guards: string;
  maintenance: string;
  match_score: number;
}

export interface Analysis {
  face_shape: string;
  hair_type: string;
  hair_density: string;
  hair_length: string;
  beard: string;
  recommendations: Recommendation[];
  avoid: string[];
  note: string;
}

export interface CapturedPhoto {
  uri: string;
  base64: string;
  width: number;
  height: number;
}

export const DEFAULT_MODELS: Record<Provider, string> = {
  anthropic: 'claude-opus-5',
  openai: 'gpt-4o',
  gemini: 'gemini-2.5-flash',
};
