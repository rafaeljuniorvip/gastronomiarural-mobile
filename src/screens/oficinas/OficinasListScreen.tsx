import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  Image,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listOficinas, type Oficina } from '../../services/oficina.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatTime } from '../../utils/date';

export default function OficinasListScreen() {
  const nav = useNavigation<any>();
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setOficinas(await listOficinas());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar oficinas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading message="Carregando oficinas..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (oficinas.length === 0) {
    return (
      <EmptyState
        icon="school-outline"
        title="Nenhuma oficina cadastrada"
        message="As oficinas da XVIII edição aparecerão aqui em breve."
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={oficinas}
      keyExtractor={(item) => String(item.id)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
      renderItem={({ item }) => {
        const totalSeats = item.total_seats ?? 0;
        const vagasRestantes = Math.max(totalSeats - item.vagas_preenchidas, 0);
        const esgotada = totalSeats > 0 && vagasRestantes === 0;
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => nav.navigate('OficinaDetail', { oficinaId: item.id })}
          >
            {item.cover_url ? (
              <Image source={{ uri: item.cover_url }} style={styles.cover} />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Icon name="school" size={36} color="#C65D2E" />
              </View>
            )}
            <View style={styles.body}>
              <Text style={styles.title}>{item.title}</Text>

              <View style={styles.metaRow}>
                <Icon name="calendar" size={14} color="#6B6B6B" />
                <Text style={styles.metaText}>
                  {formatDate(item.starts_at)} · {formatTime(item.starts_at)}
                </Text>
              </View>

              {item.location ? (
                <View style={styles.metaRow}>
                  <Icon name="map-marker" size={14} color="#6B6B6B" />
                  <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
                </View>
              ) : null}

              <View style={styles.badges}>
                {totalSeats > 0 ? (
                  <View style={[styles.badge, esgotada ? styles.badgeRed : styles.badgeGreen]}>
                    <Icon
                      name={esgotada ? 'lock' : 'ticket-confirmation-outline'}
                      size={12}
                      color="#FFF"
                    />
                    <Text style={styles.badgeText}>
                      {esgotada
                        ? 'Esgotada'
                        : `${vagasRestantes}/${totalSeats} ${vagasRestantes === 1 ? 'vaga' : 'vagas'}`}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.badge, styles.badgeNeutral]}>
                    <Icon name="account-group-outline" size={12} color="#FFF" />
                    <Text style={styles.badgeText}>Livre</Text>
                  </View>
                )}
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  cover: { width: '100%', height: 150, backgroundColor: '#FAF7F2' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { padding: 14 },
  title: { fontSize: 17, fontWeight: '700', color: '#2B2B2B', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  metaText: { fontSize: 12, color: '#6B6B6B', flexShrink: 1 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeGreen: { backgroundColor: '#2E7D32' },
  badgeRed: { backgroundColor: '#C62828' },
  badgeNeutral: { backgroundColor: '#6B6B6B' },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
});
