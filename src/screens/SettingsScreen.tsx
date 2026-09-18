import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Card } from '../components/ui';
import { LANGUAGE_LABELS, Strings } from '../i18n';
import { colors, radius, spacing } from '../theme';
import { DEFAULT_MODELS, Language, Provider, Settings } from '../types';

export const PROVIDER_LABELS: Record<Provider, string> = {
  anthropic: 'Anthropic Claude',
  openai: 'OpenAI',
  gemini: 'Google Gemini',
};

type Props = {
  s: Strings;
  settings: Settings;
  onSave: (next: Settings) => void;
  onBack: () => void;
};

export function SettingsScreen({ s, settings, onSave, onBack }: Props) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [showKey, setShowKey] = useState(false);
  const dir = { writingDirection: s.dir } as const;

  const setProvider = (provider: Provider) =>
    setDraft((d) => ({
      ...d,
      provider,
      // keep a custom model only if the user typed one for this provider
      model: Object.values(DEFAULT_MODELS).includes(d.model) ? DEFAULT_MODELS[provider] : d.model,
    }));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, dir]}>{s.settings}</Text>

      <Card>
        <Text style={[styles.label, dir]}>{s.language}</Text>
        <View style={styles.chips}>
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((l) => (
            <Chip key={l} label={LANGUAGE_LABELS[l]} active={draft.language === l} onPress={() => setDraft({ ...draft, language: l })} />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={[styles.label, dir]}>{s.provider}</Text>
        <View style={styles.chips}>
          {(Object.keys(PROVIDER_LABELS) as Provider[]).map((p) => (
            <Chip key={p} label={PROVIDER_LABELS[p]} active={draft.provider === p} onPress={() => setProvider(p)} />
          ))}
        </View>

        <Text style={[styles.label, dir, { marginTop: spacing.md }]}>{s.apiKey}</Text>
        <View style={styles.keyRow}>
          <TextInput
            value={draft.apiKey}
            onChangeText={(apiKey) => setDraft({ ...draft, apiKey: apiKey.trim() })}
            secureTextEntry={!showKey}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="sk-…"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { flex: 1 }]}
          />
          <Pressable onPress={() => setShowKey((v) => !v)} style={styles.eye}>
            <Text style={{ color: colors.gold, fontSize: 18 }}>{showKey ? '🙈' : '👁️'}</Text>
          </Pressable>
        </View>
        <Text style={[styles.hint, dir]}>{s.apiKeyHint}</Text>

        <Text style={[styles.label, dir, { marginTop: spacing.md }]}>{s.model}</Text>
        <TextInput
          value={draft.model}
          onChangeText={(model) => setDraft({ ...draft, model: model.trim() })}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={DEFAULT_MODELS[draft.provider]}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
      </Card>

      <View style={styles.actions}>
        <Button title={s.back} onPress={onBack} variant="ghost" style={{ flex: 1 }} />
        <Button
          title={s.save}
          onPress={() => onSave({ ...draft, model: draft.model || DEFAULT_MODELS[draft.provider] })}
          style={{ flex: 1 }}
        />
      </View>
    </ScrollView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && { color: colors.bg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md, maxWidth: 700, width: '100%', alignSelf: 'center' },
  title: { color: colors.gold, fontSize: 28, fontWeight: '800' },
  label: { color: colors.textMuted, fontSize: 14, fontWeight: '700', marginBottom: spacing.xs, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 15 },
  keyRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  eye: { padding: spacing.sm },
  hint: { color: colors.textMuted, fontSize: 13, marginTop: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.md },
});
