import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { USE_MOCK_API } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const theme = useTheme();
  const [employeeNo, setEmployeeNo] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!employeeNo.trim() || !password) {
      setError('사번과 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login({ employeeNo, password });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '사번 또는 비밀번호가 맞지 않습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View style={styles.header}>
              <ThemedText type="title">출근체크</ThemedText>
              <ThemedText type="body" themeColor="inkMuted">
                근무지에 도착하면 한 번, 나갈 때 한 번.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <TextField
                label="사번"
                value={employeeNo}
                onChangeText={setEmployeeNo}
                placeholder="1001"
                keyboardType="number-pad"
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
              />
              <TextField
                label="비밀번호"
                value={password}
                onChangeText={setPassword}
                placeholder="••••"
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {error ? (
                <View style={[styles.error, { backgroundColor: theme.warnSoft }]}>
                  <ThemedText type="label" themeColor="warn">
                    {error}
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <View style={styles.footer}>
              <AppButton label="로그인" onPress={handleSubmit} loading={submitting} />

              {USE_MOCK_API ? (
                <ThemedText type="caption" themeColor="inkMuted" style={styles.hint}>
                  데모 계정은 사번 1001, 1002, 2001 이고 비밀번호는 모두 1234 입니다.
                </ThemedText>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.six,
    padding: Spacing.five,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: { gap: Spacing.two },
  form: { gap: Spacing.four },
  footer: { gap: Spacing.four },
  error: {
    padding: Spacing.four,
    borderRadius: Radius.sm,
  },
  hint: { textAlign: 'center', lineHeight: 18 },
});
