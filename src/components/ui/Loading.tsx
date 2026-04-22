import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function Loading({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6B1E1E" />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF2E0' },
  text: { marginTop: 12, color: '#6B5B4A', fontSize: 14 },
});
