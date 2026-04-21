import { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { listAvaliacoes, type Avaliacao } from '../../services/avaliacao.service';
import { formatRelativeDate } from '../../utils/date';
import StarRating from './StarRating';

interface Props {
  prato_id?: number;
  barraca_id?: number;
  evento_id?: number;
  refreshKey?: number;
}

export default function AvaliacoesList({ prato_id, barraca_id, evento_id, refreshKey }: Props) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const filter: { prato_id?: number; barraca_id?: number; evento_id?: number } = {};
      if (prato_id) filter.prato_id = prato_id;
      if (barraca_id) filter.barraca_id = barraca_id;
      if (evento_id) filter.evento_id = evento_id;
      const list = await listAvaliacoes(filter);
      setAvaliacoes(list);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  }, [prato_id, barraca_id, evento_id]);

  useEffect(() => { load(); }, [load, refreshKey]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#8B4513" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <View style={styles.emptyBox}>
        <Icon name="star-outline" size={32} color="#C65D2E" />
        <Text style={styles.emptyTitle}>Sem avaliações ainda</Text>
        <Text style={styles.emptyMessage}>Seja o primeiro a avaliar.</Text>
      </View>
    );
  }

  const average =
    avaliacoes.reduce((sum, a) => sum + Number(a.rating || 0), 0) / avaliacoes.length;

  return (
    <View>
      <View style={styles.summary}>
        <Text style={styles.avgNumber}>{average.toFixed(1)}</Text>
        <View style={styles.summaryRight}>
          <StarRating value={Math.round(average)} readOnly size={18} />
          <Text style={styles.summaryCount}>
            {avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'}
          </Text>
        </View>
      </View>

      {avaliacoes.map((a) => (
        <View key={a.id} style={styles.card}>
          <View style={styles.header}>
            {a.user_avatar_url ? (
              <Image source={{ uri: a.user_avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Icon name="account" size={18} color="#6B6B6B" />
              </View>
            )}
            <View style={styles.headerText}>
              <Text style={styles.userName} numberOfLines={1}>
                {a.user_name || 'Visitante'}
              </Text>
              <Text style={styles.date}>{formatRelativeDate(a.created_at)}</Text>
            </View>
            <StarRating value={a.rating} readOnly size={16} />
          </View>

          {a.comment ? <Text style={styles.comment}>{a.comment}</Text> : null}

          {a.photos && a.photos.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photosRow}
            >
              {a.photos.map((url, idx) => (
                <Image key={idx} source={{ uri: url }} style={styles.photo} />
              ))}
            </ScrollView>
          ) : null}

          {a.owner_reply ? (
            <View style={styles.reply}>
              <View style={styles.replyHeader}>
                <Icon name="store" size={14} color="#8B4513" />
                <Text style={styles.replyLabel}>Resposta da barraca</Text>
              </View>
              <Text style={styles.replyText}>{a.owner_reply}</Text>
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { padding: 16, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#d32f2f', fontSize: 13, textAlign: 'center' },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  emptyTitle: { marginTop: 8, fontSize: 14, fontWeight: '600', color: '#2B2B2B' },
  emptyMessage: { marginTop: 2, fontSize: 12, color: '#6B6B6B' },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    marginBottom: 12,
    gap: 14,
  },
  avgNumber: { fontSize: 36, fontWeight: '900', color: '#8B4513' },
  summaryRight: { flex: 1 },
  summaryCount: { marginTop: 4, fontSize: 12, color: '#6B6B6B' },
  card: {
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    marginBottom: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FAF7F2' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '600', color: '#2B2B2B' },
  date: { fontSize: 11, color: '#6B6B6B', marginTop: 1 },
  comment: { fontSize: 13, color: '#2B2B2B', lineHeight: 19 },
  photosRow: { marginTop: 10 },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#FAF7F2',
  },
  reply: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FAF7F2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513',
  },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  replyLabel: { fontSize: 11, fontWeight: '700', color: '#8B4513', textTransform: 'uppercase', letterSpacing: 0.5 },
  replyText: { fontSize: 13, color: '#2B2B2B', lineHeight: 18 },
});
