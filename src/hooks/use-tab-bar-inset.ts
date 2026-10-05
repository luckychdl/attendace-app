import { useBottomTabBarHeight } from 'expo-router/js-tabs';

import { Spacing } from '@/constants/theme';

/**
 * 탭 바는 화면 위에 떠서 내용이 그 아래로 지나간다.
 * 스크롤 끝이 탭 바에 가리지 않도록 콘텐츠 밑에 깔아 줄 여백을 돌려준다.
 */
export function useTabBarInset() {
  return useBottomTabBarHeight() + Spacing.four;
}
