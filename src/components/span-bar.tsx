import { StyleSheet, View } from 'react-native';

import { Radius, type ToneColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const HEIGHT = 12;
/** 데이터 막대는 눈금보다 얇게 얹는다. 위아래로 예정 근무시간이 비쳐야 대조가 된다. */
const BAR_INSET = 3;
/** 예정 근무시간 앞뒤로 남겨 두는 여백(분). 일찍 오거나 늦게 간 날이 축 밖으로 나가지 않게 한다. */
const AXIS_PAD = 90;

type SpanBarProps = {
  /** 자정 기준 분. 출근하지 않았으면 null */
  start: number | null;
  /** 자정 기준 분. 퇴근을 안 찍었으면 null */
  end: number | null;
  scheduleStart: number;
  scheduleEnd: number;
  tone: ToneColor;
  label: string;
  /** 자정 기준 분. 축 위에 '지금'을 가리키는 선을 긋는다. */
  marker?: number | null;
};

/**
 * 하루의 실제 근무 구간을 예정 근무시간 축 위에 얹는다.
 * 막대가 어디서 시작하고 끝나는지가 곧 지각·조퇴다.
 */
export function SpanBar({
  start,
  end,
  scheduleStart,
  scheduleEnd,
  tone,
  label,
  marker,
}: SpanBarProps) {
  const theme = useTheme();

  const axisFrom = Math.max(0, scheduleStart - AXIS_PAD);
  const axisTo = Math.min(1440, scheduleEnd + AXIS_PAD);
  const span = axisTo - axisFrom;

  const toPercent = (minutes: number) =>
    Math.min(100, Math.max(0, ((minutes - axisFrom) / span) * 100));

  const scheduleLeft = toPercent(scheduleStart);
  const scheduleWidth = toPercent(scheduleEnd) - scheduleLeft;

  const barLeft = start == null ? null : toPercent(start);
  const barWidth = barLeft == null || end == null ? null : Math.max(1.5, toPercent(end) - barLeft);

  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[styles.axis, { backgroundColor: theme.mutedSoft }]}>
      {/* 예정 근무시간. 데이터가 아니라 눈금이므로 뒤로 물러나 있다. */}
      <View
        style={[
          styles.schedule,
          { left: `${scheduleLeft}%`, width: `${scheduleWidth}%`, backgroundColor: theme.track },
        ]}
      />

      {barLeft != null && barWidth != null ? (
        <View
          style={[
            styles.bar,
            { left: `${barLeft}%`, width: `${barWidth}%`, backgroundColor: theme[tone] }
          ]}
        />
      ) : barLeft != null ? (
        // 퇴근을 찍지 않은 날. 시작점만 남는다.
        <View style={[styles.stub, { left: `${barLeft}%`, backgroundColor: theme[tone] }]} />
      ) : null}

      {marker != null ? (
        <View style={[styles.marker, { left: `${toPercent(marker)}%`, backgroundColor: theme.ink }]} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  axis: {
    height: HEIGHT,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  schedule: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  bar: {
    position: 'absolute',
    top: BAR_INSET,
    bottom: BAR_INSET,
    borderRadius: Radius.pill,
  },
  stub: {
    position: 'absolute',
    top: BAR_INSET,
    bottom: BAR_INSET,
    width: HEIGHT - BAR_INSET * 2,
    borderRadius: Radius.pill,
  },
  /** 지금 시각. 데이터가 아니라 기준선이라 가늘게 긋는다. */
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
  },
});
