import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, View } from 'react-native';

import type { AttendanceRecord, LeaveRequest, Worksite } from '@/api/types';
import { Card } from '@/components/card';
import { SpanBar } from '@/components/span-bar';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ToneColor } from '@/constants/theme';
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
      {/* 주인공 카드. 숫자 하나가 가운데에 서고, 그 밑에 하루의 눈금이 깔린다. */}
      <Card lift="mid" radius={Radius.lg} style={styles.hero}>
        <ThemedText type="label" themeColor="inkMuted">
          {heroLabel}
        </ThemedText>

        <ThemedText type="hero" numberOfLines={1} adjustsFontSizeToFit style={styles.heroFigure}>
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
      </Card>

      {/* 출근과 퇴근은 각자 한 장씩. 찍힌 쪽만 색이 든다. */}
      <View style={styles.stamps}>
        <Stamp
          label="출근"
          icon="log-in-outline"
          tone="accent"
          value={formatTime(record?.checkInAt)}
          filled={!!record}
        />
        <Stamp
          label="퇴근"
          icon="log-out-outline"
          tone="good"
          value={formatTime(record?.checkOutAt)}
          filled={checkedOut}
        />
      </View>

      {record?.note ? (
        <ThemedText type="caption" themeColor="inkMuted" style={styles.note}>
          {record.note}
        </ThemedText>
      ) : null}
    </View>
  );
}

function Stamp({
  label,
  icon,
  tone,
  value,
  filled,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  tone: ToneColor;
  value: string;
  filled: boolean;
}) {
  const theme = useTheme();

  return (
    <Card style={styles.stamp}>
      <View
        style={[styles.badge, { backgroundColor: filled ? theme[`${tone}Soft`] : theme.sunk }]}>
        <Ionicons name={icon} size={18} color={filled ? theme[tone] : theme.muted} />
      </View>
      <View>
        <ThemedText type="caption" themeColor="inkMuted">
          {label}
        </ThemedText>
        <ThemedText
          type="figure"
          themeColor={filled ? 'ink' : 'inkMuted'}
          style={styles.stampValue}>
          {value}
        </ThemedText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: Spacing.three,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
  },
  heroFigure: {
    textAlign: 'center',
    marginTop: Spacing.one,
  },
  timeline: {
    alignSelf: 'stretch',
    gap: Spacing.two,
    marginTop: Spacing.five,
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stamps: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  stamp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampValue: {
    fontSize: 24,
    lineHeight: 28,
  },
  note: {
    paddingTop: Spacing.two,
  },
});
