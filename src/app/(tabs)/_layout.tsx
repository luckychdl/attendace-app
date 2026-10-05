import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TabBarBackground } from '@/components/tab-bar-background';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TABS = [
  { name: 'index', title: '오늘', icon: 'today' },
  { name: 'history', title: '기록', icon: 'stats-chart' },
  { name: 'leave', title: '휴가', icon: 'airplane' },
  { name: 'settings', title: '설정', icon: 'person' },
] as const;

/** 탭 바에서 안전영역을 뺀 실제 높이 */
const BAR_HEIGHT = 60;

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.inkMuted,
        // 바탕을 투명하게 비우고 유리(또는 흰 면)를 tabBarBackground 가 깐다.
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: BAR_HEIGHT + insets.bottom,
          paddingTop: Spacing.two,
          paddingBottom: insets.bottom,
        },
        tabBarBackground: () => <TabBarBackground />,
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
    fontWeight: '700',
    letterSpacing: -0.2,
    marginTop: 2,
  },
});
