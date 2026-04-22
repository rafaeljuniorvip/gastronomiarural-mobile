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
import { BlurView } from 'expo-blur';
import { listPatrocinadores, type Patrocinador } from '../../services/patrocinador.service';
import { fonts } from '../../theme/fonts';

const ROTATE_INTERVAL_MS = 8000;
const FADE_DURATION_MS = 500;
const TIERS = ['diamante', 'ouro'];
const BANNER_HEIGHT = 130;
const MARQUEE_PIXELS_PER_SECOND = 45;
const MARQUEE_GAP = 60;
// Ken Burns lento no fundo + pulso discreto no logo
const KEN_BURNS_MS = 12000;
const PULSE_MS = 2400;

export default function PatronMasterBanner() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [index, setIndex] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  // Fundo (Ken Burns)
  const bgScale = useRef(new Animated.Value(1)).current;
  const bgPan = useRef(new Animated.Value(0)).current;
  // Foreground (pulso)
  const pulse = useRef(new Animated.Value(1)).current;
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

  // Animação: Ken Burns do fundo em loop contínuo
  useEffect(() => {
    const zoom = Animated.loop(
      Animated.sequence([
        Animated.timing(bgScale, { toValue: 1.35, duration: KEN_BURNS_MS, useNativeDriver: true }),
        Animated.timing(bgScale, { toValue: 1.1, duration: KEN_BURNS_MS, useNativeDriver: true }),
      ]),
    );
    const pan = Animated.loop(
      Animated.sequence([
        Animated.timing(bgPan, { toValue: 14, duration: KEN_BURNS_MS, useNativeDriver: true }),
        Animated.timing(bgPan, { toValue: -14, duration: KEN_BURNS_MS, useNativeDriver: true }),
      ]),
    );
    zoom.start();
    pan.start();
    return () => {
      zoom.stop();
      pan.stop();
    };
  }, [bgScale, bgPan]);

  // Pulso discreto no logo de frente
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: PULSE_MS, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: PULSE_MS, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [pulse]);

  // Rotação entre patrocinadores
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

  // Marquee horizontal (fallback quando não há logo)
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
      {/* Camada 1 — logo estourada no cover com Ken Burns (fica atrás e borrada) */}
      {hasLogo ? (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ scale: bgScale }, { translateX: bgPan }],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={{ uri: current.logo_url! }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            blurRadius={24}
          />
        </Animated.View>
      ) : null}

      {/* Camada 2 — blur mais forte (dá profundidade tipo vidro fosco) */}
      {hasLogo ? (
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} pointerEvents="none" />
      ) : null}

      {/* Camada 3 — overlay dourado semi-transparente pra manter identidade */}
      <View style={styles.tintOverlay} pointerEvents="none" />

      {/* Camada 4 — conteúdo nítido (label + logo + caption) */}
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
              <Animated.Image
                source={{ uri: current.logo_url! }}
                style={[styles.logo, { transform: [{ scale: pulse }] }]}
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
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(212, 168, 66, 0.45)',
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
    paddingTop: 22,
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
    height: 72,
    width: '82%',
    maxWidth: 340,
  },
  caption: {
    marginTop: 6,
    color: '#6B1E1E',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: fonts.bodyMedium,
    opacity: 0.8,
  },
});
