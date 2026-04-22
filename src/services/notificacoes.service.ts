import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export type NotificacaoCategory =
  | 'shows'
  | 'oficinas'
  | 'patrocinios'
  | 'emergencia'
  | 'geral';

export interface DevicePreferences {
  shows: boolean;
  oficinas: boolean;
  patrocinios: boolean;
  emergencia: boolean;
}

export interface Device {
  id: number;
  user_id: number | null;
  expo_push_token: string;
  platform: 'ios' | 'android' | 'web';
  app_version: string | null;
  preferences: DevicePreferences;
}

export interface ReceivedNotificacao {
  id: string;
  title: string;
  body: string;
  category: NotificacaoCategory | string;
  notificacao_id: number | null;
  received_at: string;
  read: boolean;
}

const TOKEN_KEY = 'gr_expo_push_token';
const LOG_KEY = 'gr_notif_log';
const MAX_LOG = 50;

/**
 * Solicita permissão, obtém o Expo Push Token e registra no backend.
 * Pode ser chamado no startup e após login do usuário (rebind ao user).
 * Retorna o token (string) ou null em web / erro.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const perm = await Notifications.getPermissionsAsync();
    let status = perm.status;
    if (status !== 'granted') {
      const req = await Notifications.requestPermissionsAsync();
      status = req.status;
    }
    if (status !== 'granted') {
      return null;
    }

    // Android precisa de canal default
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6B1E1E',
      });
    }

    const extra = Constants.expoConfig?.extra as
      | { eas?: { projectId?: string } }
      | undefined;
    const projectId =
      extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      (Constants as unknown as { manifest2?: { extra?: { eas?: { projectId?: string } } } })
        ?.manifest2?.extra?.eas?.projectId;

    const tokenResult = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    const expoToken = tokenResult.data;
    if (!expoToken) return null;

    const appVersion = Constants.expoConfig?.version ?? '1.0.0';

    await api.post('/devices/register', {
      expo_push_token: expoToken,
      platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
      app_version: appVersion,
    });

    await AsyncStorage.setItem(TOKEN_KEY, expoToken);
    return expoToken;
  } catch (e) {
    console.warn('[push-register] erro:', e);
    return null;
  }
}

export async function getStoredPushToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Atualiza as preferências de categorias no backend.
 * Requer usuário autenticado (backend valida).
 */
export async function updatePreferences(
  prefs: Partial<DevicePreferences>
): Promise<Device | null> {
  const token = await getStoredPushToken();
  if (!token) return null;
  try {
    const { data } = await api.put<{ data: Device }>('/devices/preferences', {
      expo_push_token: token,
      preferences: prefs,
    });
    return data.data;
  } catch {
    return null;
  }
}

/**
 * Marca uma notificação como aberta no backend (métrica de engajamento).
 */
export async function reportOpened(notificacaoId: number): Promise<void> {
  const token = await getStoredPushToken();
  if (!token) return;
  try {
    await api.post('/notificacoes/opened', {
      notificacao_id: notificacaoId,
      expo_push_token: token,
    });
  } catch {
    // silencioso
  }
}

// ===== Log local de notificações recebidas =====

export async function loadLog(): Promise<ReceivedNotificacao[]> {
  try {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReceivedNotificacao[];
  } catch {
    return [];
  }
}

export async function saveLog(log: ReceivedNotificacao[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, MAX_LOG)));
  } catch {
    // silencioso
  }
}

export async function appendLog(item: ReceivedNotificacao): Promise<ReceivedNotificacao[]> {
  const current = await loadLog();
  const next = [item, ...current.filter((x) => x.id !== item.id)].slice(0, MAX_LOG);
  await saveLog(next);
  return next;
}

export async function markLogRead(id: string): Promise<ReceivedNotificacao[]> {
  const current = await loadLog();
  const next = current.map((x) => (x.id === id ? { ...x, read: true } : x));
  await saveLog(next);
  return next;
}

export async function clearLog(): Promise<void> {
  await AsyncStorage.removeItem(LOG_KEY);
}

/**
 * Converte um payload do Expo em ReceivedNotificacao (in-memory shape).
 */
export function notificationToLog(
  notif: Notifications.Notification | Notifications.NotificationResponse['notification']
): ReceivedNotificacao {
  const content = notif.request.content;
  const data = (content.data ?? {}) as Record<string, unknown>;
  return {
    id: notif.request.identifier,
    title: content.title ?? '',
    body: content.body ?? '',
    category: (data.category as string) ?? 'geral',
    notificacao_id: typeof data.notificacao_id === 'number' ? data.notificacao_id : null,
    received_at: new Date().toISOString(),
    read: false,
  };
}
