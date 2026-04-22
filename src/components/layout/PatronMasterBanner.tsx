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
const BANNER_HEIGHT = 110;

function buildPlaceholderUrl(name: string): string {
  const text = encodeURIComponent((name || 'Patrocinador Oficial').toUpperCase());
  return `https://dummyimage.com/1200x220/6B1E1E/D4A842.png&text=${text}`;
}

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
  const imageUri = buildPlaceholderUrl(current.name);

  return (
    <TouchableOpacity
      activeOpacity={hasLink ? 0.85 : 1}
      disabled={!hasLink}
      onPress={handlePress}
      style={styles.container}
    >
      <Animated.View style={[styles.inner, { opacity }]}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PATROCINADOR OFICIAL</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    backgroundColor: '#6B1E1E',
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 10,
    backgroundColor: 'rgba(43, 26, 16, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    color: '#F5E6C8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontFamily: fonts.bodyMedium,
  },
});
