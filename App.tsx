import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HomeScreen } from './src/screens/HomeScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { PROVIDER_LABELS, SettingsScreen } from './src/screens/SettingsScreen';
import { Button } from './src/components/ui';
import { t } from './src/i18n';
import { loadSettings, saveSettings } from './src/storage';
import { analyzeHair, ParseError, RefusalError } from './src/providers';
import { colors, spacing } from './src/theme';
import { Analysis, CapturedPhoto, Settings } from './src/types';

type Screen =
  | { name: 'loading' }
  | { name: 'home' }
  | { name: 'settings' }
  | { name: 'camera' }
  | { name: 'analyzing'; photo: CapturedPhoto }
  | { name: 'result'; photo: CapturedPhoto; analysis: Analysis }
  | { name: 'error'; photo: CapturedPhoto; message: string };

export default function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'loading' });

  useEffect(() => {
    loadSettings().then((s) => {
      setSettings(s);
      setScreen({ name: 'home' });
    });
  }, []);

  const s = useMemo(() => t(settings?.language ?? 'ar'), [settings?.language]);

  const runAnalysis = useCallback(
    async (photo: CapturedPhoto) => {
      if (!settings) return;
      setScreen({ name: 'analyzing', photo });
      try {
        const analysis = await analyzeHair(photo.base64, settings);
        setScreen({ name: 'result', photo, analysis });
      } catch (err) {
        let message = s.errorNetwork;
        if (err instanceof RefusalError) message = s.errorRefusal;
        else if (err instanceof ParseError) message = s.errorParse;
        const detail = err instanceof Error ? err.message : String(err);
        setScreen({ name: 'error', photo, message: `${message}\n\n${detail.slice(0, 200)}` });
      }
    },
    [settings, s],
  );

  const persist = async (next: Settings) => {
    setSettings(next);
    await saveSettings(next);
    setScreen({ name: 'home' });
  };

  let content: React.ReactNode;
  switch (screen.name) {
    case 'loading':
      content = (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      );
      break;
    case 'home':
      content = (
        <HomeScreen
          s={s}
          hasKey={Boolean(settings?.apiKey)}
          onStart={() => setScreen({ name: 'camera' })}
          onSettings={() => setScreen({ name: 'settings' })}
        />
      );
      break;
    case 'settings':
      content = settings && (
        <SettingsScreen s={s} settings={settings} onSave={persist} onBack={() => setScreen({ name: 'home' })} />
      );
      break;
    case 'camera':
      content = <CameraScreen s={s} onCaptured={runAnalysis} onBack={() => setScreen({ name: 'home' })} />;
      break;
    case 'analyzing':
      content = (
        <View style={styles.center}>
          <Image source={{ uri: screen.photo.uri }} style={styles.preview} blurRadius={2} />
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.analyzing}>{s.analyzing}</Text>
          <Text style={styles.hint}>{s.analyzingHint}</Text>
        </View>
      );
      break;
    case 'result':
      content = (
        <ResultScreen
          s={s}
          photo={screen.photo}
          analysis={screen.analysis}
          providerLabel={settings ? `${PROVIDER_LABELS[settings.provider]} · ${settings.model}` : ''}
          onNewCustomer={() => setScreen({ name: 'camera' })}
          onRetake={() => setScreen({ name: 'camera' })}
        />
      );
      break;
    case 'error':
      content = (
        <View style={[styles.center, { padding: spacing.xl }]}>
          <Text style={styles.errorTitle}>{s.error}</Text>
          <Text style={[styles.errorBody, { writingDirection: s.dir }]}>{screen.message}</Text>
          <View style={styles.errorActions}>
            <Button title={s.back} onPress={() => setScreen({ name: 'home' })} variant="ghost" style={{ flex: 1 }} />
            <Button title={s.retry} onPress={() => runAnalysis(screen.photo)} style={{ flex: 1 }} />
          </View>
        </View>
      );
      break;
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  preview: { width: 180, height: 240, borderRadius: 24, opacity: 0.7 },
  analyzing: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  hint: { color: colors.textMuted, fontSize: 15 },
  errorTitle: { color: colors.danger, fontSize: 24, fontWeight: '800' },
  errorBody: { color: colors.textMuted, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  errorActions: { flexDirection: 'row', gap: spacing.md, width: '100%', maxWidth: 500 },
});
