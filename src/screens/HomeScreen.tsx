import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>XVIII edição · 04–07 jun 2026</Text>
        <Text style={styles.heroTitle}>Festival de{'\n'}Gastronomia Rural</Text>
        <Text style={styles.heroSubtitle}>de Itapecerica · MG</Text>
      </View>

      <Card style={styles.card} onPress={() => nav.navigate('Barracas')}>
        <Card.Content style={styles.cardContent}>
          <Icon name="storefront-outline" size={36} color="#8B4513" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Barracas</Text>
            <Text style={styles.cardDesc}>Explore as barracas e cozinheiras tradicionais</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => nav.navigate('Pratos')}>
        <Card.Content style={styles.cardContent}>
          <Icon name="silverware-fork-knife" size={36} color="#8B4513" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Cardápio</Text>
            <Text style={styles.cardDesc}>70+ pratos típicos em fogão a lenha</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card} onPress={() => nav.navigate('Programacao')}>
        <Card.Content style={styles.cardContent}>
          <Icon name="calendar-music" size={36} color="#8B4513" />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Programação</Text>
            <Text style={styles.cardDesc}>Shows, oficinas e atrações dos 4 dias</Text>
          </View>
        </Card.Content>
      </Card>
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
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  heroTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', lineHeight: 32 },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, marginTop: 8 },
  card: { marginBottom: 12, backgroundColor: '#FFF' },
  cardContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#2B2B2B' },
  cardDesc: { fontSize: 13, color: '#6B6B6B', marginTop: 2 },
});
