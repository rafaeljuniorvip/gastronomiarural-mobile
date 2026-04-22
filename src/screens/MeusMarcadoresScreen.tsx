import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { listMyMarkers, type MarcadorKind, type MarcadorMine } from '../services/marcador.service';

const TABS: { key: MarcadorKind; label: string; icon: keyof typeof Icon.glyphMap }[] = [
  { key: 'experimentei', label: 'Já experimentei', icon: 'silverware-fork-knife' },
  { key: 'quero_provar', label: 'Quero provar', icon: 'bookmark-outline' },
];

export default function MeusMarcadoresScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const [tab, setTab] = useState<MarcadorKind>('experimentei');
  const [items, setItems] = useState<MarcadorMine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setItems(await listMyMarkers());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar marcadores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => items.filter((m) => m.kind === tab), [items, tab]);

  if (!user) {
    return (
      <EmptyState
        icon="silverware-fork-knife"
        title="Faça login para ver seus pratos"
        message='Entre com sua conta Google para marcar "experimentei" e "quero provar".'
      />
    );
  }

  if (loading) return <Loading message="Carregando seus pratos..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {TABS.map((t) => {
          const active = tab === t.key;
          const count = items.filter((m) => m.kind === t.key).length;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(t.key)}
            >
              <Icon name={t.icon} size={16} color={active ? '#8B4513' : '#6B6B6B'} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t.label}
              </Text>
              <View style={[styles.badge, active && styles.badgeActive]}>
                <Text style={[styles.badgeText, active && styles.badgeTextActive]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon={tab === 'experimentei' ? 'silverware-fork-knife' : 'bookmark-plus-outline'}
          title={tab === 'experimentei' ? 'Nenhum prato experimentado' : 'Nenhum prato na lista'}
          message={
            tab === 'experimentei'
              ? 'Marque pratos como "experimentei" no detalhe do prato.'
              : 'Toque em "quero provar" no detalhe do prato para adicioná-lo aqui.'
          }
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => `${m.kind}-${m.prato_id}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                nav.navigate('PratosTab', {
                  screen: 'PratoDetail',
                  params: { pratoId: item.prato_id },
                })
              }
            >
              {item.prato_photo_url ? (
                <Image source={{ uri: item.prato_photo_url }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]}>
                  <Icon name="silverware-fork-knife" size={24} color="#C65D2E" />
                </View>
              )}
              <View style={styles.body}>
                <Text style={styles.category}>{item.prato_category}</Text>
                <Text style={styles.name} numberOfLines={1}>
                  {item.prato_name}
                </Text>
                <View style={styles.metaRow}>
                  <Icon name="storefront" size={12} color="#6B6B6B" />
                  <Text style={styles.meta} numberOfLines={1}>
                    {item.barraca_name}
                  </Text>
                </View>
                <Text style={styles.price}>
                  R$ {Number(item.prato_price).toFixed(2).replace('.', ',')}
                </Text>
              </View>
              <Icon name="chevron-right" size={22} color="#6B6B6B" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D5',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#8B4513' },
  tabLabel: { fontSize: 13, fontWeight: '600', color: '#6B6B6B' },
  tabLabelActive: { color: '#8B4513' },
  badge: {
    backgroundColor: '#F0EDE5',
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignItems: 'center',
  },
  badgeActive: { backgroundColor: '#8B4513' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#6B6B6B' },
  badgeTextActive: { color: '#FFF' },
  list: { padding: 12 },
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
  image: { width: 76, height: 76 },
  imagePlaceholder: { backgroundColor: '#FAF7F2', justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1, padding: 12 },
  category: {
    fontSize: 10,
    color: '#C65D2E',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: { fontSize: 15, fontWeight: '700', color: '#2B2B2B', marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  meta: { fontSize: 12, color: '#6B6B6B' },
  price: { fontSize: 13, fontWeight: '700', color: '#C65D2E', marginTop: 4 },
});
