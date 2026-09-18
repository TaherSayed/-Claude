import { Language } from '../types';
import { LANGUAGE_NAMES } from '../i18n';

export const ANALYSIS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'face_shape',
    'hair_type',
    'hair_density',
    'hair_length',
    'beard',
    'recommendations',
    'avoid',
    'note',
  ],
  properties: {
    face_shape: { type: 'string', description: 'Oval, round, square, heart, diamond, oblong...' },
    hair_type: { type: 'string', description: 'Straight, wavy, curly, coily' },
    hair_density: { type: 'string', description: 'Thin, medium, thick' },
    hair_length: { type: 'string', description: 'Current hair length' },
    beard: { type: 'string', description: 'Beard status and a short suggestion' },
    recommendations: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'why', 'how_to_ask', 'clipper_guards', 'maintenance', 'match_score'],
        properties: {
          name: { type: 'string', description: 'Common haircut name barbers know' },
          why: { type: 'string', description: 'Why it suits this face shape and hair' },
          how_to_ask: { type: 'string', description: 'Exact words to tell the barber' },
          clipper_guards: { type: 'string', description: 'Guard numbers / mm for sides and back' },
          maintenance: { type: 'string', description: 'Styling products and how often to cut' },
          match_score: { type: 'integer', minimum: 0, maximum: 100 },
        },
      },
    },
    avoid: {
      type: 'array',
      items: { type: 'string' },
      description: 'Styles to avoid for this face and hair',
    },
    note: { type: 'string', description: 'One short friendly closing tip' },
  },
} as const;

export function systemPrompt(lang: Language): string {
  return [
    'You are an expert master barber and men\'s hair stylist working inside a barbershop app.',
    'A customer photo is provided. Analyse face shape, hair type, density, hairline, current length and beard.',
    'Recommend exactly three haircuts, ordered from best match to third, that a real barber can execute today.',
    'Use haircut names barbers recognise (e.g. low fade, taper, crop, buzz cut, French crop, side part, textured quiff, undercut, pompadour, curly top fade, afro taper).',
    'Give concrete clipper guard numbers in both # and mm where relevant.',
    'Be encouraging and practical. Never comment on attractiveness, age, ethnicity, weight or health.',
    'If the photo has no clear face or hair, still fill the fields, say so in note, and give safe general suggestions.',
    `Write every text value in ${LANGUAGE_NAMES[lang]}. Keep each field short (max two sentences).`,
    'Respond only with JSON matching the provided schema.',
  ].join(' ');
}

export const USER_PROMPT =
  'Here is the customer. Analyse the hair and face and recommend the three best haircuts.';
