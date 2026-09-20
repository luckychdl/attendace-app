import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { Worksite } from '@/api/types';
import { Card } from '@/components/card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { LocationState } from '@/hooks/use-location';
import { useTheme } from '@/hooks/use-theme';
import { formatDistance } from '@/lib/geo';

type LocationCardProps = {
  worksite: Worksite;
  location: LocationState;
  onRefresh: () => void;
};

export function LocationCard({ worksite, location, onRefresh }: LocationCardProps) {
  const theme = useTheme();

  const tone = location.isInside ? 'success' : location.error ? 'danger' : 'warning';
  const message = location.error
    ? location.error
    : location.distance == null
      ? '위치를 확인하는 중입니다.'
      : location.isInside
        ? `${worksite.name} 반경 안에 있습니다.`
        : `${worksite.name}에서 ${formatDistance(location.distance)} 떨어져 있습니다.`;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: theme[`${tone}Muted`] }]}>
          <Ionicons
            name={location.isInside ? 'location' : 'location-outline'}
            size={20}
            color={theme[tone]}
          />
        </View>
        <View style={styles.headerText}>
          <ThemedText type="smallBold">
            {location.isInside ? '체크 가능 지역' : '체크 가능 지역 밖'}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            허용 반경 {formatDistance(worksite.radiusMeters)}
          </ThemedText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="위치 다시 확인"
          onPress={onRefresh}
          disabled={location.loading}
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          {location.loading ? (
            <ActivityIndicator size="small" color={theme.textSecondary} />
          ) : (
            <Ionicons name="refresh" size={20} color={theme.textSecondary} />
          )}
        </Pressable>
      </View>

      <ThemedText type="small" style={{ color: theme[tone] }}>
        {message}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
});
