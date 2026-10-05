import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Curve, Elevation, Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  /** solid 은 강조색 그라데이션, soft 는 떠 있는 흰 면, ghost 는 가는 테만 남는다. */
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
  const solid = variant === 'solid';
  const textColor = solid ? theme.accentOn : theme.ink;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isBlocked, busy: !!loading }}
      disabled={isBlocked}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        solid && !isBlocked ? Elevation.mid : null,
        variant === 'soft' ? [{ backgroundColor: theme.surface }, Elevation.low] : null,
        variant === 'ghost'
          ? { borderWidth: StyleSheet.hairlineWidth * 2, borderColor: theme.hairline }
          : null,
        {
          opacity: isBlocked ? 0.4 : 1,
          transform: [{ scale: pressed && !isBlocked ? 0.97 : 1 }],
        },
        style,
      ]}>
      {solid ? (
        <LinearGradient
          colors={[theme.accent, theme.accentTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, styles.gradient]}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText type="heading" numberOfLines={1} style={{ color: textColor }}>
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
    borderCurve: Curve,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  gradient: {
    borderRadius: Radius.md,
    borderCurve: Curve,
  },
});
