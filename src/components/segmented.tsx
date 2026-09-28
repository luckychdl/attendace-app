import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText, type TextType } from '@/components/themed-text';
import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SegmentedProps<T extends string | number> = {
  options: readonly { value: T; label: string; accessibilityLabel?: string }[];
  value: T;
  onChange: (value: T) => void;
  /** 숫자만 있는 칸은 dataSmall, 한글 칸은 label */
  textType?: TextType;
};

/** 한 줄짜리 세그먼트. 고른 칸만 강조색으로 채운다. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  textType = 'label',
}: SegmentedProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.segments, { backgroundColor: theme.mutedSoft }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              {
                backgroundColor: selected ? theme.accent : 'transparent',
                opacity: pressed && !selected ? 0.6 : 1,
              },
            ]}>
            <ThemedText
              type={textType}
              numberOfLines={1}
              style={{ color: selected ? theme.accentOn : theme.ink }}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
