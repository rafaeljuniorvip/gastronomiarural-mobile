import { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Button, Chip, Divider, Snackbar } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  cancelarInscricao,
  getOficina,
  inscrever,
  type OficinaDetail,
} from '../../services/oficina.service';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatTime } from '../../utils/date';

export default function OficinaDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { user } = useAuth();
  const oficinaId = Number(route.params?.oficinaId);

  const [oficina, setOficina] = useState<OficinaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setOficina(await getOficina(oficinaId));
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar oficina');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [oficinaId]);

  useEffect(() => { load(); }, [load]);

  async function handleInscrever() {
    if (!user) {
      Alert.alert(
        'Entre para se inscrever',
        'Faça login para reservar sua vaga nesta oficina.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entrar', onPress: () => nav.navigate('AccountTab') },
        ]
      );
      return;
    }
    setActionBusy(true);
    try {
      const { qr_code } = await inscrever(oficinaId);
      setOficina((prev) => (prev ? { ...prev, inscrito: true, qr_code } : prev));
      setSnack('Inscrição confirmada! Apresente o código na entrada.');
    } catch (err: any) {
      setSnack(err?.response?.data?.error || 'Não foi possível se inscrever');
    } finally {
      setActionBusy(false);
    }
  }

  async function handleCancelar() {
    Alert.alert(
      'Cancelar inscrição',
      'Tem certeza que deseja cancelar sua inscrição? A vaga será liberada para outros visitantes.',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            setActionBusy(true);
            try {
              await cancelarInscricao(oficinaId);
              setOficina((prev) => (prev ? { ...prev, inscrito: false, qr_code: null } : prev));
              setSnack('Inscrição cancelada.');
            } catch (err: any) {
              setSnack(err?.response?.data?.error || 'Erro ao cancelar inscrição');
            } finally {
              setActionBusy(false);
            }
          },
        },
      ]
    );
  }

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!oficina) return <EmptyState icon="school-outline" title="Oficina não encontrada" />;

  const totalSeats = oficina.total_seats ?? 0;
  const vagasRestantes = Math.max(totalSeats - oficina.vagas_preenchidas, 0);
  const esgotada = totalSeats > 0 && vagasRestantes === 0 && !oficina.inscrito;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
        }
      >
        {oficina.cover_url ? (
          <Image source={{ uri: oficina.cover_url }} style={styles.cover} />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Icon name="school" size={56} color="#C84B1A" />
          </View>
        )}

        <View style={styles.body}>
          <Text style={styles.title}>{oficina.title}</Text>

          <View style={styles.chipsRow}>
            <Chip icon="calendar" style={styles.chip} textStyle={styles.chipText}>
              {formatDate(oficina.starts_at)}
            </Chip>
            <Chip icon="clock-outline" style={styles.chip} textStyle={styles.chipText}>
              {formatTime(oficina.starts_at)}
              {oficina.duration_minutes ? ` · ${oficina.duration_minutes}min` : ''}
            </Chip>
            {oficina.location ? (
              <Chip icon="map-marker" style={styles.chip} textStyle={styles.chipText}>
                {oficina.location}
              </Chip>
            ) : null}
          </View>

          {totalSeats > 0 ? (
            <View style={styles.vagasBox}>
              <Icon
                name={esgotada ? 'lock' : 'ticket-confirmation-outline'}
                size={18}
                color={esgotada ? '#C62828' : '#2E7D32'}
              />
              <Text style={[styles.vagasText, esgotada && styles.vagasTextRed]}>
                {esgotada
                  ? 'Oficina esgotada'
                  : `${vagasRestantes} de ${totalSeats} ${vagasRestantes === 1 ? 'vaga disponível' : 'vagas disponíveis'}`}
              </Text>
            </View>
          ) : null}

          {oficina.description ? (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.sectionTitle}>Sobre a oficina</Text>
              <Text style={styles.paragraph}>{oficina.description}</Text>
            </>
          ) : null}

          {oficina.inscrito && oficina.qr_code ? (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.sectionTitle}>Sua inscrição</Text>
              <View style={styles.qrCard}>
                <Icon name="ticket-confirmation" size={32} color="#6B1E1E" />
                <Text style={styles.qrLabel}>
                  Apresente este código na entrada da oficina:
                </Text>
                <View style={styles.qrCodeBox}>
                  <Text selectable style={styles.qrCodeText}>{oficina.qr_code}</Text>
                </View>
                <Text style={styles.qrHelp}>
                  Chegue com 10 minutos de antecedência.
                </Text>
              </View>
            </>
          ) : null}

          <View style={styles.actions}>
            {oficina.inscrito ? (
              <Button
                mode="outlined"
                textColor="#C62828"
                style={[styles.button, { borderColor: '#C62828' }]}
                contentStyle={styles.buttonContent}
                onPress={handleCancelar}
                disabled={actionBusy}
                loading={actionBusy}
              >
                Cancelar inscrição
              </Button>
            ) : (
              <Button
                mode="contained"
                buttonColor="#6B1E1E"
                style={styles.button}
                contentStyle={styles.buttonContent}
                onPress={handleInscrever}
                disabled={actionBusy || esgotada}
                loading={actionBusy}
              >
                {esgotada ? 'Oficina esgotada' : user ? 'Inscrever-se' : 'Entrar para inscrever-se'}
              </Button>
            )}
          </View>
        </View>
      </ScrollView>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={3000}>
        {snack || ''}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  content: { paddingBottom: 40 },
  cover: { width: '100%', height: 220, backgroundColor: '#E5DCC8' },
  coverPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  body: { padding: 16 },
  title: { fontSize: 26, fontWeight: '900', color: '#6B1E1E', fontFamily: 'PlayfairDisplay_700Bold' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: { backgroundColor: '#FFF' },
  chipText: { color: '#2B1A10', fontSize: 12 },
  vagasBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5DCC8',
    marginTop: 14,
  },
  vagasText: { color: '#2E7D32', fontWeight: '700', fontSize: 13 },
  vagasTextRed: { color: '#C62828' },
  divider: { marginVertical: 18 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#6B1E1E', marginBottom: 10, fontFamily: 'PlayfairDisplay_700Bold' },
  paragraph: { fontSize: 14, color: '#2B1A10', lineHeight: 22 },
  qrCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  qrLabel: { fontSize: 13, color: '#6B5B4A', textAlign: 'center', marginTop: 10 },
  qrCodeBox: {
    marginTop: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: '#FAF2E0',
    borderWidth: 2,
    borderColor: '#6B1E1E',
    borderRadius: 10,
    borderStyle: 'dashed',
  },
  qrCodeText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#6B1E1E',
    fontFamily: 'Courier',
  },
  qrHelp: { fontSize: 11, color: '#6B5B4A', marginTop: 12, fontStyle: 'italic' },
  actions: { marginTop: 24 },
  button: { borderRadius: 8 },
  buttonContent: { paddingVertical: 6 },
});
