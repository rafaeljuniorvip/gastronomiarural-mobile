import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { GOOGLE_CLIENT_ID } from '../config/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const nav = useNavigation<any>();
  const { loginWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    async function handleResponse() {
      if (!response) return;
      if (response.type === 'success') {
        const idToken = (response.params as Record<string, string>)?.id_token;
        if (!idToken) {
          Alert.alert('Erro', 'Não foi possível obter o token do Google.');
          return;
        }
        setSubmitting(true);
        try {
          await loginWithGoogle(idToken);
        } catch (err: any) {
          Alert.alert(
            'Falha ao entrar',
            err?.response?.data?.error || 'Não foi possível fazer login com o Google.'
          );
        } finally {
          setSubmitting(false);
        }
      } else if (response.type === 'error') {
        Alert.alert('Erro', 'O login com Google foi cancelado ou falhou.');
      }
    }
    handleResponse();
  }, [response, loginWithGoogle]);

  async function handleGooglePress() {
    try {
      await promptAsync();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível abrir o login do Google.');
    }
  }

  function continueAsGuest() {
    nav.navigate('HomeTab');
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Icon name="chef-hat" size={72} color="#8B4513" />
        <Text style={styles.title}>Festival de{'\n'}Gastronomia Rural</Text>
        <Text style={styles.subtitle}>
          Entre para avaliar pratos, inscrever-se em oficinas e favoritar barracas.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          mode="contained"
          buttonColor="#8B4513"
          textColor="#FFF"
          icon="google"
          style={styles.primaryButton}
          contentStyle={styles.buttonContent}
          onPress={handleGooglePress}
          disabled={!request || submitting}
          loading={submitting}
        >
          Continuar com Google
        </Button>

        <Button
          mode="outlined"
          textColor="#8B4513"
          style={styles.secondaryButton}
          contentStyle={styles.buttonContent}
          onPress={continueAsGuest}
          disabled={submitting}
        >
          Continuar como visitante
        </Button>

        {submitting ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#8B4513" size="small" />
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
  container: { flex: 1, backgroundColor: '#FAF7F2', padding: 28, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 32 },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 30,
  },
  subtitle: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginTop: 12 },
  actions: { gap: 12 },
  primaryButton: { borderRadius: 8 },
  secondaryButton: { borderRadius: 8, borderColor: '#8B4513' },
  buttonContent: { paddingVertical: 6 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  loadingText: { color: '#6B6B6B', fontSize: 12 },
  note: { fontSize: 11, color: '#6B6B6B', marginTop: 32, textAlign: 'center', lineHeight: 16 },
});
