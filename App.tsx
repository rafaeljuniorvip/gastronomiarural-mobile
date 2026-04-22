import { useEffect, useCallback } from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AuthProvider } from './src/contexts/AuthContext';
import { FavoritesProvider } from './src/contexts/FavoritesContext';
import AppNavigator from './src/navigation/AppNavigator';
import AppShell from './src/components/layout/AppShell';
import { colors } from './src/theme/colors';
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
    primary: colors.primary,
    primaryContainer: colors.primaryDark,
    secondary: colors.secondary,
    secondaryContainer: colors.accent,
    surface: colors.surface,
    surfaceVariant: colors.bg,
    background: colors.bg,
    error: colors.danger,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: colors.text,
    onBackground: colors.text,
    outline: colors.border,
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <FavoritesProvider>
              <AppShell>
                <AppNavigator />
              </AppShell>
            </FavoritesProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
