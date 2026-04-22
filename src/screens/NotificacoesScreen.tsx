import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import {
  loadLog,
  clearLog,
  markLogRead,
  reportOpened,
  updatePreferences,
  type ReceivedNotificacao,
  type DevicePreferences,
} from '../services/notificacoes.service';

const CATEGORY_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  shows: { label: 'Shows', icon: 'music', color: '#9B59B6' },
  oficinas: { label: 'Oficinas', icon: 'school', color: '#D4A017' },
  patrocinios: { label: 'Ofertas', icon: 'tag', color: '#4A90E2' },
  emergencia: { label: 'Emergência', icon: 'alert', color: '#D32F2F' },
  geral: { label: 'Geral', icon: 'bell', color: '#8B4513' },
};

type PrefKey = keyof DevicePreferences;

const TOGGLEABLE: { key: PrefKey; label: string; desc: string }[] = [
  { key: 'shows', label: 'Shows', desc: 'Avisos de início de shows e apresentações' },
  { key: 'oficinas', label: 'Oficinas', desc: 'Vagas abertas em oficinas culinárias' },
  { key: 'patrocinios', label: 'Ofertas', desc: 'Cupons e promoções dos patrocinadores' },
  { key: 'emergencia', label: 'Emergência', desc: 'Alertas meteorológicos e de segurança' },
];

export default function NotificacoesScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<ReceivedNotificacao[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [prefs, setPrefs] = useState<DevicePreferences>({
    shows: true,
    oficinas: true,
    patrocinios: true,
    emergencia: true,
  });
  const [savingPref, setSavingPref] = useState<PrefKey | null>(null);

  const load = useCallback(async () => {
    const log = await loadLog();
    setItems(log);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const sub = Notifications.addNotificationReceivedListener(async () => {
      // Quando uma push chega com o app aberto, recarrega o log (o App.tsx aloca no storage).
      await load();
    });
    return () => {
      sub.remove();
    };
  }, [load]);

  async function handleOpen(item: ReceivedNotificacao) {
    if (!item.read) {
      const next = await markLogRead(item.id);
      setItems(next);
    }
    if (item.notificacao_id) {
      reportOpened(item.notificacao_id);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }

  async function handleClear() {
    Alert.alert('Limpar histórico', 'Remover todas as notificações recebidas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar',
        style: 'destructive',
        onPress: async () => {
          await clearLog();
          setItems([]);
        },
      },
    ]);
  }

  async function togglePref(key: PrefKey) {
    if (!user) {
      Alert.alert('Login necessário', 'Entre com sua conta para personalizar notificações.');
      return;
    }
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSavingPref(key);
    const result = await updatePreferences({ [key]: next[key] });
    setSavingPref(null);
    if (!result) {
      // Reverte em caso de erro
      setPrefs(prefs);
      Alert.alert('Erro', 'Não foi possível salvar a preferência.');
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notificações</Text>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClear}>
            <Text style={styles.clearBtn}>Limpar</Text>
          </TouchableOpacity>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="bell-off-outline" size={48} color="#C0B9A8" />
          <Text style={styles.emptyTitle}>Nenhuma notificação</Text>
          <Text style={styles.emptyDesc}>
            Quando a organização enviar avisos, eles aparecerão aqui.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {items.map((n) => {
            const meta = CATEGORY_META[n.category] ?? CATEGORY_META.geral;
            return (
              <TouchableOpacity
                key={n.id}
                onPress={() => handleOpen(n)}
                activeOpacity={0.7}
                style={[styles.item, !n.read && styles.itemUnread]}
              >
                <View style={[styles.iconCircle, { backgroundColor: meta.color }]}>
                  <Icon name={meta.icon as keyof typeof Icon.glyphMap} size={18} color="#FFF" />
                </View>
                <View style={styles.itemBody}>
                  <View style={styles.itemHeader}>
                    <Text style={styles.itemCategory}>{meta.label}</Text>
                    <Text style={styles.itemTime}>{formatTime(n.received_at)}</Text>
                  </View>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.itemText}>{n.body}</Text>
                </View>
                {!n.read && <View style={styles.dot} />}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Preferências */}
      <View style={styles.prefsSection}>
        <Text style={styles.prefsTitle}>Preferências</Text>
        <Text style={styles.prefsSubtitle}>
          {user
            ? 'Escolha quais tipos de aviso quer receber.'
            : 'Entre com sua conta para personalizar.'}
        </Text>

        {TOGGLEABLE.map((t) => (
          <View key={t.key} style={styles.prefRow}>
            <View style={styles.prefInfo}>
              <Text style={styles.prefLabel}>{t.label}</Text>
              <Text style={styles.prefDesc}>{t.desc}</Text>
            </View>
            <Switch
              value={prefs[t.key]}
              onValueChange={() => togglePref(t.key)}
              disabled={!user || savingPref === t.key}
              trackColor={{ false: '#E5E0D5', true: '#8B4513' }}
              thumbColor="#FFF"
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (sameDay) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#2B2B2B' },
  clearBtn: { fontSize: 13, color: '#C65D2E', fontWeight: '600' },

  empty: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#2B2B2B', marginTop: 12 },
  emptyDesc: { fontSize: 13, color: '#6B6B6B', textAlign: 'center', marginTop: 6 },

  list: { gap: 10 },
  item: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    padding: 12,
    alignItems: 'flex-start',
  },
  itemUnread: { borderColor: '#8B4513', backgroundColor: '#FFFBF4' },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemBody: { flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  itemCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B4513',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemTime: { fontSize: 11, color: '#6B6B6B' },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#2B2B2B' },
  itemText: { fontSize: 13, color: '#4B4B4B', marginTop: 2, lineHeight: 18 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C65D2E',
    marginTop: 8,
  },

  prefsSection: {
    marginTop: 24,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    padding: 14,
  },
  prefsTitle: { fontSize: 16, fontWeight: '700', color: '#2B2B2B' },
  prefsSubtitle: { fontSize: 12, color: '#6B6B6B', marginTop: 4, marginBottom: 12 },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1ECE0',
  },
  prefInfo: { flex: 1, paddingRight: 12 },
  prefLabel: { fontSize: 14, fontWeight: '600', color: '#2B2B2B' },
  prefDesc: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
});
