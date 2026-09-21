import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import type { ThemeColor } from '@/constants/theme';

/** 숫자 뒤에 한글 단위를 붙여 짠다. 숫자는 Archivo, 단위는 시스템 서체. */
export function Figure({
  value,
  unit,
  size = 30,
  themeColor,
}: {
  value: string;
  unit?: string;
  size?: number;
  themeColor?: ThemeColor;
}) {
  return (
    <View style={styles.row}>
      <ThemedText
        type="figure"
        themeColor={themeColor}
        style={{ fontSize: size, lineHeight: size + 4 }}>
        {value}
      </ThemedText>
      {unit ? (
        <ThemedText type="label" themeColor="inkMuted" style={{ fontSize: Math.max(11, size * 0.4) }}>
          {unit}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
});
