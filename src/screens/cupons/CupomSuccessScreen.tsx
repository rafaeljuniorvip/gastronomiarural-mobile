import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

interface CupomSuccessParams {
  code: string;
  description: string;
  patrocinadorName: string;
  patrocinadorLogo?: string | null;
  redeemedAt?: string;
}

function formatDateTime(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function CupomSuccessScreen() {
  const nav = useNavigation<any>();
  const route = useRoute();
  const params = (route.params || {}) as CupomSuccessParams;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bounces={false}
    >
      <View style={styles.badgeWrap}>
        <View style={styles.badgeOuter}>
          <View style={styles.badgeInner}>
            <Icon name="check-bold" size={72} color="#FFF" />
          </View>
        </View>
      </View>

      <Text style={styles.mainTitle}>Cupom resgatado!</Text>
      <Text style={styles.subTitle}>Mostre esta tela ao atendente</Text>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {params.patrocinadorLogo ? (
            <Image source={{ uri: params.patrocinadorLogo }} style={styles.logo} resizeMode="contain" />
          ) : (
            <View style={[styles.logo, styles.logoPlaceholder]}>
              <Icon name="domain" size={24} color="#C84B1A" />
            </View>
          )}
          <Text style={styles.patrocName}>{params.patrocinadorName}</Text>
        </View>

        <View style={styles.codeWrap}>
          <Text style={styles.codeLabel}>CÓDIGO</Text>
          <Text style={styles.code}>{params.code}</Text>
        </View>

        <Text style={styles.description}>{params.description}</Text>

        <View style={styles.seal}>
          <Icon name="check-decagram" size={18} color="#5E7F3E" />
          <Text style={styles.sealText}>ATIVO</Text>
        </View>

        {params.redeemedAt ? (
          <Text style={styles.timestamp}>Resgatado em {formatDateTime(params.redeemedAt)}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => nav.navigate('Cupons')}
        activeOpacity={0.85}
      >
        <Text style={styles.backBtnText}>Voltar aos cupons</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#C84B1A' },
  content: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 40,
    alignItems: 'center',
  },
  badgeWrap: { marginBottom: 20 },
  badgeOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#5E7F3E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    width: '100%',
    justifyContent: 'center',
  },
  logo: { width: 44, height: 44, borderRadius: 6, backgroundColor: '#FFF' },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5DCC8',
  },
  patrocName: { fontSize: 17, fontWeight: '700', color: '#2B1A10', flexShrink: 1 },
  codeWrap: {
    alignItems: 'center',
    backgroundColor: '#FAF2E0',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#C84B1A',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 28,
    marginBottom: 18,
    width: '100%',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B5B4A',
    letterSpacing: 2,
    marginBottom: 6,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 32,
    fontWeight: '800',
    color: '#6B1E1E',
    letterSpacing: 4,
  },
  description: {
    fontSize: 16,
    color: '#2B1A10',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 18,
    fontWeight: '500',
  },
  seal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F2DE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  sealText: { color: '#5E7F3E', fontWeight: '800', letterSpacing: 1.5, fontSize: 12 },
  timestamp: { fontSize: 12, color: '#6B5B4A', marginTop: 4 },
  backBtn: {
    marginTop: 26,
    backgroundColor: '#6B1E1E',
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 28,
  },
  backBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
