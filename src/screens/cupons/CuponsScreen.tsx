import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import {
  listMyCoupons,
  listMyRedeemed,
  type Cupom,
  type CupomResgateWithCupom,
} from '../../services/cupom.service';

type TabKey = 'available' | 'redeemed';

function formatDate(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function CuponsScreen() {
  const nav = useNavigation<any>();
  const { user } = useAuth();

  const [tab, setTab] = useState<TabKey>('available');
  const [available, setAvailable] = useState<Cupom[]>([]);
  const [redeemed, setRedeemed] = useState<CupomResgateWithCupom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [a, r] = await Promise.all([listMyCoupons(), listMyRedeemed()]);
      setAvailable(a);
      setRedeemed(r);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar cupons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Recarrega ao voltar para a tela (após resgate no scanner)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function handleRefresh() {
    setRefreshing(true);
    load();
  }

  if (!user) {
    return (
      <EmptyState
        icon="ticket-percent-outline"
        title="Entre para usar os cupons"
        message="Você precisa fazer login para resgatar cupons dos patrocinadores."
      />
    );
  }

  if (loading) return <Loading message="Carregando cupons..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const dataLen = tab === 'available' ? available.length : redeemed.length;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'available' && styles.tabActive]}
          onPress={() => setTab('available')}
        >
          <Text style={[styles.tabText, tab === 'available' && styles.tabTextActive]}>
            Disponíveis ({available.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'redeemed' && styles.tabActive]}
          onPress={() => setTab('redeemed')}
        >
          <Text style={[styles.tabText, tab === 'redeemed' && styles.tabTextActive]}>
            Meus resgates ({redeemed.length})
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'available' ? (
        <FlatList
          data={available}
          keyExtractor={(item) => `av-${item.id}`}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            dataLen === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon name="ticket-percent-outline" size={56} color="#C84B1A" />
                <Text style={styles.emptyTitle}>Nenhum cupom disponível</Text>
                <Text style={styles.emptyMsg}>
                  Visite os estandes dos patrocinadores e escaneie o QR Code.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                {item.patrocinador_logo_url ? (
                  <Image source={{ uri: item.patrocinador_logo_url }} style={styles.logo} resizeMode="contain" />
                ) : (
                  <View style={[styles.logo, styles.logoPlaceholder]}>
                    <Icon name="domain" size={20} color="#C84B1A" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.patrocName} numberOfLines={1}>
                    {item.patrocinador_name}
                  </Text>
                  <Text style={styles.code}>{item.code}</Text>
                </View>
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.metaRow}>
                {item.valid_until ? (
                  <View style={styles.metaItem}>
                    <Icon name="clock-outline" size={12} color="#6B5B4A" />
                    <Text style={styles.metaText}>Válido até {formatDate(item.valid_until)}</Text>
                  </View>
                ) : null}
                {item.max_redemptions !== null ? (
                  <View style={styles.metaItem}>
                    <Icon name="account-multiple-outline" size={12} color="#6B5B4A" />
                    <Text style={styles.metaText}>
                      {item.current_redemptions}/{item.max_redemptions} resgatados
                    </Text>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.redeemBtn}
                onPress={() => nav.navigate('CupomScanner')}
                activeOpacity={0.8}
              >
                <Icon name="qrcode-scan" size={16} color="#FFF" />
                <Text style={styles.redeemBtnText}>Escanear QR para resgatar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={redeemed}
          keyExtractor={(item) => `rd-${item.id}`}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            dataLen === 0 ? (
              <View style={styles.emptyWrap}>
                <Icon name="check-decagram-outline" size={56} color="#C84B1A" />
                <Text style={styles.emptyTitle}>Nenhum cupom resgatado ainda</Text>
                <Text style={styles.emptyMsg}>
                  Seus resgates aparecerão aqui.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                nav.navigate('CupomSuccess', {
                  code: item.code,
                  description: item.description,
                  patrocinadorName: item.patrocinador_name,
                  patrocinadorLogo: item.patrocinador_logo_url,
                  redeemedAt: item.redeemed_at,
                })
              }
            >
              <View style={styles.cardHeader}>
                {item.patrocinador_logo_url ? (
                  <Image source={{ uri: item.patrocinador_logo_url }} style={styles.logo} resizeMode="contain" />
                ) : (
                  <View style={[styles.logo, styles.logoPlaceholder]}>
                    <Icon name="domain" size={20} color="#C84B1A" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.patrocName} numberOfLines={1}>
                    {item.patrocinador_name}
                  </Text>
                  <Text style={styles.code}>{item.code}</Text>
                </View>
                <View style={styles.checkBadge}>
                  <Icon name="check" size={14} color="#FFF" />
                </View>
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Icon name="check-circle" size={12} color="#5E7F3E" />
                  <Text style={[styles.metaText, { color: '#5E7F3E', fontWeight: '600' }]}>
                    Resgatado em {formatDateTime(item.redeemed_at)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => nav.navigate('CupomScanner')}
        activeOpacity={0.85}
      >
        <Icon name="qrcode-scan" size={22} color="#FFF" />
        <Text style={styles.fabText}>Escanear QR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5DCC8',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#6B1E1E' },
  tabText: { fontSize: 13, color: '#6B5B4A', fontWeight: '500' },
  tabTextActive: { color: '#6B1E1E', fontWeight: '700' },
  list: { padding: 12, paddingBottom: 96 },
  emptyWrap: { alignItems: 'center', paddingVertical: 64 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#2B1A10' },
  emptyMsg: { marginTop: 6, fontSize: 13, color: '#6B5B4A', textAlign: 'center', paddingHorizontal: 32 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  logo: { width: 42, height: 42, backgroundColor: '#FFF', borderRadius: 6 },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  patrocName: { fontSize: 14, fontWeight: '700', color: '#2B1A10' },
  code: {
    fontSize: 12,
    fontFamily: 'Courier',
    fontWeight: '700',
    color: '#6B1E1E',
    letterSpacing: 1,
    marginTop: 2,
  },
  desc: { fontSize: 14, color: '#2B1A10', lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: '#6B5B4A' },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#C84B1A',
    paddingVertical: 11,
    borderRadius: 8,
  },
  redeemBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#5E7F3E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6B1E1E',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
});
