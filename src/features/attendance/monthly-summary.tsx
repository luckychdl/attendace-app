import { StyleSheet, View } from 'react-native';

import type { MonthlySummary as MonthlySummaryData } from '@/api/types';
import { Figure } from '@/components/figure';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration } from '@/lib/date';

/** 달의 머리말. 숫자 셋과 합계 한 줄이면 충분하다. */
export function MonthlySummary({ summary }: { summary: MonthlySummaryData | null }) {
  const theme = useTheme();

  return (
    <View style={[styles.block, { backgroundColor: theme.surface }]}>
      <View style={styles.tiles}>
        <Tile label="근무일" value={summary?.workedDays} />
        <Tile label="지각" value={summary?.lateDays} />
        <Tile label="조퇴" value={summary?.earlyLeaveDays} />
      </View>

      <View style={[styles.total, { borderTopColor: theme.hairline }]}>
        <ThemedText type="caption" themeColor="inkMuted">
          총 근무시간
        </ThemedText>
        <ThemedText type="data">{formatDuration(summary?.totalWorkedMinutes ?? null)}</ThemedText>
      </View>
    </View>
  );
}

function Tile({ label, value }: { label: string; value: number | undefined }) {
  return (
    <View style={styles.tile}>
      <Figure value={value == null ? '—' : String(value)} unit={value == null ? undefined : '일'} />
      <ThemedText type="caption" themeColor="inkMuted">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.four,
  },
  tiles: {
    flexDirection: 'row',
  },
  tile: {
    flex: 1,
    gap: 1,
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.four,
  },
});
