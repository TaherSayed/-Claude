import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui';
import { Strings } from '../i18n';
import { colors, spacing } from '../theme';

type Props = {
  s: Strings;
  hasKey: boolean;
  onStart: () => void;
  onSettings: () => void;
};

export function HomeScreen({ s, hasKey, onStart, onSettings }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.icon}>💈</Text>
        <Text style={styles.title}>{s.appName}</Text>
        <Text style={[styles.tagline, { writingDirection: s.dir }]}>{s.tagline}</Text>
      </View>
      <View style={styles.actions}>
        {!hasKey && <Text style={[styles.warn, { writingDirection: s.dir }]}>{s.needKey}</Text>}
        <Button title={s.start} onPress={onStart} disabled={!hasKey} />
        <Button title={s.settings} onPress={onSettings} variant="ghost" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: spacing.xl, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  icon: { fontSize: 88 },
  title: { color: colors.gold, fontSize: 34, fontWeight: '800', textAlign: 'center' },
  tagline: { color: colors.textMuted, fontSize: 18, textAlign: 'center', maxWidth: 520, lineHeight: 28 },
  actions: { gap: spacing.md, width: '100%', maxWidth: 520, alignSelf: 'center' },
  warn: { color: colors.danger, textAlign: 'center', fontSize: 15 },
});
