import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { MonthlySummary } from '@/features/attendance/monthly-summary';
import { RecordRow } from '@/features/attendance/record-row';
import { useMonthlyAttendance } from '@/hooks/use-attendance';
import { useEmployee } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useWorksite } from '@/hooks/use-worksite';
import { shiftMonth, toMonthKey } from '@/lib/date';

export default function HistoryScreen() {
  const employee = useEmployee();
  const theme = useTheme();
  const { worksite } = useWorksite();
  const currentMonth = toMonthKey(new Date());
  const [monthKey, setMonthKey] = useState(currentMonth);
  const [refreshing, setRefreshing] = useState(false);

  const { records, summary, loading, error, reload } = useMonthlyAttendance(employee.id, monthKey);

  const isCurrentMonth = monthKey === currentMonth;
  const [year, month] = monthKey.split('-').map(Number);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.inkMuted}
            />
          }>
          <View style={styles.masthead}>
            <ThemedText type="title" accessibilityRole="header">
              {year}년 {month}월
            </ThemedText>

            <View style={styles.arrows}>
              <MonthArrow
                direction="back"
                label="이전 달"
                onPress={() => setMonthKey((prev) => shiftMonth(prev, -1))}
              />
              <MonthArrow
                direction="forward"
                label="다음 달"
                disabled={isCurrentMonth}
                onPress={() => setMonthKey((prev) => shiftMonth(prev, 1))}
              />
            </View>
          </View>

          <MonthlySummary summary={summary} />

          <View style={styles.list}>
            {loading && records.length === 0 ? (
              <ActivityIndicator style={styles.placeholder} color={theme.inkMuted} />
            ) : error ? (
              <ThemedText type="body" themeColor="inkMuted" style={styles.placeholder}>
                {error}
              </ThemedText>
            ) : records.length === 0 ? (
              <ThemedText type="body" themeColor="inkMuted" style={styles.placeholder}>
                이 달에는 기록이 없습니다.
              </ThemedText>
            ) : (
              records.map((record) => (
                <RecordRow key={record.id} record={record} worksite={worksite} />
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MonthArrow({
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
        {
          backgroundColor: theme.surface,
          opacity: disabled ? 0.35 : pressed ? 0.6 : 1,
        },
      ]}>
      <Ionicons name={`chevron-${direction}`} size={18} color={theme.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.five,
    paddingBottom: Spacing.seven,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  arrows: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  arrow: {
    width: TouchTarget,
    height: TouchTarget,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: Spacing.two,
  },
  placeholder: {
    paddingVertical: Spacing.seven,
    textAlign: 'center',
  },
});
