import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router/js-tabs';

import { useTheme } from '@/hooks/use-theme';

const TABS = [
  { name: 'index', title: '오늘', icon: 'today' },
  { name: 'history', title: '기록', icon: 'stats-chart' },
  { name: 'settings', title: '설정', icon: 'person' },
] as const;

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.inkMuted,
        tabBarStyle: {
          backgroundColor: theme.canvas,
          borderTopColor: theme.hairline,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? tab.icon : `${tab.icon}-outline`}
                size={size}
                color={color}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
