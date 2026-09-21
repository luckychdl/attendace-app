import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, TouchTarget } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TextFieldProps = TextInputProps & {
  label: string;
};

/** 테두리 대신 면으로 서는 입력칸. 포커스가 가면 강조색 링이 생긴다. */
export function TextField({ label, style, onFocus, onBlur, ...rest }: TextFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <ThemedText type="label" themeColor="inkMuted">
        {label}
      </ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.inkMuted}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            color: theme.ink,
            backgroundColor: theme.surface,
            borderColor: focused ? theme.accent : 'transparent',
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  input: {
    minHeight: TouchTarget + Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 2,
    paddingHorizontal: Spacing.four,
    fontSize: 17,
    fontWeight: '600',
  },
});
