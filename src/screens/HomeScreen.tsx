import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
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

  function handleSearch(text: string) {
    const term = text.trim();
    setQuery(text);
    if (term.length >= 2) {
      nav.navigate('Search', { initialQuery: term });
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>XVIII edição · 04–07 jun 2026</Text>
        <Text style={styles.heroTitle}>Festival de{'\n'}Gastronomia Rural</Text>
        <Text style={styles.heroSubtitle}>de Itapecerica · MG</Text>
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
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: fonts.bodyMedium,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    fontFamily: fonts.heading,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    marginTop: 8,
    fontFamily: fonts.headingRegular,
    fontStyle: 'italic',
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
