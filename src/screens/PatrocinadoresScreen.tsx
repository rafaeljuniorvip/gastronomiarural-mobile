import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { listPatrocinadores, type Patrocinador } from '../services/patrocinador.service';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import SearchBar from '../components/ui/SearchBar';

const TIER_ORDER = ['diamante', 'ouro', 'prata', 'bronze', 'apoio'];
const TIER_LABELS: Record<string, string> = {
  diamante: 'Diamante',
  ouro: 'Ouro',
  prata: 'Prata',
  bronze: 'Bronze',
  apoio: 'Apoio',
};
const TIER_COLORS: Record<string, string> = {
  diamante: '#4A90E2',
  ouro: '#D4A842',
  prata: '#8A8A8A',
  bronze: '#C84B1A',
  apoio: '#6B5B4A',
};

export default function PatrocinadoresScreen() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const filteredPatrocinadores = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patrocinadores;
    return patrocinadores.filter((p) => (p.name || '').toLowerCase().includes(term));
  }, [patrocinadores, search]);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPatrocinadores(await listPatrocinadores());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar patrocinadores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, Patrocinador[]>();
    for (const p of filteredPatrocinadores) {
      const tier = (p.tier || 'apoio').toLowerCase();
      if (!map.has(tier)) map.set(tier, []);
      map.get(tier)!.push(p);
    }
    // Ordena por TIER_ORDER, colocando desconhecidos no final
    const sortedTiers = [...map.keys()].sort((a, b) => {
      const ia = TIER_ORDER.indexOf(a);
      const ib = TIER_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return sortedTiers.map((tier) => ({ tier, items: map.get(tier) || [] }));
  }, [filteredPatrocinadores]);

  async function openLink(url: string | null) {
    if (!url) return;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Erro', 'Não foi possível abrir este link.');
      return;
    }
    Linking.openURL(url);
  }

  if (loading) return <Loading message="Carregando patrocinadores..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (patrocinadores.length === 0) {
    return (
      <EmptyState
        icon="handshake-outline"
        title="Em breve"
        message="Os patrocinadores da XVIII edição aparecerão aqui."
      />
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar patrocinador…"
      />
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <View style={styles.intro}>
        <Icon name="handshake" size={28} color="#6B1E1E" />
        <Text style={styles.introText}>
          O festival acontece graças ao apoio destas marcas que valorizam a cultura e a gastronomia rural de Minas.
        </Text>
      </View>

      {filteredPatrocinadores.length === 0 ? (
        <EmptyState
          icon="magnify-close"
          title="Nada encontrado"
          message={`Nenhum patrocinador bate com \"${search.trim()}\".`}
        />
      ) : null}

      {grouped.map(({ tier, items }) => (
        <View key={tier} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.tierDot, { backgroundColor: TIER_COLORS[tier] || '#6B1E1E' }]} />
            <Text style={styles.sectionTitle}>{TIER_LABELS[tier] || tier}</Text>
            <Text style={styles.sectionCount}>({items.length})</Text>
          </View>

          <View style={styles.grid}>
            {items.map((p, index) => (
              <Animated.View
                key={p.id}
                entering={FadeInDown.duration(400).delay(index * 40)}
                style={styles.cardWrap}
              >
                <TouchableOpacity
                  style={styles.card}
                  onPress={() => openLink(p.website_url)}
                  disabled={!p.website_url}
                  activeOpacity={p.website_url ? 0.7 : 1}
                >
                  {p.logo_url ? (
                    <Image source={{ uri: p.logo_url }} style={styles.logo} resizeMode="contain" />
                  ) : (
                    <View style={styles.logoPlaceholder}>
                      <Icon name="domain" size={32} color="#C84B1A" />
                    </View>
                  )}
                  <Text style={styles.cardName} numberOfLines={2}>{p.name}</Text>
                  {p.website_url ? (
                    <View style={styles.linkRow}>
                      <Icon name="open-in-new" size={11} color="#6B5B4A" />
                      <Text style={styles.linkText}>Site</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  content: { padding: 16, paddingBottom: 32 },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    marginBottom: 18,
  },
  introText: { flex: 1, fontSize: 13, color: '#2B1A10', lineHeight: 19 },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tierDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#6B1E1E', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'PlayfairDisplay_700Bold' },
  sectionCount: { fontSize: 12, color: '#6B5B4A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardWrap: { flexBasis: '48%', flexGrow: 1 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    alignItems: 'center',
  },
  logo: { width: '100%', height: 70, backgroundColor: '#FFF' },
  logoPlaceholder: { width: '100%', height: 70, alignItems: 'center', justifyContent: 'center' },
  cardName: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#2B1A10',
    textAlign: 'center',
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  linkText: { fontSize: 10, color: '#6B5B4A' },
});
