import React, { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Button } from '../components/ui';
import { Strings } from '../i18n';
import { colors, spacing } from '../theme';
import { CapturedPhoto } from '../types';

type Props = {
  s: Strings;
  onCaptured: (photo: CapturedPhoto) => void;
  onBack: () => void;
};

export function CameraScreen({ s, onCaptured, onBack }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [busy, setBusy] = useState(false);
  const camera = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { padding: spacing.xl, gap: spacing.md }]}>
        <Text style={styles.permTitle}>{s.cameraPermissionTitle}</Text>
        <Text style={[styles.permBody, { writingDirection: s.dir }]}>{s.cameraPermissionBody}</Text>
        <Button title={s.grant} onPress={requestPermission} />
        <Button title={s.back} onPress={onBack} variant="ghost" />
      </View>
    );
  }

  const capture = async () => {
    if (!camera.current || busy) return;
    setBusy(true);
    try {
      const raw = await camera.current.takePictureAsync({ quality: 0.9, skipProcessing: false });
      // Downscale to keep the upload small and fast; 1024px is plenty for hair analysis.
      const small = await manipulateAsync(raw.uri, [{ resize: { width: 1024 } }], {
        compress: 0.85,
        format: SaveFormat.JPEG,
        base64: true,
      });
      if (!small.base64) throw new Error('No image data');
      onCaptured({ uri: small.uri, base64: small.base64, width: small.width, height: small.height });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <CameraView ref={camera} style={styles.camera} facing={facing} mirror={facing === 'front'}>
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.oval} />
          <Text style={[styles.guide, { writingDirection: s.dir }]}>{s.guide}</Text>
        </View>
      </CameraView>
      <View style={styles.controls}>
        <Button title={s.back} onPress={onBack} variant="ghost" style={styles.side} />
        <Button title={busy ? '…' : s.capture} onPress={capture} disabled={busy} style={styles.shutter} />
        <Button
          title={s.flip}
          onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          variant="ghost"
          style={styles.side}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  oval: {
    width: 260,
    height: 340,
    borderRadius: 170,
    borderWidth: 3,
    borderColor: colors.gold,
    opacity: 0.85,
  },
  guide: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 10,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    gap: spacing.md,
  },
  side: { flex: 1 },
  shutter: { flex: 1.4 },
  permTitle: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  permBody: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
});
