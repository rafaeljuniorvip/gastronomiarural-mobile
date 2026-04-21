import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function Loading({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#8B4513" />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF7F2' },
  text: { marginTop: 12, color: '#6B6B6B', fontSize: 14 },
});
