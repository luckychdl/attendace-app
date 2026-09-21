import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** 끝까지 눌러야 하는 시간(ms). 실수로 찍히는 걸 막되 답답하지 않을 만큼만. */
const HOLD_MS = 620;

type HoldButtonProps = {
  label: string;
  onComplete: () => void;
  disabled?: boolean;
  disabledLabel?: string;
  loading?: boolean;
};

/**
 * 꾹 눌러 확정하는 버튼. 누르는 동안 강조색이 좌에서 우로 차오르고,
 * 끝까지 차면 동작이 일어난다. 손을 떼면 되감긴다.
 *
 * 글자는 두 벌을 겹쳐 두고 위쪽 벌을 차오르는 면과 함께 잘라 낸다.
 * 그래야 배경이 지나간 만큼만 글자색이 바뀐다.
 *
 * 동작 최소화 설정이 켜져 있으면 길게 누르기를 요구하지 않고 한 번 탭으로 받는다.
 */
export function HoldButton({
  label,
  onComplete,
  disabled,
  disabledLabel,
  loading,
}: HoldButtonProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const [width, setWidth] = useState(0);

  const isBlocked = !!disabled || !!loading;
  const hint = reduceMotion ? '눌러서 기록' : '꾹 누르고 계세요';
  const body = disabled ? (disabledLabel ?? label) : label;

  const fire = useCallback(() => {
    progress.set(0);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    onComplete();
  }, [onComplete, progress]);

  const handlePressIn = useCallback(() => {
    if (isBlocked || reduceMotion) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    progress.set(
      withTiming(1, { duration: HOLD_MS, easing: Easing.linear }, (finished) => {
        'worklet';
        if (finished) runOnJS(fire)();
      }),
    );
  }, [fire, isBlocked, progress, reduceMotion]);

  const handlePressOut = useCallback(() => {
    if (reduceMotion) return;
    cancelAnimation(progress);
    progress.set(withTiming(0, { duration: 180 }));
  }, [progress, reduceMotion]);

  const fillStyle = useAnimatedStyle(() => ({ width: progress.get() * width }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={body}
      accessibilityHint={reduceMotion ? undefined : '끝까지 누르고 있으면 기록됩니다.'}
      accessibilityState={{ disabled: isBlocked, busy: !!loading }}
      disabled={isBlocked}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={reduceMotion && !isBlocked ? fire : undefined}
      style={[styles.button, { backgroundColor: disabled ? theme.mutedSoft : theme.accentSoft }]}>
      {loading ? (
        <View style={styles.content}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : (
        <>
          <Face
            label={body}
            hint={disabled ? null : hint}
            width={width}
            color={disabled ? theme.inkMuted : theme.accent}
            hintColor={theme.inkMuted}
          />

          {!disabled ? (
            <Animated.View
              style={[styles.fill, { backgroundColor: theme.accent }, fillStyle]}
              pointerEvents="none">
              <Face
                label={body}
                hint={hint}
                width={width}
                color={theme.accentOn}
                hintColor={theme.accentOn}
              />
            </Animated.View>
          ) : null}
        </>
      )}
    </Pressable>
  );
}

/** 버튼 글자 한 벌. 차오르는 면 안에 같은 벌을 한 번 더 깔아 잘라 쓴다. */
function Face({
  label,
  hint,
  width,
  color,
  hintColor,
}: {
  label: string;
  hint: string | null;
  width: number;
  color: string;
  hintColor: string;
}) {
  return (
    <View style={[styles.content, width ? { width } : null]} pointerEvents="none">
      <ThemedText type="heading" style={{ color }}>
        {label}
      </ThemedText>
      {hint ? (
        <ThemedText type="caption" style={{ color: hintColor }}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: TouchTarget + Spacing.five,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
  },
});
