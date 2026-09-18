import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { DEFAULT_MODELS, Settings } from './types';

const KEY = 'barber_ai_settings_v1';

const DEFAULTS: Settings = {
  provider: 'anthropic',
  apiKey: '',
  model: DEFAULT_MODELS.anthropic,
  language: 'ar',
};

async function readRaw(): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(KEY) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(KEY);
}

async function writeRaw(value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      globalThis.localStorage?.setItem(KEY, value);
    } catch {
      // storage unavailable (private mode) - settings live in memory only
    }
    return;
  }
  await SecureStore.setItemAsync(KEY, value);
}

export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await readRaw();
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await writeRaw(JSON.stringify(settings));
}
