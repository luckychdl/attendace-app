import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { WorksiteProvider } from '@/hooks/use-worksite';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style="auto" />
      <AuthProvider>
        <WorksiteProvider>
          <RootNavigator />
        </WorksiteProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

/**
 * 세션 상태에 따라 로그인 화면과 탭 화면을 갈라준다.
 * Stack.Protected 가 guard 조건에 맞는 화면만 라우터에 노출하므로
 * 화면 쪽에서 별도의 리다이렉트 처리가 필요 없다.
 */
function RootNavigator() {
  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  // 세션 복구 중에는 스플래시를 유지한다.
  if (status === 'loading') return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}
