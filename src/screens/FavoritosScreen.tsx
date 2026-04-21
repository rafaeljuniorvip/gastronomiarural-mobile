import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Loading from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import { listBarracas, type Barraca } from '../services/barraca.service';
import { listPratos, type Prato } from '../services/prato.service';

type FavoriteItem =
  | { kind: 'barraca'; item: Barraca }
  | { kind: 'prato'; item: Prato };

export default function FavoritosScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const { favorites, refresh } = useFavorites();

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [barracas, pratos] = await Promise.all([listBarracas(), listPratos()]);
      const result: FavoriteItem[] = [];
      for (const b of barracas) {
        if (favorites.has(`barraca:${b.id}`)) result.push({ kind: 'barraca', item: b });
      }
      for (const p of pratos) {
        if (favorites.has(`prato:${p.id}`)) result.push({ kind: 'prato', item: p });
      }
      setItems(result);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, favorites]);

  useEffect(() => { load(); }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    // load será disparado pelo useEffect quando favorites mudar
  }

  if (!user) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Faça login para ver seus favoritos"
        message="Você precisa entrar com sua conta Google."
      />
    );
  }

  if (loading) return <Loading message="Carregando favoritos..." />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon="heart-outline"
        title="Nenhum favorito ainda"
        message="Toque no coração em barracas e pratos para salvá-los aqui."
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={items}
      keyExtractor={(it) => `${it.kind}-${it.item.id}`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      ListHeaderComponent={
        <Text style={styles.header}>
          {items.length} {items.length === 1 ? 'item salvo' : 'itens salvos'}
        </Text>
      }
      renderItem={({ item }) => {
        if (item.kind === 'barraca') {
          const b = item.item;
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => nav.navigate('BarracasTab', { screen: 'BarracaDetail', params: { barracaId: b.id } })}
            >
              {b.cover_url ? (
                <Image source={{ uri: b.cover_url }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Icon name="storefront" size={24} color="#C65D2E" />
                </View>
              )}
              <View style={styles.body}>
                <View style={styles.tagRow}>
                  <Icon name="storefront" size={12} color="#C65D2E" />
                  <Text style={styles.tag}>Barraca</Text>
                </View>
                <Text style={styles.name} numberOfLines={1}>{b.name}</Text>
                {b.location ? (
                  <View style={styles.metaRow}>
                    <Icon name="map-marker" size={12} color="#6B6B6B" />
                    <Text style={styles.metaText} numberOfLines={1}>{b.location}</Text>
                  </View>
                ) : null}
              </View>
              <Icon name="chevron-right" size={22} color="#6B6B6B" />
            </TouchableOpacity>
          );
        }
        const p = item.item;
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate('PratosTab', { screen: 'PratoDetail', params: { pratoId: p.id } })}
          >
            {p.photo_url ? (
              <Image source={{ uri: p.photo_url }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]}>
                <Icon name="silverware-fork-knife" size={24} color="#C65D2E" />
              </View>
            )}
            <View style={styles.body}>
              <View style={styles.tagRow}>
                <Icon name="silverware-fork-knife" size={12} color="#C65D2E" />
                <Text style={styles.tag}>{p.category}</Text>
              </View>
              <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.price}>
                R$ {Number(p.price).toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color="#6B6B6B" />
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 12 },
  header: { fontSize: 13, color: '#6B6B6B', marginBottom: 10, paddingHorizontal: 4 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E0D5',
    alignItems: 'center',
  },
  image: { width: 72, height: 72 },
  imagePlaceholder: { backgroundColor: '#FAF7F2', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: 12 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tag: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#C65D2E',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  name: { fontSize: 15, fontWeight: '600', color: '#2B2B2B', marginTop: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontSize: 11, color: '#6B6B6B' },
  price: { fontSize: 14, fontWeight: '700', color: '#C65D2E', marginTop: 3 },
});
