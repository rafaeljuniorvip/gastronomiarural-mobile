import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, RefreshControl, Image, View, Text, TouchableOpacity, type ViewStyle, type TextStyle } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listBarracas, type Barraca } from '../../services/barraca.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

type StatusBadgeConfig = {
  label: string;
  container: ViewStyle;
  text: TextStyle;
};

const STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  aberta: {
    label: 'ABERTA',
    container: { backgroundColor: '#1E8E3E' },
    text: { color: '#FFF' },
  },
  fechada: {
    label: 'FECHADA',
    container: { backgroundColor: '#6B6B6B' },
    text: { color: '#FFF' },
  },
  esgotada: {
    label: 'ESGOTADA',
    container: { backgroundColor: '#C62828' },
    text: { color: '#FFF' },
  },
  fila_alta: {
    label: 'FILA ALTA',
    container: { backgroundColor: '#E67E22' },
    text: { color: '#FFF' },
  },
};

export default function BarracasListScreen() {
  const nav = useNavigation<any>();
  const [barracas, setBarracas] = useState<Barraca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBarracas(await listBarracas());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar barracas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading message="Carregando barracas..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (barracas.length === 0) {
    return <EmptyState icon="storefront-outline" title="Nenhuma barraca cadastrada" message="As barracas da XVIII edição aparecerão aqui em breve." />;
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={barracas}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
      renderItem={({ item }) => {
        const badge = STATUS_BADGE[item.status];
        return (
          <TouchableOpacity style={styles.card} onPress={() => nav.navigate('BarracaDetail', { barracaId: item.id })}>
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Icon name="storefront" size={32} color="#C65D2E" />
              </View>
            )}
            {badge ? (
              <View style={[styles.statusBadge, badge.container]}>
                <Text style={[styles.statusText, badge.text]}>{badge.label}</Text>
              </View>
            ) : null}
            <View style={styles.cardBody}>
              <Text style={styles.name}>{item.name}</Text>
              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View style={styles.meta}>
                {item.location ? (
                  <View style={styles.metaItem}>
                    <Icon name="map-marker" size={13} color="#6B6B6B" />
                    <Text style={styles.metaText}>{item.location}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E0D5' },
  cover: { width: '100%', height: 140, backgroundColor: '#FAF7F2' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 14 },
  name: { fontSize: 17, fontWeight: '700', color: '#2B2B2B', marginBottom: 4 },
  description: { fontSize: 13, color: '#6B6B6B', marginBottom: 8, lineHeight: 18 },
  meta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#6B6B6B' },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
