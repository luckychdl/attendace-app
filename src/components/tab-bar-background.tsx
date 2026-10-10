import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { StyleSheet, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * 탭 바가 깔고 앉는 면. 화면 내용이 그 아래로 지나간다.
 *
 * 리퀴드 글래스를 쓸 수 있으면 유리를 깔아 내용이 비치게 하고,
 * 아니면 흰 캡슐을 깐다. 바탕과는 탭 바의 그림자가 갈라 놓는다.
 */
export function TabBarBackground() {
  const theme = useTheme();

  if (isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" style={[StyleSheet.absoluteFill, styles.capsule]} />
    );
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.capsule,
        styles.solid,
        { backgroundColor: theme.surface, borderColor: theme.hairline },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  capsule: {
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  /** 다크 모드에서는 그림자가 보이지 않아 가는 테가 캡슐의 윤곽을 맡는다. */
  solid: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
