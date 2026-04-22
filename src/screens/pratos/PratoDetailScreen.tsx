import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getPrato, type Prato } from '../../services/prato.service';
import { listReceitas, type Receita } from '../../services/receita.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import AvaliacoesList from '../../components/avaliacoes/AvaliacoesList';
import FavoriteButton from '../../components/FavoriteButton';
import PratoMarkerButtons from '../../components/pratos/PratoMarkerButtons';

export default function PratoDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const pratoId = Number(route.params?.pratoId);

  const [prato, setPrato] = useState<Prato | null>(null);
  const [receita, setReceita] = useState<Receita | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [avaliacoesRefreshKey, setAvaliacoesRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPrato(await getPrato(pratoId));
      try {
        const receitas = await listReceitas({ prato_id: pratoId });
        setReceita(receitas[0] ?? null);
      } catch {
        setReceita(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar prato');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pratoId]);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(
    useCallback(() => {
      setAvaliacoesRefreshKey((k) => k + 1);
    }, [])
  );

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!prato) return null;

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
            setAvaliacoesRefreshKey((k) => k + 1);
          }}
        />
      }
    >
      <View style={styles.coverWrap}>
        {prato.photo_url ? (
          <Image source={{ uri: prato.photo_url }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Icon name="silverware-fork-knife" size={56} color="#C65D2E" />
          </View>
        )}
        <View style={styles.favWrap}>
          <FavoriteButton refType="prato" refId={pratoId} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.category}>{prato.category}</Text>
        <Text style={styles.title}>{prato.name}</Text>
        <Text style={styles.price}>R$ {Number(prato.price).toFixed(2).replace('.', ',')}</Text>
        {prato.description ? <Text style={styles.description}>{prato.description}</Text> : null}

        <PratoMarkerButtons pratoId={pratoId} />

        {receita ? (
          <Button
            mode="contained"
            icon="chef-hat"
            buttonColor="#C65D2E"
            style={styles.button}
            contentStyle={styles.buttonContent}
            onPress={() => nav.navigate('ReceitaDetail', { receitaId: receita.id })}
          >
            Ver receita completa
          </Button>
        ) : null}

        <Button
          mode="contained"
          buttonColor="#8B4513"
          style={styles.button}
          contentStyle={styles.buttonContent}
          onPress={() => nav.navigate('BarracaDetail', { barracaId: prato.barraca_id })}
        >
          Ver a barraca
        </Button>

        <Divider style={styles.divider} />

        <View style={styles.avaliacoesHeader}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <Button
            mode="contained"
            compact
            icon="star-plus-outline"
            buttonColor="#C65D2E"
            textColor="#FFF"
            onPress={() =>
              nav.navigate('NovaAvaliacao', {
                prato_id: pratoId,
                title: prato.name,
              })
            }
          >
            Avaliar
          </Button>
        </View>
        <AvaliacoesList prato_id={pratoId} refreshKey={avaliacoesRefreshKey} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { paddingBottom: 40 },
  coverWrap: { position: 'relative' },
  cover: { width: '100%', height: 260, backgroundColor: '#E5E0D5' },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  favWrap: { position: 'absolute', top: 12, right: 12 },
  body: { padding: 16 },
  category: { fontSize: 11, color: '#C65D2E', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '900', color: '#8B4513', marginTop: 4 },
  price: { fontSize: 22, fontWeight: '700', color: '#C65D2E', marginTop: 8 },
  description: { fontSize: 15, color: '#2B2B2B', lineHeight: 22, marginTop: 12 },
  button: { marginTop: 20, borderRadius: 8 },
  buttonContent: { paddingVertical: 4 },
  divider: { marginVertical: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#8B4513' },
  avaliacoesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
