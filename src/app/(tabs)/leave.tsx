import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { LeaveRequest } from '@/api/types';
import { AppButton } from '@/components/app-button';
import { ScreenWash } from '@/components/screen-wash';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { BalanceCard } from '@/features/leave/balance-card';
import { LeaveRow } from '@/features/leave/leave-row';
import { useEmployee } from '@/hooks/use-auth';
import { useLeave } from '@/hooks/use-leave';
import { useTabBarInset } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';
import { describeLeave, formatLeavePeriod, isCancellable } from '@/lib/leave-rules';

function failed(caught: unknown) {
  Alert.alert(
    '처리하지 못했습니다',
    caught instanceof Error ? caught.message : '잠시 후 다시 시도해 주세요.',
  );
}

export default function LeaveScreen() {
  const employee = useEmployee();
  const theme = useTheme();
  const tabBarInset = useTabBarInset();
  const router = useRouter();
  const year = new Date().getFullYear();
  const [refreshing, setRefreshing] = useState(false);

  const { balance, requests, inbox, isManager, loading, error, busyId, reload, cancel, approve, reject } =
    useLeave(employee, year);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  }, [reload]);

  const confirmCancel = (leave: LeaveRequest) => {
    Alert.alert(
      '신청을 취소할까요?',
      `${formatLeavePeriod(leave.startDate, leave.endDate)} ${describeLeave(leave)}`,
      [
        { text: '닫기', style: 'cancel' },
        {
          text: '신청 취소',
          style: 'destructive',
          onPress: () => cancel(leave.id).catch(failed),
        },
      ],
    );
  };

  const confirmReject = (leave: LeaveRequest) => {
    Alert.alert(
      `${leave.employeeName}님의 신청을 반려할까요?`,
      `${formatLeavePeriod(leave.startDate, leave.endDate)} ${describeLeave(leave)}`,
      [
        { text: '닫기', style: 'cancel' },
        { text: '반려', style: 'destructive', onPress: () => reject(leave.id).catch(failed) },
      ],
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenWash />
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
          <ThemedText type="title" accessibilityRole="header" style={styles.masthead}>
            {year}년 휴가
          </ThemedText>

          <BalanceCard balance={balance} />

          <AppButton label="휴가 신청하기" onPress={() => router.push('/leave/new')} />

          {error ? (
            <ThemedText type="body" themeColor="inkMuted" style={styles.placeholder}>
              {error}
            </ThemedText>
          ) : null}

          {isManager && inbox.length > 0 ? (
            <Section title={`결재 대기 ${inbox.length}건`}>
              {inbox.map((leave) => (
                <LeaveRow key={leave.id} leave={leave} showApplicant>
                  <AppButton
                    label="반려"
                    variant="ghost"
                    style={styles.decision}
                    disabled={busyId != null}
                    onPress={() => confirmReject(leave)}
                  />
                  <AppButton
                    label="승인"
                    style={styles.decision}
                    loading={busyId === leave.id}
                    disabled={busyId != null && busyId !== leave.id}
                    onPress={() => approve(leave.id).catch(failed)}
                  />
                </LeaveRow>
              ))}
            </Section>
          ) : null}

          <Section title="내 신청">
            {loading && requests.length === 0 ? (
              <ActivityIndicator style={styles.placeholder} color={theme.inkMuted} />
            ) : requests.length === 0 ? (
              <ThemedText type="body" themeColor="inkMuted" style={styles.placeholder}>
                올해 신청한 휴가가 없습니다.
              </ThemedText>
            ) : (
              requests.map((leave) => {
                const cancellable = isCancellable(leave);
                return (
                  <LeaveRow
                    key={leave.id}
                    leave={leave}
                    onPress={cancellable && busyId == null ? () => confirmCancel(leave) : undefined}
                    accessibilityHint={cancellable ? '눌러서 신청을 취소합니다.' : undefined}
                  />
                );
              })
            )}
          </Section>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="label" themeColor="inkMuted" accessibilityRole="header">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.five,
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  masthead: {
    paddingBottom: Spacing.two,
  },
  section: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  decision: {
    flex: 1,
  },
  placeholder: {
    paddingVertical: Spacing.six,
    textAlign: 'center',
  },
});
