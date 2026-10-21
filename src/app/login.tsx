import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authApi, SOCIAL_LABEL } from '@/api/auth';
import { USE_MOCK_API } from '@/api/client';
import type { SocialProvider } from '@/api/types';
import { AppButton } from '@/components/app-button';
import { BrandMark } from '@/components/brand-mark';
import { SocialButtons } from '@/components/social-buttons';
import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { accentGlow, Curve, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { localStore } from '@/storage/local-store';

type LoginParams = {
  /** 가입 화면의 '기존 계정에 연결' 에서 넘어오면, 로그인하면서 이 소셜 계정을 연결한다. */
  socialToken?: string;
  provider?: SocialProvider;
};

export default function LoginScreen() {
  const { login, socialLogin } = useAuth();
  const { socialToken, provider: linkingProvider } = useLocalSearchParams<LoginParams>();
  const theme = useTheme();
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [employeeNo, setEmployeeNo] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<SocialProvider[]>([]);
  const [socialPending, setSocialPending] = useState<SocialProvider | null>(null);
  const linking = !!socialToken && !!linkingProvider;

  // 서버에 키가 설정된 제공자만 버튼을 보여 준다. 못 받아 오면 버튼 없이 사번 로그인만 둔다.
  useEffect(() => {
    if (linking) return;
    authApi
      .socialProviders()
      .then(setProviders)
      .catch(() => {});
  }, [linking]);

  // 지난번에 로그인한 회사명을 미리 채워 둔다. 그 사이 입력을 시작했으면 건드리지 않는다.
  useEffect(() => {
    if (USE_MOCK_API) return;
    localStore
      .getLastCompany()
      .then((last) => setCompanyName((current) => current || last))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if ((!USE_MOCK_API && !companyName.trim()) || !employeeNo.trim() || !password) {
      setError(
        USE_MOCK_API
          ? '사번과 비밀번호를 모두 입력해 주세요.'
          : '회사명, 사번, 비밀번호를 모두 입력해 주세요.',
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await login({
        companyName,
        employeeNo,
        password,
        socialToken: linking ? socialToken : undefined,
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '사번 또는 비밀번호가 맞지 않습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSocial = async (provider: SocialProvider) => {
    setSocialPending(provider);
    setError(null);
    try {
      const outcome = await socialLogin(provider);
      // 연결된 직원이 없으면 가입 화면에서 회사·사번을 받는다. 기존 사번 계정에 연결할 수도 있다.
      if (outcome.status === 'needsAccount') {
        router.push({
          pathname: '/signup',
          params: {
            socialToken: outcome.socialToken,
            provider: outcome.profile.provider,
            name: outcome.profile.name,
          },
        });
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : `${SOCIAL_LABEL[provider]} 로그인에 실패했습니다. 다시 시도해 주세요.`,
      );
    } finally {
      setSocialPending(null);
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
              <LinearGradient
                colors={[theme.accent, theme.accentTo]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.mark, accentGlow(theme.accent)]}>
                <BrandMark size={56} color={theme.accentOn} />
              </LinearGradient>
              <ThemedText type="title">오늘근무</ThemedText>
              <ThemedText type="body" themeColor="inkMuted">
                {linking
                  ? `기존 사번으로 로그인하면 ${SOCIAL_LABEL[linkingProvider]} 계정이 연결되어, 다음부터는 ${SOCIAL_LABEL[linkingProvider]}로 바로 들어올 수 있습니다.`
                  : '근무지에 도착하면 한 번, 나갈 때 한 번.'}
              </ThemedText>
            </View>

            <View style={styles.form}>
              {USE_MOCK_API ? null : (
                <TextField
                  label="회사명"
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="가입할 때 쓴 회사명"
                  autoCapitalize="none"
                  autoComplete="organization"
                  returnKeyType="next"
                />
              )}
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
              <AppButton
                label={linking ? '로그인하고 연결하기' : '로그인'}
                onPress={handleSubmit}
                loading={submitting}
                disabled={socialPending !== null}
              />

              {providers.length > 0 ? (
                <>
                  <View style={styles.divider}>
                    <View style={[styles.rule, { backgroundColor: theme.hairline }]} />
                    <ThemedText type="caption" themeColor="inkMuted">
                      또는
                    </ThemedText>
                    <View style={[styles.rule, { backgroundColor: theme.hairline }]} />
                  </View>
                  <SocialButtons
                    providers={providers}
                    pending={socialPending}
                    onPress={handleSocial}
                  />
                </>
              ) : null}

              {linking ? (
                <AppButton label="취소" variant="ghost" onPress={() => router.back()} />
              ) : USE_MOCK_API ? (
                <ThemedText type="caption" themeColor="inkMuted" style={styles.hint}>
                  데모 계정은 사번 1001, 1002, 2001 이고 비밀번호는 모두 1234 입니다.
                </ThemedText>
              ) : (
                <AppButton
                  label="회사 등록 · 회원가입"
                  variant="ghost"
                  onPress={() => router.push('/signup')}
                />
              )}
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
  /** 로고 한 조각. 체크 한 번이 이 앱이 하는 일 전부다. */
  mark: {
    width: 64,
    height: 64,
    borderRadius: Radius.md,
    borderCurve: Curve,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  form: { gap: Spacing.four },
  footer: { gap: Spacing.four },
  error: {
    padding: Spacing.four,
    borderRadius: Radius.sm,
    borderCurve: Curve,
  },
  hint: { textAlign: 'center', lineHeight: 18 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  rule: { flex: 1, height: StyleSheet.hairlineWidth * 2 },
});
