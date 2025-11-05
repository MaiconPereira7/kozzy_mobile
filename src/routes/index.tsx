// src/routes/index.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importa TODAS as nossas telas
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen'; // A nova tela

// 2. Define os "nomes" das nossas rotas (para o TypeScript)
// (Qualquer tela que for navegar precisa saber deste mapa)
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Register: undefined; // A nova rota
};

// 3. Cria o controlador da pilha
const Stack = createNativeStackNavigator<RootStackParamList>();

// 4. Este é o componente que define nosso mapa
const AppRoutes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login" // O app começa no Login
        screenOptions={{
          headerShown: false, // Esconde o cabeçalho padrão
        }}
      >
        {/* 5. Lista todas as nossas telas */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRoutes;