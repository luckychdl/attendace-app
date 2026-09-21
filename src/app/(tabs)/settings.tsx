import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL, USE_MOCK_API } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { RADIUS_OPTIONS } from '@/constants/worksite';
import { useAuth, useEmployee } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { useWorksite } from '@/hooks/use-worksite';
import { formatDistance } from '@/lib/geo';

export default function SettingsScreen() {
  const employee = useEmployee();
  const { logout } = useAuth();
  const { worksite, update } = useWorksite();
  const theme = useTheme();
  const [pinning, setPinning] = useState(false);

  const handlePinCurrentLocation = async () => {
    setPinning(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert('위치 권한이 필요합니다', '설정에서 위치 접근을 허용해 주세요.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await update({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      Alert.alert('근무지를 옮겼습니다', '현재 위치를 근무지 기준점으로 저장했습니다.');
    } catch {
      Alert.alert('현재 위치를 가져오지 못했습니다', 'GPS 상태를 확인한 뒤 다시 시도해 주세요.');
    } finally {
      setPinning(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃할까요?', '다시 들어오려면 사번과 비밀번호가 필요합니다.', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.identity}>
            <ThemedText type="title">{employee.name}</ThemedText>
            <ThemedText type="body" themeColor="inkMuted">
              {employee.department} {employee.position}
            </ThemedText>
          </View>

          <Group title="내 정보">
            <Row label="사번" value={employee.employeeNo} mono />
            <Row label="부서" value={employee.department} />
            <Row label="직급" value={employee.position} />
          </Group>

          <Group title="근무지">
            <Row label="사업장" value={worksite.name} />
            <Row
              label="좌표"
              value={`${worksite.latitude.toFixed(5)}, ${worksite.longitude.toFixed(5)}`}
              mono
            />
            <Row
              label="근무시간"
              value={`${pad(worksite.startHour)}:${pad(worksite.startMinute)} – ${pad(worksite.endHour)}:${pad(worksite.endMinute)}`}
              mono
            />
          </Group>

          <View style={styles.radiusBlock}>
            <ThemedText type="label" themeColor="inkMuted">
              허용 반경
            </ThemedText>
            <View style={[styles.segments, { backgroundColor: theme.mutedSoft }]}>
              {RADIUS_OPTIONS.map((option) => {
                const selected = worksite.radiusMeters === option;
                return (
                  <Pressable
                    key={option}
                    accessibilityRole="button"
                    accessibilityLabel={`허용 반경 ${formatDistance(option)}`}
                    accessibilityState={{ selected }}
                    onPress={() => update({ radiusMeters: option })}
                    style={({ pressed }) => [
                      styles.segment,
                      {
                        backgroundColor: selected ? theme.accent : 'transparent',
                        opacity: pressed && !selected ? 0.6 : 1,
                      },
                    ]}>
                    <ThemedText
                      type="dataSmall"
                      numberOfLines={1}
                      style={{ color: selected ? theme.accentOn : theme.ink }}>
                      {formatDistance(option)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <AppButton
            label="현재 위치를 근무지로 지정"
            variant="soft"
            onPress={handlePinCurrentLocation}
            loading={pinning}
          />

          <Group title="서버 연동">
            <Row label="모드" value={USE_MOCK_API ? '로컬 목 데이터' : '실서버'} />
            <Row label="API 주소" value={USE_MOCK_API ? '미설정' : API_BASE_URL} mono />
          </Group>
          <ThemedText type="caption" themeColor="inkMuted">
            .env 의 EXPO_PUBLIC_API_BASE_URL 을 채우면 같은 화면이 실서버 데이터로 동작합니다.
          </ThemedText>

          <AppButton label="로그아웃" variant="ghost" onPress={handleLogout} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View style={styles.group}>
      <ThemedText type="label" themeColor="inkMuted">
        {title}
      </ThemedText>
      <View style={[styles.groupBody, { backgroundColor: theme.surface }]}>{children}</View>
    </View>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.row}>
      <ThemedText type="body" themeColor="inkMuted">
        {label}
      </ThemedText>
      <ThemedText type={mono ? 'dataSmall' : 'body'} style={styles.rowValue}>
        {value}
      </ThemedText>
    </View>
  );
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    padding: Spacing.five,
    paddingBottom: Spacing.seven,
    gap: Spacing.five,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  identity: {
    gap: Spacing.one,
    paddingBottom: Spacing.two,
  },
  group: {
    gap: Spacing.two,
  },
  groupBody: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
    minHeight: 48,
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
  },
  radiusBlock: {
    gap: Spacing.two,
  },
  /** 반경은 한 줄짜리 세그먼트. 고른 칸만 강조색으로 채운다. */
  segments: {
    flexDirection: 'row',
    borderRadius: Radius.sm,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    minHeight: TouchTarget - Spacing.two,
    paddingHorizontal: Spacing.one,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
