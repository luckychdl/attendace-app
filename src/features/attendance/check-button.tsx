import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SIZE = 216;

export type CheckButtonMode = 'checkIn' | 'checkOut' | 'done';

const MODE_CONFIG: Record<
  CheckButtonMode,
  { label: string; caption: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  checkIn: { label: '출근하기', caption: '탭하여 출근 체크', icon: 'log-in-outline' },
  checkOut: { label: '퇴근하기', caption: '탭하여 퇴근 체크', icon: 'log-out-outline' },
  done: { label: '오늘 근무 완료', caption: '수고하셨습니다', icon: 'checkmark-done-outline' },
};

type CheckButtonProps = {
  mode: CheckButtonMode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
};

export function CheckButton({ mode, onPress, disabled, loading }: CheckButtonProps) {
  const theme = useTheme();
  const config = MODE_CONFIG[mode];

  const isDone = mode === 'done';
  const isBlocked = disabled || loading || isDone;

  const background = isDone
    ? theme.successMuted
    : mode === 'checkOut'
      ? theme.warning
      : theme.primary;
  const foreground = isDone ? theme.success : theme.primaryText;

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    onPress();
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={config.label}
        accessibilityState={{ disabled: !!isBlocked, busy: !!loading }}
        disabled={isBlocked}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: background,
            opacity: disabled && !isDone ? 0.45 : pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          },
        ]}>
        {loading ? (
          <ActivityIndicator size="large" color={foreground} />
        ) : (
          <>
            <Ionicons name={config.icon} size={56} color={foreground} />
            <ThemedText type="subtitle" style={[styles.label, { color: foreground }]}>
              {config.label}
            </ThemedText>
          </>
        )}
      </Pressable>
      <ThemedText type="small" themeColor="textSecondary">
        {config.caption}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: Spacing.three,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  label: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
  },
});
