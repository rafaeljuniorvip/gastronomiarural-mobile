import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../config/api';
import Loading from '../components/ui/Loading';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';

const DAYS = [
  { date: '2026-06-04', label: 'Qui 04' },
  { date: '2026-06-05', label: 'Sex 05' },
  { date: '2026-06-06', label: 'Sáb 06' },
  { date: '2026-06-07', label: 'Dom 07' },
];

interface Evento {
  id: number;
  type: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_minutes: number | null;
  location: string | null;
}

export default function ProgramacaoScreen() {
  const [day, setDay] = useState(DAYS[0].date);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get<{ data: Evento[] }>('/eventos', { params: { day } });
      setEventos(res.data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar programação');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [day]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {DAYS.map((d) => (
          <TouchableOpacity
            key={d.date}
            onPress={() => setDay(d.date)}
            style={[styles.dayChip, day === d.date && styles.dayChipActive]}
          >
            <Text style={[styles.dayText, day === d.date && styles.dayTextActive]}>{d.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <Loading message="Carregando..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : eventos.length === 0 ? (
        <EmptyState icon="calendar-blank" title="Sem eventos" message="Nenhum evento para este dia ainda." />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          {eventos.map((e) => (
            <View key={e.id} style={styles.card}>
              <View style={styles.cardTime}>
                <Text style={styles.time}>
                  {new Date(e.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {e.duration_minutes ? <Text style={styles.duration}>{e.duration_minutes}min</Text> : null}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.type}>{e.type}</Text>
                <Text style={styles.title}>{e.title}</Text>
                {e.location ? <Text style={styles.location}>{e.location}</Text> : null}
                {e.description ? <Text style={styles.description}>{e.description}</Text> : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  days: { padding: 12, gap: 8 },
  dayChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E5E0D5', marginRight: 6 },
  dayChipActive: { backgroundColor: '#8B4513', borderColor: '#8B4513' },
  dayText: { fontSize: 13, color: '#6B6B6B' },
  dayTextActive: { color: '#FFF', fontWeight: '700' },
  list: { padding: 12, paddingTop: 0 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E0D5' },
  cardTime: { width: 70, borderRightWidth: 1, borderRightColor: '#E5E0D5', paddingRight: 10, alignItems: 'center', justifyContent: 'center' },
  time: { fontSize: 18, fontWeight: '900', color: '#8B4513' },
  duration: { fontSize: 11, color: '#6B6B6B', marginTop: 2 },
  cardBody: { flex: 1, paddingLeft: 14 },
  type: { fontSize: 10, color: '#C65D2E', fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 15, fontWeight: '600', color: '#2B2B2B', marginTop: 2 },
  location: { fontSize: 12, color: '#6B6B6B', marginTop: 2 },
  description: { fontSize: 13, color: '#6B6B6B', marginTop: 6 },
});
