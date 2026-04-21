import { useState } from 'react';
import { TouchableOpacity, StyleSheet, Alert, ActivityIndicator, type ViewStyle } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import type { FavoriteRefType } from '../services/favorito.service';

interface Props {
  refType: FavoriteRefType;
  refId: number;
  size?: number;
  style?: ViewStyle;
}

export default function FavoriteButton({ refType, refId, size = 26, style }: Props) {
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const nav = useNavigation<any>();
  const [busy, setBusy] = useState(false);

  const active = user ? isFavorite(refType, refId) : false;

  async function handlePress() {
    if (!user) {
      Alert.alert(
        'Entre para favoritar',
        'Faça login para salvar seus favoritos no festival.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Entrar', onPress: () => nav.navigate('AccountTab') },
        ]
      );
      return;
    }
    setBusy(true);
    try {
      await toggle(refType, refId);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar o favorito. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <TouchableOpacity
      style={[styles.btn, style]}
      onPress={handlePress}
      disabled={busy}
      accessibilityLabel={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {busy ? (
        <ActivityIndicator size="small" color="#C65D2E" />
      ) : (
        <Icon
          name={active ? 'heart' : 'heart-outline'}
          size={size}
          color={active ? '#C65D2E' : '#FFF'}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
