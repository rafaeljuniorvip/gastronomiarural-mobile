import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import { listPatrocinadores, type Patrocinador } from '../../services/patrocinador.service';
import { fonts } from '../../theme/fonts';

const ROTATE_INTERVAL_MS = 6000;
const FADE_DURATION_MS = 400;
const TIERS = ['diamante', 'ouro'];

export default function PatronMasterBanner() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [index, setIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    listPatrocinadores({ tiers: TIERS })
      .then((items) => {
        if (!mounted.current) return;
        setPatrocinadores(items);
      })
      .catch(() => {
        /* silencioso: banner é ornamental */
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (patrocinadores.length <= 1) return;
    const id = setInterval(() => {
      // fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_DURATION_MS,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => (i + 1) % patrocinadores.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: FADE_DURATION_MS,
          useNativeDriver: true,
        }).start();
      });
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [patrocinadores.length, opacity]);

  if (patrocinadores.length === 0) return null;

  const current = patrocinadores[index];
  if (!current) return null;

  async function handlePress() {
    const url = current?.website_url;
    if (!url) return;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Erro', 'Não foi possível abrir este link.');
        return;
      }
      Linking.openURL(url);
    } catch {
      /* noop */
    }
  }

  const hasLink = !!current.website_url;

  return (
    <TouchableOpacity
      activeOpacity={hasLink ? 0.85 : 1}
      disabled={!hasLink}
      onPress={handlePress}
      style={styles.container}
    >
      <Animated.View style={[styles.inner, { opacity }]}>
        <View style={styles.leftColumn}>
          <Text style={styles.label}>Patrocinador oficial</Text>
          <Text style={styles.tier}>{formatTier(current.tier)}</Text>
        </View>
        <View style={styles.rightColumn}>
          {current.logo_url ? (
            <Image
              source={{ uri: current.logo_url }}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.fallbackName} numberOfLines={2}>
              {current.name}
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function formatTier(tier: string): string {
  const t = (tier || '').toLowerCase();
  if (t === 'diamante') return 'Diamante';
  if (t === 'ouro') return 'Ouro';
  return tier;
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: '#6B1E1E',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    color: '#F5E6C8',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: fonts.bodyMedium,
  },
  tier: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: fonts.bodyBold,
  },
  rightColumn: {
    flex: 2,
    height: '100%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logo: {
    width: '100%',
    height: 56,
  },
  fallbackName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'right',
    fontFamily: fonts.heading,
  },
});
