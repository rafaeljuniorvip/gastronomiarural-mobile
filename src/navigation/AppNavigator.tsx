import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

import HomeScreen from '../screens/HomeScreen';
import BarracasListScreen from '../screens/barracas/BarracasListScreen';
import BarracaDetailScreen from '../screens/barracas/BarracaDetailScreen';
import PratosListScreen from '../screens/pratos/PratosListScreen';
import PratoDetailScreen from '../screens/pratos/PratoDetailScreen';
import ProgramacaoScreen from '../screens/ProgramacaoScreen';
import OficinasListScreen from '../screens/oficinas/OficinasListScreen';
import OficinaDetailScreen from '../screens/oficinas/OficinaDetailScreen';
import PatrocinadoresScreen from '../screens/PatrocinadoresScreen';
import FavoritosScreen from '../screens/FavoritosScreen';
import AccountGateScreen from '../screens/AccountGateScreen';
import NovaAvaliacaoScreen from '../screens/avaliacoes/NovaAvaliacaoScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#8B4513' },
  headerTintColor: '#FFF',
  headerTitleStyle: { fontWeight: '700' as const },
};

function BarracasStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="BarracasList" component={BarracasListScreen} options={{ title: 'Barracas' }} />
      <Stack.Screen name="BarracaDetail" component={BarracaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="PratoDetail" component={PratoDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="NovaAvaliacao" component={NovaAvaliacaoScreen} options={{ title: 'Nova avaliação' }} />
    </Stack.Navigator>
  );
}

function PratosStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="PratosList" component={PratosListScreen} options={{ title: 'Cardápio' }} />
      <Stack.Screen name="PratoDetail" component={PratoDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="BarracaDetail" component={BarracaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="NovaAvaliacao" component={NovaAvaliacaoScreen} options={{ title: 'Nova avaliação' }} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Festival Itapecerica' }} />
      <Stack.Screen name="Barracas" component={BarracasListScreen} options={{ title: 'Barracas' }} />
      <Stack.Screen name="Pratos" component={PratosListScreen} options={{ title: 'Cardápio' }} />
      <Stack.Screen name="Programacao" component={ProgramacaoScreen} options={{ title: 'Programação' }} />
      <Stack.Screen name="Oficinas" component={OficinasListScreen} options={{ title: 'Oficinas' }} />
      <Stack.Screen name="OficinaDetail" component={OficinaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Patrocinadores" component={PatrocinadoresScreen} options={{ title: 'Patrocinadores' }} />
      <Stack.Screen name="BarracaDetail" component={BarracaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="PratoDetail" component={PratoDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="NovaAvaliacao" component={NovaAvaliacaoScreen} options={{ title: 'Nova avaliação' }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="AccountHome" component={AccountGateScreen} options={{ title: 'Conta' }} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: 'Meus favoritos' }} />
    </Stack.Navigator>
  );
}

const ICON_MAP: Record<string, string> = {
  HomeTab: 'home',
  BarracasTab: 'storefront',
  PratosTab: 'silverware-fork-knife',
  ProgramacaoTab: 'calendar-music',
  OficinasTab: 'school',
  AccountTab: 'account',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#8B4513',
          tabBarInactiveTintColor: '#6B6B6B',
          tabBarStyle: { backgroundColor: '#FFF', borderTopColor: '#E5E0D5' },
          tabBarIcon: ({ color, size }) => (
            <Icon name={(ICON_MAP[route.name] || 'circle') as any} size={size} color={color} />
          ),
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Início' }} />
        <Tab.Screen name="BarracasTab" component={BarracasStack} options={{ title: 'Barracas' }} />
        <Tab.Screen name="PratosTab" component={PratosStack} options={{ title: 'Cardápio' }} />
        <Tab.Screen name="OficinasTab" component={OficinasListScreen} options={{ title: 'Oficinas' }} />
        <Tab.Screen name="AccountTab" component={AccountStack} options={{ title: 'Conta' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
