import { StyleSheet, View } from 'react-native';

import type { AttendanceRecord } from '@/api/types';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatDuration, formatShortDate, formatTime, fromDateKey } from '@/lib/date';

export function RecordRow({ record }: { record: AttendanceRecord }) {
  const theme = useTheme();

  return (
    <View style={[styles.row, { borderBottomColor: theme.border }]}>
      <View style={styles.dateColumn}>
        <ThemedText type="smallBold">{formatShortDate(fromDateKey(record.workDate))}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatTime(record.checkInAt)} ~ {formatTime(record.checkOutAt)}
        </ThemedText>
      </View>

      <View style={styles.metaColumn}>
        <StatusBadge status={record.status} />
        <ThemedText type="small" themeColor="textSecondary">
          {formatDuration(record.workedMinutes)}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.three,
  },
  dateColumn: {
    gap: Spacing.half,
  },
  metaColumn: {
    alignItems: 'flex-end',
    gap: Spacing.half,
  },
});
