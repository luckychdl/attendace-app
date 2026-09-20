import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const theme = useTheme();

  const background =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? theme.dangerMuted
        : theme.backgroundSelected;
  const textColor =
    variant === 'primary' ? theme.primaryText : variant === 'danger' ? theme.danger : theme.text;

  const isBlocked = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isBlocked, busy: !!loading }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: isBlocked ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText type="default" style={[styles.label, { color: textColor }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  label: {
    fontWeight: '700',
  },
});
