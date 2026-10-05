import { StyleSheet, Text, type TextProps } from 'react-native';

import { Figures, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** 숫자는 Archivo, 한글은 시스템 서체. 타입이 곧 역할이다. */
export type TextType =
  | 'hero'
  | 'figure'
  | 'data'
  | 'dataSmall'
  | 'title'
  | 'heading'
  | 'body'
  | 'label'
  | 'caption';

export type ThemedTextProps = TextProps & {
  type?: TextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'body', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[styles[type], { color: theme[themeColor ?? 'ink'] }, style]} {...rest} />;
}

const styles = StyleSheet.create({
  /** 화면에 하나뿐인 숫자. 크게, 무겁게, 자간을 바짝 조인다. */
  hero: {
    fontFamily: Figures.heavy,
    fontSize: 88,
    lineHeight: 90,
    letterSpacing: -4.5,
  },
  figure: {
    fontFamily: Figures.bold,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -1.2,
  },
  data: {
    fontFamily: Figures.medium,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  dataSmall: {
    fontFamily: Figures.medium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  title: {
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.9,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
