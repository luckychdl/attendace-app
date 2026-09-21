import { StyleSheet, View } from 'react-native';

import type { AttendanceRecord, Worksite } from '@/api/types';
import { SpanBar } from '@/components/span-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { exceptionLabel, STATUS_LABEL, STATUS_TONE } from '@/lib/attendance-rules';
import { formatDuration, formatTime, fromDateKey, minutesOfDay, weekdayName } from '@/lib/date';

type RecordRowProps = {
  record: AttendanceRecord;
  worksite: Worksite;
};

/** 하루 한 줄. 숫자로도 읽히고, 막대의 위치만 봐도 지각·조퇴가 보인다. */
export function RecordRow({ record, worksite }: RecordRowProps) {
  const day = fromDateKey(record.workDate);
  const tone = STATUS_TONE[record.status];
  const exception = exceptionLabel(record.status);

  return (
    <View style={styles.row}>
      <View style={styles.head}>
        <View style={styles.date}>
          <ThemedText type="figure" style={styles.dayNumber}>
            {day.getDate()}
          </ThemedText>
          <ThemedText type="caption" themeColor="inkMuted">
            {weekdayName(day)}
          </ThemedText>
        </View>

        <View style={styles.times}>
          <ThemedText type="data">
            {formatTime(record.checkInAt)} – {formatTime(record.checkOutAt)}
          </ThemedText>
          <ThemedText type="caption" themeColor="inkMuted">
            {formatDuration(record.workedMinutes)}
            {exception ? `  ·  ${exception}` : ''}
          </ThemedText>
        </View>
      </View>

      <SpanBar
        start={minutesOfDay(record.checkInAt)}
        end={minutesOfDay(record.checkOutAt)}
        scheduleStart={worksite.startHour * 60 + worksite.startMinute}
        scheduleEnd={worksite.endHour * 60 + worksite.endMinute}
        tone={tone}
        label={`${formatTime(record.checkInAt)}부터 ${formatTime(record.checkOutAt)}까지, ${STATUS_LABEL[record.status]}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  date: {
    width: 34,
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 22,
    lineHeight: 26,
  },
  times: {
    flex: 1,
    gap: 1,
  },
});
