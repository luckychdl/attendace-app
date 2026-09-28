import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatMonthDay, fromDateKey, shiftMonth, toDateKey } from '@/lib/date';
import { isWeekend } from '@/lib/leave-rules';

const WEEK_HEAD = ['일', '월', '화', '수', '목', '금', '토'] as const;
const CELL = 40;

export type DateRange = {
  start: string | null;
  /** 아직 끝을 고르지 않았으면 null. 하루짜리는 start 와 같다. */
  end: string | null;
};

type RangeCalendarProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** 하루만 고르는 모드 (반차) */
  single?: boolean;
  /** 이 날짜보다 앞은 고를 수 없다. YYYY-MM-DD */
  minDate: string;
  /** 이미 휴가가 잡힌 날. 점으로 표시한다. */
  markedDates?: ReadonlySet<string>;
};

/**
 * 휴가 기간을 고르는 달력. 첫 탭은 시작일, 두 번째 탭은 종료일이다.
 * 주말과 지난 날은 고를 수 없다 — 기간 가운데의 주말은 차감에서 알아서 빠진다.
 */
export function RangeCalendar({ value, onChange, single, minDate, markedDates }: RangeCalendarProps) {
  const theme = useTheme();
  const minMonth = minDate.slice(0, 7);
  const [monthKey, setMonthKey] = useState(() => (value.start ?? minDate).slice(0, 7));

  const [year, month] = monthKey.split('-').map(Number);
  const first = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateKey(new Date(year, month - 1, i + 1))),
  ];

  const today = toDateKey(new Date());
  const rangeEnd = value.end ?? value.start;

  const handlePress = (dateKey: string) => {
    if (single) {
      onChange({ start: dateKey, end: dateKey });
    } else if (!value.start || value.end || dateKey < value.start) {
      onChange({ start: dateKey, end: null });
    } else {
      onChange({ start: value.start, end: dateKey });
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <ThemedText type="heading" accessibilityRole="header">
          {year}년 {month}월
        </ThemedText>
        <View style={styles.arrows}>
          <Arrow
            direction="back"
            label="이전 달"
            disabled={monthKey <= minMonth}
            onPress={() => setMonthKey((prev) => shiftMonth(prev, -1))}
          />
          <Arrow
            direction="forward"
            label="다음 달"
            onPress={() => setMonthKey((prev) => shiftMonth(prev, 1))}
          />
        </View>
      </View>

      <View style={styles.grid}>
        {WEEK_HEAD.map((name) => (
          <View key={name} style={styles.cell}>
            <ThemedText type="caption" themeColor="inkMuted">
              {name}
            </ThemedText>
          </View>
        ))}

        {cells.map((dateKey, index) => {
          if (!dateKey) return <View key={`blank-${index}`} style={styles.cell} />;

          const day = fromDateKey(dateKey);
          const disabled = dateKey < minDate || isWeekend(day);
          const isEdge = dateKey === value.start || dateKey === rangeEnd;
          const inRange =
            value.start != null && rangeEnd != null && dateKey > value.start && dateKey < rangeEnd;
          const marked = markedDates?.has(dateKey) ?? false;

          return (
            <View key={dateKey} style={styles.cell}>
              {/* 기간 띠. 양 끝 칸에는 반쪽만 깔아 동그라미와 이어지게 한다. */}
              {inRange || (isEdge && value.start !== rangeEnd && rangeEnd != null) ? (
                <View
                  style={[
                    styles.band,
                    { backgroundColor: theme.accentSoft },
                    dateKey === value.start && styles.bandStart,
                    dateKey === rangeEnd && styles.bandEnd,
                  ]}
                />
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${formatMonthDay(day)}${marked ? ', 휴가 있음' : ''}`}
                accessibilityState={{ disabled, selected: isEdge || inRange }}
                disabled={disabled}
                onPress={() => handlePress(dateKey)}
                style={({ pressed }) => [
                  styles.day,
                  {
                    backgroundColor: isEdge ? theme.accent : 'transparent',
                    opacity: pressed ? 0.6 : 1,
                  },
                ]}>
                <ThemedText
                  type="dataSmall"
                  style={[
                    { color: isEdge ? theme.accentOn : disabled ? theme.muted : theme.ink },
                    disabled && styles.faded,
                    dateKey === today && !isEdge && { color: theme.accent },
                  ]}>
                  {day.getDate()}
                </ThemedText>
                {marked ? (
                  <View
                    style={[styles.dot, { backgroundColor: isEdge ? theme.accentOn : theme.good }]}
                  />
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Arrow({
  direction,
  label,
  disabled,
  onPress,
}: {
  direction: 'back' | 'forward';
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.arrow,
        { backgroundColor: theme.mutedSoft, opacity: disabled ? 0.35 : pressed ? 0.6 : 1 },
      ]}>
      <Ionicons name={`chevron-${direction}`} size={16} color={theme.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Spacing.two,
  },
  arrows: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  arrow: {
    width: TouchTarget - 8,
    height: TouchTarget - 8,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: CELL + 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 2,
    bottom: 2,
  },
  bandStart: { left: '50%' },
  bandEnd: { right: '50%' },
  day: {
    width: CELL,
    height: CELL,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faded: { opacity: 0.45 },
  dot: {
    position: 'absolute',
    bottom: 5,
    width: 4,
    height: 4,
    borderRadius: Radius.pill,
  },
});
