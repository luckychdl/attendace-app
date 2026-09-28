import { StyleSheet, View } from 'react-native';

import type { AttendanceRecord, LeaveRequest, Worksite } from '@/api/types';
import { SpanBar } from '@/components/span-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { exceptionLabel, STATUS_LABEL, STATUS_TONE } from '@/lib/attendance-rules';
import { formatDuration, formatTime, fromDateKey, minutesOfDay, weekdayName } from '@/lib/date';
import { describeLeave, scheduleMinutes } from '@/lib/leave-rules';

type RecordRowProps = {
  record: AttendanceRecord;
  worksite: Worksite;
  /** 그날 승인된 반차·시차. 예정 근무시간 눈금이 그만큼 줄어든다. */
  leaves?: readonly LeaveRequest[];
};

/** 하루 한 줄. 숫자로도 읽히고, 막대의 위치만 봐도 지각·조퇴가 보인다. */
export function RecordRow({ record, worksite, leaves = [] }: RecordRowProps) {
  const day = fromDateKey(record.workDate);
  const tone = STATUS_TONE[record.status];
  const exception = exceptionLabel(record.status);
  // 하루를 다 쉰 날 나와서 일했다면 원래 근무시간을 눈금으로 쓴다.
  const schedule = scheduleMinutes(worksite, leaves) ?? scheduleMinutes(worksite)!;
  const notes = [exception, ...leaves.map(describeLeave)].filter(Boolean);

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
            {notes.map((note) => `  ·  ${note}`).join('')}
          </ThemedText>
        </View>
      </View>

      <SpanBar
        start={minutesOfDay(record.checkInAt)}
        end={minutesOfDay(record.checkOutAt)}
        scheduleStart={schedule.start}
        scheduleEnd={schedule.end}
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
