import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

// 웹에서는 소셜 로그인 팝업이 이 주소로 돌아온다. 결과를 연 창에 넘기고 팝업을 닫는다.
WebBrowser.maybeCompleteAuthSession();

/**
 * 소셜 로그인을 마친 브라우저가 돌아오는 주소 (onwork://oauth).
 * 결과는 openAuthSessionAsync 가 받아 처리하므로, 안드로이드에서 딥링크로 이 화면이 열리면 바로 닫는다.
 */
export default function OAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/login');
  }, [router]);

  return null;
}
