import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listEdicoes, type EdicaoPassada } from '../services/timeline.service';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

function formatVisitors(n: number | null): string {
  if (n === null || n === undefined) return '';
  if (n >= 1000) {
    const mil = n / 1000;
    const str = Number.isInteger(mil) ? String(mil) : mil.toFixed(1).replace('.', ',');
    return `${str} mil visitantes`;
  }
  return `${n} visitantes`;
}

export default function TimelineScreen() {
  const nav = useNavigation<any>();
  const [edicoes, setEdicoes] = useState<EdicaoPassada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setEdicoes(await listEdicoes());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar histórico');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading message="Carregando histórico..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (edicoes.length === 0) {
    return (
      <EmptyState
        icon="history"
        title="Em breve"
        message="O histórico das edições anteriores aparecerá aqui."
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      <View style={styles.intro}>
        <Icon name="book-open-page-variant" size={26} color="#8B4513" />
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitle}>Nossa história</Text>
          <Text style={styles.introText}>
            Desde 2007, o Festival de Gastronomia Rural celebra a cozinha da roça mineira.
          </Text>
        </View>
      </View>

      <View style={styles.timeline}>
        {edicoes.map((e, idx) => (
          <View key={e.id} style={styles.timelineRow}>
            <View style={styles.timelineSpine}>
              <View style={styles.dot} />
              {idx < edicoes.length - 1 ? <View style={styles.line} /> : null}
            </View>

            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => nav.navigate('EdicaoDetail', { edicaoId: e.id })}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.edition}>{e.edition}ª</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.year}>{e.year}</Text>
                  {e.theme ? <Text style={styles.theme}>{e.theme}</Text> : null}
                </View>
              </View>

              {e.cover_url ? (
                <Image source={{ uri: e.cover_url }} style={styles.cover} />
              ) : null}

              {e.description ? (
                <Text style={styles.description} numberOfLines={3}>
                  {e.description}
                </Text>
              ) : null}

              {e.highlights.length > 0 ? (
                <View style={styles.chipsRow}>
                  {e.highlights.slice(0, 3).map((h, i) => (
                    <View key={i} style={styles.chip}>
                      <Text style={styles.chipText} numberOfLines={1}>{h}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {e.visitors_count ? (
                <View style={styles.visitorsRow}>
                  <Icon name="account-group" size={14} color="#8B4513" />
                  <Text style={styles.visitorsText}>{formatVisitors(e.visitors_count)}</Text>
                </View>
              ) : null}

              <View style={styles.readMore}>
                <Text style={styles.readMoreText}>Ler mais</Text>
                <Icon name="chevron-right" size={16} color="#C65D2E" />
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 16, paddingBottom: 40 },
  intro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    marginBottom: 18,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B4513',
  },
  introText: { fontSize: 12, color: '#6B6B6B', marginTop: 2, lineHeight: 17 },
  timeline: { position: 'relative' },
  timelineRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  timelineSpine: { width: 18, alignItems: 'center', paddingTop: 22 },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B4513',
    borderWidth: 2,
    borderColor: '#FAF7F2',
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#D4B896',
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#F5EFE6',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  edition: {
    fontSize: 32,
    fontWeight: '900',
    color: '#8B4513',
    fontFamily: 'serif',
    letterSpacing: -1,
  },
  year: { fontSize: 14, color: '#6B6B6B', fontWeight: '600' },
  theme: { fontSize: 17, fontWeight: '700', color: '#2B2B2B', marginTop: 2 },
  cover: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginVertical: 10,
    backgroundColor: '#E5D9C3',
  },
  description: {
    fontSize: 13,
    color: '#2B2B2B',
    lineHeight: 19,
    marginTop: 4,
  },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: 'rgba(139, 69, 19, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.15)',
  },
  chipText: { fontSize: 11, color: '#8B4513', fontWeight: '600' },
  visitorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  visitorsText: { fontSize: 12, color: '#6B6B6B', fontWeight: '600' },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  readMoreText: { fontSize: 12, color: '#C65D2E', fontWeight: '700' },
});
