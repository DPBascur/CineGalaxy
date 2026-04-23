import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Search, Settings } from 'lucide-react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ICONS: Record<string, any> = {
  index: Home,
  search: Search,
  settings: Settings,
};

const LABELS: Record<string, string> = {
  index: 'Home',
  search: 'Buscar',
  settings: 'Ajustes',
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: '#0d0d0d',
        borderTopWidth: 1,
        borderTopColor: 'rgba(139,92,246,0.3)',
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        paddingTop: 10,
        paddingHorizontal: 8,
        flexDirection: 'row',
      }}
    >
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        const label = LABELS[route.name] ?? route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                width: 48,
                height: 30,
                borderRadius: 15,
                backgroundColor: isFocused ? 'rgba(139,92,246,0.18)' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Icon
                color={isFocused ? '#8B5CF6' : '#555'}
                size={22}
                strokeWidth={isFocused ? 2.5 : 1.8}
              />
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: isFocused ? '#8B5CF6' : '#555',
              }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

