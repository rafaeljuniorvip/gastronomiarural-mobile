import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import {
  addMarker,
  getMarkerStatus,
  removeMarker,
  type MarcadorKind,
  type MarcadorStatus,
} from '../../services/marcador.service';

interface Props {
  pratoId: number;
}

const EXPERIMENTEI_COLOR = '#C65D2E';
const QUERO_COLOR = '#D9A441';

export default function PratoMarkerButtons({ pratoId }: Props) {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [status, setStatus] = useState<MarcadorStatus>({ experimentei: false, quero_provar: false });
  const [busy, setBusy] = useState<MarcadorKind | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) {
        setStatus({ experimentei: false, quero_provar: false });
        setLoaded(true);
        return;
      }
      try {
        const s = await getMarkerStatus(pratoId);
        if (!cancelled) setStatus(s);
      } catch {
        // mantém estado default
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [pratoId, user]);

  async function toggle(kind: MarcadorKind) {
    if (!user) {
      Alert.alert(
        'Entre para marcar',
        'Faça login para marcar pratos como "experimentei" ou "quero provar".',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entrar', onPress: () => nav.navigate('AccountTab') },
        ]
      );
      return;
    }
    const wasActive = status[kind];
    // Otimista
    setStatus((prev) => ({ ...prev, [kind]: !wasActive }));
    setBusy(kind);
    try {
      if (wasActive) {
        await removeMarker(pratoId, kind);
      } else {
        await addMarker({ prato_id: pratoId, kind });
      }
    } catch {
      // rollback
      setStatus((prev) => ({ ...prev, [kind]: wasActive }));
      Alert.alert('Erro', 'Não foi possível atualizar o marcador. Tente novamente.');
    } finally {
      setBusy(null);
    }
  }

  const experimentado = status.experimentei;
  const desejado = status.quero_provar;

  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[
          styles.btn,
          experimentado ? { backgroundColor: EXPERIMENTEI_COLOR, borderColor: EXPERIMENTEI_COLOR } : null,
        ]}
        onPress={() => toggle('experimentei')}
        disabled={busy !== null || !loaded}
        accessibilityLabel={experimentado ? 'Remover de experimentei' : 'Marcar como experimentei'}
      >
        {busy === 'experimentei' ? (
          <ActivityIndicator size="small" color={experimentado ? '#FFF' : EXPERIMENTEI_COLOR} />
        ) : (
          <View style={styles.btnContent}>
            <Icon
              name="silverware-fork-knife"
              size={18}
              color={experimentado ? '#FFF' : EXPERIMENTEI_COLOR}
            />
            {experimentado ? (
              <View style={styles.checkBadge}>
                <Icon name="check" size={10} color={EXPERIMENTEI_COLOR} />
              </View>
            ) : null}
            <Text
              style={[
                styles.btnLabel,
                experimentado ? { color: '#FFF' } : { color: EXPERIMENTEI_COLOR },
              ]}
            >
              Experimentei
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.btn,
          desejado ? { backgroundColor: QUERO_COLOR, borderColor: QUERO_COLOR } : { borderColor: QUERO_COLOR },
        ]}
        onPress={() => toggle('quero_provar')}
        disabled={busy !== null || !loaded}
        accessibilityLabel={desejado ? 'Remover de quero provar' : 'Adicionar a quero provar'}
      >
        {busy === 'quero_provar' ? (
          <ActivityIndicator size="small" color={desejado ? '#FFF' : QUERO_COLOR} />
        ) : (
          <View style={styles.btnContent}>
            <Icon
              name={desejado ? 'bookmark' : 'bookmark-plus-outline'}
              size={18}
              color={desejado ? '#FFF' : QUERO_COLOR}
            />
            <Text
              style={[
                styles.btnLabel,
                desejado ? { color: '#FFF' } : { color: QUERO_COLOR },
              ]}
            >
              Quero provar
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, marginTop: 16 },
  btn: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: EXPERIMENTEI_COLOR,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnLabel: { fontSize: 13, fontWeight: '700' },
  checkBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -2,
  },
});
