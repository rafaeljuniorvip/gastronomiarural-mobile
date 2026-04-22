import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  RefreshControl,
  Share,
  Pressable,
} from 'react-native';
import { Button, Chip, Divider } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { getReceita, type Receita, type Dificuldade } from '../../services/receita.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

const DIFICULDADE_LABEL: Record<Dificuldade, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

const DIFICULDADE_COLOR: Record<Dificuldade, string> = {
  facil: '#2E7D32',
  medio: '#C65D2E',
  dificil: '#C62828',
};

export default function ReceitaDetailScreen() {
  const route = useRoute<any>();
  const receitaId = Number(route.params?.receitaId);

  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [checados, setChecados] = useState<Record<number, boolean>>({});

  const load = useCallback(async () => {
    setError(null);
    try {
      setReceita(await getReceita(receitaId));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar receita');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [receitaId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleShare() {
    if (!receita) return;
    const partes: string[] = [receita.title];
    if (receita.description) partes.push(receita.description);
    if (receita.ingredientes.length > 0) {
      partes.push('\nIngredientes:');
      partes.push(
        ...receita.ingredientes.map((i) => `• ${i.quantidade} — ${i.item}`)
      );
    }
    if (receita.modo_preparo.length > 0) {
      partes.push('\nModo de preparo:');
      partes.push(...receita.modo_preparo.map((p, i) => `${i + 1}. ${p}`));
    }
    partes.push('\n— Festival de Gastronomia Rural de Itapecerica');

    try {
      await Share.share({ message: partes.join('\n') });
    } catch {
      // usuário cancelou
    }
  }

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!receita) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
        />
      }
    >
      {receita.cover_url ? (
        <Image source={{ uri: receita.cover_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Icon name="chef-hat" size={56} color="#C65D2E" />
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{receita.title}</Text>

        {receita.description ? (
          <Text style={styles.description}>{receita.description}</Text>
        ) : null}

        <View style={styles.chipsRow}>
          {receita.tempo_preparo_min !== null ? (
            <Chip icon="clock-outline" style={styles.chip} textStyle={styles.chipText}>
              {receita.tempo_preparo_min} min
            </Chip>
          ) : null}
          {receita.rendimento ? (
            <Chip icon="account-group" style={styles.chip} textStyle={styles.chipText}>
              {receita.rendimento}
            </Chip>
          ) : null}
          {receita.dificuldade ? (
            <Chip
              icon="chef-hat"
              style={[
                styles.chip,
                { backgroundColor: DIFICULDADE_COLOR[receita.dificuldade] },
              ]}
              textStyle={[styles.chipText, { color: '#FFF' }]}
            >
              {DIFICULDADE_LABEL[receita.dificuldade]}
            </Chip>
          ) : null}
        </View>

        {receita.ingredientes.length > 0 ? (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Ingredientes</Text>
            <View style={styles.list}>
              {receita.ingredientes.map((ing, idx) => {
                const marcado = !!checados[idx];
                return (
                  <Pressable
                    key={idx}
                    onPress={() =>
                      setChecados((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    style={styles.ingrediente}
                  >
                    <Icon
                      name={marcado ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                      size={22}
                      color={marcado ? '#2E7D32' : '#8B4513'}
                    />
                    <View style={styles.ingredienteText}>
                      <Text
                        style={[
                          styles.ingredienteItem,
                          marcado && styles.ingredienteMarcado,
                        ]}
                      >
                        <Text style={styles.ingredienteQtd}>{ing.quantidade} </Text>
                        {ing.item}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {receita.modo_preparo.length > 0 ? (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Modo de preparo</Text>
            <View style={styles.passosList}>
              {receita.modo_preparo.map((passo, idx) => (
                <View key={idx} style={styles.passoCard}>
                  <View style={styles.passoNumero}>
                    <Text style={styles.passoNumeroText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.passoText}>{passo}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {receita.dicas ? (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Dicas da cozinheira</Text>
            <View style={styles.dicaBox}>
              <Icon name="lightbulb-on-outline" size={20} color="#C65D2E" />
              <Text style={styles.dicaText}>{receita.dicas}</Text>
            </View>
          </>
        ) : null}

        {receita.historia ? (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>História</Text>
            <Text style={styles.paragraph}>{receita.historia}</Text>
          </>
        ) : null}

        <Button
          mode="contained"
          icon="share-variant"
          buttonColor="#8B4513"
          style={styles.shareButton}
          contentStyle={styles.shareButtonContent}
          onPress={handleShare}
        >
          Compartilhar receita
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { paddingBottom: 40 },
  cover: { width: '100%', height: 260, backgroundColor: '#E5E0D5' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#8B4513',
    fontFamily: 'Merriweather',
  },
  description: { fontSize: 15, color: '#2B2B2B', lineHeight: 22, marginTop: 10 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: { backgroundColor: '#FFF' },
  chipText: { color: '#2B2B2B', fontSize: 12 },
  divider: { marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#8B4513', marginBottom: 12 },
  list: { gap: 4 },
  ingrediente: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E0D5',
  },
  ingredienteText: { flex: 1 },
  ingredienteItem: { fontSize: 14, color: '#2B2B2B' },
  ingredienteQtd: { fontWeight: '700', color: '#8B4513' },
  ingredienteMarcado: { textDecorationLine: 'line-through', color: '#6B6B6B' },
  passosList: { gap: 12 },
  passoCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  passoNumero: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passoNumeroText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  passoText: { flex: 1, fontSize: 14, lineHeight: 22, color: '#2B2B2B' },
  dicaBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF8E7',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#C65D2E',
  },
  dicaText: { flex: 1, fontSize: 14, lineHeight: 22, color: '#2B2B2B', fontStyle: 'italic' },
  paragraph: { fontSize: 14, color: '#2B2B2B', lineHeight: 22 },
  shareButton: { marginTop: 28, borderRadius: 8 },
  shareButtonContent: { paddingVertical: 6 },
});
