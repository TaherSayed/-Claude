import { Analysis, Settings } from '../types';
import { analyzeWithAnthropic } from './anthropic';
import { analyzeWithOpenAI } from './openai';
import { analyzeWithGemini } from './gemini';

export { RefusalError } from './errors';
export { ParseError } from './parse';

export function analyzeHair(imageBase64: string, settings: Settings): Promise<Analysis> {
  const { apiKey, model, language } = settings;
  switch (settings.provider) {
    case 'anthropic':
      return analyzeWithAnthropic(apiKey, model, imageBase64, language);
    case 'openai':
      return analyzeWithOpenAI(apiKey, model, imageBase64, language);
    case 'gemini':
      return analyzeWithGemini(apiKey, model, imageBase64, language);
  }
}
