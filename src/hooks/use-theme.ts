/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme() {
  const scheme = useColorScheme();

  // 'unspecified' 와 (웹 하이드레이션 전의) null 을 모두 라이트로 떨어뜨린다.
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
