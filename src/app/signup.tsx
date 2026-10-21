import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SOCIAL_LABEL } from '@/api/auth';
import type { SocialProvider } from '@/api/types';
import { AppButton } from '@/components/app-button';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Curve, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

/** 서버의 가입 조건과 같다. */
const MIN_PASSWORD_LENGTH = 4;

type SignupParams = {
  /** 소셜 로그인에서 넘어오면 비밀번호 대신 이 계정을 연결해 가입한다. */
  socialToken?: string;
  provider?: SocialProvider;
  /** 제공자가 준 이름. 미리 채워 둔다. */
  name?: string;
};

export default function SignupScreen() {
  const { signup } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<SignupParams>();
  const social = params.socialToken && params.provider ? params.provider : null;
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState(params.name ?? '');
  const [employeeNo, setEmployeeNo] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const required = [companyName, name, employeeNo, department, position];
    if (required.some((value) => !value.trim()) || (!social && !password)) {
      setError('모든 항목을 입력해 주세요.');
      return;
    }
    // 소셜 계정으로 가입하면 비밀번호를 받지 않는다.
    if (!social && password.length < MIN_PASSWORD_LENGTH) {
      setError(`비밀번호는 ${MIN_PASSWORD_LENGTH}자 이상으로 정해 주세요.`);
      return;
    }
    if (!social && password !== passwordConfirm) {
      setError('비밀번호가 서로 다릅니다.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // 성공하면 세션이 생기면서 탭 화면으로 넘어간다.
      await signup({
        companyName,
        name,
        employeeNo,
        department,
        position,
        ...(social ? { socialToken: params.socialToken } : { password }),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '가입하지 못했습니다. 다시 시도해 주세요.');
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
              <ThemedText type="title">
                {social ? `${SOCIAL_LABEL[social]} 계정으로 가입` : '회원가입'}
              </ThemedText>
              <ThemedText type="body" themeColor="inkMuted">
                {social ? `처음 오셨네요. 회사와 사번을 알려 주세요. ` : null}
                처음 등록하는 회사명이면 회사가 만들어지고 관리자가 됩니다. 이미 등록된 회사명이면 그
                회사의 팀원으로 가입됩니다.
              </ThemedText>
            </View>

            <View style={styles.form}>
              <TextField
                label="회사명"
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="우리회사"
                autoCapitalize="none"
                autoComplete="organization"
                returnKeyType="next"
              />
              <TextField
                label="이름"
                value={name}
                onChangeText={setName}
                placeholder="홍길동"
                autoComplete="name"
                returnKeyType="next"
              />
              <TextField
                label="사번"
                value={employeeNo}
                onChangeText={setEmployeeNo}
                placeholder="1001"
                autoCapitalize="none"
                autoComplete="username"
                returnKeyType="next"
              />
              <TextField
                label="부서"
                value={department}
                onChangeText={setDepartment}
                placeholder="개발팀"
                returnKeyType="next"
              />
              <TextField
                label="직급"
                value={position}
                onChangeText={setPosition}
                placeholder="사원"
                returnKeyType={social ? 'done' : 'next'}
                onSubmitEditing={social ? handleSubmit : undefined}
              />
              {social ? null : (
                <>
                  <TextField
                    label="비밀번호"
                    value={password}
                    onChangeText={setPassword}
                    placeholder={`${MIN_PASSWORD_LENGTH}자 이상`}
                    secureTextEntry
                    autoComplete="new-password"
                    returnKeyType="next"
                  />
                  <TextField
                    label="비밀번호 확인"
                    value={passwordConfirm}
                    onChangeText={setPasswordConfirm}
                    placeholder="한 번 더 입력"
                    secureTextEntry
                    autoComplete="new-password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                </>
              )}

              {error ? (
                <View style={[styles.error, { backgroundColor: theme.warnSoft }]}>
                  <ThemedText type="label" themeColor="warn">
                    {error}
                  </ThemedText>
                </View>
              ) : null}
            </View>

            <View style={styles.footer}>
              <AppButton label="가입하기" onPress={handleSubmit} loading={submitting} />
              {social ? (
                <AppButton
                  label="이미 사번 계정이 있어요 · 연결하기"
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: '/login',
                      params: { socialToken: params.socialToken, provider: social },
                    })
                  }
                />
              ) : null}
              <AppButton label="로그인으로 돌아가기" variant="ghost" onPress={() => router.back()} />
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
  header: { gap: Spacing.two, alignItems: 'flex-start' },
  form: { gap: Spacing.four },
  footer: { gap: Spacing.four },
  error: {
    padding: Spacing.four,
    borderRadius: Radius.sm,
    borderCurve: Curve,
  },
});
