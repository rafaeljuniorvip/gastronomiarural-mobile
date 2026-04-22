import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listReceitas, type Receita, type Dificuldade } from '../../services/receita.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';

const DIFICULDADE_LABEL: Record<Dificuldade, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

export default function ReceitasListScreen() {
  const nav = useNavigation<any>();
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return receitas;
    return receitas.filter((r) => (r.title || '').toLowerCase().includes(term));
  }, [receitas, search]);

  const load = useCallback(async () => {
    setError(null);
    try {
      setReceitas(await listReceitas());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar receitas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading message="Carregando receitas..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (receitas.length === 0) {
    return (
      <EmptyState
        icon="chef-hat"
        title="Nenhuma receita publicada"
        message="As receitas da XVIII edição aparecerão aqui em breve."
      />
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar receita…"
      />
      {filtered.length === 0 ? (
        <EmptyState
          icon="magnify-close"
          title="Nada encontrado"
          message={`Nenhuma receita bate com \"${search.trim()}\".`}
        />
      ) : (
    <FlatList
      contentContainerStyle={styles.content}
      data={filtered}
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
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.duration(400).delay(index * 40)}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate('ReceitaDetail', { receitaId: item.id })}
            activeOpacity={0.8}
          >
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Icon name="chef-hat" size={40} color="#C84B1A" />
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <View style={styles.meta}>
                {item.tempo_preparo_min !== null ? (
                  <View style={styles.metaItem}>
                    <Icon name="clock-outline" size={13} color="#6B5B4A" />
                    <Text style={styles.metaText}>{item.tempo_preparo_min} min</Text>
                  </View>
                ) : null}
                {item.dificuldade ? (
                  <View style={styles.metaItem}>
                    <Icon name="chart-line-variant" size={13} color="#6B5B4A" />
                    <Text style={styles.metaText}>
                      {DIFICULDADE_LABEL[item.dificuldade]}
                    </Text>
                  </View>
                ) : null}
                {item.rendimento ? (
                  <View style={styles.metaItem}>
                    <Icon name="account-group" size={13} color="#6B5B4A" />
                    <Text style={styles.metaText} numberOfLines={1}>
                      {item.rendimento}
                    </Text>
                  </View>
                ) : null}
              </View>
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
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  content: { padding: 12 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  cover: { width: '100%', height: 160, backgroundColor: '#FAF2E0' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 14 },
  title: { fontSize: 17, fontWeight: '700', color: '#6B1E1E', marginBottom: 4, fontFamily: 'PlayfairDisplay_700Bold' },
  description: { fontSize: 13, color: '#6B5B4A', marginBottom: 10, lineHeight: 18 },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, rowGap: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B5B4A' },
});
