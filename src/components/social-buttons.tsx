import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { SOCIAL_LABEL } from '@/api/auth';
import type { SocialProvider } from '@/api/types';
import { Curve, Radius, Spacing } from '@/constants/theme';

/**
 * 제공자마다 정해 둔 색. 앱 테마와 상관없이 각 사의 로그인 버튼 리소스를 따른다.
 *  - 카카오: developers.kakao.com/tool/resource/login
 *  - 네이버: 네이버 로그인 버튼 리소스 (NAVER_login_KR.zip) 의 아이콘형
 *  - 구글: Sign in with Google 브랜딩 리소스 (signin-assets.zip) 의 아이콘형 Light
 */
const BRAND: Record<SocialProvider, { background: string; mark: string; border?: string }> = {
  kakao: { background: '#FEE500', mark: '#191919' },
  naver: { background: '#03A94D', mark: '#FFFFFF' },
  google: { background: '#FFFFFF', mark: '#1F1F1F', border: '#747775' },
};

/** 한 줄에 네 개까지 들어가는 크기 */
const SIZE = 56;
const MARK = 24;

/** 구글 리소스에서 G 로고만 잘라 낸 것. 4색 그라데이션이라 벡터로 다시 그리지 않는다. */
const GOOGLE_G = require('@/assets/images/social/google-g.png');

function ProviderMark({ provider }: { provider: SocialProvider }) {
  const color = BRAND[provider].mark;
  switch (provider) {
    case 'kakao':
      // 카카오 로그인 버튼 리소스의 말풍선 심볼 경로 그대로
      return (
        <Svg width={MARK} height={MARK} viewBox="27.02 16.52 12.96 12.96">
          <Path
            fill={color}
            d="m33.501 16.5225c-3.5788 0-6.4785 2.4812-6.4785 5.5416 0 1.9671 1.1994 3.6955 3.0067 4.6782l-.6111 2.469c-.0227.0737-.0049.1527.0438.2071.0356.0386.0842.0596.1312.0596.0406 0 .0811-.014.1151-.0439l2.6258-1.9197c.3777.0579.7667.0895 1.1654.0895 3.5773 0 6.4786-2.4813 6.4786-5.5416s-2.8997-5.5398-6.477-5.5398z"
          />
        </Svg>
      );
    case 'naver':
      return (
        <Svg width={MARK * 0.75} height={MARK * 0.75} viewBox="0 0 24 24">
          <Path
            fill={color}
            d="M16.273 12.845 7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845Z"
          />
        </Svg>
      );
    case 'google':
      return <Image source={GOOGLE_G} style={styles.googleMark} contentFit="contain" />;
  }
}

type SocialButtonsProps = {
  providers: SocialProvider[];
  /** 진행 중인 제공자. 그동안 모든 버튼을 막는다. */
  pending: SocialProvider | null;
  onPress: (provider: SocialProvider) => void;
};

/** 정사각형 아이콘을 가로로 늘어놓는다. 글자가 없으니 이름은 접근성 라벨로만 붙인다. */
export function SocialButtons({ providers, pending, onPress }: SocialButtonsProps) {
  return (
    <View style={styles.row}>
      {providers.map((provider) => {
        const brand = BRAND[provider];
        const blocked = pending !== null;

        return (
          <Pressable
            key={provider}
            accessibilityRole="button"
            accessibilityLabel={`${SOCIAL_LABEL[provider]}로 계속하기`}
            accessibilityState={{ disabled: blocked, busy: pending === provider }}
            disabled={blocked}
            onPress={() => onPress(provider)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: brand.background,
                borderColor: brand.border ?? brand.background,
                opacity: blocked && pending !== provider ? 0.4 : 1,
                transform: [{ scale: pressed ? 0.94 : 1 }],
              },
            ]}>
            {pending === provider ? (
              <ActivityIndicator color={brand.mark} />
            ) : (
              <ProviderMark provider={provider} />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: Radius.md,
    borderCurve: Curve,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMark: { width: MARK, height: MARK },
});
