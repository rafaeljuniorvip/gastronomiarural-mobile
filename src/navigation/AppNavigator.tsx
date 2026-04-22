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
import MapaScreen from '../screens/MapaScreen';
import CuponsScreen from '../screens/cupons/CuponsScreen';
import ScannerScreen from '../screens/cupons/ScannerScreen';
import CupomSuccessScreen from '../screens/cupons/CupomSuccessScreen';
import ReceitaDetailScreen from '../screens/receitas/ReceitaDetailScreen';
import ReceitasListScreen from '../screens/receitas/ReceitasListScreen';
import PessoasListScreen from '../screens/pessoas/PessoasListScreen';
import PessoaDetailScreen from '../screens/pessoas/PessoaDetailScreen';
import TurismoListScreen from '../screens/turismo/TurismoListScreen';
import LocalDetailScreen from '../screens/turismo/LocalDetailScreen';
import TimelineScreen from '../screens/TimelineScreen';
import EdicaoDetailScreen from '../screens/EdicaoDetailScreen';
import FaqScreen from '../screens/FaqScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';
import MeusMarcadoresScreen from '../screens/MeusMarcadoresScreen';
import SearchScreen from '../screens/SearchScreen';

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
      <Stack.Screen name="ReceitaDetail" component={ReceitaDetailScreen} options={{ title: '' }} />
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
      <Stack.Screen name="ReceitaDetail" component={ReceitaDetailScreen} options={{ title: '' }} />
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
      <Stack.Screen name="Pessoas" component={PessoasListScreen} options={{ title: 'Pessoas do festival' }} />
      <Stack.Screen name="PessoaDetail" component={PessoaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Turismo" component={TurismoListScreen} options={{ title: 'Hospedagem e turismo' }} />
      <Stack.Screen name="LocalDetail" component={LocalDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: 'História do festival' }} />
      <Stack.Screen name="EdicaoDetail" component={EdicaoDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Faq" component={FaqScreen} options={{ title: 'Dúvidas frequentes' }} />
      <Stack.Screen name="Notificacoes" component={NotificacoesScreen} options={{ title: 'Notificações' }} />
      <Stack.Screen name="BarracaDetail" component={BarracaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="PratoDetail" component={PratoDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="NovaAvaliacao" component={NovaAvaliacaoScreen} options={{ title: 'Nova avaliação' }} />
      <Stack.Screen name="Receitas" component={ReceitasListScreen} options={{ title: 'Receitas' }} />
      <Stack.Screen name="ReceitaDetail" component={ReceitaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
    </Stack.Navigator>
  );
}

function ReceitasStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ReceitasList" component={ReceitasListScreen} options={{ title: 'Receitas' }} />
      <Stack.Screen name="ReceitaDetail" component={ReceitaDetailScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}

function AccountStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="AccountHome" component={AccountGateScreen} options={{ title: 'Conta' }} />
      <Stack.Screen name="Favoritos" component={FavoritosScreen} options={{ title: 'Meus favoritos' }} />
      <Stack.Screen name="MeusMarcadores" component={MeusMarcadoresScreen} options={{ title: 'Meus pratos' }} />
    </Stack.Navigator>
  );
}

function CuponsStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Cupons" component={CuponsScreen} options={{ title: 'Cupons' }} />
      <Stack.Screen
        name="CupomScanner"
        component={ScannerScreen}
        options={{ title: 'Escanear QR', headerStyle: { backgroundColor: '#000' } }}
      />
      <Stack.Screen name="CupomSuccess" component={CupomSuccessScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

const ICON_MAP: Record<string, string> = {
  HomeTab: 'home',
  BarracasTab: 'storefront',
  PratosTab: 'silverware-fork-knife',
  ReceitasTab: 'chef-hat',
  MapaTab: 'map-marker-multiple',
  CuponsTab: 'ticket-percent',
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
        <Tab.Screen name="ReceitasTab" component={ReceitasStack} options={{ title: 'Receitas' }} />
        <Tab.Screen name="MapaTab" component={MapaScreen} options={{ title: 'Mapa' }} />
        <Tab.Screen name="CuponsTab" component={CuponsStack} options={{ title: 'Cupons' }} />
        <Tab.Screen name="AccountTab" component={AccountStack} options={{ title: 'Conta' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
