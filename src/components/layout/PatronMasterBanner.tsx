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
  type LayoutChangeEvent,
} from 'react-native';
import { listPatrocinadores, type Patrocinador } from '../../services/patrocinador.service';
import { fonts } from '../../theme/fonts';

const ROTATE_INTERVAL_MS = 8000;
const FADE_DURATION_MS = 400;
const TIERS = ['diamante', 'ouro'];
const BANNER_HEIGHT = 110;
const MARQUEE_PIXELS_PER_SECOND = 45;
const MARQUEE_GAP = 60;
const LOGO_HEIGHT = 60;

export default function PatronMasterBanner() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [index, setIndex] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
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

  // marquee: anima translateX de 0 até -(textWidth+GAP) em loop,
  // só quando o texto for maior que o container
  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);
    if (!textWidth || !containerWidth) return;
    if (textWidth <= containerWidth) return;
    const distance = textWidth + MARQUEE_GAP;
    const duration = (distance / MARQUEE_PIXELS_PER_SECOND) * 1000;
    Animated.loop(
      Animated.timing(translateX, {
        toValue: -distance,
        duration,
        useNativeDriver: true,
      }),
    ).start();
  }, [textWidth, containerWidth, index, translateX]);

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
  const nameUpper = current.name.toUpperCase();
  const hasLogo = !!current.logo_url;
  const needsMarquee = !hasLogo && textWidth > containerWidth && textWidth > 0;

  return (
    <TouchableOpacity
      activeOpacity={hasLink ? 0.85 : 1}
      disabled={!hasLink}
      onPress={handlePress}
      style={styles.container}
    >
      <Animated.View style={[styles.inner, { opacity }]}>
        <View style={styles.label}>
          <Text style={styles.labelText}>PATROCINADOR OFICIAL</Text>
        </View>
        <View
          style={styles.contentWrap}
          onLayout={(e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {hasLogo ? (
            <>
              <Image
                source={{ uri: current.logo_url! }}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.caption} numberOfLines={1}>
                {nameUpper}
              </Text>
            </>
          ) : needsMarquee ? (
            <Animated.View
              style={[styles.marqueeRow, { transform: [{ translateX }] }]}
              pointerEvents="none"
            >
              <Text
                style={styles.name}
                onLayout={(e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width)}
              >
                {nameUpper}
              </Text>
              <View style={{ width: MARQUEE_GAP }} />
              <Text style={styles.name}>{nameUpper}</Text>
            </Animated.View>
          ) : (
            <Text
              style={[styles.name, styles.nameCentered]}
              numberOfLines={1}
              adjustsFontSizeToFit
              onLayout={(e: LayoutChangeEvent) => setTextWidth(e.nativeEvent.layout.width)}
            >
              {nameUpper}
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    backgroundColor: '#D4A842',
    width: '100%',
    overflow: 'hidden',
    borderBottomWidth: 3,
    borderBottomColor: '#6B1E1E',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
  },
  label: {
    position: 'absolute',
    top: 8,
    left: 12,
    backgroundColor: '#6B1E1E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2,
  },
  labelText: {
    color: '#F5E6C8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: fonts.bodyMedium,
  },
  contentWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  marqueeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    color: '#6B1E1E',
    fontSize: 32,
    fontFamily: fonts.heading,
    letterSpacing: 1.2,
  },
  nameCentered: {
    textAlign: 'center',
  },
  logo: {
    height: LOGO_HEIGHT,
    width: '80%',
    maxWidth: 320,
  },
  caption: {
    marginTop: 4,
    color: '#6B1E1E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: fonts.bodyMedium,
    opacity: 0.75,
  },
});
