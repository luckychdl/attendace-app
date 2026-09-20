import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL, USE_MOCK_API } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
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
        Alert.alert('위치 권한 필요', '설정에서 위치 권한을 허용해 주세요.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await update({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      Alert.alert('근무지 변경', '현재 위치를 근무지 기준점으로 저장했습니다.');
    } catch {
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    } finally {
      setPinning(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('로그아웃', '로그아웃하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card>
            <ThemedText type="smallBold">내 정보</ThemedText>
            <InfoRow label="이름" value={employee.name} />
            <InfoRow label="사번" value={employee.employeeNo} />
            <InfoRow label="부서" value={employee.department} />
            <InfoRow label="직급" value={employee.position} />
          </Card>

          <Card>
            <ThemedText type="smallBold">근무지</ThemedText>
            <InfoRow label="사업장" value={worksite.name} />
            <InfoRow
              label="좌표"
              value={`${worksite.latitude.toFixed(5)}, ${worksite.longitude.toFixed(5)}`}
            />
            <InfoRow
              label="근무시간"
              value={`${String(worksite.startHour).padStart(2, '0')}:${String(worksite.startMinute).padStart(2, '0')} ~ ${String(worksite.endHour).padStart(2, '0')}:${String(worksite.endMinute).padStart(2, '0')}`}
            />

            <View style={styles.radiusBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                허용 반경
              </ThemedText>
              <View style={styles.radiusRow}>
                {RADIUS_OPTIONS.map((option) => {
                  const selected = worksite.radiusMeters === option;
                  return (
                    <Pressable
                      key={option}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => update({ radiusMeters: option })}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: selected ? theme.primary : theme.backgroundSelected,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={{ color: selected ? theme.primaryText : theme.text }}>
                        {formatDistance(option)}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <AppButton
              label="현재 위치를 근무지로 지정"
              variant="secondary"
              onPress={handlePinCurrentLocation}
              loading={pinning}
            />
          </Card>

          <Card>
            <ThemedText type="smallBold">서버 연동</ThemedText>
            <InfoRow label="모드" value={USE_MOCK_API ? '로컬(목 데이터)' : '실서버'} />
            <InfoRow label="API 주소" value={USE_MOCK_API ? '미설정' : API_BASE_URL} />
            <ThemedText type="small" themeColor="textSecondary">
              .env 의 EXPO_PUBLIC_API_BASE_URL 을 채우면 같은 화면이 실서버 데이터로 동작합니다.
            </ThemedText>
          </Card>

          <AppButton label="로그아웃" variant="danger" onPress={handleLogout} />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="small" style={styles.infoValue}>
        {value}
      </ThemedText>
    </View>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  infoValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
  radiusBlock: {
    gap: Spacing.two,
  },
  radiusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
});
