import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/**
 * 탭 바가 깔고 앉는 면. 화면 내용이 그 아래로 지나간다.
 *
 * 리퀴드 글래스를 쓸 수 있으면 유리를 깔아 내용이 비치게 하고,
 * 아니면 흰 면에 가는 선 하나로 바탕과 갈라 놓는다.
 */
export function TabBarBackground() {
  const theme = useTheme();

  if (isLiquidGlassAvailable()) {
    return <GlassView glassEffectStyle="regular" style={StyleSheet.absoluteFill} />;
  }

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.solid,
        { backgroundColor: theme.surface, borderTopColor: theme.hairline },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  solid: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
