import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-gesture-handler';
import { UserProvider } from './src/contexts/UserContext'; // <--- Importação vital
import AppRoutes from './src/routes';

export default function App() {
  return (
    // O Provider TEM que envolver as Rotas
    <UserProvider>
      <StatusBar style="auto" />
      <AppRoutes />
    </UserProvider>
  );
}