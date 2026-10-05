/**
 * 디자인 토큰.
 *
 * 이 앱은 문서가 아니라 계기판이다. 시각과 반경, 두 개의 값을 읽는 장치.
 * 그래서 바탕은 차가운 청회색으로 깔고, 면은 그 위에 얹힌 물리적인 조각처럼
 * 아주 옅은 그림자로 띄운다. 괘선과 테두리는 쓰지 않는다.
 *
 * 강조는 전기 인디고 한 색과 그 짝(accentTo)으로만 준다. 둘을 이어 쓰면 그라데이션이 된다.
 *
 * 근태 상태색(good/warn/muted)은 라이트·다크를 각각 따로 고른 값이다.
 * 뒤집어 쓰지 말 것 — 명도 대역과 색각 분리 검사를 모드별로 통과한 조합이다.
 */

import type { ViewStyle } from 'react-native';

import '@/global.css';

export const Colors = {
  light: {
    canvas: '#EEF0F7',
    surface: '#FFFFFF',
    /** 눌러 들어간 면. 세그먼트 바탕과 눈금 트랙이 여기에 앉는다. */
    sunk: '#E4E7F0',
    ink: '#15171F',
    inkMuted: '#6B7080',
    hairline: '#E0E3ED',
    accent: '#3B30E8',
    /** accent 의 짝. 둘을 이어 그라데이션으로 쓴다. */
    accentTo: '#6E4BFF',
    accentSoft: '#E7E5FF',
    accentOn: '#FFFFFF',
    good: '#007F67',
    goodSoft: '#D6F2EA',
    warn: '#A85B00',
    warnSoft: '#FCEBD4',
    muted: '#878C9C',
    mutedSoft: '#E4E7F0',
    /** 근무 구간 막대가 놓이는 예정 근무시간 트랙 */
    track: '#C3C8D8',
  },
  dark: {
    canvas: '#0A0B10',
    surface: '#15171F',
    sunk: '#1D202A',
    ink: '#F2F3F8',
    inkMuted: '#8A90A3',
    hairline: '#262A36',
    accent: '#8478FF',
    accentTo: '#5C8CFF',
    accentSoft: '#1E1B3A',
    accentOn: '#0A0B10',
    good: '#2BB88A',
    goodSoft: '#0C2620',
    warn: '#D29128',
    warnSoft: '#2B2110',
    muted: '#777E91',
    mutedSoft: '#1D202A',
    track: '#343A4A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/** 근태 상태를 칠하는 색. `${tone}` 과 `${tone}Soft` 가 항상 쌍으로 있다. */
export type ToneColor = 'accent' | 'good' | 'warn' | 'muted';

/** 숫자 전용 서체. 한글은 시스템 서체를 그대로 쓴다. */
export const Figures = {
  medium: 'Archivo_500Medium',
  bold: 'Archivo_700Bold',
  heavy: 'Archivo_800ExtraBold',
} as const;

export const Spacing = {
  one: 4,
  two: 8,
  three: 12,
  four: 16,
  five: 24,
  six: 32,
  seven: 48,
} as const;

/** 모서리는 넉넉하게. 작은 칩일수록 덜 둥글다. */
export const Radius = {
  xs: 10,
  sm: 14,
  md: 20,
  lg: 26,
  xl: 34,
  pill: 999,
} as const;

/**
 * iOS 의 연속 곡률(스퀴클). 원호로 꺾이는 모서리보다 면이 매끄럽게 이어진다.
 * 둥근 면을 쓰는 곳에는 전부 같이 붙인다 — 안드로이드·웹에서는 무시된다.
 */
export const Curve = 'continuous' as const satisfies ViewStyle['borderCurve'];

/**
 * 면을 바탕에서 띄우는 그림자. 검정이 아니라 남청색으로 드리워 바탕의 청회색과 섞인다.
 * 다크 모드에서는 보이지 않지만 안드로이드 elevation 은 그대로 작동한다.
 */
export const Elevation = {
  /** 목록 안의 카드 */
  low: {
    shadowColor: '#171B3D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  /** 화면의 주인공 카드 */
  mid: {
    shadowColor: '#171B3D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 6,
  },
  /** 바탕 위를 떠다니는 것 — 탭 바, 주요 버튼 */
  high: {
    shadowColor: '#171B3D',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },
} as const satisfies Record<string, ViewStyle>;

/** 강조색 면이 바탕에 번지는 빛. 누를 수 있다는 걸 색으로 알린다. */
export function accentGlow(color: string): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  };
}

/** 터치 가능한 요소의 최소 한 변 길이(pt) */
export const TouchTarget = 44;

export const MaxContentWidth = 520;
