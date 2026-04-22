import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import {
  listFaqGrouped,
  FAQ_CATEGORY_LABELS,
  type FaqGroup,
  type FaqCategory,
  type FaqItem,
} from '../services/faq.service';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CONTACT_PHONE = '+5537998649151';
const CONTACT_WHATSAPP = 'https://wa.me/5537998649151';
const CONTACT_LABEL = '(37) 99864-9151';

export default function FaqScreen() {
  const [groups, setGroups] = useState<FaqGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FaqCategory | 'all'>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const load = useCallback(async () => {
    setError(null);
    try {
      setGroups(await listFaqGrouped());
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar FAQ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggle(id: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtered = useMemo<FaqGroup[]>(() => {
    const term = search.trim().toLowerCase();
    return groups
      .filter((g) => filter === 'all' || g.category === filter)
      .map((g) => ({
        category: g.category,
        items: g.items.filter((it: FaqItem) => {
          if (!term) return true;
          return (
            it.question.toLowerCase().includes(term) ||
            it.answer.toLowerCase().includes(term)
          );
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, filter, search]);

  async function openContact(url: string) {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Não foi possível abrir este link.');
      return;
    }
    Linking.openURL(url);
  }

  if (loading) return <Loading message="Carregando dúvidas..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (groups.length === 0) {
    return (
      <EmptyState
        icon="help-circle-outline"
        title="Em breve"
        message="As perguntas frequentes serão publicadas em breve."
      />
    );
  }

  const categories = groups.map((g) => g.category);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
      keyboardShouldPersistTaps="handled"
    >
      {/* Busca */}
      <View style={styles.searchBox}>
        <Icon name="magnify" size={18} color="#6B5B4A" />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar pergunta ou palavra-chave..."
          placeholderTextColor="#9B9B9B"
          autoCorrect={false}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color="#6B5B4A" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Chips de categoria */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <Chip label="Todas" active={filter === 'all'} onPress={() => setFilter('all')} />
        {categories.map((c) => (
          <Chip
            key={c}
            label={FAQ_CATEGORY_LABELS[c] ?? c}
            active={filter === c}
            onPress={() => setFilter(c)}
          />
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptySearch}>
          <Icon name="help-circle-outline" size={36} color="#C84B1A" />
          <Text style={styles.emptySearchText}>Nenhuma pergunta encontrada.</Text>
        </View>
      ) : (
        filtered.map((g) => (
          <View key={g.category} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {FAQ_CATEGORY_LABELS[g.category] ?? g.category}
            </Text>
            {g.items.map((it) => {
              const open = expanded.has(it.id);
              return (
                <TouchableOpacity
                  key={it.id}
                  style={styles.item}
                  activeOpacity={0.8}
                  onPress={() => toggle(it.id)}
                >
                  <View style={styles.itemHeader}>
                    <Text style={styles.question}>{it.question}</Text>
                    <Icon
                      name={open ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#6B1E1E"
                    />
                  </View>
                  {open ? <Text style={styles.answer}>{it.answer}</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ))
      )}

      {/* Contato */}
      <View style={styles.contactBox}>
        <Icon name="headset" size={26} color="#6B1E1E" />
        <Text style={styles.contactTitle}>Não encontrou o que procurava?</Text>
        <Text style={styles.contactText}>
          Fale com a organização do festival pelo WhatsApp ou telefone.
        </Text>
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={[styles.contactButton, styles.contactPrimary]}
            onPress={() => openContact(CONTACT_WHATSAPP)}
          >
            <Icon name="whatsapp" size={16} color="#FFF" />
            <Text style={styles.contactButtonText}>WhatsApp</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.contactButton, styles.contactSecondary]}
            onPress={() => openContact(`tel:${CONTACT_PHONE}`)}
          >
            <Icon name="phone" size={16} color="#6B1E1E" />
            <Text style={[styles.contactButtonText, { color: '#6B1E1E' }]}>
              {CONTACT_LABEL}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  content: { padding: 16, paddingBottom: 32 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#2B1A10', padding: 0 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingBottom: 14, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  chipActive: { backgroundColor: '#6B1E1E', borderColor: '#6B1E1E' },
  chipText: { fontSize: 12, color: '#6B5B4A', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B1E1E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    marginBottom: 8,
  },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  question: { flex: 1, fontSize: 14, fontWeight: '700', color: '#2B1A10' },
  answer: {
    fontSize: 13,
    color: '#2B1A10',
    lineHeight: 20,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EADD',
  },
  emptySearch: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    gap: 8,
  },
  emptySearchText: { fontSize: 13, color: '#6B5B4A' },
  contactBox: {
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#F5EFE6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginTop: 10,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B1E1E',
    marginTop: 8,
    textAlign: 'center',
  },
  contactText: {
    fontSize: 12,
    color: '#6B5B4A',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactPrimary: { backgroundColor: '#25D366' },
  contactSecondary: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#6B1E1E',
  },
  contactButtonText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
});
