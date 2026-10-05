import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LeaveRequest, Worksite } from '@/api/types';
import { HoldButton } from '@/components/hold-button';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Curve, MaxContentWidth, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { PlacePill } from '@/features/attendance/place-pill';
import { TodayPanel } from '@/features/attendance/today-panel';
import { useNow, useTodayAttendance } from '@/hooks/use-attendance';
import { useEmployee } from '@/hooks/use-auth';
import { useApprovedLeaves } from '@/hooks/use-leave';
import { useCurrentLocation } from '@/hooks/use-location';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { useWorksite } from '@/hooks/use-worksite';
import { formatClock, formatFullDate, toDateKey, weekdayName } from '@/lib/date';
import { approvedLeavesOn, describeLeave, scheduleMinutes } from '@/lib/leave-rules';

export default function CheckInScreen() {
  const employee = useEmployee();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const { worksite } = useWorksite();
  const now = useNow();
  const location = useCurrentLocation(worksite);
  const { record, loading, submitting, error, submit, reload, checkedIn, checkedOut } =
    useTodayAttendance(employee.id, worksite);

  const todayKey = toDateKey(now);
  const { leaves } = useApprovedLeaves(employee.id, todayKey, todayKey);
  const todayLeaves = approvedLeavesOn(leaves, employee.id, todayKey);

  // 첫 진입의 로딩까지 당겨서 새로고침으로 보여주지 않도록 분리한다.
  const [refreshing, setRefreshing] = useState(false);

  const kind = checkedIn ? 'out' : 'in';

  const refreshLocation = location.refresh;
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([reload(), refreshLocation()]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshLocation, reload]);

  const runCheck = useCallback(
    async (note: string | null) => {
      try {
        const next = await submit(kind, { location: location.point, note });
        Alert.alert(
          kind === 'in' ? '출근했습니다' : '퇴근했습니다',
          `${formatFullDate(new Date(next.checkOutAt ?? next.checkInAt))}\n${
            kind === 'in' ? '좋은 하루 보내세요.' : '오늘 하루 수고하셨습니다.'
          }`,
        );
      } catch (caught) {
        Alert.alert(
          '기록하지 못했습니다',
          caught instanceof Error ? caught.message : '잠시 후 다시 시도해 주세요.',
        );
      }
    },
    [kind, location.point, submit],
  );

  /** 반경 밖 예외 체크. 사유가 비고로 남는다. */
  const handleOutsideCheck = useCallback(() => {
    Alert.alert('근무지 밖에서 기록할까요?', '외부 근무로 기록되고, 비고에 사유가 남습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '기록하기',
        style: 'destructive',
        onPress: () => runCheck('근무지 반경 밖에서 체크 (외부 근무)'),
      },
    ]);
  }, [runCheck]);

  const blocked = loading || location.loading || !location.isInside;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: tabBarInset }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.inkMuted}
            />
          }>
          <ThemedText type="title" accessibilityRole="header">
            {now.getMonth() + 1}월 {now.getDate()}일 {weekdayName(now)}요일
          </ThemedText>

          <PlacePill worksite={worksite} location={location} onRefresh={location.refresh} />

          {todayLeaves.length > 0 ? (
            <StatusPill tone="accent" label={leaveNotice(todayLeaves, worksite)} />
          ) : null}

          <View style={styles.stage}>
            <TodayPanel
              record={record}
              now={now}
              worksite={worksite}
              checkedOut={checkedOut}
              leaves={todayLeaves}
            />
          </View>

          {error ? (
            <View style={[styles.notice, { backgroundColor: theme.mutedSoft }]}>
              <ThemedText type="caption" themeColor="inkMuted">
                {error}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.actions}>
            {checkedOut ? (
              <View style={[styles.closed, { backgroundColor: theme.sunk }]}>
                <ThemedText type="heading" themeColor="inkMuted">
                  오늘 근무 끝
                </ThemedText>
              </View>
            ) : (
              <HoldButton
                label={kind === 'in' ? '출근하기' : '퇴근하기'}
                disabledLabel={location.loading ? '위치 확인 중' : '근무지 반경 안에서만 가능해요'}
                disabled={blocked}
                loading={submitting}
                onComplete={() => runCheck(null)}
              />
            )}

            {!checkedOut && !location.isInside && !location.loading ? (
              <Pressable
                accessibilityRole="button"
                accessibilityHint="사유를 남기고 근무지 반경 밖에서 기록합니다."
                onPress={handleOutsideCheck}
                style={({ pressed }) => [
                  styles.outside,
                  { backgroundColor: pressed ? theme.surface : 'transparent' },
                ]}>
                <ThemedText type="label" themeColor="warn">
                  근무지 밖에서 기록하기
                </ThemedText>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** 오늘 쓰는 휴가와, 그래서 몇 시부터 몇 시까지 일하면 되는지 한 줄로 */
function leaveNotice(leaves: LeaveRequest[], worksite: Worksite) {
  const schedule = scheduleMinutes(worksite, leaves);
  if (!schedule) return '오늘은 쉬는 날입니다';
  const names = leaves.map(describeLeave).join(' · ');
  return `${names} · ${formatClock(schedule.start)}–${formatClock(schedule.end)} 근무`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: Spacing.five,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  /** 오늘 하루가 화면에서 남는 자리를 모두 차지한다. */
  stage: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: Spacing.four,
  },
  notice: {
    borderRadius: Radius.sm,
    borderCurve: Curve,
    padding: Spacing.four,
  },
  actions: {
    gap: Spacing.three,
  },
  /** 더 누를 게 없는 자리. 버튼과 같은 덩치지만 떠 있지 않고 눌러 들어가 있다. */
  closed: {
    minHeight: TouchTarget + Spacing.six,
    borderRadius: Radius.xl,
    borderCurve: Curve,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outside: {
    minHeight: TouchTarget,
    borderRadius: Radius.sm,
    borderCurve: Curve,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
