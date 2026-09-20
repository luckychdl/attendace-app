import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { MonthlySummary } from '@/features/attendance/monthly-summary';
import { RecordRow } from '@/features/attendance/record-row';
import { useMonthlyAttendance } from '@/hooks/use-attendance';
import { useEmployee } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatMonth, shiftMonth, toMonthKey } from '@/lib/date';

export default function HistoryScreen() {
  const employee = useEmployee();
  const theme = useTheme();
  const currentMonth = toMonthKey(new Date());
  const [monthKey, setMonthKey] = useState(currentMonth);

  const { records, summary, loading, error, reload } = useMonthlyAttendance(employee.id, monthKey);

  const isCurrentMonth = monthKey === currentMonth;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reload} />}>
          <View style={styles.monthNav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              hitSlop={8}
              onPress={() => setMonthKey((prev) => shiftMonth(prev, -1))}>
              <Ionicons name="chevron-back" size={24} color={theme.text} />
            </Pressable>

            <ThemedText type="smallBold" style={styles.monthLabel}>
              {formatMonth(monthKey)}
            </ThemedText>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={8}
              disabled={isCurrentMonth}
              onPress={() => setMonthKey((prev) => shiftMonth(prev, 1))}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={isCurrentMonth ? theme.border : theme.text}
              />
            </Pressable>
          </View>

          <MonthlySummary summary={summary} />

          <Card style={styles.listCard}>
            <ThemedText type="smallBold">일별 기록</ThemedText>

            {loading && records.length === 0 ? (
              <ActivityIndicator style={styles.placeholder} color={theme.textSecondary} />
            ) : error ? (
              <ThemedText type="small" themeColor="danger" style={styles.placeholder}>
                {error}
              </ThemedText>
            ) : records.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.placeholder}>
                이 달의 근태 기록이 없습니다.
              </ThemedText>
            ) : (
              records.map((record) => <RecordRow key={record.id} record={record} />)
            )}
          </Card>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
  },
  monthLabel: {
    fontSize: 18,
    lineHeight: 24,
  },
  listCard: {
    padding: Spacing.three,
    gap: 0,
  },
  placeholder: {
    paddingVertical: Spacing.four,
    textAlign: 'center',
  },
});
