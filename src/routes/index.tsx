// src/routes/index.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importa as telas
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen'; 
import AppDrawer from './AppDrawer';
// <<< MUDANÇA >>> Importar a nova tela
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// 2. <<< MUDANÇA >>> Atualiza o "mapa" de rotas
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined; 
  ForgotPassword: undefined; // <-- ADICIONA A NOVA ROTA
};

// 3. Cria o controlador da pilha
const Stack = createNativeStackNavigator<RootStackParamList>();

// 4. Componente do mapa
const AppRoutes = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* 5. Telas de Autenticação */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        
        {/* <<< MUDANÇA >>> Adiciona a nova tela ao Stack */}
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        
        {/* 6. Tela do App (que contém o Drawer) */}
        <Stack.Screen name="App" component={AppDrawer} />
      
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppRoutes;