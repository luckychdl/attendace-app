/**
 * 디자인 토큰.
 *
 * 종이·괘선·도장을 쓰지 않는다. 화면은 문서가 아니라 살아 있는 면이다.
 * 테두리 대신 여백과 면, 강조는 전기 인디고 한 색으로만 준다.
 *
 * 근태 상태색(good/warn/muted)은 라이트·다크를 각각 따로 고른 값이다.
 * 뒤집어 쓰지 말 것 — 명도 대역과 색각 분리 검사를 모드별로 통과한 조합이다.
 */

import '@/global.css';

export const Colors = {
  light: {
    canvas: '#EFEFF3',
    surface: '#FFFFFF',
    ink: '#121218',
    inkMuted: '#6E6E7A',
    hairline: '#E3E3EA',
    accent: '#4B3BEB',
    accentSoft: '#E9E7FF',
    accentOn: '#FFFFFF',
    good: '#0A8457',
    goodSoft: '#DDF1E8',
    warn: '#B96A00',
    warnSoft: '#FBEEDA',
    muted: '#8E8E9C',
    mutedSoft: '#E5E5EC',
    /** 근무 구간 막대가 놓이는 예정 근무시간 트랙 */
    track: '#CBCBD9',
  },
  dark: {
    canvas: '#0D0D11',
    surface: '#18181F',
    ink: '#F3F3F7',
    inkMuted: '#8D8D9B',
    hairline: '#26262F',
    accent: '#7C6DFF',
    accentSoft: '#201C3D',
    accentOn: '#0D0D11',
    good: '#1EA96A',
    goodSoft: '#10291E',
    warn: '#C2870F',
    warnSoft: '#2C220E',
    muted: '#7A7A8A',
    mutedSoft: '#22222B',
    track: '#343441',
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
  xs: 8,
  sm: 12,
  md: 18,
  lg: 28,
  pill: 999,
} as const;

/** 터치 가능한 요소의 최소 한 변 길이(pt) */
export const TouchTarget = 44;

export const MaxContentWidth = 520;
