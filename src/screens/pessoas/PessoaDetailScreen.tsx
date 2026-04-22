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
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../../config/api';
import { getPessoa, type Pessoa, type PessoaRole } from '../../services/pessoa.service';
import Loading from '../../components/ui/Loading';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';

const ROLE_LABELS: Record<PessoaRole, string> = {
  cozinheira: 'Cozinheira tradicional',
  artista: 'Artista',
  artesao: 'Artesão(ã)',
  produtor: 'Produtor(a)',
};

interface BarracaRef {
  id: number;
  name: string;
  cover_url: string | null;
  cozinheira_id: number | null;
  location: string | null;
}

interface EventoRef {
  id: number;
  title: string;
  artist_id: number | null;
  cook_id: number | null;
  starts_at: string;
  location: string | null;
  cover_url: string | null;
  type: string;
}

type SocialKey = 'instagram' | 'facebook' | 'youtube' | 'whatsapp' | 'website';

const SOCIAL_ICONS: Record<SocialKey, string> = {
  instagram: 'instagram',
  facebook: 'facebook',
  youtube: 'youtube',
  whatsapp: 'whatsapp',
  website: 'web',
};

const SOCIAL_COLORS: Record<SocialKey, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  youtube: '#FF0000',
  whatsapp: '#25D366',
  website: '#6B1E1E',
};

function buildSocialUrl(key: SocialKey, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (key === 'whatsapp') {
    const digits = value.replace(/\D/g, '');
    if (!digits) return null;
    const withCountry = digits.length <= 11 ? `55${digits}` : digits;
    return `https://wa.me/${withCountry}`;
  }
  if (key === 'instagram' && !value.startsWith('http')) {
    const handle = value.replace(/^@/, '');
    return `https://instagram.com/${handle}`;
  }
  if (!/^https?:\/\//i.test(value)) return `https://${value}`;
  return value;
}

export default function PessoaDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const pessoaId = Number(route.params?.pessoaId);

  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [barracas, setBarracas] = useState<BarracaRef[]>([]);
  const [eventos, setEventos] = useState<EventoRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const p = await getPessoa(pessoaId);
      setPessoa(p);

      if (p.role === 'cozinheira') {
        const { data } = await api.get<{ data: BarracaRef[] }>('/barracas');
        setBarracas((data.data ?? []).filter((b) => b.cozinheira_id === p.id));
      } else {
        setBarracas([]);
      }

      if (p.role === 'artista') {
        const { data } = await api.get<{ data: EventoRef[] }>('/eventos');
        setEventos((data.data ?? []).filter((e) => e.artist_id === p.id));
      } else {
        setEventos([]);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erro ao carregar pessoa');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pessoaId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loading message="Carregando..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!pessoa) return <EmptyState icon="account-off-outline" title="Pessoa não encontrada" />;

  const socials = (Object.keys(SOCIAL_ICONS) as SocialKey[])
    .map((key) => ({ key, url: buildSocialUrl(key, pessoa.social?.[key] ?? '') }))
    .filter((s) => !!s.url);

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
      <View style={styles.hero}>
        {pessoa.photo_url ? (
          <Image source={{ uri: pessoa.photo_url }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Icon name="account" size={80} color="#C84B1A" />
          </View>
        )}
        <Text style={styles.name}>{pessoa.name}</Text>
        <Text style={styles.role}>{ROLE_LABELS[pessoa.role]}</Text>
      </View>

      {pessoa.bio ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.paragraph}>{pessoa.bio}</Text>
        </View>
      ) : null}

      {socials.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contato e redes</Text>
          <View style={styles.socialRow}>
            {socials.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.socialBtn, { borderColor: SOCIAL_COLORS[s.key] }]}
                onPress={() => s.url && Linking.openURL(s.url)}
              >
                <Icon name={SOCIAL_ICONS[s.key] as any} size={26} color={SOCIAL_COLORS[s.key]} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : null}

      {pessoa.role === 'cozinheira' && barracas.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Barracas</Text>
          {barracas.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={styles.relCard}
              onPress={() => nav.navigate('BarracaDetail', { barracaId: b.id })}
            >
              {b.cover_url ? (
                <Image source={{ uri: b.cover_url }} style={styles.relImage} />
              ) : (
                <View style={[styles.relImage, styles.relImagePlaceholder]}>
                  <Icon name="storefront" size={28} color="#C84B1A" />
                </View>
              )}
              <View style={styles.relBody}>
                <Text style={styles.relTitle}>{b.name}</Text>
                {b.location ? <Text style={styles.relMeta}>{b.location}</Text> : null}
              </View>
              <Icon name="chevron-right" size={22} color="#6B5B4A" />
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {pessoa.role === 'artista' && eventos.length > 0 ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Apresentações</Text>
          {eventos.map((e) => (
            <View key={e.id} style={styles.relCard}>
              {e.cover_url ? (
                <Image source={{ uri: e.cover_url }} style={styles.relImage} />
              ) : (
                <View style={[styles.relImage, styles.relImagePlaceholder]}>
                  <Icon name={'calendar-music' as any} size={28} color="#C84B1A" />
                </View>
              )}
              <View style={styles.relBody}>
                <Text style={styles.relTitle}>{e.title}</Text>
                <Text style={styles.relMeta}>
                  {new Date(e.starts_at).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {e.location ? ` · ${e.location}` : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0' },
  content: { paddingBottom: 32 },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    backgroundColor: '#6B1E1E',
  },
  photo: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: '#FFF',
    backgroundColor: '#FAF2E0',
  },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  name: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  role: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#FFF',
    marginTop: 12,
    marginHorizontal: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B1E1E',
    marginBottom: 10,
  },
  paragraph: { fontSize: 14, color: '#2B1A10', lineHeight: 22 },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF2E0',
  },
  relCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF2E0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    gap: 12,
  },
  relImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#E5DCC8' },
  relImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  relBody: { flex: 1 },
  relTitle: { fontSize: 14, fontWeight: '700', color: '#2B1A10' },
  relMeta: { fontSize: 12, color: '#6B5B4A', marginTop: 3 },
});
