import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import SearchBar from '../components/ui/SearchBar';
import EmptyState from '../components/ui/EmptyState';
import { globalSearch, type SearchResult, type SearchKind } from '../services/search.service';

const KIND_ORDER: SearchKind[] = ['barraca', 'prato', 'receita', 'evento', 'pessoa', 'turismo'];

const KIND_LABEL: Record<SearchKind, string> = {
  barraca: 'Barracas',
  prato: 'Pratos',
  receita: 'Receitas',
  evento: 'Eventos',
  pessoa: 'Pessoas',
  turismo: 'Turismo',
};

const KIND_ICON: Record<SearchKind, string> = {
  barraca: 'storefront-outline',
  prato: 'silverware-fork-knife',
  receita: 'chef-hat',
  evento: 'calendar-music',
  pessoa: 'account-group-outline',
  turismo: 'bed-outline',
};

const KIND_COLOR: Record<SearchKind, string> = {
  barraca: '#6B1E1E',
  prato: '#C84B1A',
  receita: '#1E8E3E',
  evento: '#4A90E2',
  pessoa: '#8A4FFF',
  turismo: '#D4A842',
};

function routeFor(result: SearchResult): { name: string; params: Record<string, unknown> } | null {
  switch (result.kind) {
    case 'barraca':
      return { name: 'BarracaDetail', params: { barracaId: result.id } };
    case 'prato':
      return { name: 'PratoDetail', params: { pratoId: result.id } };
    case 'receita':
      return { name: 'ReceitaDetail', params: { receitaId: result.id } };
    case 'evento':
      // Não há tela dedicada de evento — abre a programação onde ele aparecerá.
      return { name: 'Programacao', params: {} };
    case 'pessoa':
      return { name: 'PessoaDetail', params: { pessoaId: result.id } };
    case 'turismo':
      return { name: 'LocalDetail', params: { localId: result.id } };
    default:
      return null;
  }
}

export default function SearchScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const initialQuery: string = route.params?.initialQuery ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async (q: string) => {
    const term = q.trim();
    if (term.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await globalSearch(term);
      setResults(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao buscar');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  const sections = useMemo(() => {
    const map = new Map<SearchKind, SearchResult[]>();
    for (const r of results) {
      const arr = map.get(r.kind);
      if (arr) arr.push(r);
      else map.set(r.kind, [r]);
    }
    return KIND_ORDER.filter((k) => map.has(k)).map((kind) => ({
      title: KIND_LABEL[kind],
      kind,
      data: map.get(kind) || [],
    }));
  }, [results]);

  function handleQueryChange(text: string) {
    setQuery(text);
    runSearch(text);
  }

  function handlePress(item: SearchResult) {
    const target = routeFor(item);
    if (!target) return;
    nav.navigate(target.name as never, target.params as never);
  }

  const trimmed = query.trim();

  return (
    <View style={styles.container}>
      <SearchBar
        value={query}
        onChange={handleQueryChange}
        placeholder="Buscar barracas, pratos, receitas…"
        autoFocus
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#6B1E1E" />
        </View>
      ) : error ? (
        <EmptyState icon="alert-circle-outline" title="Erro ao buscar" message={error} />
      ) : trimmed.length < 2 ? (
        <EmptyState
          icon="magnify"
          title="Digite ao menos 2 letras"
          message="Busque por nomes de barracas, pratos, receitas, pessoas, eventos ou locais."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="magnify-close"
          title="Nada encontrado"
          message={`Nenhum resultado para \"${trimmed}\".`}
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => `${item.kind}-${item.id}`}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Icon
                name={KIND_ICON[section.kind as SearchKind] as any}
                size={14}
                color={KIND_COLOR[section.kind as SearchKind]}
              />
              <Text style={[styles.sectionTitle, { color: KIND_COLOR[section.kind as SearchKind] }]}>
                {section.title.toUpperCase()}
              </Text>
              <Text style={styles.sectionCount}>· {section.data.length}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handlePress(item)} activeOpacity={0.8}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Icon name={KIND_ICON[item.kind] as any} size={22} color="#C84B1A" />
                </View>
              )}
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {item.subtitle}
                  </Text>
                ) : null}
                <View style={styles.kindRow}>
                  <View style={[styles.kindChip, { borderColor: KIND_COLOR[item.kind] }]}>
                    <Text style={[styles.kindChipText, { color: KIND_COLOR[item.kind] }]}>
                      {KIND_LABEL[item.kind]}
                    </Text>
                  </View>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#B0B0B0" />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  list: { padding: 12, paddingTop: 0, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F2EBE0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 0.8 },
  sectionCount: { fontSize: 12, color: '#6B1E1E', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  thumb: { width: 52, height: 52, borderRadius: 8, backgroundColor: '#FAF2E0' },
  thumbPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: '#2B1A10' },
  subtitle: { fontSize: 12, color: '#6B5B4A', marginTop: 2 },
  kindRow: { flexDirection: 'row', marginTop: 6 },
  kindChip: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  kindChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
});
