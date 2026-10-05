import { StyleSheet, View, type ViewProps } from 'react-native';

import { Curve, Elevation, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  /** 바탕에서 얼마나 띄울지. 목록 안은 low, 화면의 주인공은 mid. */
  lift?: keyof typeof Elevation;
  /** 안쪽 여백을 직접 잡고 싶을 때 끈다 (달력처럼 칸이 끝까지 차는 경우) */
  padded?: boolean;
  radius?: number;
};

/** 바탕 위에 얹힌 한 조각. 테두리가 아니라 그림자로 선다. */
export function Card({
  lift = 'low',
  padded = true,
  radius = Radius.md,
  style,
  ...rest
}: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        Elevation[lift],
        { backgroundColor: theme.surface, borderRadius: radius },
        padded && styles.padded,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderCurve: Curve,
  },
  padded: {
    padding: Spacing.four,
  },
});
