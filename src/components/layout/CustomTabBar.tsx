import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ScrollView,
  type LayoutChangeEvent,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts } from '../../theme/fonts';

interface TabConfig {
  icon: string;
  label: string;
  color: string;
}

// Mesma paleta-assinatura dos tiles da Home
const TAB_STYLES: Record<string, TabConfig> = {
  HomeTab: { icon: 'home-variant', label: 'Início', color: '#6B1E1E' },
  BarracasTab: { icon: 'storefront', label: 'Barracas', color: '#E5A56C' },
  PratosTab: { icon: 'silverware-fork-knife', label: 'Cardápio', color: '#E55934' },
  ReceitasTab: { icon: 'chef-hat', label: 'Receitas', color: '#D4A842' },
  MapaTab: { icon: 'map-marker-radius', label: 'Mapa', color: '#3E8691' },
  CuponsTab: { icon: 'ticket-percent', label: 'Cupons', color: '#D99A1F' },
  AccountTab: { icon: 'account-circle', label: 'Conta', color: '#8E5BA8' },
};

interface Measurement {
  x: number;
  width: number;
}

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [measurements, setMeasurements] = useState<Record<number, Measurement>>({});
  const scrollRef = useRef<ScrollView>(null);
  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;

  const activeRouteName = state.routes[state.index]?.name;
  const activeColor = TAB_STYLES[activeRouteName]?.color ?? '#6B1E1E';
  const currentMeasurement = measurements[state.index];

  // Desliza a pill até a posição do item ativo (spring suave)
  useEffect(() => {
    if (!currentMeasurement) return;
    Animated.parallel([
      Animated.spring(pillX, {
        toValue: currentMeasurement.x,
        useNativeDriver: false,
        tension: 90,
        friction: 13,
      }),
      Animated.spring(pillW, {
        toValue: currentMeasurement.width,
        useNativeDriver: false,
        tension: 90,
        friction: 13,
      }),
    ]).start();
  }, [currentMeasurement?.x, currentMeasurement?.width, pillX, pillW]);

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
    >
      <View style={styles.island}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Pill de fundo — fica ATRÁS dos itens e desliza entre eles */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.pill,
              {
                backgroundColor: activeColor,
                transform: [{ translateX: pillX }],
                width: pillW,
              },
            ]}
          />

          {state.routes.map((route, index) => {
            const tab = TAB_STYLES[route.name];
            if (!tab) return null;
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params as never);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <TouchableOpacity
                key={route.key}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                onLayout={(e: LayoutChangeEvent) => {
                  // Em alguns re-renders o RN dispara onLayout sem layout (null).
                  // Guard defensivo contra "Cannot read property 'layout' of null".
                  const layout = e?.nativeEvent?.layout;
                  if (!layout) return;
                  setMeasurements((prev) => {
                    const current = prev[index];
                    const next = { x: layout.x, width: layout.width };
                    if (current && current.x === next.x && current.width === next.width) {
                      return prev;
                    }
                    return { ...prev, [index]: next };
                  });
                }}
                style={styles.tab}
              >
                <Icon
                  name={tab.icon as any}
                  size={18}
                  color={isFocused ? '#FFF' : '#6B5B4A'}
                />
                <Text
                  style={[
                    styles.label,
                    { color: isFocused ? '#FFF' : '#6B5B4A' },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    // navbar flutuante: margem nas laterais e embaixo
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  island: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    alignItems: 'center',
    position: 'relative',
  },
  // Fundo colorido da tab ativa, sai deslizando de uma pra outra
  pill: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    borderRadius: 22,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    fontFamily: fonts.bodyBold,
  },
});
