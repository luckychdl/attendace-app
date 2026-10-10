import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { TabBarBackground } from '@/components/tab-bar-background';
import { Elevation, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { TAB_BAR_HEIGHT, useTabBarBottom } from '@/hooks/use-tab-bar-inset';
import { useTheme } from '@/hooks/use-theme';

const TABS = [
  { name: 'index', title: '오늘', icon: 'today' },
  { name: 'history', title: '기록', icon: 'stats-chart' },
  { name: 'leave', title: '휴가', icon: 'airplane' },
  { name: 'settings', title: '설정', icon: 'person' },
] as const;

/** 탭 한 칸이 차지하는 속 높이. 이보다 좁으면 글자 밑동이 잘린다. */
const ITEM_HEIGHT = 55;

export default function TabsLayout() {
  const theme = useTheme();
  const bottom = useTabBarBottom();
  const { width } = useWindowDimensions();
  // 넓은 화면에서는 캡슐이 본문 폭을 넘지 않고 가운데에 선다.
  const side = Math.max(Spacing.five, (width - (MaxContentWidth - Spacing.five * 2)) / 2);

  return (
    <Tabs
      // 캡슐이 스스로 바닥에서 떠 있으므로 탭 바가 안전영역을 한 번 더 더하지 않게 한다.
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.inkMuted,
        // 바닥에 붙은 띠가 아니라 떠 있는 캡슐. 바탕은 비우고 유리(또는 흰 면)를 tabBarBackground 가 깐다.
        tabBarStyle: {
          ...Elevation.high,
          position: 'absolute',
          bottom,
          marginHorizontal: side,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderRadius: Radius.pill,
          height: TAB_BAR_HEIGHT,
          // 탭 한 칸의 속 높이(여백 5 + 아이콘 28 + 간격 2 + 글자 15 + 여백 5)를 캡슐 한가운데에 세운다.
          paddingTop: (TAB_BAR_HEIGHT - ITEM_HEIGHT) / 2,
          paddingBottom: (TAB_BAR_HEIGHT - ITEM_HEIGHT) / 2,
          paddingHorizontal: Spacing.two,
        },
        tabBarBackground: () => <TabBarBackground />,
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: styles.label,
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            // 고른 탭은 아이콘이 속이 찬 모양으로 바뀌고 옅은 강조색 알약 위에 앉는다.
            tabBarIcon: ({ color, focused }) => (
              <View
                style={[
                  styles.slot,
                  focused ? { backgroundColor: theme.accentSoft } : null,
                ]}>
                <Ionicons
                  name={focused ? tab.icon : `${tab.icon}-outline`}
                  size={20}
                  color={color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 46,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 2,
  },
});
