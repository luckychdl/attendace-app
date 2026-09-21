import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, type ToneColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type StatusPillProps = {
  tone: ToneColor;
  label: string;
  /** 오른쪽에 덧붙는 보조 값. 숫자라면 호출부에서 data 타입으로 넘긴다. */
  trailing?: React.ReactNode;
};

/** 상태를 한 덩어리로 보여 주는 알약. 색만으로 뜻을 전하지 않도록 항상 글자를 같이 둔다. */
export function StatusPill({ tone, label, trailing }: StatusPillProps) {
  const theme = useTheme();

  return (
    <View style={[styles.pill, { backgroundColor: theme[`${tone}Soft`] }]}>
      <View style={[styles.dot, { backgroundColor: theme[tone] }]} />
      <ThemedText type="label" style={{ color: theme[tone] }}>
        {label}
      </ThemedText>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: Radius.pill,
  },
});
