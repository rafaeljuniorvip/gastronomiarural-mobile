import { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as WebBrowser from 'expo-web-browser';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config/api';

const MOBILE_LOGIN_URL =
  deriveWebOriginFromApi(API_BASE_URL) + '/mobile-login';
const APP_RETURN_SCHEME = 'gastronomiarural://auth';

function deriveWebOriginFromApi(apiBase: string): string {
  try {
    const parsed = new URL(apiBase);
    const host = parsed.host.replace(/^api\./, '');
    return `${parsed.protocol}//${host}`;
  } catch {
    return 'https://gastronomiarural.viptecnologia.com.br';
  }
}

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { loginWithToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleGooglePress() {
    try {
      setSubmitting(true);
      const result = await WebBrowser.openAuthSessionAsync(
        MOBILE_LOGIN_URL,
        APP_RETURN_SCHEME
      );

      if (result.type !== 'success' || !result.url) {
        setSubmitting(false);
        return;
      }

      let token: string | null = null;
      try {
        const parsed = new URL(result.url);
        token = parsed.searchParams.get('token');
      } catch {
        const match = result.url.match(/[?&]token=([^&]+)/);
        token = match ? decodeURIComponent(match[1]) : null;
      }

      if (!token) {
        Alert.alert('Erro', 'Login não retornou token.');
        setSubmitting(false);
        return;
      }

      await loginWithToken(token);
    } catch (err: any) {
      Alert.alert('Falha ao entrar', err?.message || 'Erro desconhecido');
    } finally {
      setSubmitting(false);
    }
  }

  function continueAsGuest() {
    nav.navigate('HomeTab');
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Icon name="chef-hat" size={72} color="#6B1E1E" />
        <Text style={styles.title}>Festival de{'\n'}Gastronomia Rural</Text>
        <Text style={styles.subtitle}>
          Entre para avaliar pratos, inscrever-se em oficinas e favoritar barracas.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          buttonColor="#6B1E1E"
          textColor="#FFF"
          icon="google"
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          onPress={handleGooglePress}
          disabled={submitting}
          loading={submitting}
        >
          Continuar com Google
        </Button>

        <Button
          mode="outlined"
          textColor="#6B1E1E"
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
          onPress={continueAsGuest}
          disabled={submitting}
        >
          Continuar como visitante
        </Button>

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#6B1E1E" size="small" />
            <Text style={styles.loadingText}>Validando acesso…</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.note}>
        Ao continuar, você concorda em compartilhar nome, e-mail e foto do seu perfil Google.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF2E0', padding: 28, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 32 },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#6B1E1E',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 30,
  },
  subtitle: { fontSize: 14, color: '#6B5B4A', textAlign: 'center', marginTop: 12 },
  actions: { gap: 12 },
  primaryButton: { borderRadius: 8 },
  secondaryButton: { borderRadius: 8, borderColor: '#6B1E1E' },
  buttonContent: { paddingVertical: 6 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  loadingText: { color: '#6B5B4A', fontSize: 12 },
  note: { fontSize: 11, color: '#6B5B4A', marginTop: 32, textAlign: 'center', lineHeight: 16 },
});
