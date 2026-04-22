import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, RefreshControl, Image, View, Text, TouchableOpacity, type ViewStyle, type TextStyle } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listBarracas, type Barraca } from '../../services/barraca.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import GroupModeSelector, { type GroupMode } from '../../components/ui/GroupModeSelector';

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

function toTitleCase(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function extractCategoria(location: string | null | undefined): string {
  if (!location) return 'Outras';
  const parts = location.split('·').map((p) => p.trim()).filter(Boolean);
  const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  return last ? toTitleCase(last) : 'Outras';
}

function extractSetor(location: string | null | undefined): string {
  if (!location || !location.trim()) return 'Sem setor';
  return location.trim();
}

export default function BarracasListScreen() {
  const nav = useNavigation<any>();
  const [barracas, setBarracas] = useState<Barraca[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [groupMode, setGroupMode] = useState<GroupMode>('categoria');

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

  const sections = useMemo(() => {
    const groups = new Map<string, Barraca[]>();
    for (const b of barracas) {
      const key = groupMode === 'categoria' ? extractCategoria(b.location) : extractSetor(b.location);
      const arr = groups.get(key);
      if (arr) arr.push(b);
      else groups.set(key, [b]);
    }
    return Array.from(groups.entries())
      .filter(([, data]) => data.length > 0)
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([title, data]) => ({ title, data }));
  }, [barracas, groupMode]);

  if (loading) return <Loading message="Carregando barracas..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (barracas.length === 0) {
    return <EmptyState icon="storefront-outline" title="Nenhuma barraca cadastrada" message="As barracas da XVIII edição aparecerão aqui em breve." />;
  }

  return (
    <View style={styles.container}>
      <GroupModeSelector value={groupMode} onChange={setGroupMode} />
      <SectionList
        contentContainerStyle={styles.content}
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
            <Text style={styles.sectionCount}>· {data.length} {data.length === 1 ? 'barraca' : 'barracas'}</Text>
          </View>
        )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 12, paddingTop: 0 },
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
