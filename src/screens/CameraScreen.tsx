import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Button } from '../components/ui';
import { Strings } from '../i18n';
import { colors, radius, spacing } from '../theme';
import { CapturedPhoto } from '../types';

type Props = {
  s: Strings;
  onCaptured: (photo: CapturedPhoto) => void;
  onBack: () => void;
};

const TIMER_SECONDS = 3;

export function CameraScreen({ s, onCaptured, onBack }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [review, setReview] = useState<CapturedPhoto | null>(null);
  const camera = useRef<CameraView>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, []);

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
    if (!camera.current || busy || !ready) return;
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
      // Freeze the live feed and let the barber confirm the shot before spending an API call.
      setReview({ uri: small.uri, base64: small.base64, width: small.width, height: small.height });
    } finally {
      setBusy(false);
      setCountdown(null);
    }
  };

  const startTimer = () => {
    if (busy || countdown !== null) return;
    let n = TIMER_SECONDS;
    setCountdown(n);
    const tick = () => {
      n -= 1;
      if (n <= 0) {
        setCountdown(0);
        void capture();
        return;
      }
      setCountdown(n);
      countdownRef.current = setTimeout(tick, 1000);
    };
    countdownRef.current = setTimeout(tick, 1000);
  };

  const cancelTimer = () => {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setCountdown(null);
  };

  if (review) {
    return (
      <View style={styles.root}>
        <Image source={{ uri: review.uri }} style={styles.reviewImage} resizeMode="contain" />
        <Text style={[styles.reviewTitle, { writingDirection: s.dir }]}>{s.reviewTitle}</Text>
        <View style={styles.controls}>
          <Button title={s.retake} onPress={() => setReview(null)} variant="ghost" style={styles.side} />
          <Button title={s.usePhoto} onPress={() => onCaptured(review)} style={styles.shutter} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        ref={camera}
        style={styles.camera}
        facing={facing}
        mirror={facing === 'front'}
        onCameraReady={() => setReady(true)}
      >
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.liveBadge}>
            <View style={[styles.liveDot, !ready && { backgroundColor: colors.textMuted }]} />
            <Text style={styles.liveText}>{s.live}</Text>
          </View>
          <View style={styles.oval} />
          {countdown !== null && countdown > 0 ? (
            <Text style={styles.countdown}>{countdown}</Text>
          ) : (
            <Text style={[styles.guide, { writingDirection: s.dir }]}>{s.guide}</Text>
          )}
        </View>
      </CameraView>
      <View style={styles.controls}>
        <Button title={s.back} onPress={onBack} variant="ghost" style={styles.side} />
        <Button
          title={busy ? '…' : s.capture}
          onPress={capture}
          disabled={busy || !ready || countdown !== null}
          style={styles.shutter}
        />
        <Button
          title={countdown !== null ? '✕' : s.timer}
          onPress={countdown !== null ? cancelTimer : startTimer}
          disabled={busy || !ready}
          variant="ghost"
          style={styles.side}
        />
        <Button
          title={s.flip}
          onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
          disabled={busy || countdown !== null}
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
  liveBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger },
  liveText: { color: colors.text, fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  oval: {
    width: 260,
    height: 340,
    borderRadius: 170,
    borderWidth: 3,
    borderColor: colors.gold,
    opacity: 0.85,
  },
  countdown: {
    color: colors.gold,
    fontSize: 96,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 12,
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
    gap: spacing.sm,
  },
  side: { flex: 1 },
  shutter: { flex: 1.4 },
  reviewImage: { flex: 1, margin: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface },
  reviewTitle: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  permTitle: { color: colors.text, fontSize: 22, fontWeight: '700', textAlign: 'center' },
  permBody: { color: colors.textMuted, fontSize: 16, textAlign: 'center' },
});
