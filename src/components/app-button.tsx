import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'solid' | 'soft' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  variant = 'solid',
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const theme = useTheme();
  const isBlocked = disabled || loading;

  const background =
    variant === 'solid' ? theme.accent : variant === 'soft' ? theme.surface : 'transparent';
  const textColor = variant === 'solid' ? theme.accentOn : theme.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isBlocked, busy: !!loading }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          opacity: isBlocked ? 0.4 : 1,
          transform: [{ scale: pressed && !isBlocked ? 0.97 : 1 }],
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText type="heading" style={{ color: textColor }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TouchTarget + Spacing.two,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.three,
  },
});
