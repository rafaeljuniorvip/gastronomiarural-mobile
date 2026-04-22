import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { listMapa, type MapaFeature } from '../services/mapa.service';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

type FilterKey = 'all' | 'barraca' | 'palco' | 'banheiro' | 'estacionamento' | 'posto_saude' | 'outros';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Tudo' },
  { key: 'barraca', label: 'Barracas' },
  { key: 'palco', label: 'Palcos' },
  { key: 'banheiro', label: 'Banheiros' },
  { key: 'estacionamento', label: 'Estacionamento' },
  { key: 'posto_saude', label: 'Saúde' },
  { key: 'outros', label: 'Outros' },
];

// Ícone (MaterialCommunityIcons) por subtype
const SUBTYPE_ICON: Record<string, keyof typeof Icon.glyphMap> = {
  barraca: 'store',
  palco: 'microphone-variant',
  banheiro: 'toilet',
  estacionamento: 'parking',
  posto_saude: 'hospital-building',
  caixa: 'cash',
  agua: 'water',
  entrada: 'gate',
  kids: 'teddy-bear',
};

// Rótulo legível por subtype
const SUBTYPE_LABEL: Record<string, string> = {
  barraca: 'Barraca',
  palco: 'Palco',
  banheiro: 'Banheiro',
  estacionamento: 'Estacionamento',
  posto_saude: 'Posto de saúde',
  caixa: 'Caixa / ATM',
  agua: 'Ponto de água',
  entrada: 'Entrada',
  kids: 'Área kids',
};

// Cor do chip por subtype (paleta festival)
const SUBTYPE_COLOR: Record<string, string> = {
  barraca: '#8B4513',
  palco: '#C65D2E',
  banheiro: '#4A90E2',
  estacionamento: '#6B6B6B',
  posto_saude: '#D32F2F',
  caixa: '#2E7D32',
  agua: '#0288D1',
  entrada: '#8B4513',
  kids: '#D4A017',
};

const OUTROS_KEYS = ['caixa', 'agua', 'entrada', 'kids'];

export default function MapaScreen() {
  const [features, setFeatures] = useState<MapaFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>('all');

  const load = useCallback(async () => {
    setError(null);
    try {
      setFeatures(await listMapa());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar o mapa');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'all') return features;
    if (filter === 'outros') return features.filter((f) => OUTROS_KEYS.includes(f.subtype));
    return features.filter((f) => f.subtype === filter);
  }, [features, filter]);

  const handleRoute = useCallback(async (f: MapaFeature) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}`;
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Erro', 'Não foi possível abrir o mapa.');
      return;
    }
    Linking.openURL(url);
  }, []);

  if (loading) return <Loading message="Carregando mapa..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      {/* Barra de filtros horizontal */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon="map-marker-off-outline"
          title="Nada aqui ainda"
          message="Não há pontos cadastrados para este filtro."
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const iconName = SUBTYPE_ICON[item.subtype] || 'map-marker';
            const label = SUBTYPE_LABEL[item.subtype] || item.subtype;
            const color = SUBTYPE_COLOR[item.subtype] || '#8B4513';
            const name = item.name || label;

            return (
              <View style={styles.card}>
                <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
                  <Icon name={iconName as any} size={24} color={color} />
                </View>

                <View style={styles.cardBody}>
                  <Text style={styles.cardName} numberOfLines={2}>
                    {name}
                  </Text>
                  <View style={styles.metaRow}>
                    <View style={[styles.typeChip, { backgroundColor: color }]}>
                      <Text style={styles.typeChipText}>{label}</Text>
                    </View>
                    <Text style={styles.coords} numberOfLines={1}>
                      {Number(item.lat).toFixed(5)}, {Number(item.lng).toFixed(5)}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.routeBtn}
                  onPress={() => handleRoute(item)}
                  activeOpacity={0.7}
                >
                  <Icon name="directions" size={16} color="#FFF" />
                  <Text style={styles.routeBtnText}>Rota</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  filterWrap: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D5',
  },
  filterRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    backgroundColor: '#FAF7F2',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  chipText: { fontSize: 13, color: '#6B6B6B', fontWeight: '500' },
  chipTextActive: { color: '#FFF', fontWeight: '700' },
  listContent: { padding: 16, paddingBottom: 32 },
  separator: { height: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 6 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#2B2B2B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeChipText: { fontSize: 10, fontWeight: '700', color: '#FFF', textTransform: 'uppercase' },
  coords: { fontSize: 11, color: '#6B6B6B', flexShrink: 1 },
  routeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C65D2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  routeBtnText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
});
