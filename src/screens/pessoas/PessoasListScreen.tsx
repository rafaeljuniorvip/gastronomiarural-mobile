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
import { listPessoas, type Pessoa, type PessoaRole } from '../../services/pessoa.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

const ROLE_FILTERS: Array<{ key: PessoaRole; label: string }> = [
  { key: 'cozinheira', label: 'Cozinheiras' },
  { key: 'artista', label: 'Artistas' },
  { key: 'artesao', label: 'Artesãos' },
  { key: 'produtor', label: 'Produtores' },
];

export default function PessoasListScreen() {
  const nav = useNavigation<any>();
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<PessoaRole>('cozinheira');

  const load = useCallback(async () => {
    setError(null);
    try {
      setPessoas(await listPessoas());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar pessoas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () => pessoas.filter((p) => p.role === filter && p.active),
    [pessoas, filter]
  );

  if (loading) return <Loading message="Carregando pessoas..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsWrap}
        contentContainerStyle={styles.chipsContent}
      >
        {ROLE_FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {filtered.length === 0 ? (
        <EmptyState
          icon="account-group-outline"
          title="Nenhuma pessoa cadastrada"
          message="As pessoas do festival aparecerão aqui em breve."
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
                onPress={() => nav.navigate('PessoaDetail', { pessoaId: item.id })}
              >
                {item.photo_url ? (
                  <Image source={{ uri: item.photo_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Icon name="account" size={38} color="#C65D2E" />
                  </View>
                )}
                <View style={styles.cardBody}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.bio ? (
                    <Text style={styles.bio} numberOfLines={2}>
                      {item.bio}
                    </Text>
                  ) : null}
                </View>
                <Icon name="chevron-right" size={22} color="#6B6B6B" />
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
  chipsWrap: { maxHeight: 56, flexGrow: 0 },
  chipsContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E0D5',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  chipText: { fontSize: 12, color: '#2B2B2B', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  content: { padding: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    gap: 12,
  },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FAF7F2' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: '#2B2B2B' },
  bio: { fontSize: 13, color: '#6B6B6B', marginTop: 4, lineHeight: 18 },
});
