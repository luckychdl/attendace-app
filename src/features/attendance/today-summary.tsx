import { StyleSheet, View } from 'react-native';

import type { AttendanceRecord } from '@/api/types';
import { Card } from '@/components/card';
import { StatusBadge } from '@/components/status-badge';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { formatDuration, formatTime, minutesBetween } from '@/lib/date';

type TodaySummaryProps = {
  record: AttendanceRecord | null;
  /** 근무 중일 때 경과 시간 계산에 쓰는 현재 시각 */
  now: Date;
};

export function TodaySummary({ record, now }: TodaySummaryProps) {
  const workedMinutes =
    record == null
      ? null
      : (record.workedMinutes ?? minutesBetween(record.checkInAt, now));

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <ThemedText type="smallBold">오늘 근태</ThemedText>
        {record ? <StatusBadge status={record.status} /> : null}
      </View>

      <View style={styles.row}>
        <Cell label="출근" value={formatTime(record?.checkInAt)} />
        <Cell label="퇴근" value={formatTime(record?.checkOutAt)} />
        <Cell label="근무" value={formatDuration(workedMinutes)} />
      </View>

      {record?.note ? (
        <ThemedText type="small" themeColor="textSecondary">
          비고: {record.note}
        </ThemedText>
      ) : null}
    </Card>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText style={styles.cellValue}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    gap: Spacing.half,
  },
  cellValue: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
});
