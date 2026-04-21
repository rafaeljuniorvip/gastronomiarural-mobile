import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, RefreshControl, Image, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listPratos, type Prato } from '../../services/prato.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'carnes', label: 'Carnes' },
  { value: 'aves', label: 'Aves' },
  { value: 'mineirices', label: 'Mineirices' },
  { value: 'peixes', label: 'Peixes' },
  { value: 'quitandas', label: 'Doces' },
  { value: 'bebidas', label: 'Bebidas' },
];

export default function PratosListScreen() {
  const nav = useNavigation<any>();
  const [pratos, setPratos] = useState<Prato[]>([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            onPress={() => setCategory(cat.value)}
            style={[styles.chip, category === cat.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, category === cat.value && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <Loading message="Carregando pratos..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : pratos.length === 0 ? (
        <EmptyState icon="silverware-off" title="Nenhum prato encontrado" />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={pratos}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          renderItem={({ item }) => (
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
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  filters: { padding: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E0D5', marginRight: 6 },
  chipActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  chipText: { color: '#6B6B6B', fontSize: 13 },
  chipTextActive: { color: '#FFF', fontWeight: '600' },
  list: { padding: 12, paddingTop: 0 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 10, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E0D5' },
  image: { width: 100, height: 100 },
  imagePlaceholder: { backgroundColor: '#FAF7F2', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: 12 },
  category: { fontSize: 10, textTransform: 'uppercase', color: '#C65D2E', fontWeight: '700', letterSpacing: 0.5 },
  name: { fontSize: 15, fontWeight: '600', color: '#2B2B2B', marginTop: 2 },
  desc: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: '#C65D2E', marginTop: 6 },
});
