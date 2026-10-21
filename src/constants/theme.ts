/**
 * 디자인 토큰.
 *
 * 이 앱은 문서가 아니라 계기판이다. 시각과 반경, 두 개의 값을 읽는 장치.
 * 그래서 바탕은 흰색으로 비우고, 면은 그 위에 얹힌 물리적인 조각처럼
 * 아주 옅은 그림자로 띄운다. 괘선과 테두리는 쓰지 않는다.
 *
 * 색은 흰색과 검은색, 그 사이의 무채색 회색만 쓴다. 강조는 라이트에서 검정, 다크에서 흰색이다.
 * accentTo 는 그라데이션 자리를 위해 남겨 두었지만 accent 와 같은 값이라 단색으로 보인다.
 *
 * 근태 상태색(good/warn/muted)은 라이트·다크를 각각 따로 고른 값이다.
 * 뒤집어 쓰지 말 것 — 명도 대역과 색각 분리 검사를 모드별로 통과한 조합이다.
 */

import type { ViewStyle } from 'react-native';

import '@/global.css';

export const Colors = {
  light: {
    canvas: '#FFFFFF',
    surface: '#FFFFFF',
    /** 눌러 들어간 면. 세그먼트 바탕과 눈금 트랙이 여기에 앉는다. */
    sunk: '#EDEDED',
    ink: '#111111',
    inkMuted: '#6B6B6B',
    hairline: '#E5E5E5',
    accent: '#111111',
    /** accent 의 짝. 그라데이션 자리에 쓰지만 지금은 같은 색이라 단색으로 칠해진다. */
    accentTo: '#111111',
    accentSoft: '#EFEFEF',
    accentOn: '#FFFFFF',
    good: '#007F67',
    goodSoft: '#D6F2EA',
    warn: '#A85B00',
    warnSoft: '#FCEBD4',
    muted: '#8A8A8A',
    mutedSoft: '#EDEDED',
    /** 근무 구간 막대가 놓이는 예정 근무시간 트랙 */
    track: '#C9C9C9',
  },
  dark: {
    canvas: '#0A0A0A',
    surface: '#161616',
    sunk: '#1F1F1F',
    ink: '#F2F2F2',
    inkMuted: '#8F8F8F',
    hairline: '#2A2A2A',
    accent: '#F2F2F2',
    accentTo: '#F2F2F2',
    accentSoft: '#222222',
    accentOn: '#0A0A0A',
    good: '#2BB88A',
    goodSoft: '#0C2620',
    warn: '#D29128',
    warnSoft: '#2B2110',
    muted: '#7A7A7A',
    mutedSoft: '#1F1F1F',
    track: '#3A3A3A',
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
 * 면을 바탕에서 띄우는 그림자. 무채색 바탕에 맞춰 검정으로 드리운다.
 * 다크 모드에서는 보이지 않지만 안드로이드 elevation 은 그대로 작동한다.
 */
export const Elevation = {
  /** 목록 안의 카드 */
  low: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  /** 화면의 주인공 카드 */
  mid: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 6,
  },
  /** 바탕 위를 떠다니는 것 — 탭 바, 주요 버튼 */
  high: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 12,
  },
} as const satisfies Record<string, ViewStyle>;

/** 강조색 면 아래에 드리우는 그림자. 누를 수 있다는 걸 알린다. 검정 면이라 색 번짐 대신 옅게 띄운다. */
export function accentGlow(color: string): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  };
}

/** 터치 가능한 요소의 최소 한 변 길이(pt) */
export const TouchTarget = 44;

export const MaxContentWidth = 520;
