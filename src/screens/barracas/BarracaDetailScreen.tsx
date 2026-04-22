import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Chip, Divider, Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { getBarraca, type BarracaDetail } from '../../services/barraca.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import AvaliacoesList from '../../components/avaliacoes/AvaliacoesList';
import FavoriteButton from '../../components/FavoriteButton';

export default function BarracaDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const barracaId = Number(route.params?.barracaId);

  const [barraca, setBarraca] = useState<BarracaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [avaliacoesRefreshKey, setAvaliacoesRefreshKey] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBarraca(await getBarraca(barracaId));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar barraca');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [barracaId]);

  useEffect(() => { load(); }, [load]);

  async function openRoute() {
    if (!barraca?.lat || !barraca?.lng) return;
    const lat = barraca.lat;
    const lng = barraca.lng;
    const label = encodeURIComponent(barraca.name);
    // Tenta abrir o app nativo (Apple Maps iOS, Google Maps Android), senão browser
    const nativeUrl = Platform.select({
      ios: `maps://?daddr=${lat},${lng}&q=${label}`,
      android: `geo:${lat},${lng}?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    });
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    try {
      const can = nativeUrl ? await Linking.canOpenURL(nativeUrl) : false;
      await Linking.openURL(can && nativeUrl ? nativeUrl : fallbackUrl);
    } catch {
      await Linking.openURL(fallbackUrl);
    }
  }

  // Recarrega avaliações quando voltar de NovaAvaliacao
  useFocusEffect(
    useCallback(() => {
      setAvaliacoesRefreshKey((k) => k + 1);
    }, [])
  );

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!barraca) return <EmptyState icon="store-off" title="Barraca não encontrada" />;

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
        {barraca.cover_url ? (
          <Image source={{ uri: barraca.cover_url }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Icon name="storefront" size={56} color="#C84B1A" />
          </View>
        )}
        <View style={styles.favWrap}>
          <FavoriteButton refType="barraca" refId={barracaId} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{barraca.name}</Text>

        <View style={styles.chips}>
          {barraca.location ? (
            <Chip icon="map-marker" style={styles.chip} textStyle={styles.chipText}>{barraca.location}</Chip>
          ) : null}
          {barraca.opening_hours ? (
            <Chip icon="clock-outline" style={styles.chip} textStyle={styles.chipText}>{barraca.opening_hours}</Chip>
          ) : null}
        </View>

        {barraca.lat && barraca.lng ? (
          <TouchableOpacity style={styles.routeBtn} onPress={openRoute} activeOpacity={0.85}>
            <Icon name="directions" size={20} color="#FFF" />
            <Text style={styles.routeBtnText}>Traçar rota até a barraca</Text>
          </TouchableOpacity>
        ) : null}

        {barraca.description ? <Text style={styles.description}>{barraca.description}</Text> : null}

        {barraca.history ? (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>História</Text>
            <Text style={styles.paragraph}>{barraca.history}</Text>
          </>
        ) : null}

        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Cardápio</Text>
        {barraca.pratos.length === 0 ? (
          <Text style={styles.empty}>Nenhum prato cadastrado ainda.</Text>
        ) : (
          barraca.pratos.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={styles.pratoCard}
              onPress={() => nav.navigate('PratoDetail', { pratoId: p.id })}
            >
              {p.photo_url ? (
                <Image source={{ uri: p.photo_url }} style={styles.pratoImage} />
              ) : (
                <View style={[styles.pratoImage, styles.pratoImagePlaceholder]}>
                  <Icon name="image-off-outline" size={24} color="#C84B1A" />
                </View>
              )}
              <View style={styles.pratoBody}>
                <Text style={styles.pratoCategory}>{p.category}</Text>
                <Text style={styles.pratoName}>{p.name}</Text>
                {p.description ? (
                  <Text style={styles.pratoDesc} numberOfLines={2}>{p.description}</Text>
                ) : null}
                <Text style={styles.pratoPrice}>
                  R$ {Number(p.price).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <Divider style={styles.divider} />
        <View style={styles.avaliacoesHeader}>
          <Text style={styles.sectionTitle}>Avaliações</Text>
          <Button
            mode="contained"
            compact
            icon="star-plus-outline"
            buttonColor="#C84B1A"
            textColor="#FFF"
            onPress={() =>
              nav.navigate('NovaAvaliacao', {
                barraca_id: barracaId,
                title: barraca.name,
              })
            }
          >
            Avaliar
          </Button>
        </View>
        <AvaliacoesList barraca_id={barracaId} refreshKey={avaliacoesRefreshKey} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  content: { paddingBottom: 32 },
  coverWrap: { position: 'relative' },
  cover: { width: '100%', height: 220, backgroundColor: '#E5DCC8' },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  favWrap: { position: 'absolute', top: 12, right: 12 },
  body: { padding: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#6B1E1E', marginBottom: 8, fontFamily: 'PlayfairDisplay_700Bold' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#FFF' },
  chipText: { color: '#2B1A10', fontSize: 12 },
  description: { fontSize: 15, color: '#2B1A10', lineHeight: 22 },
  divider: { marginVertical: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#6B1E1E', marginBottom: 12, fontFamily: 'PlayfairDisplay_700Bold' },
  paragraph: { fontSize: 14, color: '#2B1A10', lineHeight: 22 },
  empty: { fontStyle: 'italic', color: '#6B5B4A' },
  pratoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  pratoImage: { width: 90, height: 90 },
  pratoImagePlaceholder: { backgroundColor: '#FAF2E0', justifyContent: 'center', alignItems: 'center' },
  pratoBody: { flex: 1, padding: 12 },
  pratoCategory: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#C84B1A',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pratoName: { fontSize: 15, fontWeight: '600', color: '#2B1A10', marginTop: 2 },
  pratoDesc: { fontSize: 12, color: '#6B5B4A', marginTop: 2 },
  pratoPrice: { fontSize: 15, fontWeight: '700', color: '#C84B1A', marginTop: 6 },
  avaliacoesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5E7F3E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginHorizontal: 14,
    marginVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  routeBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
});
