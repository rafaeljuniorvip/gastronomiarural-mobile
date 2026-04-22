import { View, StyleSheet, Text } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle-outline" size={48} color="#d32f2f" />
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <Button mode="outlined" onPress={onRetry} style={styles.button}>
          Tentar novamente
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#FAF2E0' },
  text: { marginTop: 12, color: '#2B1A10', fontSize: 14, textAlign: 'center' },
  button: { marginTop: 16 },
});
