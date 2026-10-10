import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';

/** 떠 있는 탭 바 캡슐의 높이 */
export const TAB_BAR_HEIGHT = 66;

/** 탭 바 캡슐이 화면 바닥에서 떨어져 있는 거리. 홈 인디케이터가 없는 기기에서도 바닥에 붙지 않는다. */
export function useTabBarBottom() {
  return Math.max(useSafeAreaInsets().bottom, Spacing.three);
}

/**
 * 탭 바는 화면 위에 떠서 내용이 그 아래로 지나간다.
 * 스크롤 끝이 탭 바에 가리지 않도록 콘텐츠 밑에 깔아 줄 여백을 돌려준다.
 */
export function useTabBarInset() {
  return TAB_BAR_HEIGHT + useTabBarBottom() + Spacing.four;
}
