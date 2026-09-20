import { useCallback } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { CheckButton, type CheckButtonMode } from '@/features/attendance/check-button';
import { LocationCard } from '@/features/attendance/location-card';
import { TodaySummary } from '@/features/attendance/today-summary';
import { useTodayAttendance, useNow } from '@/hooks/use-attendance';
import { useEmployee } from '@/hooks/use-auth';
import { useCurrentLocation } from '@/hooks/use-location';
import { useWorksite } from '@/hooks/use-worksite';
import { formatClock, formatFullDate } from '@/lib/date';

export default function CheckInScreen() {
  const employee = useEmployee();
  const { worksite } = useWorksite();
  const now = useNow();
  const location = useCurrentLocation(worksite);
  const { record, loading, submitting, submit, reload, checkedIn, checkedOut } =
    useTodayAttendance(employee.id, worksite);

  const mode: CheckButtonMode = checkedOut ? 'done' : checkedIn ? 'checkOut' : 'checkIn';
  const kind = mode === 'checkOut' ? 'out' : 'in';

  const runCheck = useCallback(
    async (note: string | null) => {
      try {
        const next = await submit(kind, { location: location.point, note });
        Alert.alert(
          kind === 'in' ? '출근 체크 완료' : '퇴근 체크 완료',
          `${formatFullDate(new Date(next.checkOutAt ?? next.checkInAt))}\n${
            kind === 'in' ? '좋은 하루 보내세요!' : '오늘 하루 수고하셨습니다!'
          }`,
        );
      } catch (caught) {
        Alert.alert('체크 실패', caught instanceof Error ? caught.message : '다시 시도해 주세요.');
      }
    },
    [kind, location.point, submit],
  );

  const handlePress = useCallback(() => {
    if (!location.isInside) {
      Alert.alert('근무지 반경 밖입니다', '근무지 반경 안에서 다시 시도해 주세요.');
      return;
    }
    runCheck(null);
  }, [location.isInside, runCheck]);

  /** 반경 밖 예외 체크. 사유가 기록으로 남는다. */
  const handleOutsideCheck = useCallback(() => {
    Alert.alert(
      '근무지 밖에서 체크할까요?',
      '외부 근무·출장 등으로 기록되며, 비고에 사유가 남습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '체크하기',
          style: 'destructive',
          onPress: () => runCheck('근무지 반경 밖에서 체크 (외부 근무)'),
        },
      ],
    );
  }, [runCheck]);

  const disabled = loading || location.loading || !location.isInside;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                reload();
                location.refresh();
              }}
            />
          }>
          <View style={styles.header}>
            <ThemedText type="small" themeColor="textSecondary">
              {employee.department} · {employee.position}
            </ThemedText>
            <ThemedText type="subtitle">{employee.name}님</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {formatFullDate(now)}
            </ThemedText>
            <ThemedText style={styles.clock}>{formatClock(now)}</ThemedText>
          </View>

          <LocationCard worksite={worksite} location={location} onRefresh={location.refresh} />

          <CheckButton
            mode={mode}
            onPress={handlePress}
            disabled={disabled}
            loading={submitting}
          />

          {!location.isInside && mode !== 'done' ? (
            <ThemedText
              type="small"
              themeColor="primary"
              style={styles.outsideLink}
              onPress={handleOutsideCheck}>
              근무지 밖에서 체크 (사유 기록)
            </ThemedText>
          ) : null}

          <TodaySummary record={record} now={now} />
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
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: { gap: Spacing.half },
  clock: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  outsideLink: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
