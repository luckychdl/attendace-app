import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import type { Worksite } from '@/api/types';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, TouchTarget, type ToneColor } from '@/constants/theme';
import type { LocationState } from '@/hooks/use-location';
import { useTheme } from '@/hooks/use-theme';
import { formatDistance } from '@/lib/geo';

type PlacePillProps = {
  worksite: Worksite;
  location: LocationState;
  onRefresh: () => void;
};

/** 지금 찍을 수 있는 자리인지 한 줄로 답한다. */
export function PlacePill({ worksite, location, onRefresh }: PlacePillProps) {
  const theme = useTheme();
  const { tone, label, detail } = read(worksite, location);

  return (
    <View style={styles.row}>
      <StatusPill
        tone={tone}
        label={label}
        trailing={
          detail ? (
            <ThemedText type="dataSmall" style={{ color: theme[tone] }}>
              {detail}
            </ThemedText>
          ) : null
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="위치 다시 확인"
        accessibilityState={{ busy: location.loading }}
        onPress={onRefresh}
        disabled={location.loading}
        style={({ pressed }) => [
          styles.refresh,
          { backgroundColor: pressed ? theme.surface : 'transparent' },
        ]}>
        {location.loading ? (
          <ActivityIndicator size="small" color={theme.inkMuted} />
        ) : (
          <Ionicons name="refresh" size={17} color={theme.inkMuted} />
        )}
      </Pressable>
    </View>
  );
}

function read(
  worksite: Worksite,
  location: LocationState,
): { tone: ToneColor; label: string; detail: string | null } {
  if (location.error) return { tone: 'muted', label: '위치 확인 안 됨', detail: null };
  if (location.distance == null) return { tone: 'muted', label: '위치 확인 중', detail: null };
  if (location.isInside) {
    return { tone: 'good', label: worksite.name, detail: formatDistance(location.distance) };
  }
  return { tone: 'warn', label: '근무지 밖', detail: formatDistance(location.distance) };
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  refresh: {
    width: TouchTarget,
    height: TouchTarget,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -Spacing.three,
  },
});
