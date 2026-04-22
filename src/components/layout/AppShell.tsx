import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PatronMasterBanner from './PatronMasterBanner';
import PatronFooterTicker from './PatronFooterTicker';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.topSafeArea}>
        <PatronMasterBanner />
      </SafeAreaView>
      <View style={styles.content}>{children}</View>
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        <PatronFooterTicker />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#8B4513',
  },
  topSafeArea: {
    backgroundColor: '#8B4513',
  },
  content: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  bottomSafeArea: {
    backgroundColor: '#F2EBE0',
  },
});
