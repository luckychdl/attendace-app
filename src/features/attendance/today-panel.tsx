import { StyleSheet, View } from 'react-native';

import type { AttendanceRecord, LeaveRequest, Worksite } from '@/api/types';
import { Card } from '@/components/card';
import { SpanBar } from '@/components/span-bar';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { STATUS_TONE } from '@/lib/attendance-rules';
import { formatClock, formatTime, minutesBetween, minutesOfDay } from '@/lib/date';
import { scheduleMinutes } from '@/lib/leave-rules';

type TodayPanelProps = {
  record: AttendanceRecord | null;
  now: Date;
  worksite: Worksite;
  checkedOut: boolean;
  /** 오늘 승인된 반차·시차. 예정 근무시간 눈금이 그만큼 줄어든다. */
  leaves?: readonly LeaveRequest[];
};

/**
 * 오늘 하루를 숫자 하나로 요약한다.
 * 출근 전에는 지금 시각이, 근무 중에는 흘러가는 근무 시간이 주인공이다.
 */
export function TodayPanel({ record, now, worksite, checkedOut, leaves = [] }: TodayPanelProps) {
  const theme = useTheme();

  const workedMinutes =
    record == null ? null : (record.workedMinutes ?? minutesBetween(record.checkInAt, now));

  const heroLabel = record == null ? '현재 시각' : checkedOut ? '오늘 총 근무' : '근무 시간';
  const hero =
    record == null
      ? formatTime(now)
      : `${Math.floor((workedMinutes ?? 0) / 60)}:${String((workedMinutes ?? 0) % 60).padStart(2, '0')}`;

  const { start: scheduleStart, end: scheduleEnd } =
    scheduleMinutes(worksite, leaves) ?? scheduleMinutes(worksite)!;
  const nowMinutes = minutesOfDay(now);

  return (
    <View style={styles.panel}>
      <ThemedText type="label" themeColor="inkMuted">
        {heroLabel}
      </ThemedText>

      <ThemedText type="hero" numberOfLines={1} adjustsFontSizeToFit>
        {hero}
      </ThemedText>

      {/* 하루의 모양과 그 위에서 지금의 위치. 기록 화면과 같은 눈금을 쓴다. */}
      <View style={styles.timeline}>
        <SpanBar
          start={minutesOfDay(record?.checkInAt)}
          end={record == null ? null : checkedOut ? minutesOfDay(record.checkOutAt) : nowMinutes}
          scheduleStart={scheduleStart}
          scheduleEnd={scheduleEnd}
          tone={record ? STATUS_TONE[record.status] : 'muted'}
          marker={nowMinutes}
          label={
            record
              ? `${formatTime(record.checkInAt)}부터 근무 중`
              : '아직 출근하지 않았습니다'
          }
        />
        <View style={styles.scale}>
          <ThemedText type="caption" themeColor="inkMuted">
            {formatClock(scheduleStart)}
          </ThemedText>
          <ThemedText type="caption" themeColor="inkMuted">
            {formatClock(scheduleEnd)}
          </ThemedText>
        </View>
      </View>

      <Card lift="mid" padded={false} style={styles.stamps}>
        <Stamp label="출근" value={formatTime(record?.checkInAt)} filled={!!record} />
        <View style={[styles.divider, { backgroundColor: theme.hairline }]} />
        <Stamp label="퇴근" value={formatTime(record?.checkOutAt)} filled={checkedOut} />
      </Card>

      {record?.note ? (
        <ThemedText type="caption" themeColor="inkMuted" style={styles.note}>
          {record.note}
        </ThemedText>
      ) : null}
    </View>
  );
}

function Stamp({ label, value, filled }: { label: string; value: string; filled: boolean }) {
  return (
    <View style={styles.stamp}>
      <ThemedText type="caption" themeColor="inkMuted">
        {label}
      </ThemedText>
      <ThemedText type="figure" themeColor={filled ? 'ink' : 'inkMuted'} style={styles.stampValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.two,
  },
  timeline: {
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stamps: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.four,
    marginTop: Spacing.four,
  },
  stamp: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  stampValue: {
    fontSize: 26,
    lineHeight: 30,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  note: {
    paddingTop: Spacing.two,
  },
});
