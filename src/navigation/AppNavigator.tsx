import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import PatronFooterTicker from '../components/layout/PatronFooterTicker';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

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
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#FFF',
  headerTitleStyle: {
    fontWeight: '700' as const,
    fontFamily: fonts.heading,
  },
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
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
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

function MapaStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MapaHome" component={MapaScreen} options={{ title: 'Mapa do festival' }} />
      <Stack.Screen name="BarracaDetail" component={BarracaDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="PratoDetail" component={PratoDetailScreen} options={{ title: '' }} />
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

// Cada tab tem sua "cor assinatura" — casa com a paleta dos tiles da Home
// e traz mais vida à navegação, saindo do monocromático bordô.
interface TabStyle { icon: string; label: string; color: string }
const TAB_STYLES: Record<string, TabStyle> = {
  HomeTab: { icon: 'home-variant', label: 'Início', color: '#6B1E1E' },
  BarracasTab: { icon: 'storefront', label: 'Barracas', color: '#E5A56C' },
  PratosTab: { icon: 'silverware-fork-knife', label: 'Cardápio', color: '#E55934' },
  ReceitasTab: { icon: 'chef-hat', label: 'Receitas', color: '#D4A842' },
  MapaTab: { icon: 'map-marker-radius', label: 'Mapa', color: '#3E8691' },
  CuponsTab: { icon: 'ticket-percent', label: 'Cupons', color: '#D99A1F' },
  AccountTab: { icon: 'account-circle', label: 'Conta', color: '#8E5BA8' },
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        // Ticker dos patrocinadores renderizado imediatamente acima da tab bar.
        // Antes ficava num SafeAreaView separado depois do Tab.Navigator e criava
        // um gap vertical porque a tab bar já aplica o safe-area-inset-bottom.
        tabBar={(props) => (
          <View>
            <PatronFooterTicker />
            <BottomTabBar {...props} />
          </View>
        )}
        screenOptions={({ route }) => {
          const tab = TAB_STYLES[route.name];
          return {
            headerShown: false,
            tabBarActiveTintColor: tab?.color || colors.primary,
            tabBarInactiveTintColor: '#9B8A7A',
            tabBarStyle: {
              backgroundColor: '#FFF',
              borderTopWidth: 0,
              // padding lateral evita que o 1º e o último ícone encostem
              // nas bordas curvas da tela (iPhone/Android com cantos arredondados)
              paddingTop: 6,
              paddingHorizontal: 10,
              height: 64,
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarItemStyle: {
              // respiração extra entre os ícones
              paddingHorizontal: 2,
            },
            tabBarLabelStyle: {
              fontFamily: fonts.bodyBold,
              fontSize: 10,
              fontWeight: '700',
              letterSpacing: 0.3,
              marginTop: 2,
            },
            tabBarIcon: ({ focused }) => {
              const t = TAB_STYLES[route.name];
              if (!t) return <Icon name="circle" size={22} color="#9B8A7A" />;
              // Ativo: ícone branco dentro de uma pill colorida
              if (focused) {
                return (
                  <View style={[styles.pill, { backgroundColor: t.color }]}>
                    <Icon name={t.icon as any} size={18} color="#FFF" />
                  </View>
                );
              }
              return <Icon name={t.icon as any} size={22} color="#9B8A7A" />;
            },
          };
        }}
      >
        <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Início' }} />
        <Tab.Screen name="BarracasTab" component={BarracasStack} options={{ title: 'Barracas' }} />
        <Tab.Screen name="PratosTab" component={PratosStack} options={{ title: 'Cardápio' }} />
        <Tab.Screen name="ReceitasTab" component={ReceitasStack} options={{ title: 'Receitas' }} />
        <Tab.Screen name="MapaTab" component={MapaStack} options={{ title: 'Mapa' }} />
        <Tab.Screen name="CuponsTab" component={CuponsStack} options={{ title: 'Cupons' }} />
        <Tab.Screen name="AccountTab" component={AccountStack} options={{ title: 'Conta' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  // Pill colorida envolvendo o ícone da tab ativa — dá "vida" à navbar
  pill: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
