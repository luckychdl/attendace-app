import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { USE_MOCK_API } from '@/api/client';
import { AppButton } from '@/components/app-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [employeeNo, setEmployeeNo] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!employeeNo.trim() || !password) {
      setError('사번과 비밀번호를 입력해 주세요.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login({ employeeNo, password });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '로그인에 실패했습니다.');
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
            keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <ThemedText type="subtitle">출근체크</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                사번과 비밀번호로 로그인해 주세요.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <TextField
                label="사번"
                value={employeeNo}
                onChangeText={setEmployeeNo}
                placeholder="예) 1001"
                keyboardType="number-pad"
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
              />
              <TextField
                label="비밀번호"
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                secureTextEntry
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              {error ? (
                <ThemedText type="small" themeColor="danger">
                  {error}
                </ThemedText>
              ) : null}

              <AppButton label="로그인" onPress={handleSubmit} loading={submitting} />
            </View>

            {USE_MOCK_API ? (
              <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                데모 계정 · 사번 1001 / 1002 / 2001, 비밀번호 1234{'\n'}
                실서버 연동은 .env 의 EXPO_PUBLIC_API_BASE_URL 을 설정하세요.
              </ThemedText>
            ) : null}
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
    gap: Spacing.five,
    padding: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: { gap: Spacing.two },
  form: { gap: Spacing.three },
  hint: { textAlign: 'center', lineHeight: 20 },
});
