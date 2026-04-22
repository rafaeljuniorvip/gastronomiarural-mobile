import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { listPatrocinadores, type Patrocinador } from '../../services/patrocinador.service';

const TIERS = ['prata', 'bronze', 'apoio'];
// velocidade em pixels por segundo (devagar)
const SCROLL_SPEED_PX_PER_SEC = 30;

export default function PatronFooterTicker() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [contentWidth, setContentWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const mounted = useRef(true);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    mounted.current = true;
    listPatrocinadores({ tiers: TIERS })
      .then((items) => {
        if (!mounted.current) return;
        setPatrocinadores(items);
      })
      .catch(() => {
        /* silencioso */
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (contentWidth <= 0 || patrocinadores.length === 0) return;
    animationRef.current?.stop();
    translateX.setValue(0);
    const durationMs = (contentWidth / SCROLL_SPEED_PX_PER_SEC) * 1000;
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -contentWidth,
        duration: durationMs,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animationRef.current = anim;
    anim.start();
    return () => {
      anim.stop();
    };
  }, [contentWidth, patrocinadores.length, translateX]);

  if (patrocinadores.length === 0) return null;

  // duplicate para loop contínuo
  const loopItems = [...patrocinadores, ...patrocinadores];

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.track, { transform: [{ translateX }] }]}>
        {/* Primeira cópia: mede a largura */}
        <View
          style={styles.segment}
          onLayout={(e) => setContentWidth(e.nativeEvent.layout.width)}
        >
          {patrocinadores.map((p, idx) => (
            <TickerItem key={`a-${p.id}-${idx}`} name={p.name} isLast={idx === patrocinadores.length - 1} />
          ))}
        </View>
        {/* Segunda cópia para loop */}
        <View style={styles.segment}>
          {patrocinadores.map((p, idx) => (
            <TickerItem key={`b-${p.id}-${idx}`} name={p.name} isLast={idx === patrocinadores.length - 1} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

function TickerItem({ name, isLast }: { name: string; isLast: boolean }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemText} numberOfLines={1}>
        {name}
      </Text>
      {!isLast ? <Text style={styles.separator}>·</Text> : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: '#F2EBE0',
    overflow: 'hidden',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D8CEBD',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    color: '#8B4513',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  separator: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: '700',
    opacity: 0.5,
  },
  spacer: {
    width: 20,
  },
});
