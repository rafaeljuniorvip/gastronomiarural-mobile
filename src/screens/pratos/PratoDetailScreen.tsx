import { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, RefreshControl } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getPrato, type Prato } from '../../services/prato.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

export default function PratoDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const pratoId = Number(route.params?.pratoId);

  const [prato, setPrato] = useState<Prato | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPrato(await getPrato(pratoId));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar prato');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pratoId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!prato) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
    >
      {prato.photo_url && <Image source={{ uri: prato.photo_url }} style={styles.cover} />}
      <View style={styles.body}>
        <Text style={styles.category}>{prato.category}</Text>
        <Text style={styles.title}>{prato.name}</Text>
        <Text style={styles.price}>R$ {Number(prato.price).toFixed(2).replace('.', ',')}</Text>
        {prato.description && <Text style={styles.description}>{prato.description}</Text>}

        <Button
          mode="contained"
          buttonColor="#8B4513"
          style={styles.button}
          onPress={() => nav.navigate('BarracaDetail', { barracaId: prato.barraca_id })}
        >
          Ver a barraca
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { paddingBottom: 32 },
  cover: { width: '100%', height: 260 },
  body: { padding: 16 },
  category: { fontSize: 11, color: '#C65D2E', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 26, fontWeight: '900', color: '#8B4513', marginTop: 4 },
  price: { fontSize: 22, fontWeight: '700', color: '#C65D2E', marginTop: 8 },
  description: { fontSize: 15, color: '#2B2B2B', lineHeight: 22, marginTop: 12 },
  button: { marginTop: 20 },
});
