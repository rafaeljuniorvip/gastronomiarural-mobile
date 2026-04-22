import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Animated, Easing } from 'react-native';
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
  {
    key: 'barracas',
    icon: 'storefront-outline',
    title: 'Barracas',
    desc: 'Explore as barracas e cozinheiras tradicionais',
    route: 'Barracas',
  },
  {
    key: 'pratos',
    icon: 'silverware-fork-knife',
    title: 'Cardápio',
    desc: '70+ pratos típicos em fogão a lenha',
    route: 'Pratos',
  },
  {
    key: 'receitas',
    icon: 'chef-hat',
    title: 'Receitas',
    desc: 'Receitas tradicionais da cozinha rural mineira',
    route: 'Receitas',
  },
  {
    key: 'programacao',
    icon: 'calendar-music',
    title: 'Programação',
    desc: 'Shows, apresentações e atrações dos 4 dias',
    route: 'Programacao',
  },
  {
    key: 'oficinas',
    icon: 'school-outline',
    title: 'Oficinas',
    desc: 'Inscreva-se em oficinas culinárias com vagas limitadas',
    route: 'Oficinas',
  },
  {
    key: 'pessoas',
    icon: 'account-group-outline',
    title: 'Pessoas',
    desc: 'Cozinheiras, artistas, artesãos e produtores',
    route: 'Pessoas',
  },
  {
    key: 'turismo',
    icon: 'bed-outline',
    title: 'Hospedagem e turismo',
    desc: 'Hotéis, pousadas e atrações de Itapecerica',
    route: 'Turismo',
  },
  {
    key: 'timeline',
    icon: 'history',
    title: 'História do festival',
    desc: '18 edições de sabores e tradição',
    route: 'Timeline',
  },
  {
    key: 'faq',
    icon: 'help-circle-outline',
    title: 'Dúvidas frequentes',
    desc: 'Horários, regras, acessibilidade e mais',
    route: 'Faq',
  },
  {
    key: 'notificacoes',
    icon: 'bell-outline',
    title: 'Notificações',
    desc: 'Alertas da organização e preferências',
    route: 'Notificacoes',
  },
  {
    key: 'patrocinadores',
    icon: 'handshake-outline',
    title: 'Patrocinadores',
    desc: 'Quem apoia o Festival de Gastronomia Rural',
    route: 'Patrocinadores',
  },
];

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const [query, setQuery] = useState('');
  // Brilho diagonal (shimmer) percorrendo o hero
  const shimmer = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 3800,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(1600),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [shimmer]);

  function handleSearch(text: string) {
    const term = text.trim();
    setQuery(text);
    if (term.length >= 2) {
      nav.navigate('Search', { initialQuery: term });
    }
  }

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-280, 600],
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        {/* brilho diagonal animado sobre o fundo */}
        <Animated.View
          pointerEvents="none"
          style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }, { rotate: '18deg' }] }]}
        />

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
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>70+</Text>
            <Text style={styles.heroStatLabel}>pratos</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>4</Text>
            <Text style={styles.heroStatLabel}>dias</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatNum}>18ª</Text>
            <Text style={styles.heroStatLabel}>edição</Text>
          </View>
        </View>
      </View>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(212, 168, 66, 0.55)',
  },
  // brilho diagonal animado que atravessa o card
  shimmer: {
    position: 'absolute',
    top: -80,
    left: 0,
    width: 120,
    height: 300,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    transform: [{ rotate: '18deg' }],
  },
  heroBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
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
  heroStat: {
    alignItems: 'center',
    flex: 1,
  },
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
