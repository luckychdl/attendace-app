import { Archivo_500Medium } from '@expo-google-fonts/archivo/500Medium';
import { Archivo_700Bold } from '@expo-google-fonts/archivo/700Bold';
import { Archivo_800ExtraBold } from '@expo-google-fonts/archivo/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';

import { Colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { WorksiteProvider } from '@/hooks/use-worksite';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // 숫자 전용 서체. 한글은 시스템 서체를 그대로 쓴다.
  const [fontsLoaded, fontError] = useFonts({
    Archivo_500Medium,
    Archivo_700Bold,
    Archivo_800ExtraBold,
  });

  // 내비게이션이 칠하는 배경까지 앱 토큰을 쓰게 해서 화면 전환 시 흰 배경이 번쩍이지 않게 한다.
  const navigationTheme = useMemo<Theme>(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    const palette = isDark ? Colors.dark : Colors.light;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.accent,
        background: palette.canvas,
        card: palette.surface,
        text: palette.ink,
        border: palette.hairline,
      },
    };
  }, [isDark]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <WorksiteProvider>
          <RootNavigator fontsReady={fontsLoaded || !!fontError} />
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
function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { status } = useAuth();
  const isAuthenticated = status === 'authenticated';
  const ready = fontsReady && status !== 'loading';

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  // 세션 복구와 서체 로딩이 끝날 때까지 스플래시를 유지한다.
  if (!ready) return null;

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
