import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  RefreshControl,
  FlatList,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { getEdicao, type EdicaoPassada } from '../services/timeline.service';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

function formatVisitors(n: number | null): string {
  if (n === null || n === undefined) return '';
  if (n >= 1000) {
    const mil = n / 1000;
    const str = Number.isInteger(mil) ? String(mil) : mil.toFixed(1).replace('.', ',');
    return `${str} mil`;
  }
  return String(n);
}

function formatBrl(v: string | null): string | null {
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function formatDateRange(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  if (s && e) return `${fmt(s)} – ${fmt(e)}`;
  if (s) return fmt(s);
  if (e) return fmt(e);
  return null;
}

export default function EdicaoDetailScreen() {
  const route = useRoute<any>();
  const edicaoId = Number(route.params?.edicaoId);

  const [edicao, setEdicao] = useState<EdicaoPassada | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setEdicao(await getEdicao(edicaoId));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar edição');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [edicaoId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!edicao) return <EmptyState icon="history" title="Edição não encontrada" />;

  const dateRange = formatDateRange(edicao.start_date, edicao.end_date);
  const impact = formatBrl(edicao.economy_impact_brl);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
    >
      {edicao.cover_url ? (
        <Image source={{ uri: edicao.cover_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Icon name="history" size={56} color="#C84B1A" />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.edition}>{edicao.edition}ª edição</Text>
        <Text style={styles.year}>{edicao.year}</Text>

        {edicao.theme ? <Text style={styles.theme}>{edicao.theme}</Text> : null}

        {dateRange ? (
          <View style={styles.metaRow}>
            <Icon name="calendar" size={16} color="#6B5B4A" />
            <Text style={styles.metaText}>{dateRange}</Text>
          </View>
        ) : null}

        {edicao.description ? (
          <>
            <Text style={styles.sectionTitle}>Sobre esta edição</Text>
            <Text style={styles.paragraph}>{edicao.description}</Text>
          </>
        ) : null}

        {edicao.highlights.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Destaques</Text>
            {edicao.highlights.map((h, i) => (
              <View key={i} style={styles.highlightRow}>
                <Icon name="star" size={14} color="#C84B1A" />
                <Text style={styles.highlightText}>{h}</Text>
              </View>
            ))}
          </>
        ) : null}

        {(edicao.visitors_count || impact) ? (
          <>
            <Text style={styles.sectionTitle}>Números</Text>
            <View style={styles.numbersRow}>
              {edicao.visitors_count ? (
                <View style={styles.numberCard}>
                  <Icon name="account-group" size={22} color="#6B1E1E" />
                  <Text style={styles.numberValue}>{formatVisitors(edicao.visitors_count)}</Text>
                  <Text style={styles.numberLabel}>visitantes</Text>
                </View>
              ) : null}
              {impact ? (
                <View style={styles.numberCard}>
                  <Icon name="cash-multiple" size={22} color="#6B1E1E" />
                  <Text style={styles.numberValue}>{impact}</Text>
                  <Text style={styles.numberLabel}>economia</Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {edicao.curiosities ? (
          <>
            <Text style={styles.sectionTitle}>Curiosidades</Text>
            <View style={styles.curiosityBox}>
              <Icon name="lightbulb-on" size={18} color="#6B1E1E" />
              <Text style={styles.curiosityText}>{edicao.curiosities}</Text>
            </View>
          </>
        ) : null}

        {edicao.gallery.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Galeria</Text>
            <FlatList
              horizontal
              data={edicao.gallery}
              keyExtractor={(item, i) => `${i}-${item}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContent}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.galleryItem} />
              )}
            />
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  cover: { width: '100%', height: 220, backgroundColor: '#E5DCC8' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { padding: 18, paddingBottom: 32 },
  edition: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6B1E1E',
    fontFamily: 'serif',
    letterSpacing: -1,
  },
  year: { fontSize: 16, color: '#6B5B4A', marginTop: -4, fontWeight: '600' },
  theme: { fontSize: 22, fontWeight: '700', color: '#2B1A10', marginTop: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  metaText: { fontSize: 13, color: '#6B5B4A' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B1E1E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 22,
    marginBottom: 8,
  },
  paragraph: { fontSize: 14, color: '#2B1A10', lineHeight: 21 },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  highlightText: { flex: 1, fontSize: 13, color: '#2B1A10', lineHeight: 19 },
  numbersRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  numberCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    alignItems: 'center',
  },
  numberValue: { fontSize: 20, fontWeight: '900', color: '#6B1E1E', marginTop: 4 },
  numberLabel: { fontSize: 11, color: '#6B5B4A', textTransform: 'uppercase', letterSpacing: 0.5 },
  curiosityBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F5EFE6',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },
  curiosityText: { flex: 1, fontSize: 13, color: '#2B1A10', lineHeight: 20, fontStyle: 'italic' },
  galleryContent: { gap: 10, paddingRight: 10 },
  galleryItem: {
    width: 180,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#E5DCC8',
  },
});
