import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Icon name="chef-hat" size={72} color="#8B4513" />
      <Text style={styles.title}>Festival de{'\n'}Gastronomia Rural</Text>
      <Text style={styles.subtitle}>Entre para avaliar pratos, inscrever-se em oficinas e favoritar barracas.</Text>

      <Button
        mode="contained"
        buttonColor="#8B4513"
        icon="google"
        style={styles.button}
        onPress={() => Alert.alert('Em breve', 'Login Google será habilitado via expo-auth-session na próxima build.')}
      >
        Entrar com Google
      </Button>

      <Text style={styles.note}>
        Você pode continuar como visitante sem entrar — basta fechar esta tela.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF7F2', padding: 32 },
  title: { fontSize: 26, fontWeight: '900', color: '#8B4513', textAlign: 'center', marginTop: 16, lineHeight: 30 },
  subtitle: { fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginTop: 12, marginBottom: 24 },
  button: { marginTop: 8, width: '100%' },
  note: { fontSize: 12, color: '#6B6B6B', marginTop: 32, textAlign: 'center' },
});
