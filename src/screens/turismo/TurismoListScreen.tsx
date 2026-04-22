import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  listLocais,
  type LocalTurismo,
  type LocalTurismoType,
} from '../../services/turismo.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

type FilterValue = 'all' | LocalTurismoType;

interface FilterOption {
  value: FilterValue;
  label: string;
  icon: string;
}

const FILTERS: FilterOption[] = [
  { value: 'all', label: 'Tudo', icon: 'view-grid-outline' },
  { value: 'hotel', label: 'Hotéis', icon: 'bed' },
  { value: 'pousada', label: 'Pousadas', icon: 'home-variant-outline' },
  { value: 'restaurante', label: 'Restaurantes', icon: 'silverware-fork-knife' },
  { value: 'atracao', label: 'Atrações', icon: 'star-outline' },
  { value: 'cachoeira', label: 'Cachoeiras', icon: 'waves' },
  { value: 'igreja', label: 'Igrejas', icon: 'church' },
];

const TYPE_META: Record<LocalTurismoType, { label: string; color: string; icon: string }> = {
  hotel: { label: 'Hotel', color: '#1976D2', icon: 'bed' },
  pousada: { label: 'Pousada', color: '#8B4513', icon: 'home-variant' },
  restaurante: { label: 'Restaurante', color: '#C65D2E', icon: 'silverware-fork-knife' },
  atracao: { label: 'Atração', color: '#6A1B9A', icon: 'star' },
  cachoeira: { label: 'Cachoeira', color: '#00838F', icon: 'waves' },
  igreja: { label: 'Igreja', color: '#455A64', icon: 'church' },
  trilha: { label: 'Trilha', color: '#2E7D32', icon: 'hiking' },
  mercado: { label: 'Mercado', color: '#EF6C00', icon: 'storefront-outline' },
  servico: { label: 'Serviço', color: '#6B6B6B', icon: 'cog-outline' },
};

export default function TurismoListScreen() {
  const nav = useNavigation<any>();
  const [locais, setLocais] = useState<LocalTurismo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('all');

  const load = useCallback(async () => {
    setError(null);
    try {
      setLocais(await listLocais());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar locais');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtrados = useMemo(
    () => (filter === 'all' ? locais : locais.filter((l) => l.type === filter)),
    [locais, filter]
  );

  const destaques = useMemo(
    () => locais.filter((l) => l.featured).slice(0, 6),
    [locais]
  );

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (locais.length === 0) {
    return (
      <EmptyState
        icon="bed"
        title="Nenhum local cadastrado"
        message="Hospedagens e atrações de Itapecerica aparecerão aqui em breve."
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filtrados}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
      ListHeaderComponent={
        <>
          {destaques.length > 0 && filter === 'all' ? (
            <View style={styles.destaquesWrap}>
              <Text style={styles.destaquesTitle}>Em destaque</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.destaquesList}
              >
                {destaques.map((d) => {
                  const meta = TYPE_META[d.type];
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={styles.destaqueCard}
                      onPress={() => nav.navigate('LocalDetail', { localId: d.id })}
                    >
                      {d.cover_url ? (
                        <Image source={{ uri: d.cover_url }} style={styles.destaqueCover} />
                      ) : (
                        <View style={[styles.destaqueCover, styles.coverPlaceholder]}>
                          <Icon name={meta.icon as any} size={32} color="#C65D2E" />
                        </View>
                      )}
                      <View style={styles.destaqueBody}>
                        <View style={[styles.typeChip, { backgroundColor: meta.color }]}>
                          <Text style={styles.typeChipText}>{meta.label}</Text>
                        </View>
                        <Text style={styles.destaqueTitle} numberOfLines={2}>
                          {d.name}
                        </Text>
                        {d.price_range ? (
                          <Text style={styles.destaquePrice} numberOfLines={1}>
                            {d.price_range}
                          </Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTERS.map((f) => {
              const active = filter === f.value;
              return (
                <TouchableOpacity
                  key={f.value}
                  onPress={() => setFilter(f.value)}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                >
                  <Icon
                    name={f.icon as any}
                    size={14}
                    color={active ? '#FFF' : '#8B4513'}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      active && styles.filterChipTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      }
      renderItem={({ item, index }) => {
        const meta = TYPE_META[item.type];
        const dist =
          item.distance_km !== null && item.distance_km !== undefined
            ? `${Number(item.distance_km).toFixed(1)} km`
            : null;
        return (
          <Animated.View entering={FadeInDown.duration(400).delay(index * 40)}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => nav.navigate('LocalDetail', { localId: item.id })}
            >
              {item.cover_url ? (
                <Image source={{ uri: item.cover_url }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverPlaceholder]}>
                  <Icon name={meta.icon as any} size={40} color="#C65D2E" />
                </View>
              )}
              <View style={styles.body}>
                <View style={[styles.typeChip, { backgroundColor: meta.color }]}>
                  <Text style={styles.typeChipText}>{meta.label}</Text>
                </View>
                <Text style={styles.title} numberOfLines={2}>
                  {item.name}
                </Text>
                {item.address ? (
                  <View style={styles.metaRow}>
                    <Icon name="map-marker-outline" size={14} color="#6B6B6B" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.address}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.metaFooter}>
                  {dist ? (
                    <View style={styles.metaRow}>
                      <Icon name="walk" size={14} color="#6B6B6B" />
                      <Text style={styles.metaText}>{dist}</Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  {item.price_range ? (
                    <Text style={styles.price} numberOfLines={1}>
                      {item.price_range}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.openBtn}
                  onPress={() => nav.navigate('LocalDetail', { localId: item.id })}
                >
                  <Text style={styles.openBtnText}>Abrir</Text>
                  <Icon name="arrow-right" size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyFilter}>
          <Icon name="magnify" size={32} color="#C65D2E" />
          <Text style={styles.emptyFilterTitle}>
            Nenhum local nessa categoria ainda
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 12, paddingBottom: 32 },
  destaquesWrap: { marginBottom: 16 },
  destaquesTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#8B4513',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 2,
  },
  destaquesList: { gap: 10, paddingRight: 4 },
  destaqueCard: {
    width: 200,
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  destaqueCover: { width: '100%', height: 110, backgroundColor: '#FAF7F2' },
  destaqueBody: { padding: 10, gap: 6 },
  destaqueTitle: { fontSize: 14, fontWeight: '700', color: '#2B2B2B' },
  destaquePrice: { fontSize: 12, color: '#6B6B6B' },
  chipsRow: { gap: 8, paddingVertical: 4, paddingRight: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  filterChipActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#8B4513' },
  filterChipTextActive: { color: '#FFF' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  cover: { width: '100%', height: 160, backgroundColor: '#FAF7F2' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { padding: 14, gap: 6 },
  typeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  typeChipText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 17, fontWeight: '700', color: '#2B2B2B' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B6B6B', flexShrink: 1 },
  metaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  price: { fontSize: 13, fontWeight: '700', color: '#8B4513' },
  openBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B4513',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  openBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  emptyFilter: { alignItems: 'center', padding: 24, gap: 10 },
  emptyFilterTitle: { color: '#6B6B6B', fontSize: 14 },
});
