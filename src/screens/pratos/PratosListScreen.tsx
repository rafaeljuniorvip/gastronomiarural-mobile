import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, RefreshControl, Image, View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listPratos, type Prato } from '../../services/prato.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import CategoryChips from '../../components/ui/CategoryChips';
import GroupModeSelector, { type GroupMode } from '../../components/ui/GroupModeSelector';
import SearchBar from '../../components/ui/SearchBar';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'carnes', label: 'Carnes' },
  { value: 'aves', label: 'Aves' },
  { value: 'mineirices', label: 'Mineirices' },
  { value: 'peixes', label: 'Peixes' },
  { value: 'quitandas', label: 'Doces' },
  { value: 'bebidas', label: 'Bebidas' },
];

const CATEGORY_LABELS: Record<string, string> = {
  carnes: 'Carnes',
  aves: 'Aves',
  mineirices: 'Mineirices',
  peixes: 'Peixes',
  quitandas: 'Doces',
  bebidas: 'Bebidas',
};

function categoryLabel(value: string): string {
  if (!value) return 'Outros';
  return CATEGORY_LABELS[value] || (value.charAt(0).toUpperCase() + value.slice(1).toLowerCase());
}

function barracaLabel(prato: Prato): string {
  if (prato.barraca_name && prato.barraca_name.trim()) return prato.barraca_name.trim();
  return `Barraca #${prato.barraca_id}`;
}

export default function PratosListScreen() {
  const nav = useNavigation<any>();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [category, setCategory] = useState('');
  const [groupMode, setGroupMode] = useState<GroupMode>('categoria');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      setPratos(await listPratos(category ? { category } : {}));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar pratos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pratos;
    return pratos.filter((p) => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
  }, [pratos, search]);

  const sections = useMemo(() => {
    const groups = new Map<string, Prato[]>();
    for (const p of filtered) {
      const key = groupMode === 'categoria' ? categoryLabel(p.category) : barracaLabel(p);
      const arr = groups.get(key);
      if (arr) arr.push(p);
      else groups.set(key, [p]);
    }
    return Array.from(groups.entries())
      .filter(([, data]) => data.length > 0)
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([title, data]) => ({ title, data }));
  }, [filtered, groupMode]);

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar prato ou ingrediente…"
      />
      <GroupModeSelector value={groupMode} onChange={setGroupMode} />
      {groupMode === 'categoria' ? (
        <CategoryChips
          options={CATEGORIES}
          value={category}
          onChange={setCategory}
        />
      ) : null}

      {loading ? (
        <Loading message="Carregando pratos..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : pratos.length === 0 ? (
        <EmptyState icon="silverware" title="Nenhum prato encontrado" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="magnify-close"
          title="Nada encontrado"
          message={`Nenhum prato bate com \"${search.trim()}\".`}
        />
      ) : (
        <SectionList
          contentContainerStyle={styles.list}
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderSectionHeader={({ section: { title, data } }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
              <Text style={styles.sectionCount}>· {data.length} {data.length === 1 ? 'prato' : 'pratos'}</Text>
            </View>
          )}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(400).delay(index * 40)}>
              <TouchableOpacity style={styles.card} onPress={() => nav.navigate('PratoDetail', { pratoId: item.id })}>
                {item.photo_url ? (
                  <Image source={{ uri: item.photo_url }} style={styles.image} />
                ) : (
                  <View style={[styles.image, styles.imagePlaceholder]}>
                    <Icon name="silverware-fork-knife" size={28} color="#C65D2E" />
                  </View>
                )}
                <View style={styles.body}>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
                  ) : null}
                  <Text style={styles.price}>R$ {Number(item.price).toFixed(2).replace('.', ',')}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  list: { padding: 12, paddingTop: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2EBE0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#8B4513', letterSpacing: 0.8 },
  sectionCount: { fontSize: 12, color: '#8B4513', marginLeft: 6, fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 10, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E0D5' },
  image: { width: 100, height: 100 },
  imagePlaceholder: { backgroundColor: '#FAF7F2', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: 12 },
  category: { fontSize: 10, textTransform: 'uppercase', color: '#C65D2E', fontWeight: '700', letterSpacing: 0.5 },
  name: { fontSize: 15, fontWeight: '600', color: '#2B2B2B', marginTop: 2 },
  desc: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: '#C65D2E', marginTop: 6 },
});
