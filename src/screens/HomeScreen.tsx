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
  // Paleta própria de cada card — saindo do monocromático bordô
  bg: string;
  iconBg: string;
  iconColor: string;
  accent: string;
}

const CARDS: CardAction[] = [
  {
    key: 'barracas', icon: 'storefront', title: 'Barracas',
    desc: 'Cozinheiras tradicionais e fogão a lenha',
    route: 'Barracas',
    bg: '#F4E4D4', iconBg: '#E5A56C', iconColor: '#FFF', accent: '#A05B20',
  },
  {
    key: 'pratos', icon: 'silverware-fork-knife', title: 'Cardápio',
    desc: '70+ pratos típicos',
    route: 'Pratos',
    bg: '#FDE2DC', iconBg: '#E55934', iconColor: '#FFF', accent: '#B2381A',
  },
  {
    key: 'receitas', icon: 'chef-hat', title: 'Receitas',
    desc: 'Saberes da cozinha rural',
    route: 'Receitas',
    bg: '#FAEDBB', iconBg: '#D4A842', iconColor: '#FFF', accent: '#8F6F1D',
  },
  {
    key: 'programacao', icon: 'calendar-music', title: 'Programação',
    desc: 'Shows e atrações dos 4 dias',
    route: 'Programacao',
    bg: '#E8DCF0', iconBg: '#8E5BA8', iconColor: '#FFF', accent: '#5E3877',
  },
  {
    key: 'oficinas', icon: 'school', title: 'Oficinas',
    desc: 'Aulas culinárias · 30 vagas',
    route: 'Oficinas',
    bg: '#D7E8D9', iconBg: '#5D8B5F', iconColor: '#FFF', accent: '#315B34',
  },
  {
    key: 'pessoas', icon: 'account-group', title: 'Pessoas',
    desc: 'Cozinheiras, artistas e artesãos',
    route: 'Pessoas',
    bg: '#F8D7C6', iconBg: '#C25C2C', iconColor: '#FFF', accent: '#8A3C1A',
  },
  {
    key: 'mapa_home', icon: 'map-marker-radius', title: 'Mapa',
    desc: 'Localização das atrações',
    route: 'MapaTab',
    bg: '#D1E6EA', iconBg: '#3E8691', iconColor: '#FFF', accent: '#245863',
  },
  {
    key: 'turismo', icon: 'bed', title: 'Hospedagem',
    desc: 'Hotéis, pousadas e pontos turísticos',
    route: 'Turismo',
    bg: '#E1EED9', iconBg: '#6E9145', iconColor: '#FFF', accent: '#436124',
  },
  {
    key: 'cupons_home', icon: 'ticket-percent', title: 'Cupons',
    desc: 'Descontos dos patrocinadores',
    route: 'CuponsTab',
    bg: '#FBE6B8', iconBg: '#D99A1F', iconColor: '#FFF', accent: '#8F651B',
  },
  {
    key: 'timeline', icon: 'history', title: 'História',
    desc: '18 edições de tradição',
    route: 'Timeline',
    bg: '#EDE0C8', iconBg: '#7A5A2E', iconColor: '#FFF', accent: '#4A3619',
  },
  {
    key: 'faq', icon: 'help-circle', title: 'Dúvidas',
    desc: 'Horários, regras e acessibilidade',
    route: 'Faq',
    bg: '#DCE3F0', iconBg: '#4E6FA6', iconColor: '#FFF', accent: '#2B4273',
  },
  {
    key: 'notificacoes', icon: 'bell-ring', title: 'Notificações',
    desc: 'Alertas e preferências',
    route: 'Notificacoes',
    bg: '#FAD9D9', iconBg: '#C84B4B', iconColor: '#FFF', accent: '#8A2727',
  },
  {
    key: 'patrocinadores', icon: 'handshake', title: 'Patrocinadores',
    desc: 'Quem torna o festival possível',
    route: 'Patrocinadores',
    bg: '#F3E5C0', iconBg: '#B39030', iconColor: '#FFF', accent: '#6B5410',
  },
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

        <View style={styles.grid}>
          {CARDS.map((c) => (
            <TouchableOpacity
              key={c.key}
              activeOpacity={0.85}
              onPress={() => nav.navigate(c.route as never)}
              style={[styles.tile, { backgroundColor: c.bg }]}
            >
              <View style={[styles.tileIconWrap, { backgroundColor: c.iconBg }]}>
                <Icon name={c.icon as any} size={22} color={c.iconColor} />
              </View>
              <Text style={[styles.tileTitle, { color: c.accent }]} numberOfLines={1}>
                {c.title}
              </Text>
              <Text style={styles.tileDesc} numberOfLines={2}>
                {c.desc}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    paddingTop: 18,
    paddingBottom: 26,
    paddingHorizontal: 22,
    overflow: 'hidden',
    position: 'relative',
    // linha dourada só na base, pra separar do conteúdo abaixo
    borderBottomWidth: 2,
    borderBottomColor: '#D4A842',
    minHeight: 195,
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
    fontSize: 30,
    fontWeight: '700',
    lineHeight: 34,
    fontFamily: fonts.heading,
    letterSpacing: 0.3,
  },
  heroDivider: {
    height: 2,
    width: 40,
    backgroundColor: '#D4A842',
    marginTop: 6,
    marginBottom: 6,
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
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(245, 230, 200, 0.25)',
  },
  heroStat: { alignItems: 'center', flex: 1 },
  heroStatNum: {
    color: '#D4A842',
    fontSize: 20,
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
    marginTop: 8,
    marginBottom: 4,
  },
  countdownNum: {
    color: '#D4A842',
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '900',
    fontFamily: fonts.heading,
    letterSpacing: -1,
  },
  countdownUnit: {
    color: '#F5E6C8',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
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
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 30,
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
  // Grid de tiles coloridos
  searchBar: { marginHorizontal: 0, marginBottom: 12, marginTop: 0 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tile: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    minHeight: 116,
    justifyContent: 'flex-start',
  },
  tileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: fonts.heading,
    letterSpacing: 0.2,
  },
  tileDesc: {
    fontSize: 11,
    marginTop: 2,
    color: 'rgba(60, 40, 25, 0.7)',
    lineHeight: 14,
    fontFamily: fonts.body,
  },
});
