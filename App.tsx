// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { UserProvider } from './src/contexts/UserContext';
import AppRoutes from './src/routes'; 

// CONFIGURAÇÃO ATUALIZADA (Sem o erro de 'deprecated')
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,  // Novo padrão (substitui o Alert)
    shouldShowList: true,    // Novo padrão
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  return (
    <UserProvider>
      {/* Ajustei o estilo da StatusBar para ficar mais visível */}
      <StatusBar style="dark" backgroundColor="#F5F5F5" />
      <AppRoutes />
    </UserProvider>
  );
}