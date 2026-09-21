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
    fontSize: 84,
    lineHeight: 88,
    letterSpacing: -4,
  },
  figure: {
    fontFamily: Figures.bold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -1,
  },
  data: {
    fontFamily: Figures.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  dataSmall: {
    fontFamily: Figures.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  heading: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});
