import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const HEIGHT = 340;

/**
 * 화면 머리에서 번져 내려오는 옅은 강조색. 바탕에 닿기 전에 다 사라진다.
 * 면이 아니라 빛이라서 누를 수 없고, 내용은 그 위를 그대로 지나간다.
 *
 * 다크 모드에만 깐다. 라이트 모드의 바탕은 아무것도 얹지 않은 흰색이다.
 */
export function ScreenWash() {
  const theme = useTheme();
  const scheme = useColorScheme();

  if (scheme !== 'dark') return null;

  return (
    <LinearGradient
      pointerEvents="none"
      colors={[theme.accentSoft, theme.canvas]}
      style={styles.wash}
    />
  );
}

const styles = StyleSheet.create({
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEIGHT,
  },
});
