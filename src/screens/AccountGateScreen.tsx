import { useAuth } from '../contexts/AuthContext';
import LoginScreen from './LoginScreen';
import PerfilScreen from './PerfilScreen';
import Loading from '../components/ui/Loading';

export default function AccountGateScreen() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <PerfilScreen />;
  return <LoginScreen />;
}
