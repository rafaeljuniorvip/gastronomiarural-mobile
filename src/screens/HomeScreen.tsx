import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

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
    key: 'patrocinadores',
    icon: 'handshake-outline',
    title: 'Patrocinadores',
    desc: 'Quem apoia o Festival de Gastronomia Rural',
    route: 'Patrocinadores',
  },
];

export default function HomeScreen() {
  const nav = useNavigation<any>();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>XVIII edição · 04–07 jun 2026</Text>
        <Text style={styles.heroTitle}>Festival de{'\n'}Gastronomia Rural</Text>
        <Text style={styles.heroSubtitle}>de Itapecerica · MG</Text>
      </View>

      {CARDS.map((c) => (
        <Card key={c.key} style={styles.card} onPress={() => nav.navigate(c.route)}>
          <Card.Content style={styles.cardContent}>
            <Icon name={c.icon as any} size={36} color="#8B4513" />
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardDesc}>{c.desc}</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#6B6B6B" />
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 16 },
  hero: {
    backgroundColor: '#8B4513',
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
  },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', lineHeight: 32 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 8 },
  card: { marginBottom: 12, backgroundColor: '#FFF' },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#2B2B2B' },
  cardDesc: { fontSize: 13, color: '#6B6B6B', marginTop: 2 },
});
