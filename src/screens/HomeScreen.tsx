import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Card } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import SearchBar from '../components/ui/SearchBar';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface CardAction {
  key: string;
  icon: string;
  title: string;
  desc: string;
  route: string;
}

const CARDS: CardAction[] = [
  { key: 'barracas', icon: 'storefront-outline', title: 'Barracas', desc: 'Explore as barracas e cozinheiras tradicionais', route: 'Barracas' },
  { key: 'pratos', icon: 'silverware-fork-knife', title: 'Cardápio', desc: '70+ pratos típicos em fogão a lenha', route: 'Pratos' },
  { key: 'receitas', icon: 'chef-hat', title: 'Receitas', desc: 'Receitas tradicionais da cozinha rural mineira', route: 'Receitas' },
  { key: 'programacao', icon: 'calendar-music', title: 'Programação', desc: 'Shows, apresentações e atrações dos 4 dias', route: 'Programacao' },
  { key: 'oficinas', icon: 'school-outline', title: 'Oficinas', desc: 'Inscreva-se em oficinas culinárias com vagas limitadas', route: 'Oficinas' },
  { key: 'pessoas', icon: 'account-group-outline', title: 'Pessoas', desc: 'Cozinheiras, artistas, artesãos e produtores', route: 'Pessoas' },
  { key: 'turismo', icon: 'bed-outline', title: 'Hospedagem e turismo', desc: 'Hotéis, pousadas e atrações de Itapecerica', route: 'Turismo' },
  { key: 'timeline', icon: 'history', title: 'História do festival', desc: '18 edições de sabores e tradição', route: 'Timeline' },
  { key: 'faq', icon: 'help-circle-outline', title: 'Dúvidas frequentes', desc: 'Horários, regras, acessibilidade e mais', route: 'Faq' },
  { key: 'notificacoes', icon: 'bell-outline', title: 'Notificações', desc: 'Alertas da organização e preferências', route: 'Notificacoes' },
  { key: 'patrocinadores', icon: 'handshake-outline', title: 'Patrocinadores', desc: 'Quem apoia o Festival de Gastronomia Rural', route: 'Patrocinadores' },
];

// Festival começa: 04/06/2026 00:00 -03:00 (horário oficial)
const FESTIVAL_START = new Date('2026-06-04T00:00:00-03:00');

function daysUntilFestival(): number {
  const now = Date.now();
  const diff = FESTIVAL_START.getTime() - now;
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

type SlideKey = 'identity' | 'countdown' | 'cta_oficinas' | 'legacy';

const SLIDE_ORDER: SlideKey[] = ['identity', 'countdown', 'cta_oficinas', 'legacy'];
const SLIDE_INTERVAL_MS = 5500;
const SLIDE_FADE_MS = 450;

function HeroCarousel({ onPressOficinas }: { onPressOficinas: () => void }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  // Brilho diagonal que percorre o hero em loop
  const shimmer = useRef(new Animated.Value(-1)).current;
  const days = useMemo(() => daysUntilFestival(), []);

  // Shimmer
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(1400),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  // Cross-fade entre slides
  useEffect(() => {
    const id = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: SLIDE_FADE_MS,
        useNativeDriver: true,
      }).start(() => {
        setSlideIdx((i) => (i + 1) % SLIDE_ORDER.length);
        Animated.timing(opacity, {
          toValue: 1,
          duration: SLIDE_FADE_MS,
          useNativeDriver: true,
        }).start();
      });
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [opacity]);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-280, 600],
  });

  const current = SLIDE_ORDER[slideIdx];

  return (
    <View style={styles.hero}>
      {/* Shimmer diagonal animado — presente em todos os slides */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          { transform: [{ translateX: shimmerTranslate }, { rotate: '18deg' }] },
        ]}
      />

      <Animated.View style={[styles.slide, { opacity }]}>
        {current === 'identity' ? <SlideIdentity /> : null}
        {current === 'countdown' ? <SlideCountdown days={days} /> : null}
        {current === 'cta_oficinas' ? <SlideCtaOficinas onPress={onPressOficinas} /> : null}
        {current === 'legacy' ? <SlideLegacy /> : null}
      </Animated.View>

      {/* Indicadores no rodapé do hero */}
      <View style={styles.dots}>
        {SLIDE_ORDER.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === slideIdx ? styles.dotActive : styles.dotIdle]}
          />
        ))}
      </View>
    </View>
  );
}

// === Slides ===

function SlideIdentity() {
  return (
    <>
      <View style={styles.heroBadges}>
        <View style={styles.heroBadge}>
          <Icon name="calendar-star" size={12} color="#F5E6C8" />
          <Text style={styles.heroBadgeText}>XVIII EDIÇÃO</Text>
        </View>
        <View style={styles.heroBadgeAlt}>
          <Text style={styles.heroBadgeAltText}>04–07 JUN 2026</Text>
        </View>
      </View>
      <Text style={styles.heroTitle}>Gastronomia Rural</Text>
      <View style={styles.heroDivider} />
      <Text style={styles.heroSubtitle}>Itapecerica · Minas Gerais</Text>
      <View style={styles.heroStats}>
        <StatItem num="70+" label="pratos" />
        <View style={styles.heroStatDivider} />
        <StatItem num="4" label="dias" />
        <View style={styles.heroStatDivider} />
        <StatItem num="18ª" label="edição" />
      </View>
    </>
  );
}

function SlideCountdown({ days }: { days: number }) {
  return (
    <View style={styles.centeredSlide}>
      <View style={styles.heroBadge}>
        <Icon name="fire" size={12} color="#F5E6C8" />
        <Text style={styles.heroBadgeText}>CONTAGEM REGRESSIVA</Text>
      </View>
      <View style={styles.countdownWrap}>
        <Text style={styles.countdownNum}>{days}</Text>
        <Text style={styles.countdownUnit}>{days === 1 ? 'DIA' : 'DIAS'}</Text>
      </View>
      <Text style={styles.heroSubtitle}>até o festival começar</Text>
      <Text style={styles.countdownDate}>04 a 07 de junho · quinta a domingo</Text>
    </View>
  );
}

function SlideCtaOficinas({ onPress }: { onPress: () => void }) {
  return (
    <View style={styles.centeredSlide}>
      <Icon name="school" size={34} color="#D4A842" style={{ marginBottom: 8 }} />
      <Text style={styles.ctaTitle}>Oficinas{'\n'}culinárias</Text>
      <Text style={styles.ctaSubtitle}>30 vagas por turma · inscrições abertas</Text>
      <TouchableOpacity style={styles.ctaButton} onPress={onPress} activeOpacity={0.85}>
        <Text style={styles.ctaButtonText}>RESERVAR VAGA</Text>
        <Icon name="arrow-right" size={14} color="#6B1E1E" />
      </TouchableOpacity>
    </View>
  );
}

function SlideLegacy() {
  return (
    <View style={styles.centeredSlide}>
      <View style={styles.heroBadge}>
        <Icon name="trophy-variant" size={12} color="#F5E6C8" />
        <Text style={styles.heroBadgeText}>LEGADO</Text>
      </View>
      <View style={styles.countdownWrap}>
        <Text style={styles.countdownNum}>80k</Text>
      </View>
      <Text style={styles.heroSubtitle}>visitantes na última edição</Text>
      <Text style={styles.countdownDate}>Prêmio Cumbucca · 17 anos de tradição</Text>
    </View>
  );
}

function StatItem({ num, label }: { num: string; label: string }) {
  return (
    <View style={styles.heroStat}>
      <Text style={styles.heroStatNum}>{num}</Text>
      <Text style={styles.heroStatLabel}>{label}</Text>
    </View>
  );
}

// === Tela principal ===

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const [query, setQuery] = useState('');

  function handleSearch(text: string) {
    const term = text.trim();
    setQuery(text);
    if (term.length >= 2) {
      nav.navigate('Search', { initialQuery: term });
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentNoHero}>
      {/* Hero é full-bleed: sem padding lateral/topo do scroll */}
      <HeroCarousel onPressOficinas={() => nav.navigate('Oficinas')} />

      <View style={styles.listPadding}>
        <SearchBar
          value={query}
          onChange={handleSearch}
          placeholder="Buscar barracas, pratos, receitas…"
          debounceMs={400}
          containerStyle={styles.searchBar}
        />

        {CARDS.map((c) => (
          <Card key={c.key} style={styles.card} onPress={() => nav.navigate(c.route)}>
            <Card.Content style={styles.cardContent}>
              <Icon name={c.icon as any} size={36} color="#6B1E1E" />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardDesc}>{c.desc}</Text>
              </View>
              <Icon name="chevron-right" size={22} color="#6B5B4A" />
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  contentNoHero: { paddingBottom: 16 },
  listPadding: { paddingHorizontal: 16, paddingTop: 16 },
  hero: {
    backgroundColor: colors.primary,
    // full-bleed: sem borderRadius, sem margem — encosta no topo e nas laterais
    paddingTop: 28,
    paddingBottom: 34,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
    // linha dourada só na base, pra separar do conteúdo abaixo
    borderBottomWidth: 2,
    borderBottomColor: '#D4A842',
    minHeight: 260,
  },
  slide: {
    flex: 1,
  },
  centeredSlide: {
    alignItems: 'center',
  },
  shimmer: {
    position: 'absolute',
    top: -80,
    left: 0,
    width: 120,
    height: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
  },
  // Slide Identity
  heroBadges: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D4A842',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#F5E6C8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: fonts.bodyBold,
  },
  heroBadgeAlt: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(245, 230, 200, 0.6)',
  },
  heroBadgeAltText: {
    color: 'rgba(245, 230, 200, 0.95)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    fontFamily: fonts.bodyMedium,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '700',
    lineHeight: 42,
    fontFamily: fonts.heading,
    letterSpacing: 0.3,
  },
  heroDivider: {
    height: 2,
    width: 48,
    backgroundColor: '#D4A842',
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 2,
  },
  heroSubtitle: {
    color: 'rgba(245, 230, 200, 0.95)',
    fontSize: 14,
    fontFamily: fonts.headingRegular,
    fontStyle: 'italic',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245, 230, 200, 0.25)',
  },
  heroStat: { alignItems: 'center', flex: 1 },
  heroStatNum: {
    color: '#D4A842',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: fonts.heading,
    letterSpacing: 0.5,
  },
  heroStatLabel: {
    color: 'rgba(245, 230, 200, 0.8)',
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: fonts.bodyMedium,
  },
  heroStatDivider: {
    width: StyleSheet.hairlineWidth,
    height: 28,
    backgroundColor: 'rgba(245, 230, 200, 0.3)',
  },
  // Slide Countdown
  countdownWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 14,
    marginBottom: 6,
  },
  countdownNum: {
    color: '#D4A842',
    fontSize: 72,
    lineHeight: 76,
    fontWeight: '900',
    fontFamily: fonts.heading,
    letterSpacing: -1,
  },
  countdownUnit: {
    color: '#F5E6C8',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
    fontFamily: fonts.bodyBold,
  },
  countdownDate: {
    color: 'rgba(245, 230, 200, 0.7)',
    fontSize: 11,
    marginTop: 10,
    letterSpacing: 0.6,
    fontFamily: fonts.bodyMedium,
    textAlign: 'center',
  },
  // Slide CTA
  ctaTitle: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
    textAlign: 'center',
    fontFamily: fonts.heading,
  },
  ctaSubtitle: {
    color: 'rgba(245, 230, 200, 0.9)',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.body,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D4A842',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 16,
  },
  ctaButtonText: {
    color: '#6B1E1E',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    fontFamily: fonts.bodyBold,
  },
  // Indicadores
  dots: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { height: 4, borderRadius: 2 },
  dotActive: { width: 18, backgroundColor: '#D4A842' },
  dotIdle: { width: 6, backgroundColor: 'rgba(245, 230, 200, 0.4)' },
  // Cards
  searchBar: { marginHorizontal: 0, marginBottom: 12, marginTop: 0 },
  card: { marginBottom: 12, backgroundColor: colors.surface },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    fontFamily: fonts.heading,
  },
  cardDesc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    fontFamily: fonts.body,
  },
});
