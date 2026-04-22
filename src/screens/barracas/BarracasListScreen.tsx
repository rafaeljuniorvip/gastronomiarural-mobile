import { useCallback, useEffect, useMemo, useState } from 'react';
import { SectionList, StyleSheet, RefreshControl, Image, View, Text, TouchableOpacity, type ViewStyle, type TextStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { listBarracas, type Barraca } from '../../services/barraca.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import GroupModeSelector, { type GroupMode } from '../../components/ui/GroupModeSelector';
import SearchBar from '../../components/ui/SearchBar';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

type StatusBadgeConfig = {
  label: string;
  container: ViewStyle;
  text: TextStyle;
};

const STATUS_BADGE: Record<string, StatusBadgeConfig> = {
  aberta: {
    label: 'ABERTA',
    container: { backgroundColor: '#5E7F3E' },
    text: { color: '#FFF' },
  },
  fechada: {
    label: 'FECHADA',
    container: { backgroundColor: '#6B5B4A' },
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
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return barracas;
    return barracas.filter((b) => {
      const name = (b.name || '').toLowerCase();
      const location = (b.location || '').toLowerCase();
      return name.includes(term) || location.includes(term);
    });
  }, [barracas, search]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Barraca[]>();
    for (const b of filtered) {
      const key = groupMode === 'categoria' ? extractCategoria(b.location) : extractSetor(b.location);
      const arr = groups.get(key);
      if (arr) arr.push(b);
      else groups.set(key, [b]);
    }
    return Array.from(groups.entries())
      .filter(([, data]) => data.length > 0)
      .sort(([a], [b]) => a.localeCompare(b, 'pt-BR'))
      .map(([title, data]) => ({ title, data }));
  }, [filtered, groupMode]);

  useEffect(() => {
    setCollapsed(new Set(grouped.map((g) => g.title)));
  }, [groupMode, barracas.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const sections = useMemo(() => (
    grouped.map((g) => ({
      title: g.title,
      count: g.data.length,
      data: collapsed.has(g.title) ? [] : g.data,
    }))
  ), [grouped, collapsed]);

  const toggle = useCallback((title: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => setCollapsed(new Set()), []);
  const collapseAll = useCallback(() => {
    setCollapsed(new Set(grouped.map((g) => g.title)));
  }, [grouped]);

  if (loading) return <Loading message="Carregando barracas..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (barracas.length === 0) {
    return <EmptyState icon="storefront-outline" title="Nenhuma barraca cadastrada" message="As barracas da XVIII edição aparecerão aqui em breve." />;
  }

  // Quando o filtro ativo elimina todas as barracas, mostramos empty state dedicado.
  const filteredEmpty = filtered.length === 0 && search.trim().length > 0;

  return (
    <View style={styles.container}>
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar barraca ou setor…"
      />
      <GroupModeSelector value={groupMode} onChange={setGroupMode} />
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={expandAll}>
          <Icon name="unfold-more-horizontal" size={14} color="#6B1E1E" />
          <Text style={styles.toolbarBtnText}>Expandir todas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarBtn} onPress={collapseAll}>
          <Icon name="unfold-less-horizontal" size={14} color="#6B1E1E" />
          <Text style={styles.toolbarBtnText}>Colapsar todas</Text>
        </TouchableOpacity>
      </View>
      {filteredEmpty ? (
        <EmptyState
          icon="magnify-close"
          title="Nada encontrado"
          message={`Nenhuma barraca bate com \"${search.trim()}\".`}
        />
      ) : (
      <SectionList
        contentContainerStyle={styles.content}
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
        renderSectionHeader={({ section: { title, count } }) => {
          const isCollapsed = collapsed.has(title);
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.sectionHeader}
              onPress={() => toggle(title)}
            >
              <Text style={styles.sectionTitle}>{title.toUpperCase()}</Text>
              <Text style={styles.sectionCount}>· {count} {count === 1 ? 'barraca' : 'barracas'}</Text>
              <View style={styles.sectionChevron}>
                <Icon name={isCollapsed ? 'chevron-down' : 'chevron-up'} size={20} color="#6B1E1E" />
              </View>
            </TouchableOpacity>
          );
        }}
        renderItem={({ item, index, section }) => {
          const badge = STATUS_BADGE[item.status];
          const localIndex = section.data.findIndex((b) => b.id === item.id);
          const delayIdx = localIndex >= 0 ? localIndex : index;
          return (
            <Animated.View entering={FadeInDown.duration(400).delay(delayIdx * 40)}>
              <TouchableOpacity style={styles.card} onPress={() => nav.navigate('BarracaDetail', { barracaId: item.id })}>
                {item.cover_url ? (
                  <Image source={{ uri: item.cover_url }} style={styles.cover} />
                ) : (
                  <View style={[styles.cover, styles.coverPlaceholder]}>
                    <Icon name="storefront" size={32} color="#C84B1A" />
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
                        <Icon name="map-marker" size={13} color="#6B5B4A" />
                        <Text style={styles.metaText}>{item.location}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 12, paddingTop: 0 },
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    backgroundColor: '#FFF',
  },
  toolbarBtnText: { fontSize: 11, color: colors.primary, fontWeight: '700', letterSpacing: 0.3, fontFamily: fonts.bodyBold },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2EBE0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.primary, letterSpacing: 0.8, fontFamily: fonts.bodyBold },
  sectionCount: { fontSize: 12, color: colors.primary, marginLeft: 6, fontWeight: '600', fontFamily: fonts.bodyMedium },
  sectionChevron: { marginLeft: 'auto' },
  card: { backgroundColor: colors.surface, borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  cover: { width: '100%', height: 140, backgroundColor: colors.bg },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  cardBody: { padding: 14 },
  name: { fontSize: 18, fontWeight: '700', color: colors.primary, marginBottom: 4, fontFamily: fonts.heading },
  description: { fontSize: 13, color: colors.textMuted, marginBottom: 8, lineHeight: 18, fontFamily: fonts.body },
  meta: { flexDirection: 'row', gap: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.textMuted, fontFamily: fonts.body },
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
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, fontFamily: fonts.bodyBold },
});
