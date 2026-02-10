import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-gesture-handler'; // Deve ser a primeira linha
import { AppDrawer } from './src/routes/AppDrawer';

export default function App() {
  return (
    <NavigationContainer>
      {/* Define o estilo da barra de status (hora, bateria, etc) */}
      <StatusBar style="auto" />

      {/* Carrega o menu lateral e as telas que configuramos */}
      <AppDrawer />
    </NavigationContainer>
  );
}