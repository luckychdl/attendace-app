import { StyleSheet, View } from 'react-native';

import type { LeaveBalance } from '@/api/types';
import { Figure } from '@/components/figure';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDays } from '@/lib/leave-rules';

/**
 * 한 해의 연차를 막대 하나로 보여 준다.
 * 쓴 만큼 강조색이 차고, 결재를 기다리는 만큼 옅게 이어진다. 남은 칸이 곧 남은 연차다.
 */
export function BalanceCard({ balance }: { balance: LeaveBalance | null }) {
  const theme = useTheme();

  const granted = balance?.granted ?? 0;
  const share = (days: number): `${number}%` =>
    `${granted > 0 ? Math.min(100, (days / granted) * 100) : 0}%`;

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <ThemedText type="label" themeColor="inkMuted">
        남은 연차
      </ThemedText>
      <Figure
        value={balance ? formatDays(balance.remaining) : '—'}
        unit={balance ? `/ ${formatDays(granted)}일` : undefined}
        size={44}
      />

      <View
        accessible
        accessibilityLabel={
          balance
            ? `${formatDays(granted)}일 중 ${formatDays(balance.used)}일 사용, ${formatDays(balance.pending)}일 결재 대기`
            : '연차 현황을 불러오는 중'
        }
        style={[styles.meter, { backgroundColor: theme.mutedSoft }]}>
        {balance ? (
          <>
            <View style={{ width: share(balance.used), backgroundColor: theme.accent }} />
            <View style={{ width: share(balance.pending), backgroundColor: theme.track }} />
          </>
        ) : null}
      </View>

      <View style={styles.legend}>
        <Legend color={theme.accent} label="사용" days={balance?.used} />
        <Legend color={theme.track} label="결재 대기" days={balance?.pending} />
      </View>
    </View>
  );
}

function Legend({ color, label, days }: { color: string; label: string; days?: number }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <ThemedText type="caption" themeColor="inkMuted">
        {label}
      </ThemedText>
      <ThemedText type="dataSmall">{days == null ? '—' : `${formatDays(days)}일`}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  meter: {
    flexDirection: 'row',
    height: 10,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginTop: Spacing.two,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingTop: Spacing.one,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
  },
});
