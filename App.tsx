import { UserProvider } from './src/contexts/UserContext';
import AppRoutes from './src/routes'; // ou o caminho correto das suas rotas

export default function App() {
  return (
    // O UserProvider tem de envolver o seu aplicativo!
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}