import React, { useEffect } from 'react';
import { UserProvider } from './src/contexts/UserContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { initServerUrl } from './src/services/api';
import AppRoutes from './src/routes';

export default function App() {
  useEffect(() => {
    initServerUrl(); // carrega URL salva pelo usuário (se houver)
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </ThemeProvider>
  );
}
