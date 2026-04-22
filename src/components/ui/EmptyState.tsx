import { View, StyleSheet, Text } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface Props {
  icon?: keyof typeof Icon.glyphMap;
  title: string;
  message?: string;
}

export default function EmptyState({ icon = 'information-outline', title, message }: Props) {
  return (
    <View style={styles.container}>
      <Icon name={icon as any} size={56} color="#C84B1A" />
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  title: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#2B1A10', textAlign: 'center', fontFamily: 'PlayfairDisplay_700Bold' },
  message: { marginTop: 6, fontSize: 14, color: '#6B5B4A', textAlign: 'center' },
});
