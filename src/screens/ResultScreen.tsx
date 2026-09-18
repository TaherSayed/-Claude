import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from '../components/ui';
import { Strings } from '../i18n';
import { colors, radius, spacing } from '../theme';
import { Analysis, CapturedPhoto, Recommendation } from '../types';

type Props = {
  s: Strings;
  photo: CapturedPhoto;
  analysis: Analysis;
  providerLabel: string;
  onNewCustomer: () => void;
  onRetake: () => void;
};

export function ResultScreen({ s, photo, analysis, providerLabel, onNewCustomer, onRetake }: Props) {
  const dir = { writingDirection: s.dir } as const;
  const facts: Array<[string, string]> = [
    [s.faceShape, analysis.face_shape],
    [s.hairType, analysis.hair_type],
    [s.density, analysis.hair_density],
    [s.length, analysis.hair_length],
    [s.beard, analysis.beard],
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: photo.uri }} style={styles.photo} />
        <View style={styles.facts}>
          <Text style={[styles.title, dir]}>{s.results}</Text>
          {facts.map(([label, value]) => (
            <View key={label} style={styles.factRow}>
              <Text style={[styles.factLabel, dir]}>{label}</Text>
              <Text style={[styles.factValue, dir]}>{value}</Text>
            </View>
          ))}
        </View>
      </View>

      {analysis.recommendations.map((r, i) => (
        <RecommendationCard key={i} rank={i + 1} r={r} s={s} />
      ))}

      {analysis.avoid.length > 0 && (
        <Card style={{ borderColor: colors.danger + '66' }}>
          <Text style={[styles.section, { color: colors.danger }, dir]}>{s.avoid}</Text>
          {analysis.avoid.map((a, i) => (
            <Text key={i} style={[styles.body, dir]}>
              • {a}
            </Text>
          ))}
        </Card>
      )}

      {analysis.note ? <Text style={[styles.note, dir]}>{analysis.note}</Text> : null}
      <Text style={styles.powered}>
        {s.poweredBy} {providerLabel}
      </Text>

      <View style={styles.actions}>
        <Button title={s.retake} onPress={onRetake} variant="ghost" style={{ flex: 1 }} />
        <Button title={s.newCustomer} onPress={onNewCustomer} style={{ flex: 1 }} />
      </View>
    </ScrollView>
  );
}

function RecommendationCard({ rank, r, s }: { rank: number; r: Recommendation; s: Strings }) {
  const dir = { writingDirection: s.dir } as const;
  return (
    <Card style={rank === 1 ? styles.topCard : undefined}>
      <View style={styles.cardHead}>
        <View style={styles.rank}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <Text style={[styles.cardTitle, dir]}>{r.name}</Text>
        <Text style={styles.score}>
          {r.match_score}% {s.match}
        </Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${r.match_score}%` }]} />
      </View>
      <Field label={s.why} value={r.why} s={s} />
      <Field label={s.howToAsk} value={r.how_to_ask} s={s} highlight />
      <Field label={s.guards} value={r.clipper_guards} s={s} />
      <Field label={s.maintenance} value={r.maintenance} s={s} />
    </Card>
  );
}

function Field({ label, value, s, highlight }: { label: string; value: string; s: Strings; highlight?: boolean }) {
  if (!value) return null;
  const dir = { writingDirection: s.dir } as const;
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, dir]}>{label}</Text>
      <Text style={[styles.body, highlight && styles.highlight, dir]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, gap: spacing.md, maxWidth: 900, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', gap: spacing.lg, flexWrap: 'wrap' },
  photo: { width: 160, height: 213, borderRadius: radius.lg, backgroundColor: colors.surface },
  facts: { flex: 1, minWidth: 220, gap: spacing.xs },
  title: { color: colors.gold, fontSize: 26, fontWeight: '800', marginBottom: spacing.sm },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  factLabel: { color: colors.textMuted, fontSize: 15 },
  factValue: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'right' },
  topCard: { borderColor: colors.gold },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { color: colors.bg, fontWeight: '800', fontSize: 16 },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: '800', flex: 1 },
  score: { color: colors.gold, fontWeight: '700', fontSize: 14 },
  bar: { height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3, marginVertical: spacing.sm, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.gold },
  field: { marginTop: spacing.sm, gap: 2 },
  fieldLabel: { color: colors.gold, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  body: { color: colors.text, fontSize: 16, lineHeight: 24 },
  highlight: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    fontStyle: 'italic',
  },
  section: { fontSize: 17, fontWeight: '800', marginBottom: spacing.xs },
  note: { color: colors.textMuted, fontSize: 15, textAlign: 'center', paddingHorizontal: spacing.md },
  powered: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
});
