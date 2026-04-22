import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PatronMasterBanner from './PatronMasterBanner';

interface AppShellProps {
  children: React.ReactNode;
}

// O PatronFooterTicker agora é injetado como tabBar custom em AppNavigator,
// para ficar imediatamente acima da tab bar sem gap causado por safe-area
// aplicado duas vezes.
export default function AppShell({ children }: AppShellProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <PatronMasterBanner />
      </SafeAreaView>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#6B1E1E',
  },
  topSafeArea: {
    backgroundColor: '#6B1E1E',
  },
  content: {
    flex: 1,
    backgroundColor: '#FAF2E0',
  },
});
