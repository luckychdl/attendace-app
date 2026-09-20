import { StyleSheet, View } from 'react-native';

import type { MonthlySummary as MonthlySummaryData } from '@/api/types';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDuration } from '@/lib/date';

export function MonthlySummary({ summary }: { summary: MonthlySummaryData | null }) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <Tile label="근무일" value={summary ? `${summary.workedDays}일` : '-'} />
        <Tile label="지각" value={summary ? `${summary.lateDays}일` : '-'} />
        <Tile label="조기퇴근" value={summary ? `${summary.earlyLeaveDays}일` : '-'} />
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        총 근무시간 {formatDuration(summary?.totalWorkedMinutes ?? null)}
      </ThemedText>
    </Card>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.tileValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
    gap: Spacing.half,
  },
  tileValue: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
});
