import { useEffect, useCallback } from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from './src/contexts/AuthContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  appendLog,
  notificationToLog,
  registerForPushNotifications,
} from './src/services/notificacoes.service';

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#8B4513',
    primaryContainer: '#6B340E',
    secondary: '#C65D2E',
    secondaryContainer: '#D4A017',
    surface: '#FFFFFF',
    surfaceVariant: '#FAF7F2',
    background: '#FAF7F2',
    error: '#d32f2f',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#2B2B2B',
    onBackground: '#2B2B2B',
    outline: '#E5E0D5',
  },
};

export default function App() {
  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  useEffect(() => {
    registerForPushNotifications().catch((e) => {
      console.warn('[push-register] erro:', e);
    });
    const sub = Notifications.addNotificationReceivedListener((notif) => {
      appendLog(notificationToLog(notif)).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <FavoritesProvider>
              <AppNavigator />
            </FavoritesProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
