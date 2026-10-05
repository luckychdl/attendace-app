import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Curve, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fromDateKey, weekdayName } from '@/lib/date';

/** 근태 기록 사이에 끼는 연차일 한 줄. 출근하지 않은 게 아니라 쉰 날임을 보여 준다. */
export function LeaveDayRow({
  dateKey,
  label,
  reason,
}: {
  dateKey: string;
  /** 연차 · 시차 16:00–18:00 */
  label: string;
  reason: string | null;
}) {
  const theme = useTheme();
  const day = fromDateKey(dateKey);

  return (
    <View style={styles.row}>
      <View style={styles.date}>
        <ThemedText type="figure" themeColor="inkMuted" style={styles.dayNumber}>
          {day.getDate()}
        </ThemedText>
        <ThemedText type="caption" themeColor="inkMuted">
          {weekdayName(day)}
        </ThemedText>
      </View>

      <View style={[styles.body, { backgroundColor: theme.accentSoft }]}>
        <ThemedText type="label" themeColor="accent">
          {label}
        </ThemedText>
        {reason ? (
          <ThemedText type="caption" themeColor="inkMuted" numberOfLines={1} style={styles.reason}>
            {reason}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    paddingVertical: Spacing.three,
  },
  date: {
    width: 34,
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 22,
    lineHeight: 26,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderRadius: Radius.sm,
    borderCurve: Curve,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  reason: {
    flexShrink: 1,
  },
});
