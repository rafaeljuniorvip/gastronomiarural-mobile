import { View, Text, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Button, Divider } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const nav = useNavigation<any>();

  if (!user) return null;

  function confirmLogout() {
    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Icon name="account" size={48} color="#FFF" />
          </View>
        )}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <Divider style={styles.divider} />

      <TouchableOpacity
        style={styles.row}
        onPress={() => nav.navigate('Favoritos')}
      >
        <Icon name="heart-outline" size={24} color="#8B4513" />
        <Text style={styles.rowText}>Meus favoritos</Text>
        <Icon name="chevron-right" size={22} color="#6B6B6B" />
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas oficinas</Text>
        <View style={styles.placeholderCard}>
          <Icon name="school-outline" size={20} color="#6B6B6B" />
          <Text style={styles.placeholderText}>
            As oficinas em que você se inscreveu aparecerão aqui em breve.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Minhas avaliações</Text>
        <View style={styles.placeholderCard}>
          <Icon name="star-outline" size={20} color="#6B6B6B" />
          <Text style={styles.placeholderText}>
            O histórico das suas avaliações aparecerá aqui em breve.
          </Text>
        </View>
      </View>

      <Button
        mode="outlined"
        textColor="#C62828"
        icon="logout"
        style={styles.logout}
        contentStyle={styles.logoutContent}
        onPress={confirmLogout}
      >
        Sair da conta
      </Button>

      <Text style={styles.footer}>Festival de Gastronomia Rural · Itapecerica MG</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  content: { padding: 16, paddingBottom: 32 },
  header: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#8B4513' },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '700', color: '#2B2B2B', marginTop: 14 },
  email: { fontSize: 13, color: '#6B6B6B', marginTop: 4 },
  divider: { marginVertical: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
    marginBottom: 10,
  },
  rowText: { flex: 1, fontSize: 15, color: '#2B2B2B', fontWeight: '500' },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E0D5',
  },
  placeholderText: { flex: 1, fontSize: 12, color: '#6B6B6B', lineHeight: 17 },
  logout: { marginTop: 28, borderColor: '#C62828', borderRadius: 8 },
  logoutContent: { paddingVertical: 4 },
  footer: { textAlign: 'center', fontSize: 11, color: '#6B6B6B', marginTop: 24 },
});
