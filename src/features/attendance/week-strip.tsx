import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import type { AttendanceStatus } from '@/api/types';
import { ThemedText } from '@/components/themed-text';
import { accentGlow, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { STATUS_LABEL, STATUS_TONE } from '@/lib/attendance-rules';
import { toDateKey, weekdayName } from '@/lib/date';

const DAY = 38;
const DOT = 5;

type WeekStripProps = {
  today: Date;
  /** 날짜 키별 근태 상태. 기록이 없는 날은 빠져 있다. */
  statuses: ReadonlyMap<string, AttendanceStatus>;
};

/**
 * 이번 주 일곱 칸. 오늘만 강조색으로 차 있고, 기록이 있는 날은 밑에 상태색 점이 찍힌다.
 * 한 주는 월요일에 시작한다.
 */
export function WeekStrip({ today, statuses }: WeekStripProps) {
  const theme = useTheme();
  const todayKey = toDateKey(today);

  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });

  return (
    <View style={styles.strip}>
      {days.map((day) => {
        const key = toDateKey(day);
        const isToday = key === todayKey;
        const status = statuses.get(key);

        return (
          <View
            key={key}
            accessible
            accessibilityLabel={`${day.getMonth() + 1}월 ${day.getDate()}일 ${weekdayName(day)}요일${
              isToday ? ', 오늘' : ''
            }${status ? `, ${STATUS_LABEL[status]}` : ''}`}
            style={styles.cell}>
            <ThemedText type="caption" themeColor={isToday ? 'accent' : 'inkMuted'}>
              {weekdayName(day)}
            </ThemedText>

            <View style={[styles.day, isToday ? accentGlow(theme.accent) : null]}>
              {isToday ? (
                <LinearGradient
                  colors={[theme.accent, theme.accentTo]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, styles.fill]}
                />
              ) : null}
              <ThemedText
                type="data"
                style={{
                  color: isToday ? theme.accentOn : key > todayKey ? theme.inkMuted : theme.ink,
                }}>
                {day.getDate()}
              </ThemedText>
            </View>

            <View
              style={[
                styles.dot,
                { backgroundColor: status ? theme[STATUS_TONE[status]] : 'transparent' },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    alignItems: 'center',
    gap: Spacing.one + 2,
  },
  day: {
    width: DAY,
    height: DAY,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    borderRadius: Radius.pill,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: Radius.pill,
  },
});
