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
  Alert,
} from 'react-native';
import { Chip, Divider } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import {
  getLocal,
  type LocalTurismo,
  type LocalTurismoType,
} from '../../services/turismo.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';

const TYPE_META: Record<LocalTurismoType, { label: string; color: string; icon: string }> = {
  hotel: { label: 'Hotel', color: '#1976D2', icon: 'bed' },
  pousada: { label: 'Pousada', color: '#6B1E1E', icon: 'home-variant' },
  restaurante: { label: 'Restaurante', color: '#C84B1A', icon: 'silverware-fork-knife' },
  atracao: { label: 'Atração', color: '#6A1B9A', icon: 'star' },
  cachoeira: { label: 'Cachoeira', color: '#00838F', icon: 'waves' },
  igreja: { label: 'Igreja', color: '#455A64', icon: 'church' },
  trilha: { label: 'Trilha', color: '#2E7D32', icon: 'hiking' },
  mercado: { label: 'Mercado', color: '#EF6C00', icon: 'storefront-outline' },
  servico: { label: 'Serviço', color: '#6B5B4A', icon: 'cog-outline' },
};

function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function LocalDetailScreen() {
  const route = useRoute<any>();
  const localId = route.params?.localId;

  const [local, setLocal] = useState<LocalTurismo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (localId === undefined || localId === null) {
      setError('Local não encontrado');
      setLoading(false);
      return;
    }
    setError(null);
    try {
      setLocal(await getLocal(localId));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar local');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [localId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!local) return null;

  const meta = TYPE_META[local.type];
  const lat = parseNumber(local.lat);
  const lng = parseNumber(local.lng);
  const distancia = parseNumber(local.distance_km);

  async function openUrl(url: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Não foi possível abrir', url);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o link.');
    }
  }

  function handleCall() {
    if (!local?.phone) return;
    const cleaned = local.phone.replace(/[^\d+]/g, '');
    openUrl(`tel:${cleaned}`);
  }

  function handleWhatsApp() {
    if (!local?.whatsapp) return;
    openUrl(`https://wa.me/${local.whatsapp}`);
  }

  function handleMaps() {
    if (lat !== null && lng !== null) {
      const label = encodeURIComponent(local?.name ?? 'Local');
      const url =
        Platform.OS === 'ios'
          ? `maps:0,0?q=${label}@${lat},${lng}`
          : `geo:0,0?q=${lat},${lng}(${label})`;
      const fallback = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.canOpenURL(url).then((supported) => {
        openUrl(supported ? url : fallback);
      });
      return;
    }
    if (local?.address) {
      const q = encodeURIComponent(local.address);
      openUrl(`https://www.google.com/maps/search/?api=1&query=${q}`);
    }
  }

  function handleSite() {
    if (!local?.website_url) return;
    openUrl(local.website_url);
  }

  const gallery = Array.isArray(local.gallery) ? local.gallery : [];
  const hasMaps = (lat !== null && lng !== null) || !!local.address;

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
      {local.cover_url ? (
        <Image source={{ uri: local.cover_url }} style={styles.cover} />
      ) : (
        <View style={[styles.cover, styles.coverPlaceholder]}>
          <Icon name={meta.icon as any} size={64} color="#C84B1A" />
        </View>
      )}

      {gallery.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.gallery}
        >
          {gallery.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.galleryImg} />
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.body}>
        <View style={[styles.typeChip, { backgroundColor: meta.color }]}>
          <Icon name={meta.icon as any} size={12} color="#FFF" />
          <Text style={styles.typeChipText}>{meta.label}</Text>
        </View>

        <Text style={styles.title}>{local.name}</Text>

        {local.address ? (
          <View style={styles.metaRow}>
            <Icon name="map-marker" size={16} color="#6B5B4A" />
            <Text style={styles.metaText}>{local.address}</Text>
          </View>
        ) : null}

        <View style={styles.chipsRow}>
          {distancia !== null ? (
            <Chip icon="walk" style={styles.chip} textStyle={styles.chipText}>
              {distancia.toFixed(1)} km do festival
            </Chip>
          ) : null}
          {local.price_range ? (
            <Chip icon="cash" style={styles.chip} textStyle={styles.chipText}>
              {local.price_range}
            </Chip>
          ) : null}
          {local.rating !== null && local.rating !== undefined ? (
            <Chip icon="star" style={styles.chip} textStyle={styles.chipText}>
              {Number(local.rating).toFixed(1)}
            </Chip>
          ) : null}
        </View>

        {local.description ? (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Sobre</Text>
            <Text style={styles.paragraph}>{local.description}</Text>
          </>
        ) : null}

        {local.amenities && local.amenities.length > 0 ? (
          <>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Amenidades</Text>
            <View style={styles.amenitiesRow}>
              {local.amenities.map((a, idx) => (
                <View key={idx} style={styles.amenityChip}>
                  <Icon name="check-circle-outline" size={14} color="#2E7D32" />
                  <Text style={styles.amenityText}>{a}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Contato</Text>
        <View style={styles.actions}>
          {local.phone ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#1976D2' }]}
              onPress={handleCall}
            >
              <Icon name="phone" size={20} color="#FFF" />
              <Text style={styles.actionText}>Ligar</Text>
            </TouchableOpacity>
          ) : null}
          {local.whatsapp ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#25D366' }]}
              onPress={handleWhatsApp}
            >
              <Icon name="whatsapp" size={20} color="#FFF" />
              <Text style={styles.actionText}>WhatsApp</Text>
            </TouchableOpacity>
          ) : null}
          {hasMaps ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#C84B1A' }]}
              onPress={handleMaps}
            >
              <Icon name="map-marker-radius" size={20} color="#FFF" />
              <Text style={styles.actionText}>Como chegar</Text>
            </TouchableOpacity>
          ) : null}
          {local.website_url ? (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#455A64' }]}
              onPress={handleSite}
            >
              <Icon name="web" size={20} color="#FFF" />
              <Text style={styles.actionText}>Site</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  content: { paddingBottom: 40 },
  cover: { width: '100%', height: 240, backgroundColor: '#E5DCC8' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  gallery: { gap: 8, padding: 10, paddingRight: 20 },
  galleryImg: {
    width: 120,
    height: 90,
    borderRadius: 8,
    backgroundColor: '#E5DCC8',
  },
  body: { padding: 16, gap: 10 },
  typeChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeChipText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: { fontSize: 26, fontWeight: '900', color: '#6B1E1E', fontFamily: 'PlayfairDisplay_700Bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, color: '#6B5B4A', flexShrink: 1 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { backgroundColor: '#FFF' },
  chipText: { color: '#2B1A10', fontSize: 12 },
  divider: { marginVertical: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#6B1E1E', marginBottom: 10, fontFamily: 'PlayfairDisplay_700Bold' },
  paragraph: { fontSize: 14, color: '#2B1A10', lineHeight: 22 },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  amenityText: { color: '#2B1A10', fontSize: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: 150,
  },
  actionText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
